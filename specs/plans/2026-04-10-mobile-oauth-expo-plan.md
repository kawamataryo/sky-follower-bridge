# Mobile OAuth (Expo OAuth Client) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** モバイルアプリの OAuth ログインを `@atproto/oauth-client-expo@0.0.10` に置き換え、既存の `expo-auth-session` + サーバープロキシ経路を完全に廃止する。

**Architecture:** クライアントサイドで完結する OAuth。ネイティブモジュール (iOS Swift) が DPoP/JWT 署名を担当し、MMKV にセッションを保持する。secure-store には `{ authMethod: "oauth", sub }` のマーカーのみ残す。App Password 経路は fallback link として維持する。サーバーには native 用 client metadata を返す新エンドポイントを 1 つだけ追加する。

**Tech Stack:** `@atproto/oauth-client-expo@0.0.10` / `@atproto/api` (AtpAgent) / Expo (bare workflow, iOS のみ) / Hono (Cloudflare Workers) / Vitest + happy-dom

**設計の元:** `specs/2026-04-10-mobile-oauth-expo-design.md`

---

## 前提

- ブランチ: `feat/mobile-app`
- 作業対象プラットフォーム: **iOS のみ** (`mobile/android/` は存在しないため Android は別タスク)
- `@atproto/oauth-client-expo` バージョンは `0.0.10` に**完全固定** (`^` 不可)
- canonical client metadata JSON は設計書の「client-metadata.json の最終形」節の内容 (リテラル):

```json
{
  "client_id": "https://server.sky-follower-bridge.dev/oauth/mobile/client-metadata.json",
  "client_name": "Sky Follower Bridge Mobile",
  "client_uri": "https://server.sky-follower-bridge.dev",
  "policy_uri": "https://server.sky-follower-bridge.dev/privacy-policy",
  "redirect_uris": ["dev.sky-follower-bridge.mobile:/oauth-callback"],
  "scope": "atproto transition:generic",
  "token_endpoint_auth_method": "none",
  "response_types": ["code"],
  "grant_types": ["authorization_code", "refresh_token"],
  "application_type": "native",
  "dpop_bound_access_tokens": true
}
```

この JSON は **Phase 1/2 のサーバー側とモバイル側で 1 バイト単位で一致** させる必要がある。Phase 4 の snapshot テストで検証する。

---

## ファイル構造

### 新規作成

| ファイル | 役割 |
|---|---|
| `server/src/lib/mobileOAuthClientMetadata.ts` | canonical JSON を返す純粋関数。request origin に依存しない |
| `mobile/assets/oauth-client-metadata.json` | モバイル側 canonical JSON のローカルコピー |
| `mobile/lib/bskyOAuthClient.ts` | `ExpoOAuthClient` シングルトンと `signIn/restore/signOut` 薄ラッパー |
| `mobile/__tests__/bskyOAuth.test.ts` | `loginWithOAuth` のエラー正規化テスト |
| `mobile/__tests__/bskyAgent.test.ts` | `restoreAgent` の OAuth 分岐テスト |
| `mobile/__tests__/oauthClientMetadata.test.ts` | local JSON と server canonical 出力の snapshot 一致テスト |

### 修正

| ファイル | 変更内容 |
|---|---|
| `server/src/index.tsx` | `/oauth/mobile/client-metadata.json` ハンドラ追加 |
| `mobile/package.json` | `@atproto/oauth-client-expo@0.0.10` 追加、`base-64`/`expo-auth-session`/`@types/base-64` 削除 |
| `mobile/app.json` | `scheme` を `dev.sky-follower-bridge.mobile` に変更 |
| `mobile/ios/SkyFollowerBridge/Info.plist` | `CFBundleURLSchemes` から旧 `sky-follower-bridge` 削除 |
| `mobile/lib/constants.ts` | `BSKY_OAUTH_CLIENT_ID`/`BSKY_OAUTH_REDIRECT_URI`/`BSKY_OAUTH_SCOPE` 削除 |
| `mobile/lib/bskyOAuth.ts` | **全面書き換え**。`loginWithOAuth(identifier) → { agent, sub }` シグネチャ維持 |
| `mobile/lib/bskyAgent.ts` | `restoreAgent` の OAuth 分岐を実装 (現状は `return null`) |
| `mobile/contexts/AuthContext.tsx` | restore 失敗時の `signOut + clearSession`、logout の OAuth 分岐、`sub` 空値ガード |
| `mobile/app/auth.tsx` | エラー表示を `OAuthLoginError.code` ベースに、`cancelled` はサイレント |

---

## 実装タスク

全部で 17 タスク。依存順に並んでいる。各タスクの最後に commit する。

---

### Task 1: server の canonical metadata ヘルパー作成

**Files:**
- Create: `server/src/lib/mobileOAuthClientMetadata.ts`

- [ ] **Step 1: ヘルパーファイルを新規作成**

`server/src/lib/mobileOAuthClientMetadata.ts`:

```ts
export const MOBILE_OAUTH_CANONICAL_ORIGIN =
  "https://server.sky-follower-bridge.dev";

export type MobileOAuthClientMetadata = {
  client_id: string;
  client_name: string;
  client_uri: string;
  policy_uri: string;
  redirect_uris: string[];
  scope: string;
  token_endpoint_auth_method: "none";
  response_types: ["code"];
  grant_types: ["authorization_code", "refresh_token"];
  application_type: "native";
  dpop_bound_access_tokens: true;
};

export function createMobileOAuthClientMetadata(): MobileOAuthClientMetadata {
  const origin = MOBILE_OAUTH_CANONICAL_ORIGIN;
  return {
    client_id: `${origin}/oauth/mobile/client-metadata.json`,
    client_name: "Sky Follower Bridge Mobile",
    client_uri: origin,
    policy_uri: `${origin}/privacy-policy`,
    redirect_uris: ["dev.sky-follower-bridge.mobile:/oauth-callback"],
    scope: "atproto transition:generic",
    token_endpoint_auth_method: "none",
    response_types: ["code"],
    grant_types: ["authorization_code", "refresh_token"],
    application_type: "native",
    dpop_bound_access_tokens: true,
  };
}
```

