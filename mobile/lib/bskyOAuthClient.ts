import { ExpoOAuthClient } from "@atproto/oauth-client-expo";
import type { OAuthSession } from "@atproto/oauth-client-expo";
import clientMetadata from "~/assets/oauth-client-metadata.json";

let instance: ExpoOAuthClient | null = null;

function getClient(): ExpoOAuthClient {
  if (!instance) {
    instance = new ExpoOAuthClient({
      clientMetadata: clientMetadata as never,
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
