import { WebcryptoKey } from "@atproto/jwk-webcrypto";
import { OAuthClient } from "@atproto/oauth-client";
import { clearBskyClientCache } from "./bskyClient";
import {
  getChromeStorage,
  removeChromeStorageItems,
  setToChromeStorage,
} from "./chromeHelper";
import {
  BSKY_OAUTH_CLIENT_ID,
  BSKY_OAUTH_HANDLE_RESOLVER,
  BSKY_OAUTH_REDIRECT_URI,
  BSKY_OAUTH_SCOPE,
  STORAGE_KEYS,
} from "./constants";

const DB_NAME = "@atproto-oauth-client-sky-follower-bridge";
const DB_VERSION = 1;
const STORE_NAMES = {
  state: "state",
  session: "session",
  didCache: "didCache",
  dpopNonceCache: "dpopNonceCache",
  handleCache: "handleCache",
  authorizationServerMetadataCache: "authorizationServerMetadataCache",
  protectedResourceMetadataCache: "protectedResourceMetadataCache",
} as const;

type StoreName = (typeof STORE_NAMES)[keyof typeof STORE_NAMES];

type StoreItem<T> = {
  value: T;
  expiresAt?: string;
};

type OAuthTokenSetLike = {
  refresh_token?: string;
  expires_at?: number;
};

type OAuthRuntimeDpopKeyLike = {
  kid: string;
  cryptoKeyPair: CryptoKeyPair;
};

type OAuthStoredDpopKeyLike = {
  keyId: string;
  keyPair: CryptoKeyPair;
};

type OAuthRecordLike = {
  dpopKey?: OAuthRuntimeDpopKeyLike | OAuthStoredDpopKeyLike;
  tokenSet?: OAuthTokenSetLike;
  [key: string]: unknown;
};

const toDateFromEpoch = (epoch: number) => {
  // OAuth TokenSet.expires_at is a Unix timestamp in seconds in common SDKs.
  // Normalize both seconds and milliseconds so persisted sessions do not expire immediately.
  return new Date(epoch > 1_000_000_000_000 ? epoch : epoch * 1000);
};

class BskyOAuthDatabase {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.open();
  }

  private async open() {
    return await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = () => {
        const db = request.result;
        for (const storeName of Object.values(STORE_NAMES)) {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName);
          }
        }
      };
      request.onsuccess = () => resolve(request.result);
    });
  }

  private async withStore<T>(
    storeName: StoreName,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest,
  ) {
    const db = await this.dbPromise;
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      let result: T;
      const request = operation(store);
      request.onsuccess = () => {
        result = request.result as T;
      };
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () =>
        reject(
          transaction.error || new Error("IndexedDB transaction aborted."),
        );
    });
  }

  private createStore<T>(
    storeName: StoreName,
    options: {
      expiresAt?: (value: T) => Date | null;
      encode?: (value: T) => Promise<unknown> | unknown;
      decode?: (value: unknown) => Promise<T> | T;
    } = {},
  ) {
    const encode = options.encode || ((value: T) => value);
    const decode = options.decode || ((value: unknown) => value as T);
    const expiresAt = options.expiresAt;
    return {
      get: async (key: string) => {
        const item = await this.withStore<StoreItem<unknown> | undefined>(
          storeName,
          "readonly",
          (store) => store.get(key),
        );
        if (!item) return undefined;
        if (item.expiresAt && new Date(item.expiresAt) < new Date()) {
          await this.withStore(storeName, "readwrite", (store) =>
            store.delete(key),
          );
          return undefined;
        }
        return await decode(item.value);
      },
      set: async (key: string, value: T) => {
        const encoded = await encode(value);
        const expiry = expiresAt?.(value) || null;
        const item: StoreItem<unknown> = {
          value: encoded,
          ...(expiry && { expiresAt: expiry.toISOString() }),
        };
        await this.withStore(storeName, "readwrite", (store) =>
          store.put(item, key),
        );
      },
      del: async (key: string) => {
        await this.withStore(storeName, "readwrite", (store) =>
          store.delete(key),
        );
      },
    };
  }

  getSessionStore() {
    return this.createStore<OAuthRecordLike>(STORE_NAMES.session, {
      expiresAt: ({ tokenSet }) =>
        tokenSet?.refresh_token || !tokenSet?.expires_at
          ? null
          : toDateFromEpoch(tokenSet.expires_at),
      encode: (session) => {
        if (!session?.dpopKey) return session;
        const { dpopKey, ...rest } = session;
        const runtimeKey = dpopKey as OAuthRuntimeDpopKeyLike;
        return {
          ...rest,
          dpopKey: {
            keyId: runtimeKey.kid,
            keyPair: runtimeKey.cryptoKeyPair,
          },
        };
      },
      decode: async (session) => {
        if (!session || typeof session !== "object") {
          return session as OAuthRecordLike;
        }
        const record = session as OAuthRecordLike;
        if (!record.dpopKey) {
          return record;
        }
        const { dpopKey, ...rest } = record as {
          dpopKey: OAuthStoredDpopKeyLike;
          [key: string]: unknown;
        };
        return {
          ...rest,
          dpopKey: await WebcryptoKey.fromKeypair(
            dpopKey.keyPair,
            dpopKey.keyId,
          ),
        };
      },
    });
  }

  getStateStore() {
    return this.createStore<OAuthRecordLike>(STORE_NAMES.state, {
      expiresAt: () => new Date(Date.now() + 10 * 60 * 1000),
      encode: (state) => {
        if (!state?.dpopKey) return state;
        const { dpopKey, ...rest } = state;
        const runtimeKey = dpopKey as OAuthRuntimeDpopKeyLike;
        return {
          ...rest,
          dpopKey: {
            keyId: runtimeKey.kid,
            keyPair: runtimeKey.cryptoKeyPair,
          },
        };
      },
      decode: async (state) => {
        if (!state || typeof state !== "object") {
          return state as OAuthRecordLike;
        }
        const record = state as OAuthRecordLike;
        if (!record.dpopKey) {
          return record;
        }
        const { dpopKey, ...rest } = record as {
          dpopKey: OAuthStoredDpopKeyLike;
          [key: string]: unknown;
        };
        return {
          ...rest,
          dpopKey: await WebcryptoKey.fromKeypair(
            dpopKey.keyPair,
            dpopKey.keyId,
          ),
        };
      },
    });
  }

  getCacheStore(storeName: StoreName, ttlMs = 60 * 1000) {
    return this.createStore<unknown>(storeName, {
      expiresAt: () => new Date(Date.now() + ttlMs),
    });
  }
}

