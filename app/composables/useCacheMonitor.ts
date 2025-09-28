/**
 * Cache Monitor Composable - Minimal stub implementation
 * Provides basic cache monitoring functionality for CacheStatus component
 */

export const useCacheMonitor = () => {
  // Reactive state for cache monitoring
  const isServiceWorkerReady = ref(false)
  const lastUpdate = ref<Date | null>(null)
  const cacheEfficiency = ref<{
    audioCached: number
    staticCached: number
    totalCached: number
    cacheHitRate: number
    version: string
  } | null>(null)

  // Check service worker status
  const checkServiceWorkerStatus = () => {
    if (import.meta.client && 'serviceWorker' in navigator) {
      isServiceWorkerReady.value = !!navigator.serviceWorker.controller
    }
  }

  // Get cache statistics
  const getCacheStats = async () => {
    try {
      if (import.meta.client && 'caches' in window) {
        const cacheNames = await caches.keys()
        let totalCached = 0
        let audioCached = 0
        let staticCached = 0

        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName)
          const keys = await cache.keys()
          totalCached += keys.length

          // Count audio and static files
          keys.forEach(request => {
            if (request.url.includes('/audio/')) {
              audioCached++
            } else {
              staticCached++
            }
          })
        }

        cacheEfficiency.value = {
          audioCached,
          staticCached,
          totalCached,
          cacheHitRate: totalCached > 0 ? (audioCached / totalCached) * 100 : 0,
          version: '1.0.0'
        }
      }
    } catch (error) {
      console.warn('[CacheMonitor] Failed to get cache stats:', error)
    }
  }

  // Update service worker
  const updateServiceWorker = async () => {
    try {
      if (import.meta.client && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          window.location.reload()
        }
      }
    } catch (error) {
      console.warn('[CacheMonitor] Failed to update service worker:', error)
    }
  }

  // Clear all caches
  const clearAllCaches = async () => {
    try {
      if (import.meta.client && 'caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
        await getCacheStats()
        lastUpdate.value = new Date()
      }
    } catch (error) {
      console.warn('[CacheMonitor] Failed to clear caches:', error)
    }
  }

  // Initialize on client
  if (import.meta.client) {
    onMounted(() => {
      checkServiceWorkerStatus()
      getCacheStats()
    })
  }

  return {
    isServiceWorkerReady: readonly(isServiceWorkerReady),
    lastUpdate: readonly(lastUpdate),
    cacheEfficiency: readonly(cacheEfficiency),
    getCacheStats,
    updateServiceWorker,
    clearAllCaches
  }
}