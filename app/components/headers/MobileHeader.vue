<template>
  <!-- Mobile Header -->
  <header class="p-4 pt-12 safe-top flex-shrink-0">
    <div class="flex items-center justify-between mb-2">
      <div>
        <p class="text-sm text-slate-600 dark:text-slate-400">quran.in.th</p>
        <h1 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
          อัลกุรอาน
        </h1>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="w-8 h-8 rounded-full bg-white/70 dark:bg-slate-700 flex items-center justify-center backdrop-blur-sm"
          @click="toggleDarkMode">
          <UIcon :name="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
            class="w-4 h-4 text-slate-700 dark:text-slate-300" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// Use useState-based theme management instead of props
const { isDark, toggleDarkMode } = useThemeActions()
</script>