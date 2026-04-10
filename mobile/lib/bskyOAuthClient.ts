// Must be imported BEFORE @atproto/oauth-client-expo so the AbortSignal.timeout
// polyfill is in place when the package's runtime helpers are evaluated.
import "~/lib/polyfills";

import { ExpoOAuthClient } from "@atproto/oauth-client-expo";
import type { OAuthSession } from "@atproto/oauth-client-expo";
import clientMetadata from "~/assets/oauth-client-metadata.json";
import { BSKY_DOMAIN } from "./constants";

let instance: ExpoOAuthClient | null = null;

function getClient(): ExpoOAuthClient {
  if (!instance) {
    instance = new ExpoOAuthClient({
      clientMetadata: clientMetadata as never,
      // XRPC handle resolution via com.atproto.identity.resolveHandle.
      // RN に DNS/DoH がないため URL 文字列で XrpcHandleResolver に委譲する
      // (拡張版と同じ構成: src/lib/bskyOAuthClient.ts の handleResolver)。
      handleResolver: `https://${BSKY_DOMAIN}`,
    });
  }
  return instance;
}

export const expoOAuthClient = {
  signIn(identifier: string): Promise<OAuthSession> {
    return getClient().signIn(identifier);
  },

  // spec 決定事項 #6: restore 時に refresh を強制しない。
  // 並列 restore 時の refresh 競合でセッションを壊すリスクを避けるため。
  // 必要になった時点で OAuthSession.fetchHandler が自動リフレッシュする。
  restore(sub: string): Promise<OAuthSession> {
    return getClient().restore(sub, false);
  },

  // OAuthClient は signOut ではなく revoke を公開する。
  revoke(sub: string): Promise<void> {
    return getClient().revoke(sub);
  },
};
