import { Howl } from 'howler'
import type { VerseTiming, AudioFile, Surah, AudioMetadata } from '~/types/quran'
import { useLocalStorage } from './useLocalStorage'

export const useAudioPlayer = () => {
  const localStorage = useLocalStorage()

  // Load initial state from localStorage or set defaults
  const initialState = localStorage.loadPlayerState()

  const isPlaying = useState<boolean>('player-isPlaying', () => false)
  const isLoading = useState<boolean>('player-isLoading', () => false)
  const currentTime = useState<number>('player-currentTime', () => initialState.currentTime || 0)
  const duration = useState<number>('player-duration', () => 0)
  const volume = useState<number>('player-volume', () => initialState.volume)
  const isMuted = useState<boolean>('player-isMuted', () => false)
  const currentSurah = useState<number | null>('player-currentSurah', () => initialState.currentSurah)
  const currentReciter = useState<number | null>('player-currentReciter', () => initialState.currentReciter)
  const currentVerse = useState<number>('player-currentVerse', () => 1)
  const audioElement = useState<HTMLAudioElement | null>('player-audioElement', () => null)
  const audioFile = useState<AudioFile | null>('player-audioFile', () => null)
  const error = useState<string | null>('player-error', () => null)

  // Additional reactive state
  const showTranslation = useState<boolean>('player-showTranslation', () => initialState.showTranslation)
  const repeatMode = useState<'none' | 'one' | 'all'>('player-repeatMode', () => 'none')
  const playbackRate = useState<number>('player-playbackRate', () => initialState.playbackRate)
  const autoPlay = useState<boolean>('player-autoPlay', () => true)

  // Player configuration state - single mode from localStorage
  const playerMode = useState<'autoNext' | 'shuffle' | 'loop' | 'none'>('player-playerMode', () => initialState.playerMode)

  // Computed properties for backward compatibility
  const shufflePlay = computed(() => playerMode.value === 'shuffle')
  const loopPlay = computed(() => playerMode.value === 'loop')
  const autoPlayNext = computed(() => playerMode.value === 'autoNext')

  // Howler.js specific state
  const currentHowl = useState<Howl | null>('player-currentHowl', () => null)
  const soundId = useState<number | null>('player-soundId', () => null)
  const isBuffering = useState<boolean>('player-isBuffering', () => false)

  // Screen Wake Lock sentinel
  let wakeLock: WakeLockSentinel | null = null

  // Track last saved time to prevent excessive localStorage updates
  let lastSavedTime = 0

  // Playback controls
  const play = async () => {
    if (!currentHowl.value) return

    try {
      isBuffering.value = true
      soundId.value = currentHowl.value.play() as number

      // Set volume and rate
      currentHowl.value.volume(volume.value / 100)
      currentHowl.value.rate(playbackRate.value)
    } catch (err) {
      console.error('[HowlerPlayer] Error playing audio:', err)
      error.value = 'เกิดข้อผิดพลาดในการเล่นเสียง กรุณาลองใหม่'
      isBuffering.value = false
    }
  }

  const pause = () => {
    if (!currentHowl.value) return
    currentHowl.value.pause()
  }

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

  // Screen Wake Lock management
  const acquireWakeLock = async () => {
    if (import.meta.client && 'wakeLock' in navigator) {
      try {
        wakeLock = await navigator.wakeLock.request('screen')
        console.log('[WakeLock] Acquired')
        // Handle release on visibility change (e.g., user switches tabs)
        wakeLock.addEventListener('release', () => {
          console.log('[WakeLock] Released by browser')
          wakeLock = null
        })
      } catch (err: unknown) {
        const error = err as Error
        console.error(`[WakeLock] Failed to acquire: ${error.name}, ${error.message}`)
        wakeLock = null
      }
    }
  }

  const releaseWakeLock = async () => {
    if (import.meta.client && wakeLock) {
      try {
        await wakeLock.release()
        console.log('[WakeLock] Released programmatically')
        wakeLock = null
      } catch (err: unknown) {
        const error = err as Error
        console.error(`[WakeLock] Failed to release: ${error.name}, ${error.message}`)
      }
    }
  }

  // Computed properties
  const progress = computed(() => {
    return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
  })

  const currentVerseTiming = computed((): VerseTiming | null => {
    if (!audioFile.value?.verse_timings) return null

    return audioFile.value.verse_timings.find(timing => {
      const startTime = timing.timestamp_from / 1000
      const endTime = timing.timestamp_to / 1000
      return currentTime.value >= startTime && currentTime.value < endTime
    }) || null
  })

  const currentVerseNumber = computed(() => {
    if (!currentVerseTiming.value) return currentVerse.value

    const verseKey = currentVerseTiming.value.verse_key
    const verseParts = verseKey.split(':')
    const verseNumber = verseParts[1] ? parseInt(verseParts[1]) : currentVerse.value
    return verseNumber
  })

  const totalVerses = computed(() => {
    return audioFile.value?.verse_timings?.length || 0
  })

  const isFirstVerse = computed(() => currentTime.value <= 10)
  const isLastVerse = computed(() => currentTime.value >= (duration.value - 10))

  // Platform detection for MediaSession API
  const createPlatformDetector = () => {
    if (!import.meta.client) return { isiOS: false, isAndroid: false, isSafari: false, isMobile: false, isPWA: false }

    const userAgent = navigator.userAgent
    return {
      isiOS: /iPad|iPhone|iPod/.test(userAgent),
      isAndroid: /Android/.test(userAgent),
      isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
      isMobile: /Mobi|Android/i.test(userAgent),
      isPWA: window.matchMedia('(display-mode: standalone)').matches
    }
  }

  // Background-aware mode handling for MediaSession
  const handleBackgroundNext = async () => {
    // Use Web Locks to prevent the browser from suspending the script during track transition
    if (import.meta.client && 'locks' in navigator) {
      await navigator.locks.request('audio-player-lock', async () => {
        await executeNextTrackLogic()
      })
    } else {
      // Fallback for browsers that don't support Web Locks
      await executeNextTrackLogic()
    }
  }

  const executeNextTrackLogic = async () => {
    console.log('[MediaSession] Background next track triggered, mode:', playerMode.value)

    // Update MediaSession state to indicate processing
    if (import.meta.client && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing'
    }

    try {
      switch (playerMode.value) {
        case 'shuffle':
          console.log('[MediaSession] Executing shuffle mode')
          await playRandomSurah()
          break
        case 'autoNext':
          console.log('[MediaSession] Executing autoNext mode')
          await playNextSurah()
          break
        case 'loop':
          console.log('[MediaSession] Executing loop mode')
          seekTo(0)
          await play()
          break
        case 'none':
        default:
          console.log('[MediaSession] Default: playing next surah')
          await playNextSurah()
          break
      }
    } catch (error) {
      console.error('[MediaSession] Background progression failed:', error)
      // Update MediaSession to indicate error/pause state
      if (import.meta.client && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused'
      }
    }
  }

  const handleBackgroundPrevious = () => {
    console.log('[MediaSession] Background previous track triggered, mode:', playerMode.value)
    switch (playerMode.value) {
      case 'shuffle':
        playRandomSurah()
        break
      case 'autoNext':
        playPreviousSurah()
        break
      case 'loop':
        seekTo(0)
        play()
        break
      case 'none':
      default:
        // Default to previous surah for better UX
        playPreviousSurah()
        break
    }
  }

  // iOS-specific MediaSession setup (no seek + track navigation conflict)
  const setupiOSMediaSession = () => {
    const actionHandlers = [
      ['play', () => play()],
      ['pause', () => pause()],
      ['nexttrack', handleBackgroundNext],
      ['previoustrack', handleBackgroundPrevious]
      // Note: No seek handlers due to iOS Safari conflict
    ]

    // Set handlers after audio starts playing (iOS requirement)
    const setHandlersAfterPlay = () => {
      for (const [action, handler] of actionHandlers) {
        try {
          navigator.mediaSession.setActionHandler(action as MediaSessionAction, handler as MediaSessionActionHandler)
          console.log(`[MediaSession iOS] Set handler for ${action}`)
        } catch (error) {
          console.warn(`[MediaSession iOS] Action "${action}" not supported:`, error)
        }
      }
    }

    // Listen for playing event to set handlers (iOS timing fix)
    if (currentHowl.value) {
      currentHowl.value.once('play', setHandlersAfterPlay)
    }

    return setHandlersAfterPlay
  }

  // Standard MediaSession setup (Android/Desktop - full feature support)
  const setupStandardMediaSession = () => {
    const actionHandlers = [
      ['play', () => play()],
      ['pause', () => pause()],
      ['nexttrack', handleBackgroundNext],
      ['previoustrack', handleBackgroundPrevious],
      ['seekbackward', (details: MediaSessionActionDetails) => {
        const skipTime = details.seekOffset || 10
        const newTime = Math.max(0, currentTime.value - skipTime)
        seekTo(newTime)
      }],
      ['seekforward', (details: MediaSessionActionDetails) => {
        const skipTime = details.seekOffset || 10
        const newTime = Math.min(duration.value, currentTime.value + skipTime)
        seekTo(newTime)
      }],
      ['seekto', (details: MediaSessionActionDetails) => {
        if (details.seekTime !== undefined) {
          seekTo(details.seekTime)
        }
      }]
    ]

    for (const [action, handler] of actionHandlers) {
      try {
        navigator.mediaSession.setActionHandler(action as MediaSessionAction, handler as MediaSessionActionHandler)
        console.log(`[MediaSession Standard] Set handler for ${action}`)
      } catch (error) {
        console.warn(`[MediaSession Standard] Action "${action}" not supported:`, error)
      }
    }
  }

  // Initialize MediaSession API for native OS controls with platform-specific setup
  const initMediaSession = () => {
    if (!import.meta.client || !('mediaSession' in navigator)) return

    const platform = createPlatformDetector()
    console.log('[MediaSession] Detected platform:', platform)

    if (platform.isiOS) {
      console.log('[MediaSession] Using iOS-specific setup')
      return setupiOSMediaSession()
    } else {
      console.log('[MediaSession] Using standard setup')
      setupStandardMediaSession()
      return null
    }
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

    navigator.mediaSession.playbackState = isPlaying.value ? 'playing' : 'paused'
  }

  // Update MediaSession position state for seeking
  const updateMediaSessionPositionState = () => {
    if (!import.meta.client || !('mediaSession' in navigator)) return

    if (!isFinite(duration.value) || !isFinite(currentTime.value) || !isFinite(playbackRate.value)) {
      return
    }

    try {
      navigator.mediaSession.setPositionState({
        duration: duration.value,
        playbackRate: playbackRate.value,
        position: currentTime.value
      })
    } catch (error) {
      console.warn('Failed to update MediaSession position state:', error)
    }
  }

  // Get audio URL for both environments
  const getAudioUrl = async (surahId: number, reciterId: number): Promise<string> => {
    const paddedReciterId = reciterId.toString().padStart(3, '0')
    const paddedSurahId = surahId.toString().padStart(3, '0')

    return `/api/audio/${paddedReciterId}/${paddedSurahId}`
  }

  // Load audio metadata from reciter-specific surah data via API
  const loadAudioMetadata = async (surahId: number, reciterId: number): Promise<AudioMetadata | null> => {
    try {
      // Get metadata from the surahs API endpoint
      const response = await $fetch<{
        reciterId: string,
        surahs: Surah[],
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

      isLoading.value = true
      error.value = null
      currentSurah.value = surahId
      currentReciter.value = reciterId
      currentTime.value = 0

      // Save to localStorage when surah or reciter changes
      localStorage.updateSurah(surahId)
      localStorage.updateReciter(reciterId)

      // Load metadata for the surah
      const metadata = await loadAudioMetadata(surahId, reciterId)
      if (metadata) {
        // Create a minimal AudioFile object for compatibility
        audioFile.value = {
          id: surahId,
          chapter_id: surahId,
          file_size: metadata.fileSize || 0,
          format: metadata.format || 'ogg',
          audio_url: '',  // Will be set below
          duration: metadata.duration || 0,
          verse_timings: [] // Empty for now - verse timings not available in current metadata
        }
      }

      // Get audio URL (handles dev/production environments)!
      const audioUrl = await getAudioUrl(surahId, reciterId)

      // Update the audio file URL
      if (audioFile.value) {
        audioFile.value.audio_url = audioUrl
      }

      // Detect network type for optimization
      networkType.value = detectNetworkType()

      // Note: Audio prefetching removed with Service Worker cleanup

      // Create new Howl instance optimized for large file streaming
      const howl = new Howl({
        src: [audioUrl],
        html5: true, // CRITICAL: Use HTML5 Audio for large files and streaming
        preload: 'metadata',
        format: ['ogg'], // Explicit format support
        onload: () => {
          duration.value = howl.duration()
          isLoading.value = false

          // Handle time restoration
          const savedTime = initialState.currentTime || 0
          const savedSurah = initialState.currentSurah
          const currentSurahId = currentSurah.value

          // If loading the same surah that was last played, seek to the saved position
          if (savedSurah === currentSurahId && savedTime > 0 && savedTime < duration.value) {
            howl.seek(savedTime)
            currentTime.value = savedTime
          } else {
            // Otherwise, start from the beginning
            howl.seek(0)
            currentTime.value = 0
          }

          console.log('[HowlerPlayer] Audio loaded successfully, duration:', duration.value)
        },
        onloaderror: (id, loadError) => {
          console.error('[HowlerPlayer] Load error:', loadError)
          error.value = 'ไม่พบไฟล์เสียงสำหรับซูเราะฮฺนี้ กรุณาลองซูเราะฮฺอื่น'
          isLoading.value = false
        },
        onplay: () => {
          isPlaying.value = true
          isBuffering.value = false

          // Acquire Wake Lock to prevent sleep during playback
          acquireWakeLock()

          // Update MediaSession
          if (import.meta.client && 'mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing'
            updateMediaSessionPositionState()
          }

          console.log('[HowlerPlayer] Playback started')
        },
        onpause: () => {
          isPlaying.value = false

          // Release Wake Lock on pause
          releaseWakeLock()

          // Update MediaSession
          if (import.meta.client && 'mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused'
          }

          // Save current state to localStorage as the single source of truth on pause
          if (currentSurah.value) {
            localStorage.updateCurrentState(currentSurah.value, currentTime.value)
          }

          console.log('[HowlerPlayer] Playback paused')
        },
        onend: async () => {
          isPlaying.value = false

          // Release Wake Lock on end
          releaseWakeLock()

          console.log('[HowlerPlayer] Triggering handleAudioEnd()')

          // CRITICAL: Update MediaSession playbackState BEFORE calling handleAudioEnd
          // This tells the OS that the track ended and triggers background auto-progression
          if (import.meta.client && 'mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused'
          }

          await handleAudioEnd()

          console.log('[HowlerPlayer] Playback ended')
        },
        onstop: () => {
          isPlaying.value = false

          // Release Wake Lock on stop
          releaseWakeLock()

          console.log('[HowlerPlayer] Playback stopped')
        },
        onplayerror: (id, playError) => {
          console.error('[HowlerPlayer] Play error:', playError)
          error.value = 'เกิดข้อผิดพลาดในการเล่นเสียง กรุณาลองใหม่'
          isPlaying.value = false

          // Handle unlock requirement on mobile
          howl.once('unlock', () => {
            howl.play()
          })
        }
      })

      // Store the Howl instance
      currentHowl.value = howl

      // Reinitialize MediaSession handlers for new audio (especially important for iOS)
      const platform = createPlatformDetector()
      if (platform.isiOS) {
        // For iOS, set up handlers to be applied when audio starts playing
        setupiOSMediaSession()
      }
      // Note: For non-iOS platforms, handlers are already set during initMediaSession

      // Reset saved time tracker for new audio
      lastSavedTime = 0

      // Set up time tracking interval (Howler.js doesn't provide timeupdate)
      if (import.meta.client) {
        const updateTime = () => {
          if (currentHowl.value && isPlaying.value) {
            const seek = currentHowl.value.seek() as number
            if (typeof seek === 'number' && isFinite(seek)) {
              currentTime.value = seek

              // Update MediaSession position periodically
              if (Math.floor(seek) % 3 === 0) {
                updateMediaSessionPositionState()
              }

              // Save current state (surah + time) to localStorage every 10 seconds
              const currentTenSecondMark = Math.floor(seek / 10) * 10
              if (currentTenSecondMark !== lastSavedTime && currentTenSecondMark % 10 === 0 && currentSurah.value) {
                lastSavedTime = currentTenSecondMark
                localStorage.updateCurrentState(currentSurah.value, seek)
              }
            }
          }

          if (currentHowl.value) {
            requestAnimationFrame(updateTime)
          }
        }
        requestAnimationFrame(updateTime)
      }

    } catch (err) {
      console.error('[HowlerPlayer] Error loading audio:', err)
      error.value = 'เกิดข้อผิดพลาดในการโหลดเสียง กรุณาลองใหม่'
      isLoading.value = false

      // Clear current states to allow retry
      currentSurah.value = null
      currentReciter.value = null
    }
  }

  const togglePlay = async () => {
    if (isPlaying.value) {
      pause()
    } else {
      await play()
    }
  }



  // Seeking
  const seekTo = (seconds: number) => {
    if (!currentHowl.value) return

    if (!isFinite(seconds) || !isFinite(duration.value) || duration.value <= 0) {
      console.warn('[HowlerPlayer] Invalid seek parameters:', { seconds, duration: duration.value })
      return
    }

    const seekTime = Math.max(0, Math.min(seconds, duration.value))

    if (isFinite(seekTime)) {
      currentHowl.value.seek(seekTime)
      currentTime.value = seekTime
    }
  }

  const seekToProgress = (progressPercent: number) => {
    if (!isFinite(progressPercent) || progressPercent < 0 || progressPercent > 100) {
      console.warn('[HowlerPlayer] Invalid progress percentage:', progressPercent)
      return
    }

    const seconds = (progressPercent / 100) * duration.value
    seekTo(seconds)
  }

  // Volume controls
  const setVolume = (newVolume: number) => {
    volume.value = Math.max(0, Math.min(100, newVolume))
    if (currentHowl.value) {
      currentHowl.value.volume(volume.value / 100)
    }
    // Save to localStorage
    localStorage.updateVolume(volume.value)
  }

  const toggleMute = () => {
    isMuted.value = !isMuted.value
    if (currentHowl.value) {
      currentHowl.value.mute(isMuted.value)
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
    if (!audioFile.value?.verse_timings) return

    const verseTiming = audioFile.value.verse_timings.find(
      timing => timing.verse_key.endsWith(`:${verseNumber}`)
    )

    if (verseTiming && verseTiming.timestamp_from) {
      const startTime = verseTiming.timestamp_from / 1000

      if (isFinite(startTime) && startTime >= 0) {
        seekTo(startTime)
        currentVerse.value = verseNumber
      }
    }
  }

  const previousVerse = () => {
    const newTime = Math.max(0, currentTime.value - 10)
    seekTo(newTime)
  }

  const nextVerse = () => {
    const newTime = Math.min(duration.value, currentTime.value + 10)
    seekTo(newTime)
  }

  // Handle audio end with new player modes (supports both foreground and background)
  const handleAudioEnd = async () => {
    console.log('[HowlerPlayer] Audio ended, player mode:', playerMode.value)

    // For background compatibility: Use MediaSession nexttrack for auto-progression
    // This ensures auto-progression works even when page is backgrounded/minimized
    const needsAutoProgression = ['loop', 'shuffle', 'autoNext'].includes(playerMode.value)

    if (needsAutoProgression) {
      console.log('[HowlerPlayer] Auto-progression needed, calling handleBackgroundNext for background compatibility')
      // Use the MediaSession-compatible handler which works in background
      await handleBackgroundNext()
    } else {
      console.log('[HowlerPlayer] No auto-progression mode active')
      // Update MediaSession to indicate no further action
      if (import.meta.client && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none'
      }
    }
  }

  // Play random surah for shuffle mode
  const playRandomSurah = async () => {
    console.log('[HowlerPlayer] playRandomSurah called')
    if (!currentReciter.value) {
      console.log('[HowlerPlayer] playRandomSurah: No current reciter')
      return
    }

    // Generate random surah ID (1-114), excluding current surah
    let randomSurahId
    do {
      randomSurahId = Math.floor(Math.random() * 114) + 1
    } while (randomSurahId === currentSurah.value)

    console.log('[HowlerPlayer] playRandomSurah: Selected surah', randomSurahId)

    try {
      await loadAudio(randomSurahId, currentReciter.value)
      await play()

      // Direct MediaSession metadata update (fallback)
      updateMediaSessionForCurrentTrack()

      // Call metadata callback if set
      if (onAutoPlayMetadataUpdate) {
        onAutoPlayMetadataUpdate(randomSurahId, currentReciter.value)
      }
    } catch (err) {
      console.error('[HowlerPlayer] Error loading random surah:', err)
      error.value = 'Failed to load random surah'
    }
  }

  // Select random surah from available surahs list when current surah is null
  const selectRandomSurahFromList = (surahs: readonly { readonly id: number }[]) => {
    if (!surahs.length) return null

    const randomIndex = Math.floor(Math.random() * surahs.length)
    const selectedSurahId = surahs[randomIndex]?.id ?? 1

    console.log(`🎲 No current surah found - selecting random surah: ${selectedSurahId} from ${surahs.length} available surahs`)

    return selectedSurahId
  }

  // Play next sequential surah
  const playNextSurah = async () => {
    console.log('[HowlerPlayer] playNextSurah called')
    if (!currentSurah.value || !currentReciter.value) {
      console.log('[HowlerPlayer] playNextSurah: Missing current surah or reciter')
      return
    }

    const nextSurahId = currentSurah.value + 1
    console.log('[HowlerPlayer] playNextSurah: Next surah ID', nextSurahId)

    // If we've reached the end (Surah 114), restart from Surah 1
    const targetSurahId = nextSurahId > 114 ? 1 : nextSurahId

    try {
      await loadAudio(targetSurahId, currentReciter.value)
      await play()

      // Direct MediaSession metadata update (fallback)
      updateMediaSessionForCurrentTrack()

      // Call metadata callback if set
      if (onAutoPlayMetadataUpdate) {
        onAutoPlayMetadataUpdate(targetSurahId, currentReciter.value)
      }
    } catch (err) {
      console.error('[HowlerPlayer] Error loading next surah:', err)
      error.value = 'Failed to load next surah'
    }
  }

  // Play previous sequential surah
  const playPreviousSurah = async () => {
    if (!currentSurah.value || !currentReciter.value) return

    const previousSurahId = currentSurah.value - 1

    // If we've reached the beginning (Surah 1), go to Surah 114
    const targetSurahId = previousSurahId < 1 ? 114 : previousSurahId

    try {
      await loadAudio(targetSurahId, currentReciter.value)
      await play()

      // Direct MediaSession metadata update (fallback)
      updateMediaSessionForCurrentTrack()

      // Call metadata callback if set
      if (onAutoPlayMetadataUpdate) {
        onAutoPlayMetadataUpdate(targetSurahId, currentReciter.value)
      }
    } catch (err) {
      console.error('[HowlerPlayer] Error loading previous surah:', err)
      error.value = 'Failed to load previous surah'
    }
  }

  // Callback for external metadata updates during auto-play (preserved from original)
  let onAutoPlayMetadataUpdate: ((surahId: number, reciterId: number) => void) | null = null

  // Set callback for metadata updates
  const setAutoPlayMetadataCallback = (callback: (surahId: number, reciterId: number) => void) => {
    onAutoPlayMetadataUpdate = callback
  }

  // Update MediaSession metadata for current track (fallback method)
  const updateMediaSessionForCurrentTrack = () => {
    if (!import.meta.client || !('mediaSession' in navigator)) return
    if (!currentSurah.value || !currentReciter.value) return

    // Simple metadata update with basic info
    const surahName = `ซูเราะฮ์ ${currentSurah.value}`
    const reciterName = `ภาษาไทยโดย ${currentReciter.value}`

    navigator.mediaSession.metadata = new MediaMetadata({
      title: surahName,
      artist: reciterName,
      album: 'อัลกุรอานพร้อมความหมายภาษาไทย',
      artwork: [
        {
          src: '/cover.jpg',
          sizes: '512x512',
          type: 'image/jpeg'
        }
      ]
    })

    console.log(`[MediaSession] Updated metadata: ${surahName} by ${reciterName}`)
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
    const newMode = shufflePlay.value ? 'none' : 'shuffle'
    setPlayerMode(newMode)
  }

  const toggleLoopPlay = () => {
    const newMode = loopPlay.value ? 'none' : 'loop'
    setPlayerMode(newMode)
  }

  const toggleAutoPlayNext = () => {
    const newMode = autoPlayNext.value ? 'none' : 'autoNext'
    setPlayerMode(newMode)
  }

  // Watch reactive state changes to save to localStorage
  watch(showTranslation, (newValue) => {
    localStorage.updateShowTranslation(newValue)
  })

  // Clear error state and enable retry
  const clearError = () => {
    error.value = null
    isLoading.value = false
  }

  // Cleanup
  const cleanup = () => {
    if (currentHowl.value) {
      currentHowl.value.unload()
      currentHowl.value = null
      soundId.value = null
    }
    // Ensure wake lock is released on cleanup
    releaseWakeLock()
  }

  // Background/visibility state management for audio continuation
  const setupVisibilityHandling = () => {
    if (!import.meta.client) return

    // Handle page visibility changes for background audio
    document.addEventListener('visibilitychange', () => {
      const isHidden = document.hidden
      console.log('[HowlerPlayer] Page visibility changed, hidden:', isHidden)

      // Re-acquire wake lock if document becomes visible and we are still playing
      if (!isHidden && isPlaying.value && !wakeLock) {
        console.log('[WakeLock] Re-acquiring on visibility change')
        acquireWakeLock()
      }

      if (import.meta.client && 'mediaSession' in navigator) {
        // Ensure MediaSession stays active when page is hidden
        if (isHidden && isPlaying.value) {
          console.log('[HowlerPlayer] Page hidden while playing, ensuring MediaSession active')
          navigator.mediaSession.playbackState = 'playing'
        }
      }
    })

    // Handle page lifecycle events for better mobile compatibility
    window.addEventListener('pagehide', () => {
      console.log('[HowlerPlayer] Page hide event - maintaining audio state')
      if (isPlaying.value && import.meta.client && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing'
      }
    })

    window.addEventListener('pageshow', () => {
      console.log('[HowlerPlayer] Page show event - syncing audio state')
      if (isPlaying.value && import.meta.client && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing'
      }
    })
  }

  // Initialize MediaSession and background handling on client
  onMounted(() => {
    if (import.meta.client) {
      initMediaSession()
      setupVisibilityHandling()
    }
  })



  return {
    // State
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    currentSurah,
    currentReciter,
    currentVerse,
    audioElement,
    audioFile,
    error,
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
    clearError,
    updateMediaSessionMetadata,
    updateMediaMetadata: updateMediaSessionMetadata, // Alias for backward compatibility
    playNextSurah,
    playPreviousSurah,
    playRandomSurah,
    setAutoPlayMetadataCallback,

    // localStorage utilities
    clearPlayerState: localStorage.clearPlayerState,
    getRandomSurah: localStorage.getRandomSurah,
    updateCurrentTime: localStorage.updateCurrentTime,
    updateCurrentState: localStorage.updateCurrentState,

    // Utility functions
    selectRandomSurahFromList
  }
}