> **Why canonical URL hardcode?** spec の決定事項 #1。request origin に依存すると `wrangler dev` と本番で client_id が変わり、モバイル同梱 JSON との一致が崩れるため。

- [ ] **Step 2: TypeScript エラーがないことを確認**

Run: `cd server && npx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 3: Commit**

```bash
git add server/src/lib/mobileOAuthClientMetadata.ts
git commit -m "feat(server): add mobile OAuth client metadata helper"
```

---

### Task 2: server にエンドポイントを追加

**Files:**
- Modify: `server/src/index.tsx`

- [ ] **Step 1: Hono ハンドラを追加**

`server/src/index.tsx` の既存の `/oauth/client-metadata.json` ハンドラの直後 (現行 108 行目あたり、`app.get("/oauth/callback", ...)` の前) に以下を挿入:

```tsx
import { createMobileOAuthClientMetadata } from "./lib/mobileOAuthClientMetadata";

// ... (既存コード)

app.get("/oauth/mobile/client-metadata.json", (c) => {
  return c.json(createMobileOAuthClientMetadata(), 200, {
    "Cache-Control": "no-store",
  });
});
```

import 文はファイル先頭の既存 import 群に追加すること。

- [ ] **Step 2: TypeScript エラーがないことを確認**

Run: `cd server && npx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 3: ローカル起動で response を確認**

Run: `cd server && npx wrangler dev --local --port 8788`
別ターミナルで:
```bash
curl -s http://127.0.0.1:8788/oauth/mobile/client-metadata.json | jq .
```
Expected: canonical JSON (Task 1 Step 1 のリテラルと完全一致)。特に:
- `"client_id": "https://server.sky-follower-bridge.dev/oauth/mobile/client-metadata.json"` (localhost ではなく canonical URL)
- `"application_type": "native"`
- `"redirect_uris": ["dev.sky-follower-bridge.mobile:/oauth-callback"]`

wrangler を `Ctrl+C` で停止する。

- [ ] **Step 4: Commit**

```bash
git add server/src/index.tsx
git commit -m "feat(server): add /oauth/mobile/client-metadata.json endpoint"
```

---

### Task 3: モバイル canonical JSON アセットを作成

**Files:**
- Create: `mobile/assets/oauth-client-metadata.json`

- [ ] **Step 1: ローカルコピーを作成**

`mobile/assets/oauth-client-metadata.json`:

```json
{
  "client_id": "https://server.sky-follower-bridge.dev/oauth/mobile/client-metadata.json",
  "client_name": "Sky Follower Bridge Mobile",
  "client_uri": "https://server.sky-follower-bridge.dev",
  "policy_uri": "https://server.sky-follower-bridge.dev/privacy-policy",
  "redirect_uris": ["dev.sky-follower-bridge.mobile:/oauth-callback"],
  "scope": "atproto transition:generic",
  "token_endpoint_auth_method": "none",
  "response_types": ["code"],
  "grant_types": ["authorization_code", "refresh_token"],
  "application_type": "native",
  "dpop_bound_access_tokens": true
}
```

> **重要:** Task 1 の `createMobileOAuthClientMetadata()` が返すオブジェクトを `JSON.stringify` した結果と 1 バイト単位で一致させる。Task 16 の snapshot テストで検証するので、プロパティの順序もこの通りに揃えること。

- [ ] **Step 2: Commit**

```bash
git add mobile/assets/oauth-client-metadata.json
git commit -m "feat(mobile): add canonical OAuth client metadata asset"
```

---

### Task 4: `@atproto/oauth-client-expo` を追加し旧依存を削除

**Files:**
- Modify: `mobile/package.json`

- [ ] **Step 1: 旧依存の参照を grep で確認**

Run:
```bash
cd mobile && grep -r "expo-auth-session" --include="*.ts" --include="*.tsx" .
cd mobile && grep -r "base-64" --include="*.ts" --include="*.tsx" .
```
Expected: `mobile/lib/bskyOAuth.ts` の import 行のみ (Task 11 で削除予定)。それ以外で参照があれば Task 11 の削除範囲を拡張する必要がある。

- [ ] **Step 2: 新パッケージをインストール**

Run:
```bash
cd mobile && npm install @atproto/oauth-client-expo@0.0.10 --save-exact
```
Expected: `package.json` の `dependencies` に `"@atproto/oauth-client-expo": "0.0.10"` が**キャレット無し**で入る。

- [ ] **Step 3: 旧依存を削除**

Run:
```bash
cd mobile && npm uninstall expo-auth-session base-64 @types/base-64
```
Expected: `package.json` から 3 つのパッケージが消える。`node_modules` も更新される。

> **Note:** `npm install` 後の `package-lock.json` の差分も一緒にコミットする。

- [ ] **Step 4: `mobile/package.json` を確認**

Run: `cat mobile/package.json`
Expected:
- `dependencies` に `"@atproto/oauth-client-expo": "0.0.10"` (キャレット無し)
- `expo-auth-session`, `base-64` が消えている
- `devDependencies` から `@types/base-64` が消えている

- [ ] **Step 5: 既存テストがまだ通ることを確認**

Run: `cd mobile && npm run test -- --run`
Expected: 既存の 4 つのテストファイル (`bskyHelpers.test.ts` 等) が全て pass する。この時点で `bskyOAuth.ts` はまだ旧 import のまま残っているが、テスト対象ではないので影響なし。

- [ ] **Step 6: Commit**

