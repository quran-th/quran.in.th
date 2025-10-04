// Audio configuration composable
// This composable is kept for backward compatibility but no longer provides useLocalAudio
// as the application now uses unified R2 storage for both development and production
export const useAudioConfig = () => {
  return {
    // Legacy properties for backward compatibility
    isLoading: readonly(ref(false)),
    error: readonly(ref<string | null>(null)),
    refresh: () => {} // No-op since config is static
  }
}
