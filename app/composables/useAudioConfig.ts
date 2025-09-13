import { ref, computed } from 'vue'

// Audio configuration composable that fetches from Cloudflare env vars
export const useAudioConfig = () => {
  const config = ref<{ useLocalAudio: boolean } | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Fetch configuration from API endpoint (which reads from Cloudflare env vars)
  const fetchConfig = async () => {
    if (config.value !== null) return // Already loaded
    
    isLoading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ useLocalAudio: boolean }>('/api/config/audio')
      config.value = response
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch audio config'
      console.error('Failed to fetch audio config:', err)
      
      // Fallback to runtime config for development
      const runtimeConfig = useRuntimeConfig()
      config.value = { useLocalAudio: runtimeConfig.public.useLocalAudio }
    } finally {
      isLoading.value = false
    }
  }

  // Initialize on first access
  const useLocalAudio = computed(() => {
    if (!config.value && !isLoading.value) {
      fetchConfig()
    }
    return config.value?.useLocalAudio ?? false
  })

  return {
    useLocalAudio,
    isLoading: readonly(isLoading),
    error: readonly(error),
    refresh: fetchConfig
  }
}