```bash
git add mobile/package.json mobile/package-lock.json
git commit -m "chore(mobile): add @atproto/oauth-client-expo, remove expo-auth-session"
```

---

### Task 5: `app.json` の scheme を更新

**Files:**
- Modify: `mobile/app.json`

- [ ] **Step 1: scheme を書き換え**

Edit `mobile/app.json`:
```json
{
  "expo": {
    "name": "Sky Follower Bridge",
    "slug": "sky-follower-bridge",
    "version": "1.0.0",
    "scheme": "dev.sky-follower-bridge.mobile",
    "platforms": ["ios", "android"],
    ...
  }
}
```

`"scheme": "sky-follower-bridge"` → `"scheme": "dev.sky-follower-bridge.mobile"` に変更するのみ。他のフィールドには触れない。

- [ ] **Step 2: Commit**

```bash
git add mobile/app.json
git commit -m "chore(mobile): update URL scheme to bundle identifier"
```

---

### Task 6: iOS Info.plist から旧 scheme を削除

**Files:**
- Modify: `mobile/ios/SkyFollowerBridge/Info.plist`

- [ ] **Step 1: 旧 scheme を削除**

現状の `CFBundleURLTypes` は以下の通り:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>sky-follower-bridge</string>
      <string>dev.sky-follower-bridge.mobile</string>
    </array>
  </dict>
</array>
```

`<string>sky-follower-bridge</string>` の行のみ削除し、以下の状態にする:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>dev.sky-follower-bridge.mobile</string>
    </array>
  </dict>
</array>
```

- [ ] **Step 2: Commit**

```bash
git add mobile/ios/SkyFollowerBridge/Info.plist
git commit -m "chore(ios): remove legacy sky-follower-bridge URL scheme"
```

---

### Task 7: pod install と iOS ビルド確認

**Files:** (変更なし、ビルド検証のみ)

- [ ] **Step 1: pod install 実行**

Run:
```bash
cd mobile/ios && pod install
```
Expected:
- `ExpoAtprotoOAuthClient` Pod がインストールされる (autolink)
- `Podfile.lock` が更新される
- エラーなく完了する

もし Pod が見つからないエラーが出た場合、`cd mobile && npx expo prebuild --no-install` **は実行しない** (既存の `mobile/ios/` を壊すため)。代わりに `cd mobile && npx pod-install` を試す。

- [ ] **Step 2: iOS シミュレータでビルド確認**

Run:
```bash
cd mobile && npm run ios
```
Expected:
- Xcode ビルドが成功する
- シミュレータでアプリが起動する
- `auth.tsx` 画面が表示される (まだ旧 OAuth 実装のまま)
- この時点では OAuth は動かなくてよい。**ビルドが通ること**だけを確認する。

ビルド失敗時のトラブルシューティング:
- Pods 周りのエラー → `cd mobile/ios && rm -rf Pods Podfile.lock && pod install`
- Xcode キャッシュ → `cd mobile && rm -rf ios/build`
- ネイティブモジュール認識されない → `cd mobile && npx expo-modules-autolinking react-native-config`

- [ ] **Step 3: シミュレータを停止し、Podfile.lock をコミット**

```bash
git add mobile/ios/Podfile.lock
git commit -m "chore(ios): pod install for @atproto/oauth-client-expo"
```

---

### Task 8: `bskyOAuthClient.ts` シングルトン作成

**Files:**
- Create: `mobile/lib/bskyOAuthClient.ts`

> **重要な事前確認:** `@atproto/oauth-client-expo@0.0.10` の実 API を確認する。以下のステップで node_modules の型定義を読んでから実装する。

- [ ] **Step 1: パッケージの型定義を確認**

Run:
```bash
cd mobile && find node_modules/@atproto/oauth-client-expo -name "*.d.ts" | head
```
見つかった `.d.ts` を読み、以下を確認する:
- メインのクラス名 (想定: `ExpoOAuthClient` もしくは `OAuthClient`)
- コンストラクタが受け取る client metadata の形 (JSON そのまま? `clientMetadata` プロパティ?)
- `signIn(handle)` の戻り値型 (想定: `OAuthSession` を直接返すか、`{ status, session }` のようなタグ付きか)
- `restore(sub, refresh)` の第二引数の型 (`boolean` or `'auto' | boolean`)
- `OAuthSession` から DPoP fetch を取得するプロパティ名 (想定候補: `fetchHandler` / `dpopFetch` / `fetch`)
- PDS URL を取得するプロパティ名 (想定候補: `server.issuer` / `serverUrl`)
- `sub` プロパティの取得元

この確認結果を以下の Step 2 の実装テンプレートに反映する。プロパティ名が異なっていた場合、テンプレートの該当箇所を差し替える。

- [ ] **Step 2: シングルトンファイルを作成**

`mobile/lib/bskyOAuthClient.ts` (**Step 1 で判明したプロパティ名に合わせて調整すること**):

```ts
import { ExpoOAuthClient } from "@atproto/oauth-client-expo";
import clientMetadata from "~/assets/oauth-client-metadata.json";

let instance: ExpoOAuthClient | null = null;

export function getExpoOAuthClient(): ExpoOAuthClient {
  if (!instance) {
    instance = new ExpoOAuthClient({
      clientMetadata: clientMetadata as never,
    });
  }
  return instance;
}

export const expoOAuthClient = {
  async signIn(identifier: string) {
    return getExpoOAuthClient().signIn(identifier);
  },

  // spec の決定事項 #6: restore 時に refresh を強制しない
  // (拡張版と同じ方針で並列 restore 競合を回避)
  async restore(sub: string) {
    return getExpoOAuthClient().restore(sub, false);
  },

  async signOut(sub: string) {
    return getExpoOAuthClient().signOut(sub);
  },
};
```

