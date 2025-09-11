import { Howl, Howler } from 'howler'
import type { AudioPlayerState, VerseTiming } from '~/types/quran'
import { audioService } from '~/services/audioService'

export const useHowlerAudioPlayer = () => {
  // Reactive state - enhanced for Howler.js
  const state = reactive<AudioPlayerState & {
    currentHowl: Howl | null
    isBuffering: boolean
    loadProgress: number
    networkError: boolean
    retryCount: number
  }>({
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    volume: 80,
    isMuted: false,
    currentSurah: null,
    currentReciter: null,
    currentVerse: 1,
    audioElement: null, // Keep for MediaSession compatibility
    audioFile: null,
    error: null,
    // Howler-specific state
    currentHowl: null,
    isBuffering: false,
    loadProgress: 0,
    networkError: false,
    retryCount: 0
  })

  // Additional reactive state
  const showTranslation = ref(true)
  const repeatMode = ref<'none' | 'one' | 'all'>('none')
  const playbackRate = ref(1.0)
  const autoPlay = ref(true)

  // Configuration for streaming optimization
  const MAX_RETRIES = 3
  const RETRY_DELAY = 1000 // 1 second base delay
  const UPDATE_INTERVAL = 100 // Update progress every 100ms

  // Progress tracking
  let progressTimer: NodeJS.Timeout | null = null
  
  // Retry management to prevent endless reload cycles
  let currentLoadOperation: string | null = null
  let isRetrying = false

  // Computed properties
  const progress = computed(() => {
    return state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0
  })

  const currentVerseTiming = computed((): VerseTiming | null => {
    if (!state.audioFile?.verse_timings) return null
    
    return state.audioFile.verse_timings.find(timing => {
      const startTime = timing.timestamp_from / 1000
      const endTime = timing.timestamp_to / 1000
      return state.currentTime >= startTime && state.currentTime < endTime
    }) || null
  })

  const currentVerseNumber = computed(() => {
    if (!currentVerseTiming.value) return state.currentVerse
    
    const verseKey = currentVerseTiming.value.verse_key
    const verseNumber = parseInt(verseKey.split(':')[1] || '1')
    return verseNumber
  })

  const totalVerses = computed(() => {
    return state.audioFile?.verse_timings?.length || 0
  })

  const isFirstVerse = computed(() => state.currentTime <= 10)
  const isLastVerse = computed(() => state.currentTime >= (state.duration - 10))

  // Initialize Howler global settings
  const initHowler = () => {
    if (!import.meta.client) return

    // Configure Howler for optimal streaming
    Howler.volume(state.volume / 100)
    
    // Enable HTML5 Audio for better streaming support
    Howler.html5PoolSize = 10
    
    // Initialize MediaSession for background audio
    initMediaSession()
  }

  // Create and configure Howl instance with streaming optimizations
  const createHowlInstance = (audioUrl: string): Howl => {
    const howl = new Howl({
      src: [audioUrl],
      html5: true, // Enable HTML5 Audio for streaming
      preload: 'metadata', // Only preload metadata for faster startup
      format: ['mp3'], // Specify format for better optimization
      
      // Event handlers
      onload: () => {
        state.duration = howl.duration()
        state.isLoading = false
        state.isBuffering = false
        state.loadProgress = 100
        state.networkError = false
        state.retryCount = 0
        state.error = null
        // Clear operation state on successful load
        currentLoadOperation = null
        isRetrying = false
        console.log('Audio loaded successfully')
      },
      
      
      onloaderror: (id, error) => {
        console.error('Howler load error:', error)
        handleLoadError(error)
      },
      
      onplay: () => {
        state.isPlaying = true
        state.isBuffering = false
        startProgressTracking()
        updateMediaSessionPlaybackState('playing')
      },
      
      onpause: () => {
        state.isPlaying = false
        stopProgressTracking()
        updateMediaSessionPlaybackState('paused')
      },
      
      onstop: () => {
        state.isPlaying = false
        state.currentTime = 0
        stopProgressTracking()
        updateMediaSessionPlaybackState('paused')
      },
      
      onend: () => {
        state.isPlaying = false
        stopProgressTracking()
        handleAudioEnd()
      },
      
      onplayerror: (id, error) => {
        console.error('Howler play error:', error)
        handlePlayError(error)
      },
      
      onseek: () => {
        // Update current time after seeking
        if (state.currentHowl) {
          state.currentTime = state.currentHowl.seek() as number
        }
      }
    })

    return howl
  }

  // Enhanced error handling with retry mechanisms - prevents endless reload cycles
  const handleLoadError = async (error: unknown) => {
    console.error('Load error:', error)
    state.isLoading = false
    state.isBuffering = false
    state.networkError = true

    // Prevent recursive retries during an active retry operation
    if (isRetrying) {
      console.warn('Retry already in progress, skipping additional retry attempt')
      return
    }

    if (state.retryCount < MAX_RETRIES) {
      state.retryCount++
      isRetrying = true
      console.log(`Retrying... Attempt ${state.retryCount}/${MAX_RETRIES}`)
      
      try {
        // Exponential backoff delay (1s, 2s, 4s)
        const delay = RETRY_DELAY * Math.pow(2, state.retryCount - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
        
        // Retry by creating a new Howl instance directly instead of calling loadAudio
        if (state.currentSurah && state.currentReciter && currentLoadOperation) {
          const audioUrl = await audioService.getAudioUrl(state.currentSurah, state.currentReciter)
          
          // Cleanup previous instance if exists
          if (state.currentHowl) {
            state.currentHowl.unload()
          }
          
          // Create new instance with same configuration
          state.currentHowl = createHowlInstance(audioUrl)
        }
      } catch (retryError) {
        console.error('Retry attempt failed:', retryError)
        state.error = 'Failed to load audio after retry'
      } finally {
        isRetrying = false
      }
    } else {
      // Circuit breaker: stop automatic retries after max attempts
      state.error = 'Failed to load audio after 3 attempts. Check your connection and try again.'
      console.error('Max retry attempts reached. Manual retry required.')
      isRetrying = false
      currentLoadOperation = null
    }
  }

  const handlePlayError = async (error: unknown) => {
    console.error('Play error:', error)
    state.isPlaying = false
    state.networkError = true

    if (state.retryCount < MAX_RETRIES) {
      state.retryCount++
      console.log(`Retrying playback... Attempt ${state.retryCount}/${MAX_RETRIES}`)
      
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      
      // Retry playing
      if (state.currentHowl && !state.currentHowl.playing()) {
        try {
          state.currentHowl.play()
        } catch (retryError) {
          console.error('Retry play failed:', retryError)
          state.error = 'Playback failed after multiple attempts'
        }
      }
    } else {
      state.error = 'Playback failed after multiple attempts'
    }
  }

  // Progress tracking with better performance
  const startProgressTracking = () => {
    if (progressTimer) return

    progressTimer = setInterval(() => {
      if (state.currentHowl && state.isPlaying) {
        const currentTime = state.currentHowl.seek() as number
        if (typeof currentTime === 'number' && !isNaN(currentTime)) {
          state.currentTime = currentTime
          
          // Update MediaSession position periodically
          if (Math.floor(currentTime) % 5 === 0) {
            updateMediaSessionPositionState()
          }
        }
      }
    }, UPDATE_INTERVAL)
  }

  const stopProgressTracking = () => {
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
  }

  // Initialize MediaSession API
  const initMediaSession = () => {
    if (!import.meta.client || !('mediaSession' in navigator)) return

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

  // Update MediaSession metadata
  const updateMediaSessionMetadata = (surahName: string, reciterName: string) => {
    if (!import.meta.client || !('mediaSession' in navigator)) return

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
  }

  const updateMediaSessionPlaybackState = (state: 'playing' | 'paused') => {
    if (!import.meta.client || !('mediaSession' in navigator)) return
    navigator.mediaSession.playbackState = state
  }

  const updateMediaSessionPositionState = () => {
    if (!import.meta.client || !('mediaSession' in navigator) || !state.currentHowl) return

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

  // Load and play audio with enhanced error handling
  const loadAudio = async (surahId: number, reciterId: number) => {
    try {
      // Create unique operation ID to track this specific load operation
      const operationId = `${surahId}-${reciterId}-${Date.now()}`
      currentLoadOperation = operationId
      
      // Reset retry state for new load operation
      isRetrying = false
      
      // Cleanup previous instance
      if (state.currentHowl) {
        state.currentHowl.unload()
        state.currentHowl = null
      }

      state.isLoading = true
      state.isBuffering = true
      state.loadProgress = 0
      state.error = null
      state.networkError = false
      state.retryCount = 0
      state.currentSurah = surahId
      state.currentReciter = reciterId

      // Fetch audio metadata
      const audioFile = await audioService.fetchAudioMetadata(reciterId, surahId)
      state.audioFile = audioFile

      // Get audio URL
      const audioUrl = await audioService.getAudioUrl(surahId, reciterId)
      
      // Create new Howl instance
      state.currentHowl = createHowlInstance(audioUrl)
      
      // The load event will be handled by Howl's onload callback
    } catch (error) {
      console.error('Error loading audio:', error)
      state.error = 'Failed to load audio'
      state.isLoading = false
      state.networkError = true
      currentLoadOperation = null
    }
  }

  // Update MediaSession metadata when audio is loaded
  const updateMediaMetadata = (surahName: string, reciterName: string) => {
    updateMediaSessionMetadata(surahName, reciterName)
  }

  // Playback controls with enhanced reliability
  const play = async () => {
    if (!state.currentHowl) {
      console.warn('No audio loaded')
      return
    }

    try {
      // Reset error states
      state.error = null
      state.networkError = false
      
      const playResult = state.currentHowl.play()
      
      // Howler.js play() returns a sound ID number, not a promise
      // The onplay callback will handle the play event
      if (typeof playResult === 'number') {
        // Successfully started playback
      }
      
    } catch (error) {
      console.error('Error playing audio:', error)
      await handlePlayError(error)
    }
  }

  const pause = () => {
    if (!state.currentHowl) return
    
    state.currentHowl.pause()
  }

  const togglePlay = async () => {
    if (state.isPlaying) {
      pause()
    } else {
      await play()
    }
  }

  // Seek controls with validation
  const seekTo = (seconds: number) => {
    if (!state.currentHowl) return
    
    const clampedTime = Math.max(0, Math.min(seconds, state.duration))
    state.currentHowl.seek(clampedTime)
    state.currentTime = clampedTime
    updateMediaSessionPositionState()
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
    const newTime = Math.max(0, state.currentTime - 10)
    seekTo(newTime)
  }

  const nextVerse = () => {
    const newTime = Math.min(state.duration, state.currentTime + 10)
    seekTo(newTime)
  }

  // Volume controls
  const setVolume = (volume: number) => {
    state.volume = Math.max(0, Math.min(100, volume))
    const normalizedVolume = state.volume / 100
    
    // Update both Howler global volume and current instance
    Howler.volume(normalizedVolume)
    if (state.currentHowl) {
      state.currentHowl.volume(normalizedVolume)
    }
  }

  const toggleMute = () => {
    state.isMuted = !state.isMuted
    if (state.currentHowl) {
      state.currentHowl.mute(state.isMuted)
    }
  }

  // Playback rate with validation
  const setPlaybackRate = (rate: number) => {
    const clampedRate = Math.max(0.25, Math.min(2.0, rate))
    playbackRate.value = clampedRate
    
    if (state.currentHowl) {
      state.currentHowl.rate(clampedRate)
    }
  }

  // Handle audio end with auto-play logic
  const handleAudioEnd = () => {
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
    
    if (nextSurahId > 114) {
      if (repeatMode.value === 'all') {
        await loadAudio(1, state.currentReciter)
        await play()
        updateAutoPlayMetadata(1, state.currentReciter)
      }
      return
    }
    
    try {
      await loadAudio(nextSurahId, state.currentReciter)
      await play()
      updateAutoPlayMetadata(nextSurahId, state.currentReciter)
    } catch (error) {
      console.error('Error loading next surah:', error)
      state.error = 'Failed to load next surah'
    }
  }

  // Auto-play metadata callback
  let onAutoPlayMetadataUpdate: ((surahId: number, reciterId: number) => void) | null = null
  
  const setAutoPlayMetadataCallback = (callback: (surahId: number, reciterId: number) => void) => {
    onAutoPlayMetadataUpdate = callback
  }
  
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

  // Manual retry function for when automatic retries are exhausted
  const manualRetry = async () => {
    if (!state.currentSurah || !state.currentReciter) {
      console.warn('No surah/reciter selected for manual retry')
      return
    }
    
    console.log('Manual retry requested')
    
    // Reset retry state and try again
    state.retryCount = 0
    state.networkError = false
    state.error = null
    isRetrying = false
    currentLoadOperation = null
    
    // Reload the audio
    await loadAudio(state.currentSurah, state.currentReciter)
  }

  // Cleanup with proper resource disposal
  const cleanup = () => {
    stopProgressTracking()
    
    if (state.currentHowl) {
      state.currentHowl.unload()
      state.currentHowl = null
    }
    
    // Reset retry state
    isRetrying = false
    currentLoadOperation = null
    
    // Reset state
    state.isPlaying = false
    state.currentTime = 0
    state.duration = 0
    state.isLoading = false
    state.isBuffering = false
    state.networkError = false
    state.error = null
  }

  // Initialize on client
  onMounted(() => {
    if (import.meta.client) {
      initHowler()
    }
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    // State (including new Howler-specific state)
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
    setAutoPlayMetadataCallback,
    
    // New Howler-specific methods
    initHowler,
    createHowlInstance,
    manualRetry
  }
}