# Audio System Architecture

## Overview

The audio system is the core functionality of Quran-TH, built on Howler.js for advanced audio control and Media Session API for native integration. It provides seamless audio streaming, verse-level timing, and cross-platform compatibility.

## Unified R2 Architecture

The application uses a **unified storage architecture** with Cloudflare R2 for both development and production environments:

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Client                          │
│                  (Howler.js Audio Player)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Request
                         │ /api/audio/{reciterId}/{surahId}
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Audio API Endpoint (Unified Code)              │
│         server/api/audio/[reciterId]/[id].get.ts           │
│                                                             │
│  • Validates parameters                                     │
│  • Accesses R2 bucket binding                              │
│  • Handles Range requests                                   │
│  • Returns audio stream                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ R2 API Call
                         │ bucket.get(objectKey)
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌──────────────────┐            ┌──────────────────┐
│   Development    │            │    Production    │
│                  │            │                  │
│  Miniflare R2    │            │  Cloudflare R2   │
│   Emulator       │            │     Bucket       │
│                  │            │                  │
│  .wrangler/      │            │  Global Edge     │
│  state/v3/r2/    │            │    Network       │
└──────────────────┘            └──────────────────┘
```

**Key Principles:**
- **Single Code Path**: Same R2 API code for all environments
- **No Conditionals**: No environment detection or branching logic
- **Realistic Testing**: Local development mirrors production behavior
- **Simple Onboarding**: Contributors use the same tools as production

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

### Unified R2 Storage Architecture

The application uses **Cloudflare R2** for audio storage in both development and production environments, eliminating environment-specific code paths.

**Architecture Benefits:**
- ✅ Single code path for all environments
- ✅ Consistent behavior between development and production
- ✅ Simplified maintenance and testing
- ✅ Realistic local development experience

**Development Environment:**
- Uses **Wrangler** with **Miniflare** for local R2 emulation
- Local R2 data stored in `.wrangler/state/v3/r2/`
- Seed audio files from `seed-data/audio/` directory
- Same R2 API as production

**Production Environment:**
- Uses Cloudflare R2 bucket
- Global edge network distribution
- Automatic CDN caching
- Same R2 API as development

### Audio URL Generation

```typescript
// Unified audio URL generation for all environments
const getAudioUrl = (surahId: number, reciterId: number): string => {
  // API endpoint handles R2 retrieval in both environments
  const paddedReciterId = String(reciterId).padStart(3, '0')
  const paddedSurahId = String(surahId).padStart(3, '0')
  return `/api/audio/${paddedReciterId}/${paddedSurahId}`
}

// Example URLs:
// /api/audio/001/001  → Reciter 1, Surah 1
// /api/audio/002/114  → Reciter 2, Surah 114
```

### R2 Object Structure

Audio files are stored in R2 with the following key structure:

```
R2 Bucket: quran-audio-bucket
├── 001/              # Reciter ID (padded to 3 digits)
│   ├── 001.ogg      # Surah 1
│   ├── 002.ogg      # Surah 2
│   └── ...
├── 002/              # Another reciter
│   ├── 001.ogg
│   └── ...
└── ...
```

### Local R2 Development Setup

**Initial Setup:**
```bash
# 1. Install dependencies (includes Wrangler)
npm install

# 2. Seed local R2 bucket with audio files
npm run seed:r2

# 3. Start development server with R2 emulation
npm run dev:cf
```

**Seed Data Management:**
```bash
# Seed local R2 with sample audio files
npm run seed:r2

# Force overwrite existing files
npm run seed:r2:force

# Clean local R2 storage
npm run clean:r2

# Clean and re-seed
npm run clean:r2 && npm run seed:r2
```

**Seed Data Structure:**
```
seed-data/audio/
├── 001/              # Reciter ID
│   ├── 001.ogg      # Surah files
│   └── 002.ogg
└── 002/
    ├── 001.ogg
    └── 002.ogg