> **JSON import について:** `tsconfig.json` に `"resolveJsonModule": true` が必要。`expo/tsconfig.base` が既にこれを有効にしている想定だが、TS エラーが出たら明示的に追加する。

- [ ] **Step 3: TypeScript 型チェック**

Run: `cd mobile && npx tsc --noEmit`
Expected: エラーなし。もし `ExpoOAuthClient` の型エクスポート名が異なっていたら Step 1 の調査結果でパッチする。

- [ ] **Step 4: Commit**

```bash
git add mobile/lib/bskyOAuthClient.ts
git commit -m "feat(mobile): add ExpoOAuthClient singleton wrapper"
```

---

### Task 9: `bskyOAuth.ts` のエラー正規化テストを先に書く (TDD)

**Files:**
- Create: `mobile/__tests__/bskyOAuth.test.ts`

- [ ] **Step 1: 失敗するテストを書く**

`mobile/__tests__/bskyOAuth.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("~/lib/bskyOAuthClient", () => ({
  expoOAuthClient: {
    signIn: vi.fn(),
    restore: vi.fn(),
    signOut: vi.fn(),
  },
}));

vi.mock("@atproto/api", () => ({
  AtpAgent: vi.fn().mockImplementation((opts) => ({
    service: opts.service,
    fetch: opts.fetch,
  })),
}));

import { AtpAgent } from "@atproto/api";
import { expoOAuthClient } from "~/lib/bskyOAuthClient";
import { loginWithOAuth, OAuthLoginError } from "~/lib/bskyOAuth";

describe("loginWithOAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns agent and sub on success", async () => {
    const fakeSession = {
      sub: "did:plc:abc123",
      server: { issuer: "https://bsky.social" },
      fetchHandler: vi.fn(),
    };
    vi.mocked(expoOAuthClient.signIn).mockResolvedValue(fakeSession as never);

    const result = await loginWithOAuth("alice.bsky.social");

    expect(result.sub).toBe("did:plc:abc123");
    expect(result.agent).toBeDefined();
    expect(AtpAgent).toHaveBeenCalledWith({
      service: "https://bsky.social",
      fetch: fakeSession.fetchHandler,
    });
  });

  it("throws OAuthLoginError with code=unknown when sub is empty", async () => {
    vi.mocked(expoOAuthClient.signIn).mockResolvedValue({
      sub: "",
      server: { issuer: "https://bsky.social" },
      fetchHandler: vi.fn(),
    } as never);

    await expect(loginWithOAuth("alice.bsky.social")).rejects.toMatchObject({
      name: "OAuthLoginError",
      code: "unknown",
    });
  });

  it("normalizes handle resolution errors", async () => {
    vi.mocked(expoOAuthClient.signIn).mockRejectedValue(
      new Error("Unable to resolve handle"),
    );

    await expect(loginWithOAuth("bad.handle")).rejects.toMatchObject({
      code: "handle_resolution_failed",
    });
  });

  it("normalizes cancelled as OAuthLoginError code=cancelled", async () => {
    vi.mocked(expoOAuthClient.signIn).mockRejectedValue(
      new Error("User cancelled the authentication flow"),
    );

    await expect(loginWithOAuth("alice.bsky.social")).rejects.toMatchObject({
      code: "cancelled",
    });
  });

  it("normalizes network errors", async () => {
    vi.mocked(expoOAuthClient.signIn).mockRejectedValue(
      new TypeError("Network request failed"),
    );

    await expect(loginWithOAuth("alice.bsky.social")).rejects.toMatchObject({
      code: "network",
    });
  });

  it("falls back to code=unknown for unrecognized errors", async () => {
    vi.mocked(expoOAuthClient.signIn).mockRejectedValue(
      new Error("something weird"),
    );

    await expect(loginWithOAuth("alice.bsky.social")).rejects.toMatchObject({
      code: "unknown",
    });
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `cd mobile && npm run test -- --run bskyOAuth`
Expected: FAIL — `Cannot find module '~/lib/bskyOAuth'` または `OAuthLoginError` が export されていない、など。テストが「書き換え前の旧 bskyOAuth.ts」をインポートしている場合は、旧ファイルから `OAuthLoginError` と新しい `loginWithOAuth` シグネチャが無いため失敗する。

これで失敗を確認したら次のタスクへ。**このタスクではまだコミットしない** (テストだけの中間状態はレビュー不能なため、Task 10 と一緒にコミットする)。

---

### Task 10: `bskyOAuth.ts` を全面書き換え

**Files:**
- Modify: `mobile/lib/bskyOAuth.ts`

- [ ] **Step 1: ファイル全体を置き換え**

`mobile/lib/bskyOAuth.ts` の**全内容**を以下に置き換える:

```ts
import { AtpAgent } from "@atproto/api";
import { expoOAuthClient } from "~/lib/bskyOAuthClient";

export type OAuthLoginErrorCode =
  | "cancelled"
  | "handle_resolution_failed"
  | "network"
  | "auth_server_unavailable"
  | "token_exchange_failed"
  | "browser_failed"
  | "unknown";

export class OAuthLoginError extends Error {
  public readonly code: OAuthLoginErrorCode;
  public readonly cause?: unknown;

  constructor(code: OAuthLoginErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "OAuthLoginError";
    this.code = code;
    this.cause = cause;
  }
}

