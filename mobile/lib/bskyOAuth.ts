import * as AuthSession from "expo-auth-session";
import { decode as base64Decode } from "base-64";
import * as WebBrowser from "expo-web-browser";
import { AtpAgent } from "@atproto/api";
import {
  BSKY_DOMAIN,
  BSKY_OAUTH_CLIENT_ID,
  BSKY_OAUTH_REDIRECT_URI,
  BSKY_OAUTH_SCOPE,
} from "./constants";

WebBrowser.maybeCompleteAuthSession();

const MOBILE_REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: "sky-follower-bridge",
  path: "oauth-callback",
});

function buildServerCallbackUri(): string {
  const url = new URL(BSKY_OAUTH_REDIRECT_URI);
  url.searchParams.set("redirect_uri", MOBILE_REDIRECT_URI);
  return url.toString();
}

export async function resolveAuthorizationServer(
  identifier: string,
): Promise<string> {
  const agent = new AtpAgent({ service: `https://${BSKY_DOMAIN}` });
  try {
    const did = identifier.startsWith("did:")
      ? identifier
      : (await agent.resolveHandle({ handle: identifier })).data.did;

    const didDoc = await fetch(
      did.startsWith("did:web:")
        ? `https://${did.replace("did:web:", "")}/.well-known/did.json`
        : `https://plc.directory/${did}`,
    );
    const doc = await didDoc.json();
    const pdsEndpoint =
      doc.service?.find(
        (s: { id: string }) => s.id === "#atproto_pds",
      )?.serviceEndpoint || `https://${BSKY_DOMAIN}`;

    const prm = await fetch(
      `${pdsEndpoint}/.well-known/oauth-protected-resource`,
    );
    const prmData = await prm.json();
    return prmData.authorization_servers?.[0] || `https://${BSKY_DOMAIN}`;
  } catch {
    return `https://${BSKY_DOMAIN}`;
  }
}

export async function loginWithOAuth(identifier: string): Promise<{
  agent: AtpAgent;
  sub: string;
}> {
  const authServer = await resolveAuthorizationServer(identifier);

  const asMeta = await fetch(
    `${authServer}/.well-known/oauth-authorization-server`,
  );
  const asMetaData = await asMeta.json();

  const discovery: AuthSession.DiscoveryDocument = {
    authorizationEndpoint: asMetaData.authorization_endpoint,
    tokenEndpoint: asMetaData.token_endpoint,
  };

  const redirectUri = buildServerCallbackUri();

  const request = new AuthSession.AuthRequest({
    clientId: BSKY_OAUTH_CLIENT_ID,
    scopes: [BSKY_OAUTH_SCOPE],
    redirectUri,
    usePKCE: true,
    responseType: AuthSession.ResponseType.Code,
  });

  const result = await request.promptAsync(discovery);

  if (result.type !== "success" || !result.params.code) {
    throw new Error(
      result.type === "error"
        ? result.params.error_description || "OAuth failed"
        : "OAuth cancelled",
    );
  }

  const tokenResult = await AuthSession.exchangeCodeAsync(
    {
      clientId: BSKY_OAUTH_CLIENT_ID,
      code: result.params.code,
      redirectUri,
      extraParams: {
        code_verifier: request.codeVerifier || "",
      },
    },
    discovery,
  );

  const agent = new AtpAgent({ service: authServer });
  await agent.resumeSession({
    did: tokenResult.idToken ? JSON.parse(base64Decode(tokenResult.idToken.split(".")[1])).sub : "",
    handle: identifier,
    accessJwt: tokenResult.accessToken,
    refreshJwt: tokenResult.refreshToken || "",
    active: true,
  });

  return {
    agent,
    sub: agent.session?.did || "",
  };
}
