<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>

<script setup>
// Service Worker registration with enhanced update detection
onMounted(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[App] Service worker registered:', registration)

        // Listen for updates to the service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing

          if (newWorker) {
            console.log('[App] New service worker found, installing...')

            newWorker.addEventListener('statechange', () => {
              console.log(`[App] SW state change: ${newWorker.state}`)

              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content is available, refresh to update
                  console.log('[App] New content available, reloading in 1s...')
                  setTimeout(() => {
                    window.location.reload()
                  }, 1000) // Small delay to let activation complete
                } else {
                  // Content is cached for first time
                  console.log('[App] Content is cached for offline use')
                }
              }

              if (newWorker.state === 'activated') {
                // Service worker is active, force immediate refresh
                if (navigator.serviceWorker.controller) {
                  console.log('[App] Service worker activated, forcing refresh...')
                  window.location.reload()
                }
              }
            })
          }
        })

        // Also listen for controller changes (backup refresh mechanism)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[App] Service worker controller changed, refreshing...')
          window.location.reload()
        })
      })
      .catch((error) => {
        console.error('[App] Service worker registration failed:', error)
      })
  }
})
</script>