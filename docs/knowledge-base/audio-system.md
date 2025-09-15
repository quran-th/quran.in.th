# Audio System Architecture

## Overview

The audio system is the core functionality of Quran-TH, built on Howler.js for advanced audio control and Media Session API for native integration. It provides seamless audio streaming, verse-level timing, and cross-platform compatibility.

## Audio Engine Architecture

### Howler.js Integration

```typescript
// Core audio engine setup (useAudioPlayer.ts)
import { Howl } from 'howler'

const currentHowl = ref<Howl | null>(null)
const soundId = ref<number | null>(null)

// Audio instance creation
const createHowlInstance = (audioUrl: string) => {
  return new Howl({
    src: [audioUrl],
    html5: true,          // Use HTML5 Audio for streaming
    preload: false,       // Stream on demand
    format: ['mp3', 'ogg'], // Multiple format support
    onplay: handlePlay,
    onpause: handlePause,
    onend: handleEnd,
    onerror: handleError,
    onseek: handleSeek
  })
}
```

### Media Session API Integration

```typescript
// Native audio controls integration
if ('mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: currentSurah.thaiName,
    artist: currentReciter.name,
    album: 'อัลกุรอาน',
    artwork: [
      { src: '/media-cover.png', sizes: '512x512', type: 'image/png' }
    ]
  })

  // Action handlers for hardware controls
  navigator.mediaSession.setActionHandler('play', () => play())
  navigator.mediaSession.setActionHandler('pause', () => pause())
  navigator.mediaSession.setActionHandler('seekto', (details) => {
    if (details.seekTime) seek(details.seekTime)
  })
}
```

## Audio Streaming Strategy

### Environment-Aware Audio Sources

```typescript
// Audio source configuration (useAudioConfig.ts)
const config = useRuntimeConfig()

const getAudioUrl = (surahId: number, reciterId: number): string => {
  if (config.public.useLocalAudio) {
    // Development: Local files
    return `/audio/${String(reciterId).padStart(3, '0')}/${String(surahId).padStart(3, '0')}.mp3`
  } else {
    // Production: R2/CDN streaming
    return `https://audio.quran.in.th/${reciterId}/${surahId}.mp3`
  }
}
```

### Progressive Loading Strategy

```typescript
// Smart preloading based on user behavior
const preloadStrategy = {
  // Immediate: Current surah
  immediate: () => preloadAudio(currentSurah, currentReciter),

  // Background: Next/previous surahs
  background: () => {
    if (currentSurah < 114) preloadAudio(currentSurah + 1, currentReciter)
    if (currentSurah > 1) preloadAudio(currentSurah - 1, currentReciter)
  },

  // Idle: Popular surahs
  idle: () => popularSurahs.forEach(id => preloadAudio(id, currentReciter))
}
```

## State Management

### Central Audio State

```typescript
// Reactive state management (useAudioPlayer.ts)
const state = reactive<AudioPlayerState>({
  // Playback Control
  isPlaying: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,

  // Content Selection
  currentSurah: null,
  currentReciter: null,
  currentVerse: 1,

  // Audio Configuration
  volume: 80,
  isMuted: false,

  // Error Handling
  error: null
})
```

### State Synchronization

```typescript
// Time updates and verse tracking
const updateTime = () => {
  if (currentHowl.value && state.isPlaying) {
    state.currentTime = currentHowl.value.seek() as number

    // Update current verse based on timing
    const verseTiming = getCurrentVerseTiming()
    if (verseTiming) {
      state.currentVerse = parseInt(verseTiming.verse_key.split(':')[1])
    }

    // Continue time updates
    requestAnimationFrame(updateTime)
  }
}
```

## Verse-Level Timing System

### Timing Data Structure

```typescript
// Precise verse timing (types/quran.ts)
interface VerseTiming {
  verse_key: string        // "1:1", "2:255", etc.
  timestamp_from: number   // Start time (milliseconds)
  timestamp_to: number     // End time (milliseconds)
  duration: number        // Verse duration
  segments: number[][]    // Word-level segments
}
```

### Real-Time Verse Tracking

```typescript
// Current verse detection (useAudioPlayer.ts)
const currentVerseTiming = computed((): VerseTiming | null => {
  if (!state.audioFile?.verse_timings) return null

  return state.audioFile.verse_timings.find(timing => {
    const startTime = timing.timestamp_from / 1000  // Convert to seconds
    const endTime = timing.timestamp_to / 1000
    return state.currentTime >= startTime && state.currentTime < endTime
  }) || null
})
```

### Verse Navigation

```typescript
// Jump to specific verse
const seekToVerse = (verseNumber: number) => {
  if (!state.audioFile?.verse_timings) return

  const verseTiming = state.audioFile.verse_timings.find(
    timing => timing.verse_key.endsWith(`:${verseNumber}`)
  )

  if (verseTiming && currentHowl.value) {
    const seekTime = verseTiming.timestamp_from / 1000
    currentHowl.value.seek(seekTime)
    state.currentTime = seekTime
  }
}
```

## Network Optimization

### Connection Type Detection

```typescript
// Network-aware audio quality (useAudioPlayer.ts)
const networkType = ref<'cellular' | 'wifi' | 'unknown'>('unknown')