function normalizeError(e: unknown): OAuthLoginError {
  if (e instanceof OAuthLoginError) return e;

  const rawMessage = e instanceof Error ? e.message : String(e);
  const msg = rawMessage.toLowerCase();

  if (msg.includes("cancel")) {
    return new OAuthLoginError("cancelled", rawMessage, e);
  }
  if (msg.includes("resolve handle") || msg.includes("handle not found")) {
    return new OAuthLoginError("handle_resolution_failed", rawMessage, e);
  }
  if (e instanceof TypeError && msg.includes("network")) {
    return new OAuthLoginError("network", rawMessage, e);
  }
  if (msg.includes("authorization server") || msg.includes("metadata")) {
    return new OAuthLoginError("auth_server_unavailable", rawMessage, e);
  }
  if (msg.includes("token")) {
    return new OAuthLoginError("token_exchange_failed", rawMessage, e);
  }
  if (msg.includes("browser") || msg.includes("webbrowser")) {
    return new OAuthLoginError("browser_failed", rawMessage, e);
  }
  return new OAuthLoginError("unknown", rawMessage, e);
}

export async function loginWithOAuth(identifier: string): Promise<{
  agent: AtpAgent;
  sub: string;
}> {
  let session: Awaited<ReturnType<typeof expoOAuthClient.signIn>>;
  try {
    session = await expoOAuthClient.signIn(identifier);
  } catch (e) {
    throw normalizeError(e);
  }

  // spec の「Step 15 の検証」: 空値 sub はその後の restore を必ず失敗させる
  if (!session.sub) {
    throw new OAuthLoginError("unknown", "OAuth session has empty sub");
  }

  const agent = new AtpAgent({
    service: session.server.issuer,
    fetch: session.fetchHandler,
  });

  return { agent, sub: session.sub };
}
```

> **Note:** `session.server.issuer` と `session.fetchHandler` は Task 8 Step 1 の調査で確定させた名前を使う。実際のパッケージ API が異なればここで調整する。

- [ ] **Step 2: テストが pass することを確認**

Run: `cd mobile && npm run test -- --run bskyOAuth`
Expected: 全 6 テスト pass

- [ ] **Step 3: 型チェック**

Run: `cd mobile && npx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 4: Commit (テストと実装を同じコミットに)**

```bash
git add mobile/lib/bskyOAuth.ts mobile/__tests__/bskyOAuth.test.ts
git commit -m "feat(mobile): rewrite bskyOAuth with ExpoOAuthClient and error normalization"
```

---

### Task 11: `BSKY_OAUTH_*` 定数を削除

**Files:**
- Modify: `mobile/lib/constants.ts`

- [ ] **Step 1: 未参照であることを確認**

Run:
```bash
cd mobile && grep -rn "BSKY_OAUTH_" --include="*.ts" --include="*.tsx" .
```
Expected: `constants.ts` の定義行のみ。他ファイルで参照があれば (Task 10 の rewrite でもう無いはずだが) そちらを先に潰す。

- [ ] **Step 2: 定数を削除**

`mobile/lib/constants.ts` から以下の 3 行ブロックを削除:

```ts
export const BSKY_OAUTH_CLIENT_ID =
  "https://server.sky-follower-bridge.dev/oauth/client-metadata.json";

export const BSKY_OAUTH_REDIRECT_URI =
  "https://server.sky-follower-bridge.dev/oauth/callback";

export const BSKY_OAUTH_SCOPE = "atproto transition:generic";
```

他の定数 (`BSKY_DOMAIN`, `SECURE_STORE_KEYS` 等) には触れない。

- [ ] **Step 3: 型チェック**

Run: `cd mobile && npx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 4: テスト**

Run: `cd mobile && npm run test -- --run`
Expected: 全テスト pass

- [ ] **Step 5: Commit**

```bash
git add mobile/lib/constants.ts
git commit -m "chore(mobile): remove unused BSKY_OAUTH_* constants"
```

---

### Task 12: `restoreAgent` OAuth 分岐のテストを先に書く (TDD)

**Files:**
- Create: `mobile/__tests__/bskyAgent.test.ts`

- [ ] **Step 1: 失敗するテストを書く**

`mobile/__tests__/bskyAgent.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("~/lib/bskyOAuthClient", () => ({
  expoOAuthClient: {
    signIn: vi.fn(),
    restore: vi.fn(),
    signOut: vi.fn(),
  },
}));

vi.mock("@atproto/api", () => ({
  AtpAgent: vi.fn().mockImplementation((opts) => ({
    service: opts.service,
    fetch: opts.fetch,
    session: { handle: "alice.bsky.social", did: "did:plc:abc123" },
    resumeSession: vi.fn().mockResolvedValue(undefined),
    login: vi.fn(),
  })),
}));

import { expoOAuthClient } from "~/lib/bskyOAuthClient";
import { restoreAgent } from "~/lib/bskyAgent";
import type { SessionData } from "~/types";

