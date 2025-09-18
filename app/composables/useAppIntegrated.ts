/**
 * Integrated App Composable
 * Central integration point for all app state and functionality
 * Replaces prop drilling with useState-based state management
 */

export const useAppIntegrated = () => {
  // Use existing composables instead of duplicating state management
  const audioPlayer = useAudioPlayer()
  const { selectedReciter, getCurrentReciterName, setSelectedReciter } = useReciters()
  const { surahs, getSurahById, formatDuration, loadSurahs } = useSurahs()

  // UI state management - use existing composables
  const { isDark, toggleDarkMode } = useThemeActions()
  const { isMobile } = useResponsiveState()
  const { isLargePlayerMode, togglePlayerMode } = usePlayerModeActions()
  const { selectedSurahValue, setSelectedSurah } = useSelectionState()

  // Current reciter state from existing composable
  const currentReciterId = computed(() => selectedReciter.value?.reciter_id || 2)
  const currentReciterName = getCurrentReciterName

  // Enhanced computed properties using existing audioPlayer state
  const getCurrentSurahName = () => {
    if (!audioPlayer.currentSurah.value) return "เลือกซูเราะฮฺ"
    const surah = getSurahById(audioPlayer.currentSurah.value)
    return surah ? `${surah.id}. ${surah.thaiName}` : "ไม่ทราบซูเราะฮฺ"
  }

  const getCurrentSurahRevelationPlace = () => {
    if (!audioPlayer.currentSurah.value) return 'มักกิยะฮ์'

    const surah = getSurahById(audioPlayer.currentSurah.value)
    if (!surah) return 'มักกิยะฮ์'

    return surah.revelationType === 'Meccan' ? 'มักกิยะฮ์' : 'มะดะนียะฮ์'
  }

  const getSurahRevelationPlace = (surahId: number) => {
    const surah = getSurahById(surahId)
    if (!surah) return 'มักกิยะฮ์'

    return surah.revelationType === 'Meccan' ? 'มักกิยะฮ์' : 'มะดะนียะฮ์'
  }

  const getCurrentSurahTotalDuration = () => {
    if (!audioPlayer.currentSurah.value) return '0:00'

    const surah = getSurahById(audioPlayer.currentSurah.value)
    if (!surah || !surah.duration) return '0:00'

    return formatDuration(surah.duration)
  }

  const getCurrentSurahDurationSeconds = () => {
    if (!audioPlayer.currentSurah.value) return 0

    const surah = getSurahById(audioPlayer.currentSurah.value)
    return surah?.duration || 0
  }

  const correctProgress = computed(() => {
    const metadataDuration = getCurrentSurahDurationSeconds()
    return metadataDuration > 0 ? (audioPlayer.currentTime.value / metadataDuration) * 100 : 0
  })

  // Enhanced seek function with metadata duration
  const seekToClick = (event: MouseEvent) => {
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const percentage = (clickX / rect.width) * 100

    // Use metadata duration for accurate seeking
    const metadataDuration = getCurrentSurahDurationSeconds()
    if (metadataDuration > 0) {
      const seekTime = (percentage / 100) * metadataDuration
      audioPlayer.seekTo(Math.max(0, Math.min(metadataDuration, seekTime)))
    } else {
      // Fallback to original method
      audioPlayer.seekToProgress(Math.max(0, Math.min(100, percentage)))
    }
  }

  // Auto-play method for large screen surah selection
  const selectAndPlaySurah = async (surahId: number) => {
    setSelectedSurah(surahId)
    await playSelectedAudio()
  }

  // Auto-play method for mobile surah cards
  const selectAndPlaySurahFromCard = async (surahId: number) => {
    setSelectedSurah(surahId)
    await playSelectedAudio()
  }

  // Play from hero button - toggle play/pause or start new audio
  const playFromHero = async (surahId?: number) => {
    // If a specific surah ID is provided, select it first
    if (surahId) {
      setSelectedSurah(surahId)
      await playSelectedAudio()
      return
    }

    // If audio is currently playing, just toggle pause
    if (audioPlayer.isPlaying.value) {
      await audioPlayer.togglePlay()
      return
    }

    // If audio is paused but loaded, resume playing
    if (audioPlayer.currentSurah.value && !audioPlayer.isPlaying.value) {
      await audioPlayer.togglePlay()
      return
    }

    // If no surah selected or no audio loaded, use saved surah or default to Al-Fatiha
    if (!selectedSurahValue.value) {
      setSelectedSurah(audioPlayer.currentSurah.value || 1)
      console.log(`🎵 playFromHero: Selected surah ${selectedSurahValue.value} ${audioPlayer.currentSurah.value ? '(from localStorage)' : '(default Al-Fatiha)'}`)
    }

    // Auto-play the selected audio
    await playSelectedAudio()
  }

  // Helper method to play selected audio with auto-play and enhanced error recovery
  const playSelectedAudio = async () => {
    if (!selectedSurahValue.value) return

    try {
      console.log(`🎵 Attempting to load Surah ${selectedSurahValue.value} with reciter ${currentReciterId.value}`)

      // Clear any previous error state before loading
      audioPlayer.clearError()

      // Load the audio with current selected reciter
      await audioPlayer.loadAudio(selectedSurahValue.value, currentReciterId.value)

      // Small delay to ensure audio is fully loaded
      await new Promise(resolve => setTimeout(resolve, 100))

      // Auto-play immediately after loading
      console.log('🎵 Audio loaded, attempting to play...')
      await audioPlayer.togglePlay()

      // Update MediaSession metadata
      const surah = getSurahById(selectedSurahValue.value)

      if (surah) {
        const surahDisplayName = `ซูเราะฮฺ ${surah.thaiName}`
        const reciterName = currentReciterName.value
        audioPlayer.updateMediaSessionMetadata(surahDisplayName, `เสียงแปลโดย ${reciterName}`)
        console.log(`🎵 Now playing: ${surahDisplayName} by ${reciterName}`)
      }
    } catch (err) {
      console.error("❌ Failed to load and play audio:", err)

      // Set user-friendly Thai error messages
      if (err instanceof Error) {
        if (err.message.includes('not available') || err.message.includes('404')) {
          audioPlayer.error.value = 'ไม่พบไฟล์เสียงสำหรับซูเราะฮฺนี้ กรุณาลองซูเราะฮฺอื่น'
        } else if (err.message.includes('play') || err.message.includes('autoplay')) {
          audioPlayer.error.value = 'เบราว์เซอร์ป้องกันการเล่นอัตโนมัติ กรุณาแตะเพื่อเล่น'
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          audioPlayer.error.value = 'เชื่อมต่อเครือข่ายมีปัญหา กรุณาตรวจสอบการเชื่อมต่อ'
        } else {
          audioPlayer.error.value = 'เกิดข้อผิดพลาดในการโหลดเสียง กรุณาลองใหม่'
        }
      } else {
        audioPlayer.error.value = 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่'
      }

      // Error persists until manually cleared (as per requirement)
      // No automatic clearing - user must click the X button to clear
    }
  }

  // Handle desktop reciter selection
  const onDesktopReciterChange = async (event: Event) => {
    const target = event.target as HTMLSelectElement
    const reciterId = parseInt(target.value)
    await onReciterChanged(reciterId)
  }

  // Handle reciter change - use existing composable methods
  const onReciterChanged = async (reciterId: number) => {
    console.log(`🎵 Reciter changing to ID: ${reciterId}`)

    // Update the reciter using existing composable
    setSelectedReciter(reciterId)

    console.log(`🎵 Reciter changed to: ${currentReciterName.value}`)

    // Load surahs for the new reciter
    console.log(`📚 Loading surahs for reciter ${reciterId}`)
    await loadSurahs(reciterId)
    console.log(`📚 Loaded ${surahs.value.length} surahs for reciter ${reciterId}`)

    // If audio is currently loaded, reload and auto-play with new reciter
    if (selectedSurahValue.value) {
      console.log(`🎵 Reloading audio with new reciter for Surah ${selectedSurahValue.value}`)
      await playSelectedAudio() // This will reload and auto-play with new reciter
    } else if (audioPlayer.currentSurah.value) {
      // If no selectedSurahValue but we have currentSurah, use that
      setSelectedSurah(audioPlayer.currentSurah.value)
      console.log(`🎵 Reloading current Surah ${audioPlayer.currentSurah.value} with new reciter`)
      await playSelectedAudio()
    }
  }

  // Simple reciter selection for mobile
  const selectReciter = async (reciterId: string) => {
    await onReciterChanged(parseInt(reciterId))
  }

  // Restore saved session automatically (surah + position)
  const restoreSavedSession = async () => {
    if (!audioPlayer.currentSurah.value) {
      console.log('🔄 No saved session to restore')
      return false
    }

    try {
      console.log(`🔄 Restoring saved session: Surah ${audioPlayer.currentSurah.value} at ${audioPlayer.currentTime.value || 0}s`)

      // Ensure the saved surah is selected
      if (selectedSurahValue.value !== audioPlayer.currentSurah.value) {
        setSelectedSurah(audioPlayer.currentSurah.value)
      }

      // Load the saved audio (this will automatically restore position via onload handler)
      await audioPlayer.loadAudio(audioPlayer.currentSurah.value, currentReciterId.value)

      // Update MediaSession metadata
      const surah = getSurahById(audioPlayer.currentSurah.value)
      if (surah) {
        const surahDisplayName = `ซูเราะฮฺ ${surah.thaiName}`
        const reciterName = currentReciterName.value
        audioPlayer.updateMediaSessionMetadata(surahDisplayName, `เสียงแปลโดย ${reciterName}`)
      }

      console.log(`✅ Session restored: Surah ${audioPlayer.currentSurah.value} ready for playback`)
      return true

    } catch (error) {
      console.error('❌ Failed to restore saved session:', error)
      return false
    }
  }

  return {
    ...audioPlayer,
    ...useThemeActions(),
    ...useResponsiveState(),
    ...usePlayerModeActions(),
    ...useSelectionState(),

    // Reciter state
    currentReciterId,
    currentReciterName,

    // Data
    surahs,

    // Format functions
    formatDuration,
    formatTime: audioPlayer.formatTime,
    formatTimeWithHours: audioPlayer.formatTime,

    // UI actions
    toggleDarkMode,
    togglePlayerMode,

    // Audio actions
    playFromHero,
    seekToClick,
    selectAndPlaySurah,
    selectAndPlaySurahFromCard,
    selectReciter,
    onDesktopReciterChange,
    clearError: audioPlayer.clearError,

    // Computed getters
    getCurrentSurahName,
    getCurrentSurahRevelationPlace,
    getSurahRevelationPlace,
    getCurrentSurahTotalDuration,
    correctProgress,

    // Session management
    restoreSavedSession,

    // Reciter management
    availableReciters: computed(() => [
      { id: "001", name: "บรรจง โซะมณี" },
      { id: "002", name: "อุมัร สุจิตวรรณศรี" }
    ])
  }
}
