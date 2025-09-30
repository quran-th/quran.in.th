import { computed } from 'vue'

// Audio configuration composable that directly accesses runtime config
// No API calls needed - config is already injected via Nuxt runtime config
export const useAudioConfig = () => {
  const runtimeConfig = useRuntimeConfig()
  
  // Direct access to config - no loading states or API calls needed
  const useLocalAudio = computed(() => {
    return runtimeConfig.public.useLocalAudio
  })

  return {
    useLocalAudio,
    // Legacy properties for backward compatibility (always false/null since no async loading)
    isLoading: readonly(ref(false)),
    error: readonly(ref<string | null>(null)),
    refresh: () => {} // No-op since config is static
  }
}
