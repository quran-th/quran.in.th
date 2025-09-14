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
      meta: [
        { name: 'description', content: 'สัมผัสกับอัลกุรอานที่สูงส่งพร้อมการอ่านที่ไพเราะและคำแปล' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, user-scalable=no' },
        { name: 'theme-color', content: '#3b82f6' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'อัลกุรอาน' },
        { name: 'mobile-web-app-capable', content: 'yes' }
      ],
      link: [
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'apple-touch-icon', href: '/favicon.ico' }
      ]
    }
  },

  nitro: {
    preset: "cloudflare_module",

    cloudflare: {
      deployConfig: true,
      nodeCompat: true
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