import { Agent } from "@atproto/api";
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
  agent: Agent;
  sub: string;
  handle: string;
}> {
  let session: Awaited<ReturnType<typeof expoOAuthClient.signIn>>;
  try {
    session = await expoOAuthClient.signIn(identifier);
  } catch (e) {
    throw normalizeError(e);
  }

  if (!session.sub) {
    throw new OAuthLoginError("unknown", "OAuth session has empty sub");
  }

  // OAuthSession は SessionManager を duck-type で満たすので Agent に直接渡せる。
  // cf. 拡張版 src/lib/bskyClient.ts の createAgentFromOAuthSession
  const agent = new Agent(
    session as unknown as ConstructorParameters<typeof Agent>[0],
  );

  // OAuth 経路では AtpAgent のような session.handle が無いので getProfile で解決する。
  let handle: string;
  try {
    const profile = await agent.getProfile({ actor: session.sub });
    handle = profile.data.handle;
  } catch (e) {
    throw normalizeError(e);
  }

  return { agent, sub: session.sub, handle };
}
