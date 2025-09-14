<!--
  Improved Player Layout Example
  
  Demonstrates how to refactor the current dual-layout approach with:
  - Shared components for common functionality
  - Responsive utilities for better maintainability
  - Performance optimizations with lazy loading
  - Consistent design system across layouts
-->

<template>
  <div class="player-layout-container">
    <!-- Shared responsive header -->
    <PlayerHeader 
      :current-surah="currentSurah"
      :is-dark="isDark"
      class="responsive-header"
      @toggle-dark-mode="toggleDarkMode"
    />
    
    <!-- Mobile Layout: Circular Player Interface -->
    <Suspense>
      <MobilePlayerLayout
        v-if="isMobile"
        :current-surah="currentSurah"
        :current-reciter="currentReciter"
        :audio-state="audioState"
        :surahs="surahs"
        class="mobile-layout"
        @surah-select="handleSurahSelect"
        @play-toggle="handlePlayToggle"
      />
      
      <template #fallback>
        <PlayerSkeleton variant="mobile" />
      </template>
    </Suspense>
    
    <!-- Desktop Layout: Hero + Playlist Interface -->
    <Suspense>
      <DesktopPlayerLayout
        v-else
        :current-surah="currentSurah"
        :current-reciter="currentReciter"
        :audio-state="audioState"
        :surahs="surahs"
        class="desktop-layout"
        @surah-select="handleSurahSelect"
        @play-toggle="handlePlayToggle"
      />
      
      <template #fallback>
        <PlayerSkeleton variant="desktop" />
      </template>
    </Suspense>
    
    <!-- Shared responsive audio controls -->
    <SharedAudioControls
      :audio-state="audioState"
      :current-surah="currentSurah"
      class="responsive-controls"
      @play-toggle="handlePlayToggle"
      @seek="handleSeek"
      @volume-change="handleVolumeChange"
    />
  </div>
</template>

<script setup lang="ts">
import type { AudioPlayerState, Surah } from '~/types/quran'
import { useResponsive } from '~/composables/useResponsive'

// Lazy load layout components for better performance
const MobilePlayerLayout = defineAsyncComponent({
  loader: () => import('./layouts/MobilePlayerLayout.vue'),
  loadingComponent: () => h('div', { class: 'animate-pulse bg-gray-200 h-screen rounded' }),
  delay: 200,
  timeout: 3000
})

const DesktopPlayerLayout = defineAsyncComponent({
  loader: () => import('./layouts/DesktopPlayerLayout.vue'),
  loadingComponent: () => h('div', { class: 'animate-pulse bg-gray-200 h-96 rounded' }),
  delay: 200,
  timeout: 3000
})

interface Props {
  currentSurah?: number
  currentReciter?: number
  audioState: AudioPlayerState
  surahs: Surah[]
  isDark?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDark: false
})

const emit = defineEmits<{
  surahSelect: [surahId: number]
  playToggle: []
  seek: [time: number]
  volumeChange: [volume: number]
  toggleDarkMode: []
}>()

// Responsive utilities
const { isMobile, isDesktop, responsive } = useResponsive()

// Event handlers with responsive considerations
const handleSurahSelect = (surahId: number) => {
  emit('surahSelect', surahId)
}

const handlePlayToggle = () => {
  emit('playToggle')
}

const handleSeek = (time: number) => {
  emit('seek', time)
}

const handleVolumeChange = (volume: number) => {
  emit('volumeChange', volume)
}

const toggleDarkMode = () => {
  emit('toggleDarkMode')
}

// Responsive layout configurations
const layoutConfig = computed(() => {
  return responsive({
    mobile: {
      playerType: 'circular',
      navigationStyle: 'modal',
      controlsPosition: 'integrated'
    },
    desktop: {
      playerType: 'hero',
      navigationStyle: 'table',
      controlsPosition: 'bottom'
    },
    default: {
      playerType: 'adaptive',
      navigationStyle: 'responsive',
      controlsPosition: 'auto'
    }
  })
})

// Performance optimizations
const shouldPreloadDesktop = computed(() => {
  // Preload desktop layout on tablet-sized screens
  return !isMobile.value
})

// Provide layout configuration to child components
provide('layoutConfig', layoutConfig)
provide('responsive', { isMobile, isDesktop })
</script>

<style scoped>
.player-layout-container {
  @apply min-h-screen bg-[#e7e8f3] dark:bg-slate-800;
  
  /* Responsive container with proper overflow handling */
  @apply overflow-hidden md:overflow-visible;
  
  /* CSS Grid for consistent layout structure */
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-areas: 
    "header"
    "main"
    "controls";
}

.responsive-header {
  grid-area: header;
  
  /* Responsive padding and spacing */
  @apply p-4 md:p-6;
  @apply safe-top;
}

.mobile-layout {
  grid-area: main;
  
  /* Mobile-specific optimizations */
  @apply flex flex-col;
  @apply overscroll-behavior-none; /* Prevent pull-to-refresh */
}

.desktop-layout {
  grid-area: main;
  
  /* Desktop-specific optimizations */
  @apply block;
}

.responsive-controls {
  grid-area: controls;
  
  /* Responsive positioning */
  @apply relative md:sticky md:bottom-0;
  
  /* Mobile: fixed bottom, Desktop: relative */
  @apply fixed bottom-0 left-0 right-0 md:relative md:bottom-auto;
  
  /* Proper z-index for mobile overlay */
  @apply z-50 md:z-auto;
}

/* Optimize animations for mobile performance */
@media (max-width: 767px) {
  .player-layout-container * {
    /* Use transform3d to enable hardware acceleration */
    transform: translateZ(0);
    
    /* Optimize repaints */
    backface-visibility: hidden;
    perspective: 1000px;
  }
}

/* Reduce animations on slow devices */
@media (prefers-reduced-motion: reduce) {
  .player-layout-container * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .player-layout-container {
    @apply border border-gray-800 dark:border-gray-200;
  }
}

/* Print styles */
@media print {
  .responsive-controls {
    @apply hidden;
  }
  
  .mobile-layout,
  .desktop-layout {
    @apply break-inside-avoid;
  }
}
</style>