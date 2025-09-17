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
- **Modular Component Architecture:** Highly organized component system with clear separation of concerns
- **Composable-Based State:** Reactive state management with `useAudioPlayer`, `useReciters`, `useSurahs`
- **Responsive Component Design:** Mobile-first with `md:` breakpoint at 768px, dedicated mobile/desktop components
- **Type-Safe Component System:** All components use strongly-typed TypeScript interfaces
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
├── components/               # Modular Vue component library
│   ├── headers/              # Header components for different layouts
│   │   ├── MobileHeader.vue  # Mobile app header with branding and dark mode toggle
│   │   └── DesktopHeader.vue # Desktop header with player mode toggle
│   ├── layouts/              # Layout orchestration components
│   │   ├── MobileLayout.vue  # Mobile responsive layout with tab navigation
│   │   └── DesktopLayout.vue # Desktop layout with hero section and playlist
│   ├── player/               # Audio player components
│   │   ├── MobilePlayer.vue  # Compact circular player for mobile devices
│   │   ├── DesktopPlayer.vue # Large format player with album art
│   │   └── MiniPlayer.vue    # Bottom mini player for desktop mode
│   ├── ui/                   # Reusable UI components
│   │   ├── SurahCardList.vue # Scrollable surah cards with play buttons
│   │   ├── ReciterList.vue   # Reciter selection with visual indicators
│   │   ├── TabNavigation.vue # Mobile tab navigation component
│   │   └── HeroSection.vue   # Desktop hero section with call-to-action
│   ├── modals/               # Modal and overlay components
│   │   └── PlayerConfigModal.vue # Player configuration (shuffle, loop, autoplay)
│   └── ReciterSelector.vue   # Legacy reciter selection modal (preserved)
├── composables/              # Vue composition functions (business logic)
│   ├── useAudioPlayer.ts     # Core audio playback state and controls
│   ├── useLocalStorage.ts    # Local storage state management
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

server/                       # Server-side API and middleware
├── api/                     # API endpoint handlers
│   ├── audio/              # Audio streaming endpoints
│   │   └── [reciterId]/    # Dynamic reciter-specific routes
│   │       └── [id].get.ts # Audio file streaming with R2 integration
│   └── surahs/             # Surah metadata endpoints
│       └── [reciterId].get.ts # Reciter-specific surah data
├── middleware/              # Server middleware
│   └── cache-control.ts    # HTTP cache header management
├── plugins/                # Server plugins
└── utils/                  # Server utility functions

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

### Component Architecture & Rendering Approach

The application follows a **modular component architecture** with clear separation of concerns:

#### Component Organization Strategy
- **Headers** (`headers/`): Platform-specific header components with branding and navigation
- **Layouts** (`layouts/`): Layout orchestration components that compose other components
- **Player** (`player/`): Specialized audio player components for different form factors
- **UI** (`ui/`): Reusable UI components for lists, navigation, and content sections
- **Modals** (`modals/`): Overlay components for configuration and selection interfaces

#### Rendering Patterns
- **Responsive Component Selection**: Different components for mobile vs desktop instead of CSS-only responsive design
- **Prop-Based Communication**: Parent components pass state and methods down through strongly-typed props
- **Event-Driven Updates**: Child components emit events for state changes and user interactions
- **Composition Over Inheritance**: Components are composed together rather than extending base classes

#### Component Responsibilities
- **Layout Components**: Orchestrate multiple components and manage overall page structure
- **Player Components**: Handle audio playback UI and controls for specific device types
- **UI Components**: Provide reusable interface elements with consistent styling and behavior
- **Modal Components**: Manage overlay states and user configuration interfaces

### Application Features

- **Responsive Design**: Dedicated mobile circular player and desktop playlist layout components
- **Audio Streaming**: Integration with Quran audio CDN services through composable-based state management
- **Media Session API**: Native audio controls and background playbook with cross-component state sync
- **Progressive Web App**: Advanced service worker with automatic updates and version-based cache management
- **Thai Language**: Full Thai language support with custom fonts across all components
- **Dark Mode**: Complete dark/light theme switching with component-level theme awareness
- **Surah Selection**: Platform-specific selection interfaces (mobile tabs, desktop table)
- **Real-time Progress**: Live audio progress tracking and seeking across all player components

### Development Notes

#### Code Architecture Principles
- **Modular Component System:** 13 specialized components organized by function (headers, layouts, player, ui, modals)
- **Composition API First:** All components use `<script setup lang="ts">` pattern with strict TypeScript
- **Reactive State Management:** Centralized audio state via `useAudioPlayer()` composable
- **Type-Safe Development:** All components use strongly-typed interfaces (Surah, Reciter, AudioPlayerState)
- **Component Separation:** Clear separation between player logic, UI elements, and layout orchestration
- **Responsive-First Design:** Mobile breakpoint at 768px (`md:` prefix), dedicated mobile/desktop components
- **Single Responsibility:** Each component has one focused purpose (SurahCardList, MobilePlayer, etc.)
- **Event-Driven Communication:** Loose coupling through prop callbacks and emit events

#### Key Technical Decisions
- **Howler.js Audio Engine:** Chosen over native HTML5 Audio for advanced streaming control and cross-platform compatibility
- **Environment-Aware Audio Sources:** Local files in development, R2/CDN streaming in production via `useRuntimeConfig()`
- **Progressive Web App:** Service worker implementation for offline audio caching and background playback
- **Thai Font Integration:** Custom InterThaiLoopless font family with full weight range for optimal Thai text rendering
- **Media Session API:** Native audio control integration for lock screen and notification controls
- **Version-Based Cache Management:** Manual cache versioning system (CACHE_VERSION) for reliable deployment updates without Workbox dependencies
- **Granular Cache Control:** Server middleware providing fine-grained HTTP cache headers for HTML, service worker, and manifest files
- **Smart State Restoration:** Separation of localStorage restoration (starts from beginning) from pause/resume functionality (continues from pause point)
- **Default Reciter Strategy:** Standardized reciter 2 as fallback while prioritizing localStorage preferences across all components

#### Performance Optimizations
- **WebP Image Format:** Background images optimized for faster loading
- **Tree-Shakable Imports:** Selective Nuxt UI component imports to reduce bundle size
- **Edge-First Deployment:** Cloudflare Workers for sub-100ms cold starts globally
- **Progressive Audio Loading:** Smart preloading strategy based on user behavior and network conditions
- **Tailwind CSS Purging:** Automatic removal of unused CSS classes in production builds
- **Advanced Caching Strategy:** Version-based cache management with automatic deployment cleanup
- **HTML Cache Prevention:** Multi-layer approach preventing HTML caching while optimizing asset delivery
- **Intelligent State Persistence:** Smart localStorage management with session-aware restoration

#### Development Workflow Standards
- **Code Quality:** ESLint with @nuxt/eslint configuration for consistent code style
- **Type Safety:** Strict TypeScript validation with custom Quran domain interfaces
- **Component Organization:** Modular component system organized by function and purpose
- **State Isolation:** Business logic in composables, UI logic in components, layout orchestration in layouts
- **Component Documentation:** JSDoc comments with usage examples for all major components
- **Error Handling:** Comprehensive error states for network failures and audio loading issues
- **Component Testing:** Isolated component testing with proper TypeScript interface validation

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