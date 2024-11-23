import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Sky Follower Bridge",
  lastUpdated: true,
  metaChunk: true,

  head: [
    ['meta', { name: 'theme-color', content: '#3399ff' }],
    ['meta', { name: 'google-site-verification', content: 'COM1KLUeDMoJ5NU1hCSO3rQb9zuQ6EGpACrNKXtoDnA' }],
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
        link: "https://bsky.app/profile/kawamataryo.bsky.social",
      },
      {
        icon: "x",
        link: "https://x.com/KawamataRyo",
      },
      {
        icon: "kofi",
        link: "https://ko-fi.com/kawamataryo",
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

  locales: {
    root: {
      label: 'English',
      lang: 'en'
    },
    ja: {
      label: '日本語',
      lang: 'ja',
      link: '/ja/',
      themeConfig: {
        nav: [
          { text: "Home", link: "/" },
          { text: "使い方", link: "/ja/get-started" },
          { text: "トラブルシューティング", link: "/ja/troubleshooting" },
        ],
      }
    },
    it: {
      label: "Italiano",
      lang: "it",
      link: "/it/",
      themeConfig: {
        nav: [
          { text: "Home", link: "/" },
          { text: "Iniziare", link: "/it/get-started" },
          { text: "Risoluzione dei problemi", link: "/it/troubleshooting" },
        ],
      }
    },
    zh: {
      label: "简体中文",
      lang: "zh",
      link: "/zh/",
      themeConfig: {
        nav: [
          { text: "首页", link: "/" },
          { text: "入门", link: "/zh/get-started" },
          { text: "故障排除指南", link: "/zh/troubleshooting" },
        ],
      }
    },
    fr: {
      label: "Français",
      lang: "fr",
      link: "/fr/",
      themeConfig: {
        nav: [
          { text: "Accueil", link: "/" },
          { text: "Commencer", link: "/fr/get-started" },
          { text: "Résolution des problèmes", link: "/fr/troubleshooting" },
        ],
      }
    },
    pt: {
      label: "Português",
      lang: "pt",
      link: "/pt/",
      themeConfig: {
        nav: [
          { text: "Início", link: "/" },
          { text: "Introdução", link: "/pt/get-started" },
          { text: "Guia de Solução de Problemas", link: "/pt/troubleshooting" },
        ],
      }
    },
    es: {
      label: "Español",
      lang: "es",
      link: "/es/",
      themeConfig: {
        nav: [
          { text: "Inicio", link: "/" },
          { text: "Comenzando", link: "/es/get-started" },
          { text: "Guía de solución de problemas", link: "/es/troubleshooting" },
        ],
      }
    }
  }
});
