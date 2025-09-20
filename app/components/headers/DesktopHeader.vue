<template>
  <!-- Large Screen Header -->
  <header class="p-6">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
            อัลกุรอาน
          </h1>
          <p class="text-slate-500 dark:text-slate-400">ฟังกุรอานพร้อมความหมายภาษาไทย</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            :class="isLargePlayerMode
              ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
            @click="togglePlayerMode">
            <UIcon :name="isLargePlayerMode ? 'i-heroicons-list-bullet' : 'i-heroicons-play-circle'" class="w-4 h-4 mr-1" />
            {{ isLargePlayerMode ? 'เพลย์ลิสต์' : 'โหมดเล่น' }}
          </button>
          <button class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
            @click="toggleDarkMode">
            <UIcon :name="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// Use useState-based state management instead of props
const { isLargePlayerMode, togglePlayerMode } = usePlayerModeActions()

// Use colorMode directly to avoid reactivity issues
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const toggleDarkMode = () => {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>