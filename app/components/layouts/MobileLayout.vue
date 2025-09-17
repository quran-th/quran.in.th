<template>
  <div class="h-screen bg-[#e7e8f3] dark:bg-[rgb(14,13,34)] relative flex flex-col">
    <!-- Mobile Header -->
    <MobileHeader
      :is-dark="isDark"
      :toggle-dark-mode="toggleDarkMode"
    />

    <!-- Compact Mobile Player - Always Visible -->
    <main class="px-4 pb-6 flex flex-col flex-1 min-h-0">
      <!-- Mobile Player Component -->
      <MobilePlayer
        :is-playing="isPlaying"
        :is-loading="isLoading"
        :current-time="currentTime"
        :duration="duration"
        :is-first-verse="isFirstVerse"
        :is-last-verse="isLastVerse"
        :error="error"
        :is-buffering="isBuffering"
        :network-type="networkType"
        :shuffle-play="shufflePlay"
        :loop-play="loopPlay"
        :correct-progress="correctProgress"
        :play-from-hero="playFromHero"
        :previous-verse="previousVerse"
        :next-verse="nextVerse"
        :seek-to-click="seekToClick"
        :get-current-surah-name="getCurrentSurahName"
        :get-current-surah-revelation-place="getCurrentSurahRevelationPlace"
        :get-current-surah-total-duration="getCurrentSurahTotalDuration"
        :format-time-with-hours="formatTimeWithHours"
        @open-config="showPlayerConfig = true"
      />

      <!-- Tab Navigation -->
      <TabNavigation
        :active-tab="activeTab"
        @update-tab="activeTab = $event"
      />

      <!-- Tab Content -->
      <div v-if="activeTab === 'playing'" class="flex-1 flex flex-col min-h-0">
        <!-- Surah Cards List -->
        <SurahCardList />
      </div>

      <!-- Reciter Selection Tab Content -->
      <ReciterList
        v-else-if="activeTab === 'reciters'"
      />

    </main>

    <!-- Player Configuration Modal -->
    <PlayerConfigModal
      :is-open="showPlayerConfig"
      :shuffle-play="shufflePlay"
      :loop-play="loopPlay"
      :auto-play-next="autoPlayNext"
      :toggle-shuffle-play="toggleShufflePlay"
      :toggle-loop-play="toggleLoopPlay"
      :toggle-auto-play-next="toggleAutoPlayNext"
      @close="showPlayerConfig = false"
    />
  </div>
</template>

<script setup lang="ts">
// Import components
import MobilePlayer from '~/components/player/MobilePlayer.vue'
import PlayerConfigModal from '~/components/modals/PlayerConfigModal.vue'
import MobileHeader from '~/components/headers/MobileHeader.vue'
import TabNavigation from '~/components/ui/TabNavigation.vue'
import SurahCardList from '~/components/ui/SurahCardList.vue'
import ReciterList from '~/components/ui/ReciterList.vue'

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
  availableReciters,
  currentReciterId,

  // Computed
  correctProgress,

  // Methods
  playFromHero,
  previousVerse,
  nextVerse,
  seekToClick,
  selectAndPlaySurahFromCard,
  selectReciter,
  toggleShufflePlay,
  toggleLoopPlay,
  toggleAutoPlayNext,
  getCurrentSurahName,
  getCurrentSurahRevelationPlace,
  getCurrentSurahTotalDuration,
  formatTimeWithHours,
  formatDuration
} = useAppIntegrated()

// Local state for mobile layout
const activeTab = ref('playing')
const showPlayerConfig = ref(false)
</script>