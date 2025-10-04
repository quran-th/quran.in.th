// https://nuxt.com/docs/api/configuration/nuxt-config
import { readFileSync } from 'fs'

// Read package.json for version info
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'))

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
        { rel: 'manifest', href: `/manifest.json?v=${Date.now()}` },
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

  // Route-specific caching rules
  routeRules: {
    // HTML pages - prevent caching to ensure fresh asset URLs
    '/': {
      prerender: true,
      headers: {
        'Cache-Control': 'no-cache, must-revalidate, s-maxage=0',
        'Pragma': 'no-cache', // HTTP/1.0 compatibility
        'Expires': '0' // Legacy browsers
      }
    },
    // Manifest - prevent caching for PWA updates
    '/manifest.json': {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }
  },

  nitro: {
    preset: "cloudflare_module",

    cloudflare: {
      deployConfig: true,
      nodeCompat: true
    },

    // Consolidated static asset cache control headers
    routeRules: {
      // Build metadata files - short cache for quick invalidation
      '/_nuxt/builds/**': {
        headers: {
          'Cache-Control': 'public, max-age=300, must-revalidate' // 5 minutes
        }
      },
      // Nuxt hashed assets - immutable and long-lived
      '/_nuxt/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable', // 1 year for hashed assets
          'Vary': 'Accept-Encoding' // Support compression variations
        }
      },
      // Static assets with immutable content
      '/fonts/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Cross-Origin-Embedder-Policy': 'cross-origin'
        }
      },
      // Static images and media
      '/**/*.{png,jpg,jpeg,webp,gif,svg,ico}': {
        headers: {
          'Cache-Control': 'public, max-age=2592000', // 30 days
          'Vary': 'Accept'
        }
      }
    }
  },

  modules: [
    "nitro-cloudflare-dev",
    "@nuxt/ui",
    "@nuxt/eslint",
    "@vite-pwa/nuxt"
  ],

  // PWA Configuration for Background Audio Support
  pwa: {
    // Service Worker Configuration
    strategies: 'generateSW',
    registerType: 'autoUpdate',
    devOptions: {
      enabled: true,
      type: 'module'
    },

    // Workbox Configuration for Audio Caching
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],

      // Runtime caching strategies optimized for audio streaming
      runtimeCaching: [
        {
          // Cache audio API endpoints with specific rules for background audio
          urlPattern: /^.*\/api\/audio\/.*$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'quran-audio-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
            },
            cacheableResponse: {
              statuses: [200] // Only cache 200 responses, exclude 206 partial content
            }
          }
        },
        {
          // Cache surah metadata for offline access
          urlPattern: /^.*\/api\/surahs\/.*$/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'quran-metadata-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24 // 1 day
            }
          }
        },
        {
          // Cache static assets with long-term storage
          urlPattern: /^.*\.(png|jpg|jpeg|svg|ico|woff|woff2)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'static-assets-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
            }
          }
        }
      ],

      // Skip waiting for immediate activation of new service worker
      skipWaiting: false, // User-controlled updates per design preferences
      clientsClaim: true
    },

    // Use existing /public/manifest.json instead of generating new one
    manifest: false
  },

  colorMode: {
    preference: 'light', // Set default to light instead of system
    fallback: 'light',   // Fallback when system preference can't be detected
    storageKey: 'nuxt-color-mode'
  },

  runtimeConfig: {
    // Private keys (only available on server-side)

    // Public keys (exposed to client-side)
    public: {
      // Build-time app information
      appVersion: packageJson.version,
      buildTime: new Date().toISOString()
    }
  }
})
