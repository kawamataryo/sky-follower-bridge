---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Sky Follower Bridge"
  text: "Bridge Your Social Networks"
  tagline: Seamlessly migrate your social connections from 𝕏 to Bluesky
  actions:
    - theme: brand
      text: Get Started
      link: /get-started
    - theme: alt
      text: Troubleshooting
      link: /troubleshooting
  image:
    src: /images/logo.png
    alt: Sky Follower Bridge Cover Image

features:
  - icon: 🔍
    title: Automatic Profile Matching
    details: Quickly find your Twitter connections on Bluesky using our smart profile matching system.
  - icon: 🚀
    title: Bulk Follow Feature
    details: Save time by following multiple users at once with our "Follow All" button.
  - icon: 📋
    title: Multiple List Support
    details: Works with Following, Followers, Blocked users lists, and even public Twitter Lists.
  - icon: 🌐
    title: Cross-Browser Support
    details: Available on Chrome, Firefox, and Microsoft Edge for your convenience.
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #3399ff 30%, #0066cc);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #3399ff 50%, #0066cc 50%);
  --vp-home-hero-image-filter: blur(44px);
}

.VPImage.image-src {
  max-width: 180px;
  max-height: 180px;
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>
