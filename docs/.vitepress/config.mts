import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Sky Follower Bridge: Free X to Bluesky Migration Tool",
  lastUpdated: true,
  metaChunk: true,
  sitemap: {
    hostname: 'https://www.sky-follower-bridge.dev'
  },

  head: [
    ['meta', { name: 'theme-color', content: '#3399ff' }],
    ['meta', { name: 'google-site-verification', content: 'COM1KLUeDMoJ5NU1hCSO3rQb9zuQ6EGpACrNKXtoDnA' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'Sky Follower Bridge' }],
    ['meta', { property: 'og:site_name', content: 'Sky Follower Bridge' }],
    ['meta', { property: 'og:image', content: 'https://www.sky-follower-bridge.dev/images/og-image.png' }],
    ['meta', { property: 'og:url', content: 'https://www.sky-follower-bridge.dev/' }],
    ['meta', { property: 'og:description', content: 'Instantly find and follow the same users from your 𝕏 followers on Bluesky' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon/favicon-96x96.png', sizes: '96x96' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' }],
    ['link', { rel: 'shortcut icon', href: '/favicon/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: '/favicon/site.webmanifest' }],
    [
      'script',
      {},
      `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-N9HZN4NL');`
    ]
  ],

  description: "Effortlessly migrate your followers from X, Twitter, and Threads to Bluesky with our free browser extension.",
  themeConfig: {
    siteTitle: "Sky Follower Bridge",
    logo: {
      src: "/images/logo.webp",
      alt: "Sky Follower Bridge Logo",
    },

    nav: [
      { text: "Home", link: "/" },
      {
        text: "Getting Started", items: [
          { text: "For 𝕏", link: "/get-started" },
          { text: "For Threads", link: "/get-started-for-threads" },
          { text: "For Instagram", link: "/get-started-for-instagram" },
          { text: "For TikTok", link: "/get-started-for-tiktok" },
        ]
      },
      { text: "Troubleshooting", link: "/troubleshooting" },
      { text: "FAQ", link: "/faq" },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/kawamataryo/sky-follower-bridge",
      },
      {
        icon: "bluesky",
        link: "https://bsky.app/profile/sky-follower-bridge.dev",
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
      message: 'Released under the MIT License. Privacy Policy is available <a href="./privacy-policy">here</a>.',
      copyright: 'Copyright © 2024 Ryo Kawamata'
    },
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en',
    },
    ja: {
      label: '日本語',
      lang: 'ja',
      link: '/ja/',
      title: 'Sky Follower Bridge: 無料のXからBlueskyへの移行ツール',
      description: '無料のブラウザ拡張機能で、X、Twitter、ThreadsからBlueskyへフォロワーを簡単に移行。',
      themeConfig: {
        siteTitle: "Sky Follower Bridge",
        nav: [
          { text: "Home", link: "/ja" },
          {
            text: "使い方", items: [
              { text: "𝕏", link: "/ja/get-started" },
              { text: "Threads", link: "/ja/get-started-for-threads" },
              { text: "Instagram", link: "/ja/get-started-for-instagram" },
              { text: "TikTok", link: "/ja/get-started-for-tiktok" }
            ]
          },
          { text: "トラブルシューティング", link: "/ja/troubleshooting" },
          { text: "よくある質問", link: "/ja/faq" },
        ],
      }
    },
    it: {
      label: "Italiano",
      lang: "it",
      link: "/it/",
      title: 'Sky Follower Bridge: Strumento gratuito di migrazione da X a Bluesky',
      description: 'Migra facilmente i tuoi follower da X, Twitter e Threads a Bluesky con la nostra estensione del browser gratuita.',
      themeConfig: {
        siteTitle: "Sky Follower Bridge",
        nav: [
          { text: "Home", link: "/it" },
          {
            text: "Iniziare", items: [
              { text: "Per 𝕏", link: "/it/get-started" },
              { text: "Per Threads", link: "/it/get-started-for-threads" },
              { text: "Per Instagram", link: "/it/get-started-for-instagram" },
              { text: "Per TikTok", link: "/it/get-started-for-tiktok" },
            ]
          },
          { text: "Risoluzione dei problemi", link: "/it/troubleshooting" },
          { text: "FAQ", link: "/it/faq" },
        ],
      }
    },
    zh: {
      label: "简体中文",
      lang: "zh",
      link: "/zh/",
      title: 'Sky Follower Bridge: 免费的X到Bluesky迁移工具',
      description: '使用我们的免费浏览器扩展，轻松将您的关注者从X、Twitter和Threads迁移到Bluesky。',
      themeConfig: {
        siteTitle: "Sky Follower Bridge",
        nav: [
          { text: "首页", link: "/zh" },
          {
            text: "入门", items: [
              { text: "𝕏的场景", link: "/zh/get-started" },
              { text: "Threads的场景", link: "/zh/get-started-for-threads" },
              { text: "Instagram的场景", link: "/zh/get-started-for-instagram" },
              { text: "TikTok的场景", link: "/zh/get-started-for-tiktok" },
            ]
          },
          { text: "故障排除指南", link: "/zh/troubleshooting" },
          { text: "常见问题", link: "/zh/faq" },
        ],
      }
    },
    fr: {
      label: "Français",
      lang: "fr",
      link: "/fr/",
      title: 'Sky Follower Bridge: Outil gratuit de migration de X vers Bluesky',
      description: 'Migrez facilement vos abonnés de X, Twitter et Threads vers Bluesky avec notre extension de navigateur gratuite.',
      themeConfig: {
        siteTitle: "Sky Follower Bridge",
        nav: [
          { text: "Accueil", link: "/fr" },
          {
            text: "Commencer", items: [
              { text: "Pour 𝕏", link: "/fr/get-started" },
              { text: "Pour Threads", link: "/fr/get-started-for-threads" },
              { text: "Pour Instagram", link: "/fr/get-started-for-instagram" },
              { text: "Pour TikTok", link: "/fr/get-started-for-tiktok" },
            ]
          },
          { text: "Résolution des problèmes", link: "/fr/troubleshooting" },
          { text: "FAQ", link: "/fr/faq" },
        ],
      }
    },
    pt: {
      label: "Português",
      lang: "pt",
      link: "/pt/",
      title: 'Sky Follower Bridge: Ferramenta gratuita de migração de X para Bluesky',
      description: 'Migre facilmente seus seguidores de X, Twitter e Threads para Bluesky com nossa extensão de navegador gratuita.',
      themeConfig: {
        siteTitle: "Sky Follower Bridge",
        nav: [
          { text: "Início", link: "/pt" },
          {
            text: "Introdução", items: [
              { text: "Para 𝕏", link: "/pt/get-started" },
              { text: "Para Threads", link: "/pt/get-started-for-threads" },
              { text: "Para Instagram", link: "/pt/get-started-for-instagram" },
              { text: "Para TikTok", link: "/pt/get-started-for-tiktok" },
            ]
          },
          { text: "Guia de Solução de Problemas", link: "/pt/troubleshooting" },
          { text: "FAQ", link: "/pt/faq" },
        ],
      }
    },
    es: {
      label: "Español",
      lang: "es",
      link: "/es/",
      title: 'Sky Follower Bridge: Herramienta gratuita de migración de X a Bluesky',
      description: 'Migra fácilmente tus seguidores de X, Twitter y Threads a Bluesky con nuestra extensión de navegador gratuita.',
      themeConfig: {
        siteTitle: "Sky Follower Bridge",
        nav: [
          { text: "Inicio", link: "/es" },
          {
            text: "Comenzando", items: [
              { text: "Para 𝕏", link: "/es/get-started" },
              { text: "Para Threads", link: "/es/get-started-for-threads" },
              { text: "Para Instagram", link: "/es/get-started-for-instagram" },
              { text: "Para TikTok", link: "/es/get-started-for-tiktok" },
            ]
          },
          { text: "Guía de solución de problemas", link: "/es/troubleshooting" },
          { text: "FAQ", link: "/es/faq" },
        ],
      }
    },
    ko: {
      label: "한국어",
      lang: "ko",
      link: "/ko/",
      title: 'Sky Follower Bridge: 무료 X에서 Bluesky로 팔로워 이동 도구',
      description: '무료 브라우저 확장 프로그램으로 X, Twitter, Threads에서 Bluesky로 팔로워를 쉽게 이동할 수 있습니다.',
      themeConfig: {
        siteTitle: "Sky Follower Bridge",
        nav: [
          { text: "홈", link: "/ko" },
          {
            text: "시작하기", items: [
              { text: "𝕏용", link: "/ko/get-started" },
              { text: "Threads용", link: "/ko/get-started-for-threads" },
              { text: "Instagram용", link: "/ko/get-started-for-instagram" },
              { text: "TikTok용", link: "/ko/get-started-for-tiktok" },
            ]
          },
          { text: "문제 해결", link: "/ko/troubleshooting" },
          { text: "자주 묻는 질문", link: "/ko/faq" },
        ],
      }
    },
    de: {
      label: "Deutsch",
      lang: "de",
      link: "/de/",
      title: 'Sky Follower Bridge: Kostenlose X-zu-Bluesky-Migration-Tool',
      description: 'Migriere deine Follower von X, Twitter und Threads zu Bluesky mit unserer kostenlosen Browser-Erweiterung.',
      themeConfig: {
        siteTitle: "Sky Follower Bridge",
        nav: [
          { text: "Startseite", link: "/de" },
          {
            text: "Erste Schritte", items: [
              { text: "Für 𝕏", link: "/de/get-started" },
              { text: "Für Threads", link: "/de/get-started-for-threads" },
              { text: "Für Instagram", link: "/de/get-started-for-instagram" },
              { text: "Für TikTok", link: "/de/get-started-for-tiktok" },
            ]
          },
          { text: "Fehlerbehebung", link: "/de/troubleshooting" },
          { text: "FAQ", link: "/de/faq" },
        ],
      }
    }
  }
});
