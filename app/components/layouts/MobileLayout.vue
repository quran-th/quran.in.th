<template>
  <div class="h-screen bg-[#e7e8f3] dark:bg-[rgb(14,13,34)] relative flex flex-col overflow-hidden">
    <!-- Mobile Header (only visible in playlist view) -->
    <MobileHeader
      v-if="currentView === 'playlist'"
      :is-dark="isDark"
      :toggle-dark-mode="toggleDarkMode"
    />

    <!-- View Container with Transitions -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Playlist View -->
      <Transition
        name="fade"
        mode="out-in"
      >
        <div
          v-if="currentView === 'playlist'"
          key="playlist"
          class="absolute inset-0"
        >
          <div class="h-full flex flex-col px-4 pb-6">
            <MobilePlaylistView
              @go-to-player="transitionToPlayer"
              @open-settings="showPlayerConfig = true"
            />
          </div>
        </div>

        <!-- Player View -->
        <div
          v-else-if="currentView === 'player'"
          key="player"
          class="absolute inset-0"
        >
          <MobilePlayerView
            @go-back="transitionToPlaylist"
          />
        </div>
      </Transition>
    </div>

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
import PlayerConfigModal from '~/components/modals/PlayerConfigModal.vue'
import MobileHeader from '~/components/headers/MobileHeader.vue'
import MobilePlaylistView from '~/components/views/MobilePlaylistView.vue'
import MobilePlayerView from '~/components/views/MobilePlayerView.vue'

// Use integrated app composable
const {
  // Audio state
  isPlaying,

  // Theme
  isDark,
  toggleDarkMode,

  // Player configuration
  shufflePlay,
  loopPlay,
  autoPlayNext,

  // Methods
  toggleShufflePlay,
  toggleLoopPlay,
  toggleAutoPlayNext
} = useAppIntegrated()

// Local state for mobile layout
const currentView = ref<'playlist' | 'player'>('playlist')
const showPlayerConfig = ref(false)

// View transition methods
const transitionToPlayer = () => {
  currentView.value = 'player'
}

const transitionToPlaylist = () => {
  currentView.value = 'playlist'
}

// Auto-transition to player when audio starts playing
watch(isPlaying, (newIsPlaying) => {
  if (newIsPlaying && currentView.value === 'playlist') {
    // Small delay to ensure smooth transition after audio starts
    setTimeout(() => {
      transitionToPlayer()
    }, 300)
  }
})
</script>

<style scoped>
/* Fade transition for view switching */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>