```

### API Endpoint Implementation

The audio API endpoint (`server/api/audio/[reciterId]/[id].get.ts`) uses the same R2 code for both environments:

```typescript
// Unified R2 implementation - no environment conditionals
export default defineEventHandler(async (event) => {
  // Extract parameters
  const reciterId = getRouterParam(event, 'reciterId')
  const surahId = getRouterParam(event, 'id')

  // Get R2 bucket binding (works in both dev and prod)
  const bucket = event.context.cloudflare.env.AUDIO_BUCKET

  // Build R2 object key
  const objectKey = `${reciterId}/${surahId}.ogg`

  // Fetch from R2 (Miniflare in dev, Cloudflare R2 in prod)
  const object = await bucket.get(objectKey)

  if (!object) {
    throw createError({
      statusCode: 404,
      message: 'Audio file not found'
    })
  }

  // Stream audio with Range request support
  return object.body
})
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

### R2 Range Request Support

The audio API endpoint supports HTTP Range requests for efficient seeking and streaming:

```typescript
// Range request handling in audio API endpoint
const handleRangeRequest = async (event, bucket, objectKey) => {
  const rangeHeader = getHeader(event, 'range')

  if (rangeHeader) {
    // Parse range header: "bytes=0-1023"
    const [start, end] = parseRangeHeader(rangeHeader)

    // Fetch partial content from R2
    const object = await bucket.get(objectKey, {
      range: { offset: start, length: end ? end - start + 1 : undefined }
    })

    // Return 206 Partial Content
    return new Response(object.body, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Content-Length': String(end - start + 1),
        'Accept-Ranges': 'bytes'
      }
    })
  }

  // Return full file
  return bucket.get(objectKey)
}
```

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

### R2 Storage Integration

The application integrates with Cloudflare R2 for audio storage through a unified API endpoint:

```typescript
// Audio API endpoint: server/api/audio/[reciterId]/[id].get.ts
export default defineEventHandler(async (event) => {
  // Get R2 bucket binding from Cloudflare Workers environment
  const bucket = event.context.cloudflare.env.AUDIO_BUCKET

  if (!bucket) {
    throw createError({
      statusCode: 500,
      message: 'R2 bucket binding not available'
    })
  }

  // Build R2 object key
  const reciterId = getRouterParam(event, 'reciterId')
  const surahId = getRouterParam(event, 'id')
  const objectKey = `${reciterId}/${surahId}.ogg`

  // Fetch from R2 with Range request support
  const rangeHeader = getHeader(event, 'range')
  const object = await bucket.get(objectKey, {
    range: rangeHeader ? parseRange(rangeHeader) : undefined
  })

  if (!object) {
    throw createError({
      statusCode: 404,
      message: 'Audio file not found'
    })
  }

  // Return audio stream with appropriate headers
  return new Response(object.body, {
    headers: {
      'Content-Type': 'audio/ogg',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*'
    }
  })
})
```

### Environment-Agnostic Design

The same code works in both environments:

| Environment | R2 Implementation | Storage Location |
|-------------|------------------|------------------|
| **Development** | Miniflare R2 Emulator | `.wrangler/state/v3/r2/` |
| **Production** | Cloudflare R2 | R2 Bucket (Global) |

**Key Benefits:**
- No environment detection needed
- No conditional logic in audio code
- Identical API behavior
- Simplified testing and debugging

### Wrangler Configuration

R2 bucket binding is configured in `wrangler.jsonc`:

```jsonc
{
  "name": "quran-th",
  "compatibility_date": "2024-01-01",
  "r2_buckets": [
    {
      "binding": "AUDIO_BUCKET",
      "bucket_name": "quran-audio-bucket"
    }
  ]
}
```

This configuration:
- Provides `AUDIO_BUCKET` binding in Workers environment
- Works automatically in local development (Miniflare)
- Works automatically in production (Cloudflare R2)
- No additional environment variables needed

---

**Next**: [Components →](./components.md)