import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";
import { Hono } from "hono";
import { cache } from "hono/cache";
import { OG_FONT } from "./constants";
import { generateLandingHtml } from "./lib/generateLandingHtml";
import { googleFont } from "./lib/getFonts";
import { OgImage } from "./lib/ogImage";

const app = new Hono();
const cacheSeconds = 60 * 60 * 24 * 7;

app.use(
  "*",
  cache({
    cacheName: async (c) => {
      const url = new URL(c.req.url);
      return `${c.req.method} ${url.pathname}${url.searchParams}`;
    },
    cacheControl: `max-age=${cacheSeconds}`,
  }),
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
  const redirectUri = env.OAUTH_REDIRECT_URI || `${origin}/oauth/callback`;
  const scope = env.OAUTH_SCOPE || "atproto transition:generic";

  return c.json({
    client_id: clientId,
    client_name: "Sky Follower Bridge",
    client_uri: "https://www.sky-follower-bridge.dev",
    policy_uri: "https://www.sky-follower-bridge.dev/privacy-policy",
    redirect_uris: [redirectUri],
    scope,
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    token_endpoint_auth_method: "none",
    application_type: "web",
    dpop_bound_access_tokens: true,
  });
});

app.get("/oauth/callback", (c) => {
  const env = c.env as Record<string, string | undefined>;
  const extensionRedirect =
    env.OAUTH_EXTENSION_REDIRECT_URI || c.req.query("redirect_uri");
  if (!extensionRedirect) {
    return c.text("Missing OAUTH_EXTENSION_REDIRECT_URI", 500);
  }

  const redirectUrl = new URL(extensionRedirect);
  const code = c.req.query("code");
  const state = c.req.query("state");
  const iss = c.req.query("iss");
  if (code) redirectUrl.searchParams.set("code", code);
  if (state) redirectUrl.searchParams.set("state", state);
  if (iss) redirectUrl.searchParams.set("iss", iss);

  return Response.redirect(redirectUrl.toString(), 302);
});

// CORS Proxy endpoint
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
