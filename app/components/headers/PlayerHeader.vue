<template>
  <div class="flex items-center justify-between px-4 py-3 mt-8 max-[400px]:mt-4 bg-transparent">
    <!-- Left: Navigation Button (optional) -->
    <button
      v-if="showBackButton"
      class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all active:scale-95"
      @click="$emit('goBack')"
    >
      <UIcon
        :name="buttonIcon === 'back' ? 'i-heroicons-chevron-left' : 'i-heroicons-queue-list'"
        class="w-6 h-6 transition-all duration-300 ease-in-out"
      />
    </button>
    <!-- Spacer when no back button -->
    <div v-else class="w-10 h-10"></div>

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
 * - Back navigation button (left) - optional with showBackButton prop
 * - Two-line track info (center) - bold surah name, smaller reciter name
 * - Theme toggle button (right) - switches between light/dark mode
 */

// Props
interface Props {
  showBackButton?: boolean
  buttonIcon?: 'back' | 'playlist'
}

const props = withDefaults(defineProps<Props>(), {
  showBackButton: true,
  buttonIcon: 'back'
})

// Use integrated app composable
const {
  currentReciterName,
  getCurrentSurahName
} = useAppIntegrated()

// Use colorMode directly to avoid reactivity issues
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const toggleDarkMode = () => {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
}

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
