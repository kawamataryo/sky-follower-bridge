import { Hono } from 'hono'
import { ImageResponse } from "workers-og";
import type { Context } from 'hono'

const app = new Hono()

const generateLandingPage = (c: Context) => {
  const userCount = c.req.query('q') || '0'
  const host = c.req.header('host') || ''
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`
  const ogImageUrl = `${baseUrl}/og?q=${userCount}`

  // クローラーの判定
  const userAgent = c.req.header('user-agent')?.toLowerCase() || ''
  const isCrawler = userAgent.includes('twitterbot') ||
    userAgent.includes('bsky') ||
    userAgent.includes('bot') ||
    userAgent.includes('crawler') ||
    userAgent.includes('facebook') ||
    userAgent.includes('linkedin')

  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sky Follower Bridge - Detected Users: ${userCount}</title>
    <meta name="description" content="Bridge your Twitter/X followers to Bluesky. Detected Users: ${userCount}">

    <!-- Essential OG Meta Tags -->
    <meta property="og:title" content="Sky Follower Bridge">
    <meta property="og:site_name" content="Sky Follower Bridge">
    <meta property="og:description" content="Bridge your Twitter/X followers to Bluesky. Detected Users: ${userCount}">
    <meta property="og:image" content="${ogImageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="${baseUrl}/lp?q=${userCount}">
    <meta property="og:type" content="website">

    <!-- Twitter/Bluesky specific -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@RyoKawamata">
    <meta name="twitter:title" content="Sky Follower Bridge">
    <meta name="twitter:description" content="Bridge your Twitter/X followers to Bluesky. Detected Users: ${userCount}">
    <meta name="twitter:image" content="${ogImageUrl}">

    ${!isCrawler ? `<script>
      window.location.href = 'https://www.sky-follower-bridge.dev';
    </script>` : ''}
  </head>
  <body>
    ${!isCrawler ? `
    <noscript>
      <meta http-equiv="refresh" content="0; url=https://www.sky-follower-bridge.dev">
    </noscript>
    ` : ''}
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
      <div style="text-align: center;">
        <h1>Sky Follower Bridge</h1>
        <p>Detected Users: ${userCount}</p>
        ${!isCrawler ? '<p>Redirecting to Sky Follower Bridge...</p>' : ''}
      </div>
    </div>
  </body>
</html>`

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'max-age=0, no-cache, no-store, must-revalidate',
    },
  })
}

app.get('/', (c) => {
  return generateLandingPage(c)
})

app.get('/og', async (c) => {
  const userCount = c.req.query('q') || '0'

  const html = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; width: 100vw; font-family: 'Noto Sans JP'; background: #160f29">
      <img src="https://i.gyazo.com/81ad0bb212220eaf14afe3c73066e7d7.png" width="100" height="100" style="position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; object-fit: cover;">
      <div style="display: flex; flex-direction: column; aligin-items: start; color: #ffffff; padding-top: 240px; padding-left: 80px; padding-bottom: 80px; height: 100vh; width: 100vw; gap: 20px; text-shadow: 5px 5px 10px rgba(0, 0, 0, 0.5);">
         <p style="font-size: 220px; disply: flex; aligin-items: baseline; gap: 20px;">${Number(userCount).toLocaleString()}</p>
         <p style="font-size: 60px;">Bluesky users in my network.</p>
      </div>
    </div>
   `;

  return new ImageResponse(html, {
    width: 1200,
    height: 680,
  });
})

app.get('/lp', (c) => {
  return generateLandingPage(c)
})

export default app
