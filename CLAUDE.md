# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quran-TH is a modern, responsive Quran audio player application with comprehensive Thai language support. Built on Nuxt 4 with Vue 3 Composition API, the application features intelligent audio streaming, verse-level timing, and cross-platform compatibility. The project is optimized for Cloudflare Workers edge deployment with advanced audio management using Howler.js and Media Session API integration.

**Core Features:**
- 🎵 Advanced audio streaming with Howler.js
- 📱 Responsive design (mobile circular + desktop table layouts)
- 🌐 Full Thai language localization with custom fonts
- ⚡ Edge-optimized deployment on Cloudflare Workers
- 🎨 Modern UI with Nuxt UI and Tailwind CSS
- 📻 Native audio controls via Media Session API
- 📴 Progressive Web App with offline capabilities

## Development Commands

**Development server:**
```bash
npm run dev
```
Starts the development server on `http://localhost:3000`

**Build for production:**
```bash
npm run build
```
Builds the application for production deployment

**Generate static site:**
```bash
npm run generate
```
Generates a static version of the site

**Preview production build:**
```bash
npm run preview
```
Builds and previews the production build using Wrangler

**Deploy to Cloudflare:**
```bash
npm run deploy
```
Builds and deploys to Cloudflare Workers

**Generate Cloudflare types:**
```bash
npm run cf-typegen
```
Generates TypeScript types for Cloudflare Workers

## Architecture

### Technical Stack
- **Framework:** Nuxt 4 with Vue 3 Composition API and TypeScript strict mode
- **UI Library:** Nuxt UI (@nuxt/ui) - Tailwind CSS-based component system
- **Audio Engine:** Howler.js with HTML5 Audio for streaming optimization
- **State Management:** Vue 3 reactive system with custom composables
- **Styling:** Tailwind CSS with custom Thai font integration
- **Code Quality:** ESLint with @nuxt/eslint configuration
- **Runtime:** Cloudflare Workers (V8 isolates) with edge deployment
- **Build Tool:** Vite with Nitro bundling and tree-shaking
- **Type Safety:** Comprehensive TypeScript interfaces and runtime validation

### Core Architecture Patterns
- **Composable-Based State:** Reactive state management with `useAudioPlayer`, `useReciters`, `useSurahs`
- **Responsive Component Design:** Mobile-first with `md:` breakpoint at 768px
- **Environment-Aware Audio:** Development (local files) vs Production (R2/CDN streaming)
- **Progressive Enhancement:** Base functionality + enhanced features based on capabilities
- **Edge-Optimized Deployment:** Static generation with dynamic audio streaming

### Key Configuration Files

- `nuxt.config.ts`: Main Nuxt configuration with Cloudflare preset
- `wrangler.jsonc`: Cloudflare Workers deployment configuration
- `tsconfig.json`: TypeScript configuration with Nuxt-generated references
- `worker-configuration.d.ts`: Cloudflare Workers type definitions

### Directory Structure

```
app/                           # Main application source code
├── pages/index.vue           # Primary responsive page (mobile + desktop layouts)
├── app.vue                   # Root app component with global layout
├── components/               # Vue component library
│   └── ReciterSelector.vue   # Reciter selection modal component
├── composables/              # Vue composition functions (business logic)
│   ├── useAudioPlayer.ts     # Core audio playback state and controls
│   ├── useAudioConfig.ts     # Audio configuration and environment setup
│   ├── useReciters.ts        # Reciter data management
│   └── useSurahs.ts          # Surah data management and filtering
├── types/                    # TypeScript interface definitions
│   └── quran.ts             # Core data types (Surah, Reciter, AudioFile, etc.)
├── data/                     # Static data and metadata
│   ├── reciters.ts          # Reciter information and Thai translations
│   └── surah/               # Reciter-specific surah metadata files
│       ├── 001.json         # Al-Fatihah metadata
│       └── 002.json         # Al-Baqarah metadata
└── assets/css/              # Global stylesheets
    └── main.css             # Tailwind base styles and custom fonts

public/                       # Static assets served directly
├── audio/                   # Development audio files
│   ├── 001/                 # Reciter 1 audio files
│   │   └── 001.mp3         # Surah 1, Reciter 1
│   └── 002/                 # Reciter 2 audio files
├── fonts/                   # Thai font files (InterThaiLoopless)
│   ├── InterThaiLoopless-Regular.ttf
│   └── InterThaiLoopless-*.ttf    # Full font family
├── bg.webp                  # Hero section background (optimized)
├── media-cover.png          # Media Session API artwork
├── manifest.json            # PWA configuration and metadata
└── sw.js                    # Service worker for offline functionality

docs/knowledge-base/         # Comprehensive project documentation
├── README.md               # Knowledge base overview and navigation
├── architecture.md         # System design and technical architecture
├── data-structures.md      # TypeScript interfaces and data models
├── audio-system.md         # Audio streaming and playback architecture
└── development.md          # Development workflow and best practices
```

