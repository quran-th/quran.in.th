# Quran App - System Design & Architecture

## Project Overview
A public-accessible Quran streaming application built with Nuxt.js 4, deployed on Cloudflare Workers. The MVP focuses on a clean media player interface for Quran recitation with enriched features.

## Current Setup Analysis
- **Framework**: Nuxt.js 4 with Vue 3 & TypeScript
- **UI Library**: Nuxt UI (@nuxt/ui) - Tailwind CSS-based components with accessibility
- **Code Quality**: ESLint with Nuxt configuration (@nuxt/eslint)
- **Runtime**: Cloudflare Workers (edge deployment)
- **Current State**: Complete mobile-first Quran player application with sophisticated UI
- **Dependencies**: Nuxt UI component library, ESLint, Cloudflare Workers integration

## Implementation Status ✅
- ✅ **Mobile-First Design**: Responsive layout optimized for 430px mobile viewport
- ✅ **Sophisticated UI**: Modern card system, gradient hero sections, elevated shadows
- ✅ **Complete Player Interface**: Play/pause, progress tracking, verse navigation
- ✅ **Dark/Light Theme**: CSS custom properties with seamless theme switching
- ✅ **Arabic Typography**: Proper RTL support with beautiful Arabic font rendering
- ✅ **Working Selectors**: Fixed USelect dropdowns for Reciter and Surah selection
- ✅ **Interactive Elements**: Smooth transitions, hover effects, touch-friendly controls
- ✅ **Bottom Navigation**: Mobile app-style navigation with proper z-index handling

## MVP Requirements
🎯 **Core Features**:
- Clean media player UI for Quran streaming
- Reciter selection
- Surah selection
- Translation toggle (plays after each verse)
- Standard media controls (play, pause, next, previous, volume)

## System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Vue 3)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ MediaPlayer │  │ Reciter     │  │ Surah       │         │
│  │ Component   │  │ Selector    │  │ Selector    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Translation │  │ Audio       │  │ Progress    │         │
│  │ Toggle      │  │ Controls    │  │ Tracker     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                API Layer (Nuxt Server)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Quran     │  │  Reciters   │  │ Translations│         │
│  │    API      │  │    API      │  │     API     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │   Audio     │  │  Metadata   │                          │
│  │ Streaming   │  │    API      │                          │
│  └─────────────┘  └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ External APIs
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 External Data Sources                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Quran Text  │  │   Audio     │  │ Translation │         │
│  │    API      │  │  Storage    │  │    API      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## API Architecture

### Core API Endpoints

#### 1. Quran Data API
```typescript
// Get all surahs
GET /api/quran/surahs
Response: {
  surahs: Array<{
    number: number
    name: string
    englishName: string
    numberOfVerses: number
    revelationType: 'Meccan' | 'Medinan'
  }>
}

// Get specific surah
GET /api/quran/surahs/:surahNumber
Response: {
  surah: {
    number: number
    name: string
    englishName: string
    verses: Array<{
      number: number
      text: string
      transliteration?: string
    }>
  }
}

// Get verse by verse
GET /api/quran/verses/:surahNumber/:verseNumber
Response: {
  verse: {
    surahNumber: number
    verseNumber: number
    text: string
    transliteration?: string
    translation?: string
  }
}
```

#### 2. Reciters API
```typescript
// Get all available reciters
GET /api/reciters
Response: {
  reciters: Array<{
    id: string
    name: string
    englishName: string
    style: string
    language: string
    bitrate: number
  }>
}

// Get reciter details
GET /api/reciters/:reciterId
Response: {
  reciter: {
    id: string
    name: string
    englishName: string
    biography?: string
    availableSurahs: number[]
  }
}
```

#### 3. Audio Streaming API
```typescript
// Get audio URL for specific recitation
GET /api/audio/:reciterId/:surahNumber/:verseNumber?
Response: {
  audioUrl: string
  duration: number
  format: 'mp3' | 'ogg'
  bitrate: number
}

// Stream audio directly
GET /api/stream/:reciterId/:surahNumber/:verseNumber?
Response: Audio stream (Content-Type: audio/mpeg)
```

