import { Hono } from "hono";
import { generateLandingHtml } from "./lib/generateLandingHtml";
import { cache } from "hono/cache";
import { ImageResponse } from "@cloudflare/pages-plugin-vercel-og/api";
import { OgImage } from "./lib/ogImage";
import { googleFont } from "./lib/getFonts";
import { OG_FONT } from "./constants";

const app = new Hono();
const cacheSeconds = 60 * 60 * 24;

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

app.get(
  "/",
  (c) => {
    return generateLandingHtml(c);
  },
);

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
      }
    });
  }

  const targetUrl = c.req.query("url");
  if (!targetUrl) {
    return c.text("Missing URL parameter", 400);
  }

  try {
    const response = await fetch(targetUrl);
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "text/plain",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300"
      }
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return c.text("Failed to fetch target URL", 500);
  }
});

export default app;