const detectNetworkType = () => {
  if (!import.meta.client || !('connection' in navigator)) return 'unknown'

  const connection = (navigator as any).connection
  if (!connection) return 'unknown'

  const cellularTypes = ['slow-2g', '2g', '3g']
  return cellularTypes.includes(connection.effectiveType) ? 'cellular' : 'wifi'
}

// Adaptive bitrate based on connection
const getOptimalAudioUrl = (surahId: number, reciterId: number) => {
  const quality = networkType.value === 'cellular' ? 'low' : 'high'
  return buildAudioUrl(surahId, reciterId, quality)
}
```

### Buffering and Error Recovery

```typescript
// Robust error handling and retry logic
const handleAudioError = (error: any) => {
  console.error('Audio error:', error)

  // Categorize error types
  if (error.code === 4) {
    state.error = 'NETWORK_ERROR'
    scheduleRetry()
  } else if (error.code === 3) {
    state.error = 'DECODE_ERROR'
    tryAlternativeFormat()
  } else {
    state.error = 'UNKNOWN_ERROR'
  }

  state.isLoading = false
  state.isPlaying = false
}

const scheduleRetry = (attempt = 1) => {
  if (attempt > 3) return // Max 3 retries

  const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
  setTimeout(() => retryAudioLoad(), delay)
}
```

## Caching Strategy

### Browser-Level Caching

```typescript
// Service worker audio caching (public/sw.js)
const AUDIO_CACHE = 'quran-audio-v1'

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/audio/')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            return response // Serve from cache
          }

          // Fetch and cache
          return fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone())
            return networkResponse
          })
        })
      })
    )
  }
})
```

### Application-Level Caching

```typescript
// In-memory audio caching for quick access
const audioCache = new Map<string, CachedAudio>()

const cacheAudio = async (surahId: number, reciterId: number, audioData: Blob) => {
  const cacheKey = `${reciterId}-${surahId}`

  audioCache.set(cacheKey, {
    id: cacheKey,
    surahId,
    reciterId,
    audioData,
    cachedAt: Date.now(),
    lastAccessedAt: Date.now(),
    fileSize: audioData.size
  })
}
```

## Performance Optimizations

### Audio Loading Strategy

```typescript
// Intelligent preloading
const audioLoadingStrategy = {
  priority: {
    high: ['current_surah'],
    medium: ['next_surah', 'previous_surah'],
    low: ['popular_surahs', 'recent_surahs']
  },

  triggers: {
    immediate: 'user_selection',
    background: 'playback_50_percent',
    idle: 'user_idle_5_seconds'
  }
}
```

### Memory Management

```typescript
// Automatic cleanup of unused audio instances
const cleanupAudioInstances = () => {
  // Destroy old Howl instances
  if (previousHowl.value && previousHowl.value !== currentHowl.value) {
    previousHowl.value.unload()
    previousHowl.value = null
  }

  // Clean old cache entries
  const maxCacheAge = 30 * 60 * 1000 // 30 minutes
  const now = Date.now()

  for (const [key, cached] of audioCache.entries()) {
    if (now - cached.lastAccessedAt > maxCacheAge) {
      audioCache.delete(key)
    }
  }
}
```

## Cross-Platform Compatibility

### Audio Format Support

```typescript
// Multi-format fallback for browser compatibility
const getSupportedFormats = (): string[] => {
  const audio = new Audio()
  const formats: string[] = []

  if (audio.canPlayType('audio/mpeg')) formats.push('mp3')
  if (audio.canPlayType('audio/ogg')) formats.push('ogg')
  if (audio.canPlayType('audio/wav')) formats.push('wav')

  return formats
}

const createAudioSource = (baseUrl: string): string[] => {
  const supportedFormats = getSupportedFormats()
  return supportedFormats.map(format => `${baseUrl}.${format}`)
}
```

### Mobile-Specific Optimizations

```typescript
// iOS audio unlock for autoplay
const unlockAudioContext = () => {
  if (import.meta.client && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
    const unlock = () => {
      const audio = new Audio()
      audio.play().catch(() => {}) // Unlock audio context
      document.removeEventListener('touchend', unlock, true)
    }
    document.addEventListener('touchend', unlock, true)
  }
}
```

## API Integration

### External Audio Sources

```typescript
// Integration with Quran audio APIs
const fetchAudioMetadata = async (surahId: number, reciterId: number): Promise<AudioFile> => {
  try {
    const response = await fetch(`/api/audio/${reciterId}/${surahId}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const data: AudioResponse = await response.json()
    return data.audio_files[0]
  } catch (error) {
    console.error('Failed to fetch audio metadata:', error)
    throw error
  }
}
```

### CDN Integration

```typescript
// Cloudflare R2 integration for production
const buildR2AudioUrl = (surahId: number, reciterId: number, quality = 'high') => {
  const baseUrl = 'https://audio.quran.in.th'
  const path = `${String(reciterId).padStart(3, '0')}/${String(surahId).padStart(3, '0')}`
  const suffix = quality === 'high' ? '.mp3' : '_low.mp3'

  return `${baseUrl}/${path}${suffix}`
}
```

---

**Next**: [Components →](./components.md)