#### 4. Translation API
```typescript
// Get available translations
GET /api/translations
Response: {
  translations: Array<{
    id: string
    name: string
    author: string
    language: string
    direction: 'ltr' | 'rtl'
  }>
}

// Get translated verse
GET /api/translations/:translationId/:surahNumber/:verseNumber
Response: {
  translation: {
    text: string
    footnotes?: string[]
  }
}

// Get translation audio (if available)
GET /api/translations/:translationId/audio/:surahNumber/:verseNumber
Response: {
  audioUrl: string
  duration: number
}
```

#### 5. Playback Control API
```typescript
// Get playback session
POST /api/playback/session
Body: {
  reciterId: string
  surahNumber: number
  translationEnabled: boolean
  translationId?: string
}
Response: {
  sessionId: string
  playlist: Array<{
    type: 'verse' | 'translation'
    audioUrl: string
    duration: number
    verseNumber?: number
  }>
}

// Update playback position
PUT /api/playback/session/:sessionId/position
Body: {
  currentIndex: number
  currentTime: number
}
```

## UI Component Architecture

**UI Framework**: Built with Nuxt UI components providing:
- Consistent Tailwind CSS styling
- Built-in accessibility features
- Dark/light mode support
- Responsive design out-of-the-box

### Component Hierarchy
```
App
├── Layout
│   ├── Header (Logo, Settings)
│   └── Footer (Credits, Links)
└── QuranPlayer
    ├── PlayerControls
    │   ├── PlayButton
    │   ├── PreviousButton
    │   ├── NextButton
    │   ├── VolumeControl
    │   └── ProgressBar
    ├── ContentDisplay
    │   ├── CurrentVerse
    │   ├── Translation (conditional)
    │   └── VerseInfo
    ├── PlayerSettings
    │   ├── ReciterSelector
    │   ├── SurahSelector
    │   ├── TranslationToggle
    │   └── TranslationSelector (conditional)
    └── PlaylistView
        ├── CurrentSurah
        └── VerseList
```

### Key Components Specification

#### 1. QuranPlayer (Main Container)
```vue
<template>
  <div class="quran-player">
    <ContentDisplay 
      :current-verse="currentVerse"
      :show-translation="showTranslation"
      :translation="currentTranslation"
    />
    
    <PlayerControls
      :is-playing="isPlaying"
      :current-time="currentTime"
      :duration="duration"
      :volume="volume"
      @play="handlePlay"
      @pause="handlePause"
      @seek="handleSeek"
      @volume-change="handleVolumeChange"
    />
    
    <PlayerSettings
      :selected-reciter="selectedReciter"
      :selected-surah="selectedSurah"
      :reciters="reciters"
      :surahs="surahs"
      :show-translation="showTranslation"
      @reciter-change="handleReciterChange"
      @surah-change="handleSurahChange"
      @translation-toggle="handleTranslationToggle"
    />
  </div>
</template>
```

#### 2. PlayerControls (Media Controls)
```vue
<template>
  <div class="player-controls">
    <div class="main-controls">
      <PreviousButton @click="$emit('previous')" />
      <PlayButton 
        :is-playing="isPlaying"
        @play="$emit('play')"
        @pause="$emit('pause')"
      />
      <NextButton @click="$emit('next')" />
    </div>
    
    <ProgressBar
      :current-time="currentTime"
      :duration="duration"
      @seek="$emit('seek', $event)"
    />
    
    <VolumeControl
      :volume="volume"
      @change="$emit('volume-change', $event)"
    />
  </div>
</template>
```

#### 3. ContentDisplay (Verse Display)
```vue
<template>
  <div class="content-display">
    <div class="verse-container">
      <div class="arabic-text" dir="rtl">
        {{ currentVerse.text }}
      </div>
      
      <div v-if="currentVerse.transliteration" class="transliteration">
        {{ currentVerse.transliteration }}
      </div>
      
      <div v-if="showTranslation && translation" class="translation">
        {{ translation.text }}
      </div>
    </div>
    
    <div class="verse-info">
      Surah {{ currentVerse.surahNumber }}, Verse {{ currentVerse.verseNumber }}
    </div>
  </div>
</template>
```

## Nuxt UI Integration

### Available Components
The project leverages Nuxt UI components for consistent styling and accessibility:

