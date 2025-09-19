<template>
  <!-- Surah Cards List -->
  <div class="flex flex-col flex-1 min-h-0">
    <div class="relative flex-1 min-h-0">
      <div class="space-y-3 h-full overflow-y-auto">
        <div v-for="surah in surahs" :key="surah.id"
          class="relative rounded-2xl overflow-hidden cursor-pointer transition-transform active:scale-98"
          @click="() => selectAndPlaySurahFromCard(surah.id)">
          <!-- Background inspired by hero section -->
          <div class="bg-gradient-to-r from-[rgb(191,179,147)] to-[rgb(171,159,127)] dark:from-[rgb(35,32,48)] dark:to-[rgb(25,22,38)] p-4">
            <!-- Content -->
            <div class="flex items-center justify-between">
              <div class="flex items-center flex-1">
                <!-- Surah thumbnail similar to track info -->
                <div class="w-12 h-12 bg-white/20 dark:bg-[rgb(191,179,147)] rounded-lg flex items-center justify-center mr-3">
                  <span class="text-white dark:text-slate-800 font-bold text-sm">{{ surah.id }}</span>
                </div>
                <div class="flex-1">
                  <h3 class="text-white font-semibold mb-1">
                    {{ surah.thaiName }}
                  </h3>
                  <div class="flex items-center text-white/70 text-xs">
                    <span>{{ surah.versesCount }} อายะห์</span>
                    <span class="mx-2">•</span>
                    <span v-if="surah.duration">{{ formatDuration(surah.duration) }}</span>
                    <span v-else>-</span>
                  </div>
                </div>
              </div>

              <!-- Play button -->
              <button
                class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                @click.stop="() => selectAndPlaySurahFromCard(surah.id)">
                <UIcon :name="currentSurah === surah.id && isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'"
                  class="w-5 h-5 text-white" :class="{ 'ml-0.5': !(currentSurah === surah.id && isPlaying) }" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Bottom gradient overlay for scroll indication -->
      <div class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#e7e8f3] dark:from-[rgb(14,13,34)] to-transparent pointer-events-none" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * SurahCardList Component
 *
 * Displays a scrollable list of surah cards with play buttons and metadata.
 * Each card shows the surah number, Thai name, verse count, and duration.
 *
 * @component
 * @example
 * <SurahCardList
 *   :surahs="surahs"
 *   :current-surah="currentSurah"
 *   :is-playing="isPlaying"
 *   :select-and-play-surah-from-card="selectAndPlaySurahFromCard"
 *   :format-duration="formatDuration"
 * />
 */
// Use integrated app composable instead of props
const {
  // Data
  surahs,
  currentSurah,
  isPlaying,

  // Methods
  selectAndPlaySurahFromCard,
  formatDuration
} = useAppIntegrated()

</script>