describe("restoreAgent (OAuth branch)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an AtpAgent when OAuth restore succeeds", async () => {
    vi.mocked(expoOAuthClient.restore).mockResolvedValue({
      sub: "did:plc:abc123",
      server: { issuer: "https://bsky.social" },
      fetchHandler: vi.fn(),
    } as never);

    const sessionData: SessionData = {
      authMethod: "oauth",
      sub: "did:plc:abc123",
    };

    const agent = await restoreAgent(sessionData);

    expect(agent).not.toBeNull();
    expect(expoOAuthClient.restore).toHaveBeenCalledWith("did:plc:abc123");
  });

  it("returns null and calls signOut when OAuth restore fails", async () => {
    vi.mocked(expoOAuthClient.restore).mockRejectedValue(
      new Error("session expired"),
    );
    vi.mocked(expoOAuthClient.signOut).mockResolvedValue(undefined);

    const sessionData: SessionData = {
      authMethod: "oauth",
      sub: "did:plc:abc123",
    };

    const agent = await restoreAgent(sessionData);

    expect(agent).toBeNull();
    expect(expoOAuthClient.signOut).toHaveBeenCalledWith("did:plc:abc123");
  });

  it("swallows signOut errors during failed restore", async () => {
    vi.mocked(expoOAuthClient.restore).mockRejectedValue(
      new Error("restore failed"),
    );
    vi.mocked(expoOAuthClient.signOut).mockRejectedValue(
      new Error("offline"),
    );

    const sessionData: SessionData = {
      authMethod: "oauth",
      sub: "did:plc:abc123",
    };

    // should not throw
    const agent = await restoreAgent(sessionData);
    expect(agent).toBeNull();
  });

  it("returns null immediately when sub is empty (stale marker)", async () => {
    const sessionData: SessionData = {
      authMethod: "oauth",
      sub: "",
    };

    const agent = await restoreAgent(sessionData);

    expect(agent).toBeNull();
    expect(expoOAuthClient.restore).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `cd mobile && npm run test -- --run bskyAgent`
Expected: FAIL — 現状の `restoreAgent` は OAuth 分岐で `return null` しか返さない placeholder なので、最初の成功ケースが失敗する。

---

### Task 13: `restoreAgent` に OAuth 分岐を実装

**Files:**
- Modify: `mobile/lib/bskyAgent.ts`

- [ ] **Step 1: OAuth 分岐を実装**

`mobile/lib/bskyAgent.ts` の全内容を以下に置き換える:

```ts
import { AtpAgent } from "@atproto/api";
import { expoOAuthClient } from "~/lib/bskyOAuthClient";
import type { SessionData } from "~/types";
import { BSKY_DOMAIN } from "./constants";

export async function createAgentWithAppPassword({
  identifier,
  password,
  authFactorToken,
  service,
}: {
  identifier: string;
  password: string;
  authFactorToken?: string;
  service?: string;
}): Promise<{ agent: AtpAgent; sessionData: SessionData }> {
  const serviceUrl = service || `https://${BSKY_DOMAIN}`;
  const agent = new AtpAgent({ service: serviceUrl });
  const response = await agent.login({
    identifier,
    password,
    authFactorToken,
  });

  const sessionData: SessionData = {
    authMethod: "app-password",
    service: serviceUrl,
    session: JSON.stringify(response.data),
  };

  return { agent, sessionData };
}

export async function restoreAgent(
  sessionData: SessionData,
): Promise<AtpAgent | null> {
  if (sessionData.authMethod === "app-password") {
    const agent = new AtpAgent({ service: sessionData.service });
    const session = JSON.parse(sessionData.session);
    await agent.resumeSession(session);
    return agent;
  }

  // OAuth branch
  if (!sessionData.sub) {
    return null;
  }

  try {
    const session = await expoOAuthClient.restore(sessionData.sub);
    return new AtpAgent({
      service: session.server.issuer,
      fetch: session.fetchHandler,
    });
  } catch {
    // MMKV purge (best-effort). revoke はオフライン時に失敗しうるが無視する。
    await expoOAuthClient.signOut(sessionData.sub).catch(() => {});
    return null;
  }
}
```

- [ ] **Step 2: テストが pass することを確認**

Run: `cd mobile && npm run test -- --run bskyAgent`
Expected: 全 4 テスト pass

- [ ] **Step 3: 全テスト実行**

Run: `cd mobile && npm run test -- --run`
Expected: 全テストファイルが pass

- [ ] **Step 4: Commit**

```bash
git add mobile/lib/bskyAgent.ts mobile/__tests__/bskyAgent.test.ts
git commit -m "feat(mobile): implement OAuth branch in restoreAgent"
```

---

### Task 14: `AuthContext` を更新 (sub ガード、restore 失敗、logout OAuth 分岐)

**Files:**
- Modify: `mobile/contexts/AuthContext.tsx`

- [ ] **Step 1: AuthContext を書き換え**

`mobile/contexts/AuthContext.tsx` の全内容を以下に置き換える:

```tsx
import { AtpAgent } from "@atproto/api";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createAgentWithAppPassword, restoreAgent } from "~/lib/bskyAgent";
import { loginWithOAuth } from "~/lib/bskyOAuth";
import { expoOAuthClient } from "~/lib/bskyOAuthClient";
import { clearSession, loadSession, saveSession } from "~/lib/sessionStorage";
import type { SessionData } from "~/types";