**Form & Input Components:**
- `UButton` - Play, pause, next, previous controls
- `USelect` - Reciter and surah selection dropdowns  
- `USlider` - Volume and progress controls
- `UToggle` - Translation toggle, settings switches
- `UInput` - Search functionality (future)

**Layout & Display:**
- `UCard` - Verse display container, settings panels
- `UModal` - Settings modal, help overlay
- `UContainer` - Main layout wrapper
- `UDivider` - Section separators

**Feedback & Status:**
- `UProgress` - Loading states, audio progress
- `UNotification` - Error/success messages
- `UBadge` - Verse numbers, status indicators
- `UTooltip` - Help text and shortcuts

### Styling Approach
```vue
<template>
  <!-- Using Nuxt UI with custom classes for media player -->
  <UCard class="quran-player">
    <div class="controls-section">
      <UButton 
        icon="i-heroicons-play" 
        size="lg" 
        variant="solid"
        @click="togglePlay"
      />
      
      <USlider 
        v-model="volume" 
        :max="100" 
        class="volume-control"
      />
      
      <USelect 
        v-model="selectedReciter"
        :options="reciters"
        placeholder="Choose Reciter"
      />
    </div>
    
    <div class="verse-display" dir="rtl">
      <p class="arabic-text">{{ currentVerse.text }}</p>
      <UToggle v-model="showTranslation">
        <template #label>Show Translation</template>
      </UToggle>
    </div>
  </UCard>
</template>
```

### Theming & Customization
- Dark/light mode automatically supported via Nuxt UI
- Custom CSS classes for media player specific styling
- Tailwind utilities for responsive design
- RTL support for Arabic text display

## Data Models

### TypeScript Interfaces

```typescript
// Core Quran Data
interface Surah {
  number: number
  name: string
  englishName: string
  numberOfVerses: number
  revelationType: 'Meccan' | 'Medinan'
  verses?: Verse[]
}

interface Verse {
  surahNumber: number
  verseNumber: number
  text: string
  transliteration?: string
}

// Reciter Data
interface Reciter {
  id: string
  name: string
  englishName: string
  style: string
  language: string
  bitrate: number
  availableSurahs: number[]
}

// Translation Data
interface Translation {
  id: string
  name: string
  author: string
  language: string
  direction: 'ltr' | 'rtl'
}

interface TranslatedVerse {
  text: string
  footnotes?: string[]
}

// Audio Data
interface AudioTrack {
  url: string
  duration: number
  format: 'mp3' | 'ogg'
  bitrate: number
}

// Playback Session
interface PlaybackSession {
  sessionId: string
  reciterId: string
  surahNumber: number
  translationEnabled: boolean
  translationId?: string
  currentIndex: number
  currentTime: number
  playlist: PlaylistItem[]
}

interface PlaylistItem {
  type: 'verse' | 'translation'
  audioUrl: string
  duration: number
  verseNumber?: number
  verse?: Verse
  translation?: TranslatedVerse
}

// Player State
interface PlayerState {
  isPlaying: boolean
  currentTrack: PlaylistItem | null
  currentTime: number
  duration: number
  volume: number
  playbackRate: number
  playlist: PlaylistItem[]
  currentIndex: number
}
```

## Project Directory Structure