class BskyOAuthRuntime {
  private locks = new Map<string, Promise<void>>();

  createKey(algs: string[]) {
    return WebcryptoKey.generate(algs);
  }

  getRandomValues(length: number) {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  async digest(bytes: Uint8Array, algorithm: { name: string }) {
    if (!algorithm.name.startsWith("sha")) {
      throw new TypeError(`Unsupported algorithm: ${algorithm.name}`);
    }
    const subtleAlgo = `SHA-${algorithm.name.slice(3)}`;
    const buffer = await crypto.subtle.digest(subtleAlgo, bytes);
    return new Uint8Array(buffer);
  }

  async requestLock<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    const current = this.locks.get(name) || Promise.resolve();
    // fn の結果を呼び出し元に返すためのプロミス
    const resultPromise = current.then(fn);
    // ロックチェーン用: エラーを握りつぶして後続のロックがブロックされないようにする
    const lockPromise = resultPromise
      .catch(() => {})
      .finally(() => {
        if (this.locks.get(name) === lockPromise) {
          this.locks.delete(name);
        }
      });
    this.locks.set(name, lockPromise as Promise<void>);
    // エラーをそのまま伝播させる
    return resultPromise;
  }
}

let oauthClientPromise: Promise<OAuthClient> | null = null;
let restoreOAuthSessionPromise: Promise<unknown | null> | null = null;

const createOAuthClient = async () => {
  if (!BSKY_OAUTH_CLIENT_ID || !BSKY_OAUTH_REDIRECT_URI) {
    throw new Error("OAuth is not configured. Set OAuth client env variables.");
  }

  const db = new BskyOAuthDatabase();
  const clientOrigin = new URL(BSKY_OAUTH_CLIENT_ID).origin;

  return new OAuthClient({
    handleResolver: BSKY_OAUTH_HANDLE_RESOLVER,
    responseMode: "query",
    clientMetadata: {
      client_id: BSKY_OAUTH_CLIENT_ID,
      client_name: "Sky Follower Bridge",
      client_uri: clientOrigin,
      policy_uri: `${clientOrigin}/privacy-policy`,
      redirect_uris: [BSKY_OAUTH_REDIRECT_URI],
      scope: BSKY_OAUTH_SCOPE,
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
      application_type: "web",
      dpop_bound_access_tokens: true,
    },
    runtimeImplementation: new BskyOAuthRuntime(),
    stateStore: db.getStateStore(),
    sessionStore: db.getSessionStore(),
    dpopNonceCache: db.getCacheStore(
      STORE_NAMES.dpopNonceCache,
      10 * 60 * 1000,
    ),
    didCache: db.getCacheStore(STORE_NAMES.didCache),
    handleCache: db.getCacheStore(STORE_NAMES.handleCache),
    authorizationServerMetadataCache: db.getCacheStore(
      STORE_NAMES.authorizationServerMetadataCache,
    ),
    protectedResourceMetadataCache: db.getCacheStore(
      STORE_NAMES.protectedResourceMetadataCache,
    ),
  });
};

const getOAuthClient = async () => {
  if (!oauthClientPromise) {
    oauthClientPromise = createOAuthClient();
  }
  return await oauthClientPromise;
};

