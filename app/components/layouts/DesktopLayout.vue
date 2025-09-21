<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
    <!-- Large Screen Header -->
    <DesktopHeader
      :is-dark="isDark"
      :toggle-dark-mode="toggleDarkMode"
      :is-large-player-mode="isLargePlayerMode"
      :toggle-player-mode="togglePlayerMode"
    />

    <!-- Main Content -->
    <main class="p-6">
      <div class="max-w-5xl mx-auto">
        <!-- Default Playlist Mode -->
        <div v-if="!isLargePlayerMode" class="animate-fade-in">
          <HeroSection />

          <!-- My Playlist Section -->
          <section>
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">เพลย์ลิสต์</h2>
              <div class="flex items-center gap-4">
                <!-- Desktop Reciter Selector - Simple Dropdown -->
                <div class="relative">
                  <select
                    class="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    :value="currentReciterId" @change="onDesktopReciterChange">
                    <option value="1">อ.บรรจง โซ๊ะมณี</option>
                    <option value="2">อุมัร สุจิตวรรณศรี</option>
                  </select>
                </div>
                <button class="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  <span class="text-sm text-slate-500 dark:text-slate-400">ทั้งหมด {{ surahs.length }} รายการ</span>
                </button>
              </div>
            </div>

            <!-- Playlist Table -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden mb-[80px]">
              <!-- Table Header -->
              <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <div class="grid grid-cols-12 gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <div class="col-span-1">#</div>
                  <div class="col-span-3">ซูเราะห์</div>
                  <div class="col-span-1">ประเภท</div>
                  <div class="col-span-3">เวลา</div>
                  <div class="col-span-4">ผู้อ่าน</div>
                </div>
              </div>

              <!-- Table Body -->
              <div class="max-h-96 overflow-y-auto">
                <div v-for="(surah, index) in surahs" :key="surah.id"
                  class="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                  @click="() => selectAndPlaySurah(surah.id)">
                  <div class="grid grid-cols-12 gap-4 items-center">
                    <!-- Number -->
                    <div class="col-span-1">
                      <div class="flex items-center">
                        <span v-if="currentSurah !== surah.id" class="text-slate-400 text-sm">{{ String(index +
                          1).padStart(2, '0') }}</span>
                        <UIcon v-else name="i-heroicons-speaker-wave"
                          class="w-4 h-4 text-slate-800 dark:text-slate-100" />
                      </div>
                    </div>

                    <!-- Title -->
                    <div class="col-span-3">
                      <p class="font-medium text-slate-900 dark:text-slate-100">{{ surah.thaiName }}</p>
                    </div>

                    <div class="col-span-1">
                      <span class="inline-flex px-2 py-0.5 text-xs rounded-full" :class="surah.revelationType === 'Meccan'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'">
                        {{ surah.revelationType === 'Meccan' ? 'มักกิยะห์' : 'มะดะนียะห์' }}
                      </span>
                    </div>

                    <!-- Time -->
                    <div class="col-span-3">
                      <p class="text-slate-500 dark:text-slate-400">
                        <span v-if="surah.duration">{{ formatDuration(surah.duration) }}</span>
                        <span v-else>-</span>
                      </p>
                    </div>

                    <!-- Reciter info -->
                    <div class="col-span-4">
                      <p class="text-slate-500 dark:text-slate-400 text-xs">
                        เสียงภาษาไทยโดย {{ getCurrentReciterName }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Large Player Mode -->
        <DesktopPlayer
          v-else
          :is-playing="isPlaying"
          :is-loading="isLoading"
          :current-time="currentTime"
          :duration="duration"
          :current-surah="currentSurah"
          :current-reciter="currentReciter"
          :is-first-verse="isFirstVerse"
          :is-last-verse="isLastVerse"
          :error="error"
          :is-buffering="isBuffering"
          :network-type="networkType"
          :shuffle-play="shufflePlay"
          :loop-play="loopPlay"
          :auto-play-next="autoPlayNext"
          :current-reciter-id="currentReciterId"
          :correct-progress="correctProgress"
          :previous-verse="previousVerse"
          :next-verse="nextVerse"
          :toggle-play="togglePlay"
          :seek-to-click="seekToClick"
          :on-desktop-reciter-change="onDesktopReciterChange"
          :toggle-shuffle-play="toggleShufflePlay"
          :toggle-loop-play="toggleLoopPlay"
          :toggle-auto-play-next="toggleAutoPlayNext"
          :get-current-surah-name="getCurrentSurahName"
          :get-current-surah-revelation-place="getCurrentSurahRevelationPlace"
          :get-current-surah-total-duration="getCurrentSurahTotalDuration"
          :format-time-with-hours="formatTimeWithHours"
        />
      </div>
    </main>

    <!-- Mini Player (Fixed Bottom) - Hide in Player Mode -->
    <MiniPlayer
      v-if="!isLargePlayerMode"
    />
  </div>
</template>

<script setup lang="ts">
// Import components
import DesktopPlayer from '~/components/player/DesktopPlayer.vue'
import MiniPlayer from '~/components/player/MiniPlayer.vue'
import DesktopHeader from '~/components/headers/DesktopHeader.vue'
import HeroSection from '~/components/ui/HeroSection.vue'

// Use integrated app composable instead of massive prop drilling
const {
  // Theme
  isDark,
  toggleDarkMode,

  // Audio player state
  isPlaying,
  isLoading,
  currentTime,
  duration,
  currentSurah,
  currentReciter,
  isFirstVerse,
  isLastVerse,
  error,
  isBuffering,
  networkType,

  // Player configuration
  shufflePlay,
  loopPlay,
  autoPlayNext,

  // Data
  surahs,
  currentReciterId,

  // Computed
  currentReciterName,
  getCurrentReciterName,
  correctProgress,

  // Desktop-specific state
  isLargePlayerMode,

  // Methods
  playFromHero,
  previousVerse,
  nextVerse,
  togglePlay,
  seekToClick,
  selectAndPlaySurah,
  onDesktopReciterChange,
  togglePlayerMode,
  toggleShufflePlay,
  toggleLoopPlay,
  toggleAutoPlayNext,
  getCurrentSurahName,
  getCurrentSurahRevelationPlace,
  getCurrentSurahTotalDuration,
  formatTimeWithHours,
  formatDuration
} = useAppIntegrated()
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out;
}
</style>
