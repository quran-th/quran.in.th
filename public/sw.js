// Quran Audio Player Service Worker (2025)
// Advanced caching for large audio files with streaming optimizations

const CACHE_NAME = 'quran-audio-v1'
const AUDIO_CACHE = 'quran-audio-files-v1'
const STATIC_CACHE = 'quran-static-v1'

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/bg.webp',
  '/media-cover.png'
]

// Large file caching strategy
const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024 // 10MB
const MAX_AUDIO_CACHE_SIZE = 500 * 1024 * 1024 // 500MB for audio files

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker')
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  
  // Skip waiting to activate immediately
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker')
  
  event.waitUntil(
    // Clean up old caches
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== AUDIO_CACHE && 
              cacheName !== STATIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  
  // Claim all clients immediately
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // DEVELOPMENT: Skip SW for audio during testing
  if (url.hostname === 'localhost' && isAudioRequest(request)) {
    // Let network handle audio requests directly during development
    return
  }
  
  // Handle audio files with special caching strategy
  if (isAudioRequest(request)) {
    event.respondWith(handleAudioRequest(request))
    return
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }
  
  // Handle static assets
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(handleStaticAsset(request))
    return
  }
  
  // Network first for everything else
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request)
    })
  )
})

// Audio file detection
function isAudioRequest(request) {
  const url = new URL(request.url)
  return url.pathname.includes('/audio/') || 
         url.pathname.includes('.ogg') || 
         url.pathname.includes('.mp3') ||
         request.headers.get('accept')?.includes('audio/')
}

// Advanced audio file caching with streaming support
async function handleAudioRequest(request) {
  const url = new URL(request.url)
  console.log('[SW] Handling audio request:', url.pathname)
  
  try {
    // Check if we have this file cached
    const cache = await caches.open(AUDIO_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      console.log('[SW] Serving audio from cache:', url.pathname)
      
      // Support range requests for cached audio
      if (request.headers.has('range')) {
        return createRangeResponse(cachedResponse, request.headers.get('range'))
      }
      
      return cachedResponse
    }
    
    // Fetch from network
    console.log('[SW] Fetching audio from network:', url.pathname)
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Clone response for caching
      const responseToCache = networkResponse.clone()
      
      // Only cache if file is not too large and we have space
      const contentLength = networkResponse.headers.get('content-length')
      if (contentLength && parseInt(contentLength) < LARGE_FILE_THRESHOLD) {
        // Check cache size before adding
        const cacheSize = await getCacheSize(AUDIO_CACHE)
        if (cacheSize < MAX_AUDIO_CACHE_SIZE) {
          await cache.put(request, responseToCache)
          console.log('[SW] Cached audio file:', url.pathname)
        } else {
          console.log('[SW] Cache full, not caching:', url.pathname)
          // Could implement LRU eviction here
        }
      }
      
      return networkResponse
    }
    
    return new Response('Audio file not found', { status: 404 })
    
  } catch (error) {
    console.error('[SW] Error handling audio request:', error)
    return new Response('Network error', { status: 500 })
  }
}

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  try {
    // Always try network first for API calls
    const networkResponse = await fetch(request)
    
    // Cache successful responses for offline use
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    console.log('[SW] Network failed for API, trying cache:', request.url)
    
    // Fallback to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    return new Response('Offline and no cache available', { status: 503 })
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('[SW] Failed to fetch static asset:', error)
    return new Response('Asset not available offline', { status: 503 })
  }
}

// Create HTTP range response for cached audio files
function createRangeResponse(response, rangeHeader) {
  // This is a simplified range implementation
  // In a production app, you'd want more robust range handling
  return response
}

// Calculate current cache size
async function getCacheSize(cacheName) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  let totalSize = 0
  
  for (const key of keys) {
    const response = await cache.match(key)
    if (response) {
      const contentLength = response.headers.get('content-length')
      if (contentLength) {
        totalSize += parseInt(contentLength)
      }
    }
  }
  
  return totalSize
}

// Background sync for prefetching popular content
self.addEventListener('sync', (event) => {
  if (event.tag === 'prefetch-audio') {
    event.waitUntil(prefetchPopularAudio())
  }
})

async function prefetchPopularAudio() {
  // Prefetch first few surahs that are commonly played
  const popularSurahs = [1, 2, 18, 36, 112, 113, 114] // Al-Fatiha, Al-Baqarah, Al-Kahf, Ya-Sin, Al-Ikhlas, etc.
  
  for (const surahId of popularSurahs) {
    const audioUrl = `/audio/001/${surahId.toString().padStart(3, '0')}.ogg`
    
    try {
      const cache = await caches.open(AUDIO_CACHE)
      const cached = await cache.match(audioUrl)
      
      if (!cached) {
        console.log('[SW] Prefetching popular audio:', audioUrl)
        const response = await fetch(audioUrl)
        if (response.ok) {
          await cache.put(audioUrl, response)
        }
      }
    } catch (error) {
      console.error('[SW] Error prefetching:', audioUrl, error)
    }
  }
}