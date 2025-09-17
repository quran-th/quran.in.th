import { Howl } from 'howler'
import type { AudioPlayerState, VerseTiming } from '~/types/quran'
import { useLocalStorage } from './useLocalStorage'

export const useAudioPlayer = () => {
  const localStorage = useLocalStorage()

  // Load initial state from localStorage or set defaults
  const initialState = localStorage.loadPlayerState()

  // Reactive state - keeping essential state from original
  const state = reactive<AudioPlayerState>({
    isPlaying: false,
    isLoading: false,
    currentTime: initialState.currentTime || 0,
    duration: 0,
    volume: initialState.volume,
    isMuted: false,
    currentSurah: initialState.currentSurah,
    currentReciter: initialState.currentReciter,
    currentVerse: 1,
    audioElement: null, // Will be replaced by Howl instance
    audioFile: null,
    error: null
  })

  // Additional reactive state
  const showTranslation = ref(initialState.showTranslation)
  const repeatMode = ref<'none' | 'one' | 'all'>('none')
  const playbackRate = ref(initialState.playbackRate)
  const autoPlay = ref(true)

  // Player configuration state - single mode from localStorage
  const playerMode = ref(initialState.playerMode)

  // Computed properties for backward compatibility
  const shufflePlay = computed(() => playerMode.value === 'shuffle')
  const loopPlay = computed(() => playerMode.value === 'loop')
  const autoPlayNext = computed(() => playerMode.value === 'autoNext')
  
  // Howler.js specific state
  const currentHowl = ref<Howl | null>(null)
  const soundId = ref<number | null>(null)
  const isBuffering = ref(false)

  // Track last saved time to prevent excessive localStorage updates
  let lastSavedTime = 0

  // Network type detection (preserved from original)
  const networkType = ref<'cellular' | 'wifi' | 'unknown'>('unknown')
  
  const detectNetworkType = () => {
    if (!import.meta.client || !('connection' in navigator)) return 'unknown'
    
    const connection = (navigator as { connection?: { effectiveType?: string } }).connection
    if (!connection) return 'unknown'
    
    const cellularTypes = ['slow-2g', '2g', '3g']
    if (connection.effectiveType && cellularTypes.includes(connection.effectiveType)) {
      return 'cellular'
    }
    
    return 'wifi'
  }

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
    const verseNumber = parseInt(verseKey.split(':')[1])
    return verseNumber
  })

  const totalVerses = computed(() => {
    return state.audioFile?.verse_timings?.length || 0
  })

  const isFirstVerse = computed(() => state.currentTime <= 10)
  const isLastVerse = computed(() => state.currentTime >= (state.duration - 10))

  // Initialize MediaSession API for native OS controls
  const initMediaSession = () => {
    if (!import.meta.client || !('mediaSession' in navigator)) return

    // Set up media action handlers
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

  // Update MediaSession metadata with cover image
  const updateMediaSessionMetadata = (surahName: string, reciterName: string) => {
    if (!import.meta.client || !('mediaSession' in navigator)) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: surahName,
      artist: reciterName,
      album: 'อัลกุรอาน - Al-Quran',
      artwork: [
        {
          src: '/cover.jpg', // Use the cover image from public folder
          sizes: '512x512',
          type: 'image/jpeg'
        },
        {
          src: '/favicon.ico',
          sizes: '48x48',
          type: 'image/x-icon'
        }
      ]
    })

    navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused'
  }

  // Update MediaSession position state for seeking
  const updateMediaSessionPositionState = () => {
    if (!import.meta.client || !('mediaSession' in navigator)) return

    if (!isFinite(state.duration) || !isFinite(state.currentTime) || !isFinite(playbackRate.value)) {
      return
    }

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

  // Get audio URL for both environments
  const getAudioUrl = async (surahId: number, reciterId: number): Promise<string> => {
    const paddedReciterId = reciterId.toString().padStart(3, '0')
    return `/api/audio/${paddedReciterId}/${surahId}`
  }

  // Load audio metadata from reciter-specific surah data via API
  const loadAudioMetadata = async (surahId: number, reciterId: number): Promise<Record<string, unknown> | null> => {
    try {
      // Get metadata from the surahs API endpoint
      const response = await $fetch<{
        reciterId: string,
        surahs: any[],
        total: number
      }>(`/api/surahs/${reciterId}`)

      const surahData = response.surahs.find(s => s.id === surahId)
      return surahData || null
    } catch (error) {
      console.warn('[HowlerPlayer] Could not load audio metadata:', error)
      return null
    }
  }

  // Load and configure Howl for streaming large audio files
  const loadAudio = async (surahId: number, reciterId: number) => {
    try {
      // Cleanup previous Howl instance
      if (currentHowl.value) {
        currentHowl.value.unload()
        currentHowl.value = null
        soundId.value = null
      }

      state.isLoading = true
      state.error = null
      state.currentSurah = surahId
      state.currentReciter = reciterId

      // Save to localStorage when surah or reciter changes
      localStorage.updateSurah(surahId)
      localStorage.updateReciter(reciterId)

      // Load metadata for the surah
      const metadata = await loadAudioMetadata(surahId, reciterId)
      if (metadata) {
        // Create a minimal AudioFile object for compatibility
        state.audioFile = {
          id: surahId,
          chapter_id: surahId,
          file_size: metadata.fileSize || 0,
          format: metadata.format || 'ogg',
          audio_url: '',  // Will be set below
          duration: metadata.duration || 0,
          verse_timings: [] // Empty for now - verse timings not available in current metadata
        }
      }

      // Get audio URL (handles dev/production environments)
      const audioUrl = await getAudioUrl(surahId, reciterId)
      
      // Update the audio file URL
      if (state.audioFile) {
        state.audioFile.audio_url = audioUrl
      }
      
      // Detect network type for optimization
      networkType.value = detectNetworkType()
      
      // Create new Howl instance optimized for large file streaming
      const howl = new Howl({
        src: [audioUrl],
        html5: true, // CRITICAL: Use HTML5 Audio for large files and streaming
        preload: networkType.value === 'cellular' ? 'metadata' : 'auto',
        format: ['ogg', 'mp3'], // Explicit format support
        onload: () => {
          state.duration = howl.duration()
          state.isLoading = false

          // Restore saved position if available, valid, and matches current surah
          const savedTime = initialState.currentTime || 0
          const savedSurah = initialState.currentSurah
          const currentSurahId = state.currentSurah

          if (savedTime > 0 && savedTime < state.duration && savedSurah === currentSurahId) {
            howl.seek(savedTime)
            state.currentTime = savedTime
            console.log(`[HowlerPlayer] Restored saved position: ${savedTime.toFixed(1)}s for Surah ${currentSurahId}`)
          } else if (savedTime > 0 && savedSurah !== currentSurahId) {
            console.log(`[HowlerPlayer] Skipping position restore - saved position (${savedTime.toFixed(1)}s) was for Surah ${savedSurah}, now playing Surah ${currentSurahId}`)
            // Reset saved time since we're playing a different surah
            localStorage.updateCurrentState(currentSurahId, 0)
          }

          console.log('[HowlerPlayer] Audio loaded successfully, duration:', state.duration)
        },
        onloaderror: (id, error) => {
          console.error('[HowlerPlayer] Load error:', error)
          state.error = 'Failed to load audio file'
          state.isLoading = false
        },
        onplay: () => {
          state.isPlaying = true
          isBuffering.value = false
          
          // Update MediaSession
          if (import.meta.client && 'mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing'
            updateMediaSessionPositionState()
          }
          
          console.log('[HowlerPlayer] Playback started')
        },
        onpause: () => {
          state.isPlaying = false
          
          // Update MediaSession
          if (import.meta.client && 'mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused'
          }
          
          console.log('[HowlerPlayer] Playback paused')
        },
        onend: () => {
          state.isPlaying = false
          // Only trigger next surah if playback ended near the actual end
          if (state.duration > 0 && Math.abs(state.duration - state.currentTime) < 2) {
            handleAudioEnd()
          }
          console.log('[HowlerPlayer] Playback ended')
        },
        onstop: () => {
          state.isPlaying = false
          console.log('[HowlerPlayer] Playback stopped')
        },
        onplayerror: (id, error) => {
          console.error('[HowlerPlayer] Play error:', error)
          state.error = 'Playback failed'
          state.isPlaying = false
          
          // Handle unlock requirement on mobile
          howl.once('unlock', () => {
            howl.play()
          })
        }
      })

      // Store the Howl instance
      currentHowl.value = howl

      // Reset saved time tracker for new audio
      lastSavedTime = 0

      // Set up time tracking interval (Howler.js doesn't provide timeupdate)
      if (import.meta.client) {
        const updateTime = () => {
          if (currentHowl.value && state.isPlaying) {
            const seek = currentHowl.value.seek() as number
            if (typeof seek === 'number' && isFinite(seek)) {
              state.currentTime = seek

              // Update MediaSession position periodically
              if (Math.floor(seek) % 3 === 0) {
                updateMediaSessionPositionState()
              }

              // Save current state (surah + time) to localStorage every 5 seconds
              const currentFiveSecondMark = Math.floor(seek / 5) * 5
              if (currentFiveSecondMark !== lastSavedTime && currentFiveSecondMark % 5 === 0 && state.currentSurah) {
                lastSavedTime = currentFiveSecondMark
                localStorage.updateCurrentState(state.currentSurah, seek)
              }
            }
          }

          if (currentHowl.value) {
            requestAnimationFrame(updateTime)
          }
        }
        requestAnimationFrame(updateTime)
      }
      
    } catch (error) {
      console.error('[HowlerPlayer] Error loading audio:', error)
      state.error = 'Failed to load audio'
      state.isLoading = false
    }
  }

  // Playback controls
  const play = async () => {
    if (!currentHowl.value) return
    
    try {
      isBuffering.value = true
      soundId.value = currentHowl.value.play() as number
      
      // Set volume and rate
      currentHowl.value.volume(state.volume / 100)
      currentHowl.value.rate(playbackRate.value)
      
    } catch (error) {
      console.error('[HowlerPlayer] Error playing audio:', error)
      state.error = 'Failed to play audio'
      isBuffering.value = false
    }
  }

  const pause = () => {
    if (!currentHowl.value) return

    currentHowl.value.pause()

    // Save current state (surah + time) when pausing
    if (state.currentSurah) {
      localStorage.updateCurrentState(state.currentSurah, state.currentTime)
    }
  }

  const togglePlay = async () => {
    if (state.isPlaying) {
      pause()
    } else {
      await play()
    }
  }

  // Seeking
  const seekTo = (seconds: number) => {
    if (!currentHowl.value) return
    
    if (!isFinite(seconds) || !isFinite(state.duration) || state.duration <= 0) {
      console.warn('[HowlerPlayer] Invalid seek parameters:', { seconds, duration: state.duration })
      return
    }
    
    const seekTime = Math.max(0, Math.min(seconds, state.duration))
    
    if (isFinite(seekTime)) {
      currentHowl.value.seek(seekTime)
      state.currentTime = seekTime
    }
  }

  const seekToProgress = (progressPercent: number) => {
    if (!isFinite(progressPercent) || progressPercent < 0 || progressPercent > 100) {
      console.warn('[HowlerPlayer] Invalid progress percentage:', progressPercent)
      return
    }
    
    const seconds = (progressPercent / 100) * state.duration
    seekTo(seconds)
  }

  // Volume controls
  const setVolume = (volume: number) => {
    state.volume = Math.max(0, Math.min(100, volume))
    if (currentHowl.value) {
      currentHowl.value.volume(state.volume / 100)
    }
    // Save to localStorage
    localStorage.updateVolume(state.volume)
  }

  const toggleMute = () => {
    state.isMuted = !state.isMuted
    if (currentHowl.value) {
      currentHowl.value.mute(state.isMuted)
    }
  }

  // Playback rate
  const setPlaybackRate = (rate: number) => {
    playbackRate.value = Math.max(0.25, Math.min(2.0, rate))
    if (currentHowl.value) {
      currentHowl.value.rate(playbackRate.value)
    }
    // Save to localStorage
    localStorage.updatePlaybackRate(playbackRate.value)
  }

  // Verse navigation (preserved from original)
  const goToVerse = (verseNumber: number) => {
    if (!state.audioFile?.verse_timings) return
    
    const verseTiming = state.audioFile.verse_timings.find(
      timing => timing.verse_key.endsWith(`:${verseNumber}`)
    )
    
    if (verseTiming && verseTiming.timestamp_from) {
      const startTime = verseTiming.timestamp_from / 1000
      
      if (isFinite(startTime) && startTime >= 0) {
        seekTo(startTime)
        state.currentVerse = verseNumber
      }
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

  // Handle audio end with new player modes
  const handleAudioEnd = () => {
    if (loopPlay.value) {
      // Loop current surah
      seekTo(0)
      play()
    } else if (shufflePlay.value) {
      // Play random surah
      playRandomSurah()
    } else if (autoPlayNext.value) {
      // Play next sequential surah
      playNextSurah()
    }
    // If none of the modes are active, just stop playing
  }

  // Play random surah for shuffle mode
  const playRandomSurah = async () => {
    if (!state.currentReciter) return

    // Generate random surah ID (1-114), excluding current surah
    let randomSurahId
    do {
      randomSurahId = Math.floor(Math.random() * 114) + 1
    } while (randomSurahId === state.currentSurah)

    try {
      await loadAudio(randomSurahId, state.currentReciter)
      await play()
      // Call metadata callback if set
      if (onAutoPlayMetadataUpdate) {
        onAutoPlayMetadataUpdate(randomSurahId, state.currentReciter)
      }
    } catch (error) {
      console.error('[HowlerPlayer] Error loading random surah:', error)
      state.error = 'Failed to load random surah'
    }
  }

  // Play next sequential surah
  const playNextSurah = async () => {
    if (!state.currentSurah || !state.currentReciter) return

    const nextSurahId = state.currentSurah + 1

    // If we've reached the end (Surah 114), restart from Surah 1
    const targetSurahId = nextSurahId > 114 ? 1 : nextSurahId

    try {
      await loadAudio(targetSurahId, state.currentReciter)
      await play()
      // Call metadata callback if set
      if (onAutoPlayMetadataUpdate) {
        onAutoPlayMetadataUpdate(targetSurahId, state.currentReciter)
      }
    } catch (error) {
      console.error('[HowlerPlayer] Error loading next surah:', error)
      state.error = 'Failed to load next surah'
    }
  }

  // Callback for external metadata updates during auto-play (preserved from original)
  let onAutoPlayMetadataUpdate: ((surahId: number, reciterId: number) => void) | null = null
  
  // Set callback for metadata updates
  const setAutoPlayMetadataCallback = (callback: (surahId: number, reciterId: number) => void) => {
    onAutoPlayMetadataUpdate = callback
  }

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Functions to set player mode (ensuring only one is active)
  const setPlayerMode = (mode: 'autoNext' | 'shuffle' | 'loop' | 'none') => {
    playerMode.value = mode
    localStorage.updatePlayerMode(mode)
  }

  const toggleShufflePlay = () => {
    setPlayerMode(shufflePlay.value ? 'none' : 'shuffle')
  }

  const toggleLoopPlay = () => {
    setPlayerMode(loopPlay.value ? 'none' : 'loop')
  }

  const toggleAutoPlayNext = () => {
    setPlayerMode(autoPlayNext.value ? 'none' : 'autoNext')
  }

  // Watch reactive state changes to save to localStorage
  watch(showTranslation, (newValue) => {
    localStorage.updateShowTranslation(newValue)
  })

  // Cleanup
  const cleanup = () => {
    if (currentHowl.value) {
      currentHowl.value.unload()
      currentHowl.value = null
      soundId.value = null
    }
  }

  // Initialize MediaSession on client
  onMounted(() => {
    if (import.meta.client) {
      initMediaSession()
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

    // Player configuration state
    playerMode,
    shufflePlay,
    loopPlay,
    autoPlayNext,
    setPlayerMode,
    toggleShufflePlay,
    toggleLoopPlay,
    toggleAutoPlayNext,

    // Howler.js specific state
    isBuffering,
    networkType,

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
    updateMediaSessionMetadata,
    updateMediaMetadata: updateMediaSessionMetadata, // Alias for backward compatibility
    playNextSurah,
    playRandomSurah,
    setAutoPlayMetadataCallback,

    // localStorage utilities
    clearPlayerState: localStorage.clearPlayerState,
    getRandomSurah: localStorage.getRandomSurah,
    updateCurrentTime: localStorage.updateCurrentTime,
    updateCurrentState: localStorage.updateCurrentState
  }
}