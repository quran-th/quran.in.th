# Development Guide

## Quick Start

### Prerequisites
```bash
# Required software
node >= 18.0.0
npm >= 9.0.0

# Verify installation
node --version
npm --version
```

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd quran-th

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

## Development Workflow

### Daily Development Process
```bash
# 1. Start development
git pull origin main
npm run dev

# 2. Make changes
# Edit files in app/ directory

# 3. Test changes
# Browser automatically reloads
# Test on mobile viewport (F12 → responsive)

# 4. Quality check
npm run lint        # Check code style
npm run build      # Verify build works

# 5. Commit changes
git add .
git commit -m "feat: descriptive commit message"
```

### File Organization Best Practices

#### Creating New Components
```bash
# Component location
app/components/YourComponent.vue

# Component structure template
<template>
  <div class="your-component">
    <!-- UI elements -->
  </div>
</template>

<script setup lang="ts">
// TypeScript logic
defineProps<{
  prop1: string
  prop2?: number
}>()
</script>

<style scoped>
/* Component-specific styles (if needed) */
</style>
```

#### Creating New Composables
```bash
# Composable location
app/composables/useYourFeature.ts

# Composable structure template
export const useYourFeature = () => {
  const state = reactive({
    property1: false,
    property2: ''
  })

  const method1 = () => {
    // Logic here
  }

  return {
    // Reactive state
    state: readonly(state),

    // Methods
    method1
  }
}
```

### Testing Strategy

#### Manual Testing Checklist
```yaml
Mobile Testing (< 768px):
  - [ ] Circular player displays correctly
  - [ ] Touch controls work smoothly
  - [ ] Surah selection modal opens
  - [ ] Audio controls function properly
  - [ ] Background playback works

Desktop Testing (>= 768px):
  - [ ] Table layout displays correctly
  - [ ] Playlist interactions work
  - [ ] Audio controls function properly
  - [ ] Responsive transitions smooth

Audio Testing:
  - [ ] Local audio loads (development)
  - [ ] Multiple format support (MP3/OGG)
  - [ ] Error handling for missing files
  - [ ] Volume and mute controls
  - [ ] Progress tracking accuracy

Cross-Browser Testing:
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest)
  - [ ] Mobile Safari (iOS)
  - [ ] Chrome Mobile (Android)
```

#### Performance Testing
```bash
# Lighthouse audit
npm run build
npm run preview
# Open Lighthouse in DevTools

# Bundle analysis
npx nuxi analyze

# Memory testing
# DevTools → Memory → Heap Snapshot
```

## Code Style Guidelines

### TypeScript Standards
```typescript
// ✅ Good: Explicit types
interface ComponentProps {
  title: string
  count: number
  isActive?: boolean
}

// ✅ Good: Type-safe composable
const { state, actions } = useAudioPlayer()

// ❌ Avoid: Any types
const data: any = fetchData()

// ❌ Avoid: Implicit types in functions
function calculate(a, b) {
  return a + b
}
```

### Vue Composition API Standards
```typescript
// ✅ Good: Script setup with TypeScript
<script setup lang="ts">
import type { Surah } from '~/types/quran'

interface Props {
  surah: Surah
  isPlaying?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isPlaying: false
})

const emit = defineEmits<{
  play: [surahId: number]
  pause: []
}>()
</script>

// ❌ Avoid: Options API (use Composition API)
export default {
  props: ['surah'],
  data() {
    return { isPlaying: false }
  }
}
```

### CSS/Tailwind Standards
```vue
<!-- ✅ Good: Tailwind classes with responsive design -->
<div class="p-4 md:p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
  <h2 class="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">
    {{ surah.thaiName }}
  </h2>
</div>

<!-- ❌ Avoid: Custom CSS (use Tailwind utilities) -->
<div class="custom-card">
  <h2 class="custom-title">{{ surah.thaiName }}</h2>
</div>

<style>
.custom-card {
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
}
</style>
```

## Environment Management

### Development Environment
```bash
# Environment variables (.env.local)
NODE_ENV=development
USE_LOCAL_AUDIO=true
NUXT_PUBLIC_API_BASE=http://localhost:3000

# Audio files location
public/audio/001/001.mp3  # Reciter 1, Surah 1
public/audio/002/001.mp3  # Reciter 2, Surah 1
```

