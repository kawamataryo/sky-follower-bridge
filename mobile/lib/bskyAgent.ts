import { AtpAgent } from "@atproto/api";
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

  // OAuth restoration will be implemented in bskyOAuth.ts
  return null;
}
