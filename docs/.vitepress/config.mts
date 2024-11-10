import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Sky Follower Bridge",
  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/images/logo.png' }],
    ['meta', { name: 'theme-color', content: '#3399ff' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'Sky Follower Bridge' }],
    ['meta', { property: 'og:site_name', content: 'Sky Follower Bridge' }],
    ['meta', { property: 'og:image', content: 'https://sky-follower-bridge-docs.vercel.app/og-image.png' }],
    ['meta', { property: 'og:url', content: 'https://sky-follower-bridge-docs.vercel.app/' }],
  ],

  description: "Sky Follower Bridge is a Chrome extension that allows you to follow users on Bluesky from your own account.",
  themeConfig: {
    logo: {
      src: "/images/logo.png",
      alt: "Sky Follower Bridge Logo",
    },

    nav: [
      { text: "Home", link: "/" },
      { text: "Getting Started", link: "/get-started" },
      { text: "Troubleshooting", link: "/troubleshooting" },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/kawamataryo/sky-follower-bridge",
      },
    ],

    outline: {
      level: "deep",
    },

    editLink: {
      pattern:
        "https://github.com/kawamataryo/sky-follower-bridge/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },

    search: {
      provider: "local",
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Ryo Kawamata'
    },
  },
});