const getIdentityApi = () => {
  type IdentityApi = {
    launchWebAuthFlow: (details: {
      url: string;
      interactive: boolean;
    }) => Promise<string | undefined>;
  };
  const chromeIdentity = (chrome as unknown as { identity?: IdentityApi })
    .identity;
  const browserIdentity = (
    globalThis as unknown as { browser?: { identity?: IdentityApi } }
  ).browser?.identity;
  const identity = chromeIdentity || browserIdentity;
  if (!identity) {
    throw new Error("Browser identity API is not available.");
  }
  return identity;
};

const parseCallbackParams = (redirectedUrl: string) => {
  const parsed = new URL(redirectedUrl);
  const hash = parsed.hash.startsWith("#") ? parsed.hash.slice(1) : parsed.hash;
  const hashParams = new URLSearchParams(hash);
  if (hashParams.get("code")) {
    return hashParams;
  }
  return parsed.searchParams;
};

const launchWebAuthFlow = async (url: string) => {
  const identity = getIdentityApi();
  const redirectedUrl = await identity.launchWebAuthFlow({
    url,
    interactive: true,
  });
  if (!redirectedUrl) {
    throw new Error("OAuth callback URL was not returned.");
  }
  return redirectedUrl as string;
};

export const isOAuthConfigured = () =>
  Boolean(BSKY_OAUTH_CLIENT_ID && BSKY_OAUTH_REDIRECT_URI);

export const loginWithOAuth = async (identifier: string) => {
  const client = await getOAuthClient();
  const trimmedIdentifier = identifier.trim();
  if (!trimmedIdentifier) {
    throw new Error("Identifier is required.");
  }

  const authUrl = await client.authorize(trimmedIdentifier, {
    scope: BSKY_OAUTH_SCOPE,
    responseMode: "query",
  });
  const redirectedUrl = await launchWebAuthFlow(authUrl.toString());
  const callbackParams = parseCallbackParams(redirectedUrl);
  const { session } = await client.callback(callbackParams);

  // Service worker can outlive the popup and keep a stale Agent cached
  // for the same DID across re-logins. Drop that in-memory client so the
  // next API call is bound to the newly issued OAuth session / DPoP key.
  clearBskyClientCache(session.sub);

  await setToChromeStorage(STORAGE_KEYS.BSKY_OAUTH_SUB, session.sub);
  await setToChromeStorage(STORAGE_KEYS.BSKY_CLIENT_SESSION, {
    sub: session.sub,
  });

  return session;
};

export const restoreOAuthSession = async () => {
  const storage = await getChromeStorage<{
    [STORAGE_KEYS.BSKY_OAUTH_SUB]: string;
  }>(STORAGE_KEYS.BSKY_OAUTH_SUB);
  const sub = storage?.[STORAGE_KEYS.BSKY_OAUTH_SUB];
  if (!sub) {
    return null;
  }
  if (!restoreOAuthSessionPromise) {
    restoreOAuthSessionPromise = (async () => {
      try {
        const client = await getOAuthClient();
        // 復元時に即 refresh させず、保存済みセッションをそのまま使う。
        // scan 中に並列 restore が走ると refresh 競合でセッションを壊しやすい。
        return await client.restore(sub, false);
      } catch (error) {
        // Service Worker の停止・再起動等で OAuthClient の内部状態が
        // 陳腐化している場合、キャッシュをクリアして再試行する。
        if (oauthClientPromise) {
          console.warn(
            "Retrying OAuth session restore with fresh client.",
            error,
          );
          oauthClientPromise = null;
          try {
            const freshClient = await getOAuthClient();
            return await freshClient.restore(sub, false);
          } catch (retryError) {
            console.error(
              "Failed to restore OAuth session after retry.",
              retryError,
            );
            return null;
          }
        }
        console.error("Failed to restore OAuth session.", error);
        return null;
      } finally {
        restoreOAuthSessionPromise = null;
      }
    })();
  }
  return await restoreOAuthSessionPromise;
};

export const clearOAuthSession = async () => {
  await removeChromeStorageItems([
    STORAGE_KEYS.BSKY_OAUTH_SUB,
    STORAGE_KEYS.BSKY_CLIENT_SESSION,
  ]);
};

export const resetOAuthClientCache = () => {
  oauthClientPromise = null;
};

export const logoutOAuthSession = async () => {
  const storage = await getChromeStorage<{
    [STORAGE_KEYS.BSKY_OAUTH_SUB]: string;
  }>(STORAGE_KEYS.BSKY_OAUTH_SUB);
  const sub = storage?.[STORAGE_KEYS.BSKY_OAUTH_SUB];
  const session = await restoreOAuthSession();
  if (session) {
    await session.signOut();
  }
  clearBskyClientCache(sub);
  oauthClientPromise = null;
  await clearOAuthSession();
};
