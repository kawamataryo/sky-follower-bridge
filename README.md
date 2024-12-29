# Sky Follower Bridge

<a href="https://chrome.google.com/webstore/detail/sky-follower-bridge/behhbpbpmailcnfbjagknjngnfdojpko"><img alt="Chrome web store version" src="https://img.shields.io/chrome-web-store/v/behhbpbpmailcnfbjagknjngnfdojpko.svg"></a>
<a href="https://chrome.google.com/webstore/detail/sky-follower-bridge/behhbpbpmailcnfbjagknjngnfdojpko"><img alt="Chrome web store rating" src="https://img.shields.io/chrome-web-store/stars/behhbpbpmailcnfbjagknjngnfdojpko.svg"></a>
<a href="https://chrome.google.com/webstore/detail/sky-follower-bridge/behhbpbpmailcnfbjagknjngnfdojpko"><img alt="Chrome Web Store users" src="https://img.shields.io/chrome-web-store/users/behhbpbpmailcnfbjagknjngnfdojpko"></a>

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/X8X315UWFN)
  
<a href="https://www.buymeacoffee.com/kawamata" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>
  
<a href="https://www.producthunt.com/posts/sky-follower-bridge?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-sky&#0045;follower&#0045;bridge" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=666851&theme=light" alt="Sky&#0032;Follower&#0032;Bridge - Migrate&#0032;your&#0032;social&#0032;connections&#0032;from&#0032;𝕏&#0032;to&#0032;Bluesky | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>


Instantly find and follow the same users from your 𝕏(Twitter) follows on Bluesky.

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
3. Input your Bluesky login email or handle and an [app password](https://bsky.app/settings/app-passwords).
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

### Environment Variables

- `PLASMO_PUBLIC_BSKY_DOMAIN`: The Bluesky domain to use (default: "bsky.social")

## Building for Custom PDS Servers

If you want to use this extension with a custom PDS (Personal Data Server) instead of the default bsky.social, you have two options:

### Option 1: Using .env file

1. Clone the repository:
```bash
git clone https://github.com/kawamataryo/sky-follower-bridge.git
cd sky-follower-bridge
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
echo "PLASMO_PUBLIC_BSKY_DOMAIN=bsky.social" > .env
```

4. Build the extension:
```bash
# For Chrome
npm run build
npm run package

# For Firefox
npm run build:firefox
npm run package:firefox
```

### Option 2: Using environment variable directly

You can also pass the domain directly during build:

```bash
# For Chrome
PLASMO_PUBLIC_BSKY_DOMAIN=your-custom-domain.com npm run build
PLASMO_PUBLIC_BSKY_DOMAIN=your-custom-domain.com npm run package

# For Firefox
PLASMO_PUBLIC_BSKY_DOMAIN=your-custom-domain.com npm run build:firefox
PLASMO_PUBLIC_BSKY_DOMAIN=your-custom-domain.com npm run package:firefox
```

### Loading the Built Extension

After building, you can load the extension:

**For Chrome/Edge:**
1. Go to `chrome://extensions/` (or `edge://extensions/`)
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" 
4. Select the `build/chrome-mv3-prod` directory

**For Firefox:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the zip file from the `build` directory

### Notes
- The built extension will be in the `build` directory
- When using a custom PDS, users will need to use handles in the format `username.your-custom-domain.com`
- Make sure your custom PDS server is compatible with the AT Protocol