### Deployment Configuration

The app is configured for Cloudflare Workers deployment with:
- Smart Placement capability (commented out)
- Assets binding for static files
- Observability enabled
- Node.js compatibility enabled

### Application Features

- **Responsive Design**: Mobile circular player and desktop playlist layout
- **Audio Streaming**: Integration with Quran audio CDN services
- **Media Session API**: Native audio controls and background playbook
- **Progressive Web App**: Offline-first with service worker support
- **Thai Language**: Full Thai language support with custom fonts
- **Dark Mode**: Complete dark/light theme switching
- **Surah Selection**: Slide-up modal for mobile surah browsing
- **Real-time Progress**: Live audio progress tracking and seeking

### Development Notes

#### Code Architecture Principles
- **Composition API First:** All components use `<script setup lang="ts">` pattern
- **Reactive State Management:** Centralized audio state via `useAudioPlayer()` composable
- **Type-Safe Development:** TypeScript strict mode with comprehensive interface definitions
- **Responsive-First Design:** Mobile breakpoint at 768px (`md:` prefix), circular player for mobile, table layout for desktop

#### Key Technical Decisions
- **Howler.js Audio Engine:** Chosen over native HTML5 Audio for advanced streaming control and cross-platform compatibility
- **Environment-Aware Audio Sources:** Local files in development, R2/CDN streaming in production via `useRuntimeConfig()`
- **Progressive Web App:** Service worker implementation for offline audio caching and background playback
- **Thai Font Integration:** Custom InterThaiLoopless font family with full weight range for optimal Thai text rendering
- **Media Session API:** Native audio control integration for lock screen and notification controls

#### Performance Optimizations
- **WebP Image Format:** Background images optimized for faster loading
- **Tree-Shakable Imports:** Selective Nuxt UI component imports to reduce bundle size
- **Edge-First Deployment:** Cloudflare Workers for sub-100ms cold starts globally
- **Progressive Audio Loading:** Smart preloading strategy based on user behavior and network conditions
- **Tailwind CSS Purging:** Automatic removal of unused CSS classes in production builds

#### Development Workflow Standards
- **Code Quality:** ESLint with @nuxt/eslint configuration for consistent code style
- **Type Safety:** Strict TypeScript validation with custom Quran domain interfaces
- **Component Organization:** Single-file Vue components with scoped styling when needed
- **State Isolation:** Business logic in composables, UI logic in components
- **Error Handling:** Comprehensive error states for network failures and audio loading issues

#### Testing & Quality Assurance
- **Cross-Browser Testing:** Chrome, Firefox, Safari, mobile browsers
- **Responsive Testing:** Manual testing across mobile (< 768px) and desktop (>= 768px) layouts
- **Audio Format Testing:** MP3 and OGG format support for broad compatibility
- **Performance Monitoring:** Core Web Vitals optimization and bundle size analysis
- **Accessibility:** WCAG-compliant audio controls and keyboard navigation

## 📚 Comprehensive Documentation

For detailed technical documentation, architecture guides, and development workflows, see the **Knowledge Base**:

### Quick Navigation
- **[Architecture Overview](docs/knowledge-base/architecture.md)** - System design and component relationships
- **[Data Structures](docs/knowledge-base/data-structures.md)** - TypeScript interfaces and data models
- **[Audio System](docs/knowledge-base/audio-system.md)** - Audio playback architecture and streaming
- **[Development Guide](docs/knowledge-base/development.md)** - Local setup and development workflow

### Documentation Structure
```
docs/knowledge-base/
├── README.md              # Knowledge base overview and navigation
├── architecture.md        # Technical architecture and system design
├── data-structures.md     # TypeScript interfaces and data flow
├── audio-system.md        # Howler.js integration and streaming
└── development.md         # Development workflow and best practices
```

This knowledge base provides comprehensive guidance for understanding, developing, and maintaining the Quran-TH application with detailed technical specifications, code examples, and best practices.