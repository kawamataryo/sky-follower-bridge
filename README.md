# Sky Follower Bridge

<a href="https://chrome.google.com/webstore/detail/sky-follower-bridge/behhbpbpmailcnfbjagknjngnfdojpko"><img alt="Chrome web store version" src="https://img.shields.io/chrome-web-store/v/behhbpbpmailcnfbjagknjngnfdojpko.svg"></a>
<a href="https://chrome.google.com/webstore/detail/sky-follower-bridge/behhbpbpmailcnfbjagknjngnfdojpko"><img alt="Chrome web store rating" src="https://img.shields.io/chrome-web-store/stars/behhbpbpmailcnfbjagknjngnfdojpko.svg"></a>
<a href="https://chrome.google.com/webstore/detail/sky-follower-bridge/behhbpbpmailcnfbjagknjngnfdojpko"><img alt="Chrome Web Store users" src="https://img.shields.io/chrome-web-store/users/behhbpbpmailcnfbjagknjngnfdojpko"></a>

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/X8X315UWFN)
  
<a href="https://www.producthunt.com/posts/sky-follower-bridge?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-sky&#0045;follower&#0045;bridge" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=666851&theme=light" alt="Sky&#0032;Follower&#0032;Bridge - Migrate&#0032;your&#0032;social&#0032;connections&#0032;from&#0032;𝕏&#0032;to&#0032;Bluesky | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>


Instantly find and follow the same users from your 𝕏(Twitter), Instagram, TikTok, and Threads follows on Bluesky. As of v3.1.0, the extension supports **self-hosted Bluesky PDS** servers.

https://github.com/kawamataryo/sky-follower-bridge/assets/11070996/67bdd228-dc67-4d0a-ac18-f3a3e0c7adf9


## 📖 Documentation

- [Getting Started](https://www.sky-follower-bridge.dev/get-started)
- [Troubleshooting](https://www.sky-follower-bridge.dev/troubleshooting)

## 📦 Installation

- [Chrome Web Store](https://chrome.google.com/webstore/detail/sky-follower-bridge/behhbpbpmailcnfbjagknjngnfdojpko) (Recommended)
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/sky-follower-bridge/)
- [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/sky-follower-bridge/dpeolmdblhfolkhlhbhlofkkpaojnnbb)

> [!NOTE]
> We recommend using the Chrome Web Store version as it's always up to date. Other store versions may lag behind in updates.

## 🚀 How to use

1. On 𝕏 open Your [Following](https://x.com/following), [Followers](https://x.com/followers), or [Blocked](https://x.com/settings/blocked/all) users list, or the Members page of a public List.
2. Use the `Alt + B` shortcut or click on the toolbar icon to launch the Sky Follower Bridge extension.
3. Sign in to Bluesky:
   - **Bluesky (OAuth)** (recommended): Enter your handle and click "Sign in with Bluesky". A browser window will open for secure OAuth login.
   - **App Password**: Switch to the "App Password" tab and enter your handle or email, [app password](https://bsky.app/settings/app-passwords), and **Service URL** (e.g. `https://bsky.social`). For a **self-hosted PDS**, enter your PDS URL in the Service URL field (e.g. `https://your-pds.example.com`).
4. Press the `Finding Bluesky Users` btn.
5. Bluesky users will appear in the Modal.
6. Click the "Follow" button to follow them on Bluesky.


> [!TIP]
> For Firefox users, pressing `Alt + B` may not work. In that case, click the extension icon in the browser toolbar.
> https://support.mozilla.org/en-US/kb/extensions-button

## 🔧 Troubleshooting

- Please feel free to mention [@kawamataryo.bsky.social](https://bsky.app/profile/kawamataryo.bsky.social) on Bluesky. They will provide support to ensure the tool is functioning properly.
- If you get the error "Error: Something went wrong. ...", **please reload the page** and then click on the extension icon again.

## 🚨 Limitations

- User search may fail due to rate limit in Bluesky's API. In this case, please wait for 2 to 3 minutes and execute the search again.

## Development

See [CLAUDE.md](./CLAUDE.md) for development setup and architecture.
