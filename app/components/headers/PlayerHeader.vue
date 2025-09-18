<template>
  <div class="flex items-center justify-between px-4 py-3 mt-8 max-[400px]:mt-4 bg-transparent">
    <!-- Left: Back Button -->
    <button
      class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all active:scale-95"
      @click="$emit('goBack')"
    >
      <UIcon name="i-heroicons-chevron-left" class="w-6 h-6" />
    </button>

    <!-- Center: Track Info -->
    <div class="flex-1 text-center mx-4">
      <h1 class="text-slate-900 dark:text-slate-100 font-bold text-lg leading-tight truncate">
        อัลกุรอาน
      </h1>
      <p class="text-slate-600 dark:text-slate-400 text-sm leading-tight truncate mt-0.5">
        พร้อมความหมายภาษาไทย
      </p>
    </div>

    <!-- Right: Theme Toggle Button -->
    <button
      class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all active:scale-95"
      @click="toggleDarkMode"
    >
      <UIcon
        :name="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
        class="w-5 h-5"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * PlayerHeader Component
 *
 * Two-line header for the mobile player view featuring:
 * - Back navigation button (left)
 * - Two-line track info (center) - bold surah name, smaller reciter name
 * - Theme toggle button (right) - switches between light/dark mode
 */

// Use integrated app composable
const {
  currentReciterName,
  getCurrentSurahName,
  isDark,
  toggleDarkMode
} = useAppIntegrated()

// Events
defineEmits<{
  goBack: []
}>()

// Methods
const getSurahDisplayName = () => {
  const fullName = getCurrentSurahName()
  // Extract just the Thai name part after the number
  const parts = fullName.split('.')
  if (parts.length > 1) {
    return parts[1].trim()
  }
  return fullName || 'อัล-ฟาติหะฮฺ'
}
</script>
