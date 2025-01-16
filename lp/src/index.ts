import { Hono } from 'hono'
import { ImageResponse } from "workers-og";
import { generateLandingHtml } from './lib/generateLandingHtml';
import { backgroundImage } from './lib/backgroundImage';
const app = new Hono()


app.get('/', (c) => {
  return generateLandingHtml(c)
})

app.get('/og', async (c) => {
  const userCount = c.req.query('q') || '0'

  const html = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; width: 100vw; font-family: 'Noto Sans JP'; background: #160f29">
      <img src="${backgroundImage}" width="100" height="100" style="position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; object-fit: cover;">
      <div style="display: flex; flex-direction: column; aligin-items: start; color: #ffffff; padding-top: 200px; padding-left: 65px; padding-bottom: 80px; height: 100vh; width: 100vw; gap: 20px; text-shadow: 5px 5px 6px rgba(0, 0, 0, 0.8);">
         <p style="font-size: 260px; disply: flex; aligin-items: baseline; gap: 20px;">${Number(userCount).toLocaleString()}</p>
         <p style="font-size: 60px;">Bluesky<span style="margin-left:20px;" />users<span style="margin-left:20px;" />found<span style="margin-left:20px;" />in<span style="margin-left:20px;" />my<span style="margin-left:20px;" />network.</p>
      </div>
    </div>
   `;

  return new ImageResponse(html, {
    width: 1200,
    height: 680,
  });
})

app.get('/lp', (c) => {
  return generateLandingHtml(c)
})

export default app