type AuthState = {
  agent: AtpAgent | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  handle: string | null;
  loginWithAppPassword: (params: {
    identifier: string;
    password: string;
    authFactorToken?: string;
    service?: string;
  }) => Promise<void>;
  loginWithOAuth: (identifier: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [agent, setAgent] = useState<AtpAgent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [handle, setHandle] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const session = await loadSession();
        if (!session) return;

        // sub 空値ガード: 旧バグの残骸データで restore を走らせない
        if (session.authMethod === "oauth" && !session.sub) {
          await clearSession();
          return;
        }

        const restored = await restoreAgent(session);
        if (restored) {
          setAgent(restored);
          setHandle(restored.session?.handle ?? null);
        } else {
          // restore 失敗時は secure-store マーカーもクリア
          await clearSession();
          if (session.authMethod === "oauth" && session.sub) {
            await expoOAuthClient.signOut(session.sub).catch(() => {});
          }
        }
      } catch (e) {
        console.error("Session restore failed:", e);
        await clearSession().catch(() => {});
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const loginWithAppPassword = useCallback(
    async (params: {
      identifier: string;
      password: string;
      authFactorToken?: string;
      service?: string;
    }) => {
      const { agent: newAgent, sessionData } =
        await createAgentWithAppPassword(params);
      await saveSession(sessionData);
      setAgent(newAgent);
      setHandle(newAgent.session?.handle ?? null);
    },
    [],
  );

  const handleOAuthLogin = useCallback(async (identifier: string) => {
    const { agent: newAgent, sub } = await loginWithOAuth(identifier);
    // Defense-in-depth: bskyOAuth.ts でも空値ガードしているが二重に防ぐ
    if (!sub) {
      throw new Error("OAuth login returned empty sub");
    }
    const sessionData: SessionData = { authMethod: "oauth", sub };
    await saveSession(sessionData);
    setAgent(newAgent);
    setHandle(newAgent.session?.handle ?? null);
  }, []);

  const logout = useCallback(async () => {
    // 先に現在のセッション情報を読む (clearSession 後は読めないため)
    const current = await loadSession();
    if (current?.authMethod === "oauth" && current.sub) {
      // revoke + MMKV purge (best-effort)
      await expoOAuthClient.signOut(current.sub).catch(() => {});
    }
    await clearSession();
    setAgent(null);
    setHandle(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        agent,
        isLoading,
        isLoggedIn: agent !== null,
        handle,
        loginWithAppPassword,
        loginWithOAuth: handleOAuthLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

- [ ] **Step 2: 型チェック**

Run: `cd mobile && npx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 3: 既存テスト実行**

Run: `cd mobile && npm run test -- --run`
Expected: 全テスト pass (AuthContext のテストは無いので回帰なし)

- [ ] **Step 4: Commit**

```bash
git add mobile/contexts/AuthContext.tsx
git commit -m "feat(mobile): harden AuthContext with OAuth logout, sub guard, restore cleanup"
```

---

### Task 15: `auth.tsx` のエラー表示を `OAuthLoginError.code` ベースに

**Files:**
- Modify: `mobile/app/auth.tsx`

- [ ] **Step 1: エラーマッピングを追加**

`mobile/app/auth.tsx` の `handleOAuthLogin` 関数だけを以下に書き換える (他の部分は触らない):

```tsx
import { OAuthLoginError } from "~/lib/bskyOAuth";

// ... (component 内)

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  handle_resolution_failed:
    "Handle not found. Please check the spelling and try again.",
  auth_server_unavailable:
    "Couldn't reach the Bluesky authorization server. Please try again later.",
  token_exchange_failed:
    "Authentication failed. Please try again.",
  browser_failed:
    "Couldn't open the browser. Please try again.",
  network:
    "Network error. Please check your connection.",
  unknown:
    "Login failed. Please try again.",
};

const handleOAuthLogin = async (handleOverride?: string) => {
  const handle = handleOverride || identifier.trim();
  if (!handle) {
    Alert.alert("Error", "Please enter your Bluesky handle.");
    return;
  }

  setIsLoading(true);
  try {
    await loginWithOAuth(handle);
    router.replace("/x-login-guide");
  } catch (e) {
    if (e instanceof OAuthLoginError) {
      // cancelled はユーザー意図なのでサイレント
      if (e.code === "cancelled") {
        return;
      }
      const message = OAUTH_ERROR_MESSAGES[e.code] ?? OAUTH_ERROR_MESSAGES.unknown;
      Alert.alert("Login Error", message);
    } else {
      const message = e instanceof Error ? e.message : "OAuth login failed";
      Alert.alert("Login Error", message);
    }
  } finally {
    setIsLoading(false);
  }
};
```

`handleAppPasswordLogin` は変更しない (App Password 経路は既存のエラー表示を維持)。

- [ ] **Step 2: 型チェック**

Run: `cd mobile && npx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 3: Commit**

```bash
git add mobile/app/auth.tsx
git commit -m "feat(mobile): normalize OAuth login error messages in auth screen"
```

---

### Task 16: local JSON と server canonical 出力の snapshot 一致テスト

**Files:**
- Create: `mobile/__tests__/oauthClientMetadata.test.ts`

- [ ] **Step 1: snapshot テストを書く**

`mobile/__tests__/oauthClientMetadata.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import mobileMetadata from "~/assets/oauth-client-metadata.json";
import { createMobileOAuthClientMetadata } from "../../server/src/lib/mobileOAuthClientMetadata";

describe("OAuth client metadata canonical consistency", () => {
  it("mobile asset matches server canonical output byte-for-byte", () => {
    const serverMetadata = createMobileOAuthClientMetadata();

    // 深い等価
    expect(mobileMetadata).toEqual(serverMetadata);

    // さらに厳密: JSON シリアライズ結果が一致すること
    // (プロパティ順序とホワイトスペースの違いを防ぐ)
    expect(JSON.stringify(mobileMetadata)).toBe(JSON.stringify(serverMetadata));
  });

  it("uses native application_type", () => {
    const metadata = createMobileOAuthClientMetadata();
    expect(metadata.application_type).toBe("native");
  });

  it("uses custom scheme redirect URI with single slash", () => {
    const metadata = createMobileOAuthClientMetadata();
    expect(metadata.redirect_uris).toEqual([
      "dev.sky-follower-bridge.mobile:/oauth-callback",
    ]);
  });

  it("client_id points to canonical production URL", () => {
    const metadata = createMobileOAuthClientMetadata();
    expect(metadata.client_id).toBe(
      "https://server.sky-follower-bridge.dev/oauth/mobile/client-metadata.json",
    );
  });
});
```

> **Note on cross-package import:** `mobile/__tests__` から `server/src/lib/*` を直接 import することで、monorepo 的に両者の乖離を検出する。vitest は happy-dom 環境で動くが、`createMobileOAuthClientMetadata` は純粋関数なので問題ない。もし tsconfig の `rootDir` 制約で失敗したら、`mobile/vitest.config.ts` 側で `server` をインクルードパスに追加する:
>
> ```ts
> resolve: { alias: { "~/": new URL("./", import.meta.url).pathname } }
> ```
>
> もう一つの選択肢: server 側のヘルパーを JSON シリアライズして書き出した固定スナップショットを作る方法もあるが、二重管理になるので直接 import を優先する。

- [ ] **Step 2: テストを実行**

Run: `cd mobile && npm run test -- --run oauthClientMetadata`
Expected: 全 4 テスト pass

失敗した場合の診断:
- 深い等価は通るが JSON 文字列一致が失敗 → プロパティ順序不一致。`mobile/assets/oauth-client-metadata.json` のキー順序を `createMobileOAuthClientMetadata` が返すオブジェクトと揃える
- import エラー → vitest 設定でパスが解決されていない。`mobile/vitest.config.ts` を確認

- [ ] **Step 3: 全テスト実行**

Run: `cd mobile && npm run test -- --run`
Expected: 全テスト pass (7 ファイル: 既存 4 + 新規 3)

- [ ] **Step 4: Commit**

```bash
git add mobile/__tests__/oauthClientMetadata.test.ts
git commit -m "test(mobile): snapshot OAuth metadata consistency with server"
```

---

### Task 17: 実機 (iOS シミュレータ) での検証

**Files:** (検証のみ、コード変更なし)

**Note:** このタスクは人間の操作が必要。自動化できない。エージェント実行時はユーザーに手動検証を依頼する。

- [ ] **Step 1: サーバーを本番にデプロイ**

Run:
```bash
cd server && npm run deploy
```
Expected: Wrangler が deploy 完了を報告する

Run (本番に到達できたか):
```bash
curl -s https://server.sky-follower-bridge.dev/oauth/mobile/client-metadata.json | jq .
```
Expected: Task 3 Step 1 と完全一致する JSON が返る

- [ ] **Step 2: iOS シミュレータでアプリを起動**

Run: `cd mobile && npm run ios`
Expected: アプリが起動し `auth.tsx` が表示される

- [ ] **Step 3: OAuth sign in フロー**

1. handle `alice.bsky.social` (自分のテストアカウント) を入力
2. "Sign in with Bluesky" ボタンを押す
3. システムブラウザが開き Bluesky の認可画面が表示される
4. 認可する
5. アプリに戻り `/x-login-guide` 画面に遷移する

Expected: 全て成功すること

- [ ] **Step 4: アプリ再起動でセッション復元**

1. シミュレータでアプリを完全終了 (swipe up)
2. 再度起動
3. `auth.tsx` をスキップして直接 `x-login-guide` または `index` に遷移する

Expected: 再ログイン不要でセッションが復元される

- [ ] **Step 5: Logout → 両ストレージが空**

1. Logout を実行
2. `auth.tsx` に戻ることを確認
3. アプリを完全終了 → 再起動
4. `auth.tsx` がそのまま表示される (何も復元されない)

Expected: secure-store と MMKV 両方がクリアされている

- [ ] **Step 6: キャンセルフローのサイレント動作**

1. sign in ボタンを押す
2. ブラウザでキャンセル
3. アプリに戻ると **Alert が出ない** こと、UI が loading 状態から復帰していること

Expected: 静かに元の画面に戻る

- [ ] **Step 7: 機内モード起動**

1. シミュレータを機内モードに
2. アプリを起動

Expected: クラッシュせずに起動する。restore は成功する (local 操作のみ) か、失敗して `auth.tsx` に落ちる

- [ ] **Step 8: リフレッシュトークン期限切れシミュレーション (advanced)**

MMKV を直接書き換えるのは難易度が高い。spec でも「できれば」程度の検証なので、時間が無ければスキップして OK。

簡易代替: Bluesky の別デバイスでセッションを revoke → アプリ起動 → restore が失敗して `/auth` に誘導されることを確認。

- [ ] **Step 9: 検証完了のメモを残す (optional)**

検証結果を `specs/plans/2026-04-10-mobile-oauth-expo-verification.md` にまとめる (optional、記録用)。失敗項目があれば該当 Task に戻って修正する。

- [ ] **Step 10: 検証完了を示す空コミット**

```bash
git commit --allow-empty -m "chore(mobile): manual verification of OAuth flow passed"
```

---

## 完了基準

- [ ] Task 1-16 の全ステップがチェック済み
- [ ] `cd mobile && npm run test -- --run` が全テスト pass
- [ ] `cd mobile && npx tsc --noEmit` がエラーなし
- [ ] `cd server && npx tsc --noEmit` がエラーなし
- [ ] iOS シミュレータで Task 17 の Step 3-6 が全て成功 (Step 7-8 は best-effort)
- [ ] 旧 `expo-auth-session` / `base-64` / `BSKY_OAUTH_*` 定数への参照がどこにもない (`grep` で確認)

---

## リスクと迂回

| リスク | 発生条件 | 対応 |
|---|---|---|
| `@atproto/oauth-client-expo` の API が想定と違う (プロパティ名など) | Task 8-10 で型エラー | Task 8 Step 1 の調査結果で実装テンプレートをパッチする。それでも動かない場合は設計書「リスクと撤退計画」の feature flag 化へ |
| iOS ネイティブビルド失敗 | Task 7 Step 2 | Pods 再生成 (`rm -rf Pods Podfile.lock && pod install`)。それでも駄目なら `expo prebuild --clean` は**使わず** (既存 iOS 手修正を失うため)、個別に Pod エラーを読む |
| snapshot テストで JSON 順序不一致 | Task 16 Step 2 | `mobile/assets/oauth-client-metadata.json` のキー順を `createMobileOAuthClientMetadata` が返す順序に揃える |
| server デプロイ後に `application_type: native` が Bluesky AS で拒否される | Task 17 Step 3 | 極低確率 (公式仕様)。発生したら設計書に戻って再検討 |
| 旧 scheme 削除で何かが壊れる | Task 6 | 極低 (旧 `expo-auth-session` フローは Task 10 で完全削除済)。万一壊れたら Task 6 の diff を revert |

---

## 見送り事項 (この計画では扱わない)

- Android サポート (`mobile/android/` 不在)
- `AtpAgent` → `Agent` 基底型への移行
- App Password のカスタム PDS / 2FA 対応
- マルチアカウント
- CI 上での iOS ビルド自動化

設計書の「見送り事項」節を参照。
