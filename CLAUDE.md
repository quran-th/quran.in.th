# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Nuxt.js 4 application named "quran-th" - a responsive Quran audio player application with Thai language support. The project features mobile and desktop layouts, audio streaming capabilities, and is configured for deployment to Cloudflare Workers. Built with Vue 3, TypeScript, Nuxt UI, and optimized for edge runtime deployment.

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

- **Framework:** Nuxt 4 with Vue 3 Composition API
- **UI Components:** Nuxt UI (@nuxt/ui) - Tailwind CSS-based component library
- **Audio System:** Custom composables for audio playback and Media Session API
- **Data Layer:** TypeScript interfaces for Quran data (surahs, reciters)
- **Responsive Design:** Mobile-first with circular player and desktop table layouts
- **Code Quality:** ESLint with Nuxt configuration (@nuxt/eslint)
- **Runtime:** Cloudflare Workers (edge runtime)
- **TypeScript:** Comprehensive type safety with custom Quran interfaces
- **Deployment:** Cloudflare Workers via Wrangler

### Key Configuration Files

- `nuxt.config.ts`: Main Nuxt configuration with Cloudflare preset
- `wrangler.jsonc`: Cloudflare Workers deployment configuration
- `tsconfig.json`: TypeScript configuration with Nuxt-generated references
- `worker-configuration.d.ts`: Cloudflare Workers type definitions

### Directory Structure

- `app/`: Main application code
  - `pages/index.vue`: Main responsive page with mobile/desktop layouts
  - `composables/`: Audio player, reciters, and surahs composables
  - `services/`: Audio service for CDN integration
  - `types/`: TypeScript interfaces for Quran data
  - `data/`: Audio metadata and configuration
  - `server/api/`: Server-side API endpoints
- `public/`: Static assets
  - `audio/`: Sample audio files
  - `bg.webp`: Hero section background image
  - `fonts/`: Thai font files
  - `manifest.json`: PWA configuration
- `.output/`: Build output directory (auto-generated)
- `.nuxt/`: Nuxt build cache and generated files

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

- Uses Composition API pattern throughout the application
- Audio state managed via `useAudioPlayer` composable
- Responsive breakpoints at 768px (mobile/desktop)
- Background image optimization with WebP format
- CDN integration for audio file streaming
- TypeScript strict mode for type safety
- ESLint configured for code quality and consistency
- Nuxt UI components with Tailwind CSS for styling