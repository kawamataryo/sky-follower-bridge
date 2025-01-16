import type { Context } from 'hono'

export const generateLandingHtml = (c: Context) => {
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