### Production Environment
```bash
# Cloudflare Workers environment
NODE_ENV=production
USE_LOCAL_AUDIO=false
NUXT_PUBLIC_API_BASE=https://your-domain.com

# Audio served from R2/CDN
https://audio.quran.in.th/001/001.mp3
```

## Debugging Techniques

### Audio Debug Tools
```typescript
// Enable audio debug logging
const DEBUG_AUDIO = true

const debugLog = (message: string, data?: any) => {
  if (DEBUG_AUDIO) {
    console.log(`[AudioPlayer] ${message}`, data)
  }
}

// Usage in audio methods
const play = async () => {
  debugLog('Starting playback', { surah: currentSurah.value, reciter: currentReciter.value })

  try {
    await howlInstance.play()
    debugLog('Playback started successfully')
  } catch (error) {
    debugLog('Playback failed', error)
  }
}
```

### Vue DevTools Integration
```typescript
// Component naming for DevTools
<script setup lang="ts">
// This name appears in Vue DevTools
defineOptions({
  name: 'AudioPlayer'
})
</script>
```

### Network Debug
```typescript
// Network monitoring in browser
if (import.meta.dev) {
  // Log all fetch requests
  const originalFetch = window.fetch
  window.fetch = async (...args) => {
    console.log('[Network]', args[0])
    return originalFetch(...args)
  }
}
```

## Common Development Tasks

### Adding New Reciter
```typescript
// 1. Update reciters data
// app/data/reciters.ts
export const reciters: Reciter[] = [
  // ... existing reciters
  {
    id: 3,
    reciter_id: 3,
    name: 'New Reciter Name',
    translatedName: 'New Reciter Romanized',
    style: 'Reading Style',
    styleDescription: 'Thai Description',
    qirat: 'Qirat Type'
  }
]

// 2. Add audio files
// public/audio/003/001.mp3
// public/audio/003/002.mp3
// ... etc

// 3. Update reciter-specific metadata (if needed)
// app/data/surah/001.json, app/data/surah/002.json
```

### Adding New Surah Data
```typescript
// 1. Create surah data file
// app/data/surah/115.json (for new surah)
{
  "id": 115,
  "name": "Surah Name",
  "thaiName": "Thai Name",
  "arabicName": "Arabic Name",
  "englishName": "English Name",
  "revelationType": "Meccan",
  "versesCount": 10,
  "order": 115
}

// 2. Update useSurahs composable if needed
```

### Modifying UI Layout
```vue
<!-- Mobile layout changes -->
<div class="md:hidden">
  <!-- Mobile-specific UI -->
</div>

<!-- Desktop layout changes -->
<div class="hidden md:block">
  <!-- Desktop-specific UI -->
</div>

<!-- Responsive breakpoint: 768px (md:) -->
```

## Performance Optimization

### Bundle Size Optimization
```typescript
// Use dynamic imports for heavy components
const ReciterSelector = defineAsyncComponent(
  () => import('~/components/ReciterSelector.vue')
)

// Use tree-shakable imports
import { computed, ref } from 'vue'  // ✅ Good
import * as Vue from 'vue'           // ❌ Avoid
```

### Audio Loading Optimization
```typescript
// Preload strategy configuration
const preloadConfig = {
  immediate: ['current'],      // Load immediately
  background: ['next', 'prev'], // Load in background
  idle: ['popular']           // Load when idle
}
```

### Image Optimization
```html
<!-- Use WebP format with fallbacks -->
<picture>
  <source srcset="/images/cover.webp" type="image/webp">
  <img src="/images/cover.jpg" alt="Quran Cover">
</picture>
```

## Deployment Process

### Local Production Build
```bash
# Build for production
npm run build

# Test production build locally
npm run preview

# Check for build errors
npm run lint
```

### Cloudflare Deployment
```bash
# Deploy to Cloudflare Workers
npm run deploy

# Check deployment status
wrangler whoami
wrangler list
```

### Troubleshooting Deployment
```bash
# Check Wrangler configuration
cat wrangler.jsonc

# View deployment logs
wrangler tail your-worker-name

# Debug environment variables
wrangler env list
```

---

**Next**: [Components →](./components.md)