<template>
  <!-- Mini Player (Fixed Bottom) -->
  <div class="fixed bottom-0 left-0 right-0 bg-slate-900 dark:bg-slate-950 text-white px-6 py-4">
    <div class="flex items-center gap-4">
      <!-- Track Info -->
      <div class="flex items-center gap-3 flex-1">
        <div
          class="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-sm">{{ currentSurah || '1' }}</span>
        </div>
        <div>
          <p class="font-medium">{{ getCurrentSurahName().split('.')[1]?.trim() || 'อัล-ฟาติหะฮฺ' }}</p>
          <p class="text-white/60 text-sm">เสียงแปลโดย {{ getCurrentReciterName }}</p>
        </div>
      </div>

      <!-- Time and Controls -->
      <div class="flex items-center gap-4">
        <span class="text-white/60 text-sm">{{ formatTimeWithHours(currentTime) || '0:00' }}</span>
        <button
          class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          @click="togglePlay">
          <UIcon :name="isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'" class="w-4 h-4"
            :class="{ 'ml-0.5': !isPlaying }" />
        </button>

        <!-- Progress Bar -->
        <div class="w-32 h-1 bg-white/20 rounded-full relative cursor-pointer" @click="seekToClick">
          <div class="h-full bg-white rounded-full transition-all duration-100"
            :style="{ width: correctProgress + '%' }" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props for mini player state
// Use integrated app composable instead of props
const {
  // Audio player state
  isPlaying,
  currentTime,
  currentSurah,

  // Computed
  getCurrentReciterName,
  correctProgress,

  // Methods
  togglePlay,
  seekToClick,
  getCurrentSurahName,
  formatTimeWithHours
} = useAppIntegrated()
</script>