```
quran-th/
├── app/
│   ├── components/
│   │   ├── ui/                    # Nuxt UI components (UButton, USlider, etc.)
│   │   │   ├── CustomButton.vue     # Custom wrappers if needed
│   │   │   ├── PlayerSlider.vue     # Audio progress/volume sliders
│   │   │   ├── ReciterSelect.vue    # USelect for reciter selection
│   │   │   └── SettingsModal.vue    # UModal for settings
│   │   ├── player/               # Media player components
│   │   │   ├── QuranPlayer.vue
│   │   │   ├── PlayerControls.vue
│   │   │   ├── ContentDisplay.vue
│   │   │   ├── PlayerSettings.vue
│   │   │   ├── PlayButton.vue
│   │   │   ├── ProgressBar.vue
│   │   │   └── VolumeControl.vue
│   │   ├── selectors/            # Selection components
│   │   │   ├── ReciterSelector.vue
│   │   │   ├── SurahSelector.vue
│   │   │   └── TranslationSelector.vue
│   │   └── layout/               # Layout components
│   │       ├── Header.vue
│   │       ├── Footer.vue
│   │       └── Sidebar.vue
│   ├── pages/
│   │   ├── index.vue            # Main player page
│   │   └── about.vue            # About page
│   ├── layouts/
│   │   └── default.vue          # Default layout
│   ├── composables/
│   │   ├── useAudioPlayer.ts    # Audio player logic
│   │   ├── useQuranData.ts      # Quran data management
│   │   ├── useReciters.ts       # Reciter data
│   │   └── useTranslations.ts   # Translation handling
│   ├── utils/
│   │   ├── audio.ts            # Audio utilities
│   │   ├── time.ts             # Time formatting
│   │   └── api.ts              # API helpers
│   ├── types/
│   │   ├── quran.ts            # Quran-related types
│   │   ├── player.ts           # Player types
│   │   └── api.ts              # API types
│   ├── assets/
│   │   ├── css/
│   │   │   ├── main.css
│   │   │   └── components/
│   │   └── icons/
│   └── app.vue
├── server/
│   └── api/
│       ├── quran/
│       │   ├── surahs/
│       │   │   ├── index.get.ts
│       │   │   └── [surahNumber].get.ts
│       │   └── verses/
│       │       └── [surahNumber]/[verseNumber].get.ts
│       ├── reciters/
│       │   ├── index.get.ts
│       │   └── [reciterId].get.ts
│       ├── audio/
│       │   └── [reciterId]/[surahNumber]/[verseNumber?].get.ts
│       ├── translations/
│       │   ├── index.get.ts
│       │   └── [translationId]/
│       │       ├── [surahNumber]/[verseNumber].get.ts
│       │       └── audio/[surahNumber]/[verseNumber].get.ts
│       └── playback/
│           └── session/
│               ├── index.post.ts
│               └── [sessionId]/position.put.ts
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── audio/              # Cached audio files (optional)
├── claudedocs/
│   └── quran-app-design.md
└── tests/
    ├── components/
    ├── composables/
    └── api/
```

## External API Integration

### Recommended Data Sources

1. **Quran Text API**:
   - Al Quran Cloud API (`https://api.alquran.cloud/v1/`)
   - Quran.com API (`https://api.quran.com/api/v4/`)

2. **Audio Sources**:
   - EveryAyah.com (MP3 files)
   - Quran Central
   - Islamic Network APIs

3. **Translation APIs**:
   - Al Quran Cloud (multiple translations)
   - Quran.com (community translations)

## Development Tools & Quality

### Code Quality Setup
**ESLint Configuration** (`@nuxt/eslint`):
- Nuxt-specific linting rules for Vue 3 and TypeScript
- Automatic code formatting and error detection
- Integration with VS Code and other editors

**Key Development Commands:**
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production deployment  
npm run lint         # Run ESLint checks
npm run lint:fix     # Auto-fix ESLint issues
```

**Pre-commit Hooks** (Future):
- Automatic linting and formatting before commits
- Type checking with TypeScript
- Test execution for changed files

### Development Workflow
1. **Component Development**: Use Nuxt UI components as base, extend with custom styling
2. **Type Safety**: Leverage TypeScript interfaces for all data models
3. **Code Quality**: ESLint ensures consistent code style and catches errors
4. **Hot Reload**: Immediate feedback during development with Vite
5. **Edge Testing**: Local Cloudflare Workers development with `nitro-cloudflare-dev`

## Deployment Considerations

### Cloudflare Workers Optimizations
- **Edge Caching**: Cache Quran text and metadata at edge
- **KV Storage**: Store frequently accessed data in Cloudflare KV
- **R2 Storage**: Host audio files in Cloudflare R2 for fast delivery
- **Stream API**: Use Cloudflare Stream for audio streaming optimization

### Performance Strategy
- **Lazy Loading**: Load verses and audio on-demand
- **Preloading**: Preload next verse audio for seamless playback
- **Caching**: Aggressive caching of static Quran data
- **CDN**: Serve audio files from global CDN

## Future Enhancement Considerations

### Phase 2 Features
- Bookmarking verses
- Playback history
- Multiple language UI
- Tajweed highlighting
- Download for offline listening

### Phase 3 Features
- User accounts and preferences
- Social sharing
- Community features
- Advanced search
- Study notes and annotations