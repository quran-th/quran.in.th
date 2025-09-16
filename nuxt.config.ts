// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: [
    '~/assets/css/main.css'
  ],

  app: {
    head: {
      title: 'อัลกุรอาน - Quran Player',
      htmlAttrs: { lang: 'th' },
      meta: [
        { name: 'description', content: 'สัมผัสกับอัลกุรอานที่สูงส่งพร้อมการอ่านที่ไพเราะและคำแปล' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, user-scalable=no' },
        { name: 'theme-color', content: '#bfb393' }, // Updated to match manifest theme-color
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'อัลกุรอาน' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'msapplication-TileColor', content: '#ffffff' },
        { name: 'msapplication-TileImage', content: '/ms-icon-144x144.png' }
      ],
      link: [
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'apple-touch-icon', sizes: '57x57', href: '/apple-icon-57x57.png' },
        { rel: 'apple-touch-icon', sizes: '60x60', href: '/apple-icon-60x60.png' },
        { rel: 'apple-touch-icon', sizes: '72x72', href: '/apple-icon-72x72.png' },
        { rel: 'apple-touch-icon', sizes: '76x76', href: '/apple-icon-76x76.png' },
        { rel: 'apple-touch-icon', sizes: '114x114', href: '/apple-icon-114x114.png' },
        { rel: 'apple-touch-icon', sizes: '120x120', href: '/apple-icon-120x120.png' },
        { rel: 'apple-touch-icon', sizes: '144x144', href: '/apple-icon-144x144.png' },
        { rel: 'apple-touch-icon', sizes: '152x152', href: '/apple-icon-152x152.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-icon-180x180.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/android-icon-192x192.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      ]
    }
  },

  nitro: {
    preset: "cloudflare_module",

    cloudflare: {
      deployConfig: true,
      nodeCompat: true
    },

    // Static asset cache control headers
    routeRules: {
      // Build metadata files - short cache for quick invalidation
      '/_nuxt/builds/**': {
        headers: {
          'Cache-Control': 'public, max-age=300, must-revalidate' // 5 minutes
        }
      },
      // Other Nuxt assets - longer cache with revalidation
      '/_nuxt/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable' // 1 year for hashed assets
        }
      },
      // Static assets
      '/fonts/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      },
      '/audio/**': {
        headers: {
          'Cache-Control': 'public, max-age=86400' // 1 day for audio files
        }
      }
    }
  },

  modules: [
    "nitro-cloudflare-dev",
    "@nuxt/ui",
    "@nuxt/eslint"
  ],

  runtimeConfig: {
    // Private keys (only available on server-side)
    // Environment-specific audio handling:
    // - Development: USE_LOCAL_AUDIO=true (default for local dev)
    // - Production: USE_LOCAL_AUDIO=false (R2 via Cloudflare Workers)
    useLocalAudio: process.env.NODE_ENV === 'development' ? true : (process.env.USE_LOCAL_AUDIO === 'true'),

    // Public keys (exposed to client-side)
    public: {
      // Client determines audio source via environment
      useLocalAudio: process.env.NODE_ENV === 'development' ? true : (process.env.USE_LOCAL_AUDIO === 'true')
    }
  }
})