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
    // AT Protocol OAuth spec: private-use URI scheme must be the reverse-FQDN
    // of the client_id host. client_id host = server.sky-follower-bridge.dev
    // → scheme = dev.sky-follower-bridge.server
    redirect_uris: ["dev.sky-follower-bridge.server:/oauth-callback"],
    scope: "atproto transition:generic",
    token_endpoint_auth_method: "none",
    response_types: ["code"],
    grant_types: ["authorization_code", "refresh_token"],
    application_type: "native",
    dpop_bound_access_tokens: true,
  };
}
