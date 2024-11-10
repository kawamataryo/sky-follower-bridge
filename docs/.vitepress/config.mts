import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Sky Follower Bridge",
  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,

  head: [
    ['meta', { name: 'theme-color', content: '#3399ff' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'Sky Follower Bridge' }],
    ['meta', { property: 'og:site_name', content: 'Sky Follower Bridge' }],
    ['meta', { property: 'og:image', content: 'https://sky-follower-bridge-docs.vercel.app/images/og-image.png' }],
    ['meta', { property: 'og:url', content: 'https://sky-follower-bridge-docs.vercel.app/' }],
    ['meta', { property: 'og:description', content: 'Instantly find and follow the same users from your 𝕏 followers on Bluesky' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon/favicon-96x96.png', sizes: '96x96' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' }],
    ['link', { rel: 'shortcut icon', href: '/favicon/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: '/favicon/site.webmanifest' }],
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
      {
        icon: "bluesky",
        link: "https://bsky.social/kawamataryo",
      },
      {
        icon: "x",
        link: "https://x.com/RyoKawamata",
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
      options: {
        detailedView: true,
      },
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Ryo Kawamata'
    },
  },
});
