import type { AudioPlayerState, AudioFile, VerseTiming } from '~/types/quran'
import { audioService } from '~/services/audioService'

export const useAudioPlayer = () => {
  // Reactive state
  const state = reactive<AudioPlayerState>({
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    volume: 80,
    isMuted: false,
    currentSurah: null,
    currentReciter: null,
    currentVerse: 1,
    audioElement: null,
    audioFile: null,
    error: null
  })

  // Additional reactive state
  const showTranslation = ref(true)
  const repeatMode = ref<'none' | 'one' | 'all'>('none')
  const playbackRate = ref(1.0)
  const autoPlay = ref(true) // Auto-play enabled by default

  // Computed properties
  const progress = computed(() => {
    return state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0
  })

  const currentVerseTiming = computed((): VerseTiming | null => {
    if (!state.audioFile?.verse_timings) return null
    
    return state.audioFile.verse_timings.find(timing => {
      const startTime = timing.timestamp_from / 1000 // Convert to seconds
      const endTime = timing.timestamp_to / 1000
      return state.currentTime >= startTime && state.currentTime < endTime
    }) || null
  })

  const currentVerseNumber = computed(() => {
    if (!currentVerseTiming.value) return state.currentVerse
    
    const verseKey = currentVerseTiming.value.verse_key
    const verseNumber = parseInt(verseKey.split(':')[1])
    return verseNumber
  })

  const totalVerses = computed(() => {
    return state.audioFile?.verse_timings?.length || 0
  })

  const isFirstVerse = computed(() => state.currentTime <= 10)
  const isLastVerse = computed(() => state.currentTime >= (state.duration - 10))

  // Initialize audio element
  const initAudio = () => {
    if (!process.client || state.audioElement) return

    const audio = new Audio()
    audio.preload = 'metadata'
    audio.crossOrigin = 'anonymous'

    // Event listeners
    audio.addEventListener('loadstart', () => {
      state.isLoading = true
      state.error = null
    })

    audio.addEventListener('loadedmetadata', () => {
      state.duration = audio.duration
      state.isLoading = false
    })

    audio.addEventListener('timeupdate', () => {
      state.currentTime = audio.currentTime
      // Update MediaSession position state periodically
      if (state.isPlaying && Math.floor(audio.currentTime) % 5 === 0) {
        updateMediaSessionPositionState()
      }
    })

    audio.addEventListener('ended', handleAudioEnd)
    
    audio.addEventListener('error', (e) => {
      state.error = 'Failed to load audio'
      state.isLoading = false
      state.isPlaying = false
      console.error('Audio error:', e)
    })

    audio.addEventListener('canplaythrough', () => {
      state.isLoading = false
    })

    // Volume and rate control
    audio.volume = state.volume / 100
    audio.playbackRate = playbackRate.value

    state.audioElement = audio
    
    // Initialize MediaSession for background audio
    initMediaSession()
  }

  // Initialize MediaSession API for background audio and OS integration
  const initMediaSession = () => {
    if (!process.client || !('mediaSession' in navigator)) return

    // Set up media action handlers for lock screen controls
    navigator.mediaSession.setActionHandler('play', () => {
      play()
    })

    navigator.mediaSession.setActionHandler('pause', () => {
      pause()
    })

    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const skipTime = details.seekOffset || 10
      const newTime = Math.max(0, state.currentTime - skipTime)
      seekTo(newTime)
    })

    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const skipTime = details.seekOffset || 10
      const newTime = Math.min(state.duration, state.currentTime + skipTime)
      seekTo(newTime)
    })

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        seekTo(details.seekTime)
      }
    })
  }

  // Update MediaSession metadata with current Surah and reciter info
  const updateMediaSessionMetadata = (surahName: string, reciterName: string, surahId: number) => {
    if (!process.client || !('mediaSession' in navigator)) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: surahName,
      artist: reciterName,
      album: 'อัลกุรอาน - Al-Quran',
      artwork: [
        {
          src: '/favicon.ico',
          sizes: '48x48',
          type: 'image/x-icon'
        }
      ]
    })

    // Update playback state
    navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused'
  }

  // Update MediaSession position state for progress tracking
  const updateMediaSessionPositionState = () => {
    if (!process.client || !('mediaSession' in navigator) || !state.audioElement) return

    try {
      navigator.mediaSession.setPositionState({
        duration: state.duration,
        playbackRate: playbackRate.value,
        position: state.currentTime
      })
    } catch (error) {
      console.warn('Failed to update MediaSession position state:', error)
    }
  }

  // Load and play audio
  const loadAudio = async (surahId: number, reciterId: number) => {
    if (!state.audioElement) initAudio()
    if (!state.audioElement) return

    try {
      state.isLoading = true
      state.error = null
      state.currentSurah = surahId
      state.currentReciter = reciterId

      // Fetch audio metadata
      const audioFile = await audioService.fetchAudioMetadata(reciterId, surahId)
      state.audioFile = audioFile

      // Get audio URL (cached or direct)
      const audioUrl = await audioService.getAudioUrl(surahId, reciterId)
      
      // Load the audio
      state.audioElement.src = audioUrl
      await new Promise<void>((resolve, reject) => {
        const audio = state.audioElement!
        const handleLoad = () => {
          audio.removeEventListener('canplaythrough', handleLoad)
          audio.removeEventListener('error', handleError)
          resolve()
        }
        const handleError = () => {
          audio.removeEventListener('canplaythrough', handleLoad)
          audio.removeEventListener('error', handleError)
          reject(new Error('Failed to load audio'))
        }
        
        audio.addEventListener('canplaythrough', handleLoad)
        audio.addEventListener('error', handleError)
      })
      
      state.isLoading = false
    } catch (error) {
      console.error('Error loading audio:', error)
      state.error = 'Failed to load audio'
      state.isLoading = false
    }
  }

  // Update MediaSession metadata when audio is loaded
  const updateMediaMetadata = (surahName: string, reciterName: string) => {
    updateMediaSessionMetadata(surahName, reciterName, state.currentSurah || 1)
  }

  // Playback controls
  const play = async () => {
    if (!state.audioElement) return
    
    try {
      await state.audioElement.play()
      state.isPlaying = true
      
      // Update MediaSession playback state
      if (process.client && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing'
        updateMediaSessionPositionState()
      }
    } catch (error) {
      console.error('Error playing audio:', error)
      state.error = 'Failed to play audio'
    }
  }

  const pause = () => {
    if (!state.audioElement) return
    
    state.audioElement.pause()
    state.isPlaying = false
    
    // Update MediaSession playback state
    if (process.client && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused'
    }
  }

  const togglePlay = async () => {
    if (state.isPlaying) {
      pause()
    } else {
      await play()
    }
  }

  // Seek controls
  const seekTo = (seconds: number) => {
    if (!state.audioElement) return
    
    state.audioElement.currentTime = Math.max(0, Math.min(seconds, state.duration))
  }

  const seekToProgress = (progressPercent: number) => {
    const seconds = (progressPercent / 100) * state.duration
    seekTo(seconds)
  }

  // Verse navigation
  const goToVerse = (verseNumber: number) => {
    if (!state.audioFile?.verse_timings) return
    
    const verseTiming = state.audioFile.verse_timings.find(
      timing => timing.verse_key.endsWith(`:${verseNumber}`)
    )
    
    if (verseTiming) {
      const startTime = verseTiming.timestamp_from / 1000
      seekTo(startTime)
      state.currentVerse = verseNumber
    }
  }

  const previousVerse = () => {
    // Rewind 10 seconds
    const newTime = Math.max(0, state.currentTime - 10)
    seekTo(newTime)
  }

  const nextVerse = () => {
    // Fast forward 10 seconds
    const newTime = Math.min(state.duration, state.currentTime + 10)
    seekTo(newTime)
  }

  // Volume controls
  const setVolume = (volume: number) => {
    state.volume = Math.max(0, Math.min(100, volume))
    if (state.audioElement) {
      state.audioElement.volume = state.volume / 100
    }
  }

  const toggleMute = () => {
    state.isMuted = !state.isMuted
    if (state.audioElement) {
      state.audioElement.muted = state.isMuted
    }
  }

  // Playback rate
  const setPlaybackRate = (rate: number) => {
    playbackRate.value = Math.max(0.25, Math.min(2.0, rate))
    if (state.audioElement) {
      state.audioElement.playbackRate = playbackRate.value
    }
  }

  // Handle audio end
  const handleAudioEnd = () => {
    state.isPlaying = false
    
    if (repeatMode.value === 'one') {
      // Restart current surah
      seekTo(0)
      play()
    } else if (repeatMode.value === 'all' || autoPlay.value) {
      // Auto-play next surah or repeat all
      playNextSurah()
    }
  }

  // Play next sequential surah
  const playNextSurah = async () => {
    if (!state.currentSurah || !state.currentReciter) return
    
    const nextSurahId = state.currentSurah + 1
    
    // Check if we've reached the end (Surah 114 is the last)
    if (nextSurahId > 114) {
      if (repeatMode.value === 'all') {
        // Start over from Surah 1
        await loadAudio(1, state.currentReciter)
        await play()
        // Update MediaSession metadata for first surah
        updateAutoPlayMetadata(1, state.currentReciter)
      }
      // If just auto-play (not repeat all), stop at the end
      return
    }
    
    // Load and play next surah
    try {
      await loadAudio(nextSurahId, state.currentReciter)
      await play()
      // Update MediaSession metadata for next surah
      updateAutoPlayMetadata(nextSurahId, state.currentReciter)
    } catch (error) {
      console.error('Error loading next surah:', error)
      state.error = 'Failed to load next surah'
    }
  }

  // Callback for external metadata updates during auto-play
  let onAutoPlayMetadataUpdate: ((surahId: number, reciterId: number) => void) | null = null
  
  // Set callback for metadata updates
  const setAutoPlayMetadataCallback = (callback: (surahId: number, reciterId: number) => void) => {
    onAutoPlayMetadataUpdate = callback
  }
  
  // Update MediaSession metadata during auto-play transitions
  const updateAutoPlayMetadata = (surahId: number, reciterId: number) => {
    if (onAutoPlayMetadataUpdate) {
      onAutoPlayMetadataUpdate(surahId, reciterId)
    }
  }

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Cleanup
  const cleanup = () => {
    if (state.audioElement) {
      state.audioElement.pause()
      state.audioElement.src = ''
      state.audioElement = null
    }
  }

  // Initialize on client
  onMounted(() => {
    if (process.client) {
      initAudio()
    }
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    // State
    ...toRefs(state),
    showTranslation,
    repeatMode,
    playbackRate,
    autoPlay,
    
    // Computed
    progress,
    currentVerseTiming,
    currentVerseNumber,
    totalVerses,
    isFirstVerse,
    isLastVerse,
    
    // Methods
    loadAudio,
    play,
    pause,
    togglePlay,
    seekTo,
    seekToProgress,
    goToVerse,
    previousVerse,
    nextVerse,
    setVolume,
    toggleMute,
    setPlaybackRate,
    formatTime,
    cleanup,
    updateMediaMetadata,
    playNextSurah,
    setAutoPlayMetadataCallback
  }
}