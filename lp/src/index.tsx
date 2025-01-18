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

export default app;
