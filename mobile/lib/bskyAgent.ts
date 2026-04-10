import { Agent, AtpAgent } from "@atproto/api";
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
): Promise<{ agent: Agent; handle: string } | null> {
  if (sessionData.authMethod === "app-password") {
    const agent = new AtpAgent({ service: sessionData.service });
    const session = JSON.parse(sessionData.session);
    await agent.resumeSession(session);
    return { agent, handle: agent.session?.handle ?? "" };
  }

  // OAuth branch
  if (!sessionData.sub) {
    return null;
  }

  let session: Awaited<ReturnType<typeof expoOAuthClient.restore>>;
  try {
    session = await expoOAuthClient.restore(sessionData.sub);
  } catch {
    await expoOAuthClient.revoke(sessionData.sub).catch(() => {});
    return null;
  }

  // OAuthSession は SessionManager を duck-type で満たす。
  const agent = new Agent(
    session as unknown as ConstructorParameters<typeof Agent>[0],
  );

  // OAuth セッションは handle を直接持たないので getProfile で解決する。
  // 失敗時は MMKV の session も purge して呼び出し側に再ログインさせる。
  try {
    const profile = await agent.getProfile({ actor: sessionData.sub });
    return { agent, handle: profile.data.handle };
  } catch {
    await expoOAuthClient.revoke(sessionData.sub).catch(() => {});
    return null;
  }
}
