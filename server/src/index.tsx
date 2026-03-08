import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";
import { Hono } from "hono";
import { cache } from "hono/cache";
import { OG_FONT } from "./constants";
import { generateLandingHtml } from "./lib/generateLandingHtml";
import { googleFont } from "./lib/getFonts";
import { OgImage } from "./lib/ogImage";

const app = new Hono();
const cacheSeconds = 60 * 60 * 24 * 7;

const buildCallbackRedirectUri = (
  callbackUri: string,
  extensionRedirectUri?: string,
) => {
  const redirectUri = new URL(callbackUri);
  if (extensionRedirectUri) {
    redirectUri.searchParams.set("redirect_uri", extensionRedirectUri);
  }
  return redirectUri.toString();
};

const getExtensionRedirectUris = (env: Record<string, string | undefined>) => {
  const redirectUris = env.OAUTH_EXTENSION_REDIRECT_URIS
    ?.split(",")
    .map((uri) => uri.trim())
    .filter(Boolean);

  if (redirectUris?.length) {
    return redirectUris;
  }

  return env.OAUTH_EXTENSION_REDIRECT_URI
    ? [env.OAUTH_EXTENSION_REDIRECT_URI]
    : [];
};

app.use(
  "*",
  async (c, next) => {
    if (c.req.path.startsWith("/oauth/")) {
      return next();
    }
    return cache({
      cacheName: async (ctx) => {
        const url = new URL(ctx.req.url);
        return `${ctx.req.method} ${url.pathname}${url.searchParams}`;
      },
      cacheControl: `max-age=${cacheSeconds}`,
    })(c, next);
  },
);

app.get("/", (c) => {
  return generateLandingHtml(c);
});

app.get("/og", async (c) => {
  const userCount = c.req.query("q") || "0";
  const text = `Bluesky users found in my network. , ${userCount}`;
  const font900Italic = await googleFont(text, OG_FONT, 900, "italic");
  const font900 = await googleFont(text, OG_FONT, 900, "normal");

  return new ImageResponse(<OgImage userCount={userCount} />, {
    width: 1200,
    height: 680,
    fonts: [font900Italic, font900],
  });
});

app.get("/lp", (c) => {
  return generateLandingHtml(c);
});

app.get("/oauth/client-metadata.json", (c) => {
  const env = c.env as Record<string, string | undefined>;
  const origin = new URL(c.req.url).origin;
  const clientId = `${origin}/oauth/client-metadata.json`;
  const callbackUri = env.OAUTH_REDIRECT_URI || `${origin}/oauth/callback`;
  const extensionRedirectUris = getExtensionRedirectUris(env);
  const scope = env.OAUTH_SCOPE || "atproto transition:generic";
  const redirectUris = [
    callbackUri,
    ...extensionRedirectUris.map((extensionRedirectUri) =>
      buildCallbackRedirectUri(callbackUri, extensionRedirectUri),
    ),
  ];

  return c.json(
    {
      client_id: clientId,
      client_name: "Sky Follower Bridge",
      client_uri: origin,
      policy_uri: `${origin}/privacy-policy`,
      redirect_uris: [...new Set(redirectUris)],
      scope,
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
      application_type: "web",
      dpop_bound_access_tokens: true,
    },
    200,
    {
      "Cache-Control": "no-store",
    },
  );
});

app.get("/oauth/callback", (c) => {
  const env = c.env as Record<string, string | undefined>;
  const allowedRedirectUris = getExtensionRedirectUris(env);
  const requestedRedirect = c.req.query("redirect_uri");
  let extensionRedirect: string | undefined;

  if (requestedRedirect) {
    if (allowedRedirectUris.includes(requestedRedirect)) {
      extensionRedirect = requestedRedirect;
    } else {
      return c.text("Invalid redirect_uri", 400);
    }
  } else {
    extensionRedirect = env.OAUTH_EXTENSION_REDIRECT_URI;
  }

  if (!extensionRedirect) {
    return c.text("Missing redirect_uri or OAUTH_EXTENSION_REDIRECT_URI", 500);
  }

  const redirectUrl = new URL(extensionRedirect);
  const forwardParams = ["code", "state", "iss", "error", "error_description"];
  for (const param of forwardParams) {
    const value = c.req.query(param);
    if (value) redirectUrl.searchParams.set(param, value);
  }

  return Response.redirect(redirectUrl.toString(), 302);
});

// Allowed proxy target domains (Bluesky CDN only)
const PROXY_ALLOWED_HOSTS = new Set([
  "cdn.bsky.app",
  "av-cdn.bsky.app",
]);

const isAllowedProxyUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      PROXY_ALLOWED_HOSTS.has(parsed.hostname)
    );
  } catch {
    return false;
  }
};

// CORS Proxy endpoint (restricted to Bluesky CDN domains)
app.on(["GET", "OPTIONS"], "/proxy", async (c) => {
  // Handle preflight request
  if (c.req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const targetUrl = c.req.query("url");
  if (!targetUrl) {
    return c.text("Missing URL parameter", 400);
  }

  if (!isAllowedProxyUrl(targetUrl)) {
    return c.text("Forbidden: URL is not in the allowed domains", 403);
  }

  try {
    const response = await fetch(targetUrl);
    const data = await response.arrayBuffer();

    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return c.text("Failed to fetch target URL", 500);
  }
});

export default app;
