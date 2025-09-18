<template>
  <div class="h-full relative overflow-hidden bg-slate-100 dark:bg-slate-900">
    <!-- Content -->
    <div class="h-full flex flex-col">
      <!-- Player Header -->
      <PlayerHeader
        @go-back="$emit('goBack')"
      />

      <!-- Main Player Content -->
      <div class="flex-1 flex flex-col justify-center px-6 pb-8">
        <!-- Album Art Section -->
        <div class="text-center mb-8">
          <!-- Large Album Art -->
          <div class="w-60 h-60 max-[400px]:w-48 max-[400px]:h-48 mx-auto mb-6 relative">
            <!-- Album artwork with cover image -->
            <div class="w-full h-full relative rounded-3xl shadow-2xl overflow-hidden">
              <!-- Background cover image -->
              <div
                class="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style="background-image: url('/media-cover.png')"
              />

              <!-- Overlay for text contrast -->
              <div class="absolute inset-0" />

              <!-- Surah number overlay -->
              <div class="absolute inset-0 flex items-center justify-center">
                <!-- <span class="text-white text-4xl font-bold drop-shadow-lg">{{ currentSurah || 1 }}</span> -->
              </div>
            </div>
          </div>

          <!-- Track Information -->
          <div class="mb-2">
            <h1 class="text-slate-900 dark:text-slate-100 text-2xl font-bold mb-2 leading-tight">
              {{ getSurahDisplayName() }}
            </h1>
            <p class="text-slate-600 dark:text-slate-300 text-md">
              {{ currentReciterName }}
            </p>
            <!-- Animated Surah Information Container -->
            <div class="relative h-5 overflow-hidden mt-2">
              <Transition
                :name="currentStateInfo.direction"
                :duration="{ enter: 300, leave: 200 }"
                mode="out-in"
              >
                <!-- Normal Surah Info -->
                <div
                  v-if="currentStateInfo.state === 'normal'"
                  key="surah-info"
                  class="flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm absolute top-0 left-0 right-0 h-full"
                >
                  <span v-if="currentSurah">ซูเราะฮ์ที่ {{ currentSurah }}</span>
                  <span class="mx-2">•</span>
                  <span>{{ getCurrentSurahRevelationPlace() || 'มักกะฮฺ' }}</span>
                  <span class="mx-2">•</span>
                  <span>{{ getCurrentSurahTotalDuration() || formatTimeWithHours(duration) || '0:00' }}</span>
                </div>

                <!-- Loading State -->
                <div
                  v-else-if="currentStateInfo.state === 'loading'"
                  key="loading-info"
                  class="flex items-center justify-center text-amber-700 dark:text-amber-500 text-sm absolute top-0 left-0 right-0 h-full"
                >
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 animate-spin rounded-full border border-amber-700 dark:border-amber-500 border-t-transparent" />
                    <span>
                      กำลังโหลดเสียง...
                      <span v-if="networkType === 'cellular'" class="ml-1">(📱 เซลลูลาร์)</span>
                    </span>
                  </div>
                </div>

                <!-- Error State -->
                <div
                  v-else-if="currentStateInfo.state === 'error'"
                  key="error-info"
                  class="flex items-center justify-center text-red-500 dark:text-red-400 text-sm absolute top-0 left-0 right-0 h-full"
                >
                  <div class="flex items-center space-x-2">
                    <UIcon name="i-heroicons-exclamation-triangle" class="w-3 h-3" />
                    <span>เกิดข้อผิดพลาด - กรุณาลองใหม่</span>
                    <button
                      @click="clearError"
                      class="ml-2 text-red-600 dark:text-red-300 hover:text-red-400 dark:hover:text-red-100 transition-colors"
                      :title="'ล้างข้อผิดพลาด'"
                    >
                      <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

        </div>

        <!-- Progress Section -->
        <div class="mb-8">
          <!-- Time Display -->
          <div class="flex items-center justify-between mb-4">
            <span class="text-slate-600 dark:text-slate-400 text-sm">{{ formatTimeWithHours(currentTime) || '0:00' }}</span>
            <span class="text-slate-600 dark:text-slate-400 text-sm">{{ getCurrentSurahTotalDuration() || formatTimeWithHours(duration) || '0:00' }}</span>
          </div>

          <!-- Progress Bar -->
          <div class="relative">
            <div
              class="w-full h-2 bg-slate-300 dark:bg-slate-600 rounded-full cursor-pointer"
              @click="seekToClick"
            >
              <div
                class="h-full bg-slate-800 dark:bg-slate-200 rounded-full transition-all duration-300"
                :style="{ width: correctProgress + '%' }"
              />
            </div>
          </div>
        </div>

        <!-- Control Buttons -->
        <div class="space-y-8">
          <!-- Primary Controls -->
          <div class="flex items-center justify-center gap-12">
            <!-- Previous Surah -->
            <button
              class="w-14 h-14 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 transition-all hover:text-slate-800 dark:hover:text-slate-200 active:scale-95"
              :disabled="currentSurah <= 1"
              :class="{ 'opacity-50': currentSurah <= 1 }"
              @click="playPreviousSurah"
            >
              <UIcon name="i-ri-skip-back-fill" class="w-8 h-8" />
            </button>

            <!-- Play/Pause -->
            <button
              class="w-20 h-20 rounded-full bg-slate-800 dark:bg-slate-200 flex items-center justify-center text-white dark:text-slate-800 shadow-2xl transition-all hover:scale-105 active:scale-95"
              :disabled="isLoading"
              :class="{ 'bg-red-500 text-white': error }"
              @click="playFromHero"
            >
              <UIcon
                v-if="!isLoading && !error"
                :name="isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'"
                class="w-8 h-8"
                :class="{ 'ml-1': !isPlaying }"
              />
              <UIcon v-else-if="error" name="i-heroicons-exclamation-triangle" class="w-8 h-8" />
              <div v-else class="w-8 h-8 animate-spin rounded-full border-2 border-white dark:border-slate-800 border-t-transparent" />
            </button>

            <!-- Next Surah -->
            <button
              class="w-14 h-14 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 transition-all hover:text-slate-800 dark:hover:text-slate-200 active:scale-95"
              :disabled="currentSurah >= 114"
              :class="{ 'opacity-50': currentSurah >= 114 }"
              @click="playNextSurah"
            >
              <UIcon name="i-ri-skip-forward-fill" class="w-8 h-8" />
            </button>
          </div>

          <!-- Secondary Controls -->
          <div class="flex items-center justify-center gap-8">
            <!-- Skip/Rewind 15s -->
            <button
              class="w-12 h-12 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 transition-all hover:text-slate-700 dark:hover:text-slate-300 active:scale-95"
              @click="() => seekTo(Math.max(0, currentTime - 15))"
            >
              <div class="relative">
                <UIcon name="i-ri-reset-left-line" class="w-6 h-6" />
                <span class="absolute -bottom-1 -right-1 text-xs font-bold">15</span>
              </div>
            </button>

            <!-- Playback Speed Control -->
            <PlaybackSpeedControl
              :current-speed="playbackRate"
              @speed-change="setPlaybackRate"
            />

            <!-- Player Configuration/Settings -->
            <button
              class="w-12 h-12 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95"
              :class="{
                'bg-slate-300 dark:bg-slate-600': shufflePlay || loopPlay || autoPlayNext,
                'text-slate-900 dark:text-slate-100': shufflePlay || loopPlay || autoPlayNext
              }"
              @click="openPlayerConfig = true"
            >
              <!-- Show icon of active mode or settings icon -->
              <UIcon
                v-if="shufflePlay"
                name="i-lucide-shuffle"
                class="w-5 h-5"
              />
              <UIcon
                v-else-if="loopPlay"
                name="i-heroicons-arrow-path-rounded-square"
                class="w-5 h-5"
              />
              <UIcon
                v-else-if="autoPlayNext"
                name="i-lucide-infinity"
                class="w-5 h-5"
              />
              <UIcon
                v-else
                name="i-heroicons-adjustments-vertical"
                class="w-5 h-5"
              />
            </button>

            <!-- Skip/Forward 15s -->
            <button
              class="w-12 h-12 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 transition-all hover:text-slate-700 dark:hover:text-slate-300 active:scale-95"
              @click="() => seekTo(Math.min(duration, currentTime + 15))"
            >
              <div class="relative">
                <UIcon name="i-ri-reset-right-line" class="w-6 h-6" />
                <span class="absolute -bottom-1 -right-1 text-xs font-bold">15</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Player Configuration Modal -->
    <PlayerConfigModal
      :is-open="openPlayerConfig"
      :shuffle-play="shufflePlay"
      :loop-play="loopPlay"
      :auto-play-next="autoPlayNext"
      :toggle-shuffle-play="toggleShufflePlay"
      :toggle-loop-play="toggleLoopPlay"
      :toggle-auto-play-next="toggleAutoPlayNext"
      @close="openPlayerConfig = false"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * MobilePlayerView Component
 *
 * Full-screen mobile player interface featuring:
 * - Large album art with playing animations
 * - Comprehensive track information display
 * - Primary controls (previous, play/pause, next)
 * - Secondary controls (shuffle, loop, speed, auto-next)
 * - Progress bar with seeking capability
 * - Player configuration modal
 */

// Import components
import PlayerHeader from '~/components/headers/PlayerHeader.vue'
import PlaybackSpeedControl from '~/components/ui/PlaybackSpeedControl.vue'
import PlayerConfigModal from '~/components/modals/PlayerConfigModal.vue'

// Use integrated app composable
const {
  // Audio state
  isPlaying,
  isLoading,
  currentTime,
  duration,
  currentSurah,
  error,
  isBuffering,
  networkType,

  // Player configuration
  shufflePlay,
  loopPlay,
  autoPlayNext,
  playbackRate,

  // Computed values
  currentReciterName,
  correctProgress,

  // Methods
  playFromHero,
  seekTo,
  seekToClick,
  playNextSurah,
  playPreviousSurah,
  toggleShufflePlay,
  toggleLoopPlay,
  toggleAutoPlayNext,
  setPlaybackRate,
  getCurrentSurahName,
  getCurrentSurahRevelationPlace,
  getCurrentSurahTotalDuration,
  formatTimeWithHours,
  clearError
} = useAppIntegrated()

// Computed property to determine current state and animation direction
const currentStateInfo = computed(() => {
  if (error.value) {
    return { state: 'error', direction: 'slide-down' }
  }
  if (isBuffering.value || isLoading.value) {
    return { state: 'loading', direction: 'slide-down' }
  }
  return { state: 'normal', direction: 'slide-up' }
})

// Local state
const openPlayerConfig = ref(false)

// Events
defineEmits<{
  goBack: []
}>()

// Methods
const getSurahDisplayName = () => {
  const fullName = getCurrentSurahName()
  // Extract just the Thai name part after the number
  const parts = fullName.split('.')
  if (parts.length > 1 && parts[1]) {
    return parts[1].trim()
  }
  return fullName || 'อัล-ฟาติหะฮฺ'
}
</script>

<style scoped>
/* Slide Down Animation - for loading and error states */
.slide-down-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-down-leave-active {
  transition: all 0.2s cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* Slide Up Animation - for normal surah info */
.slide-up-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-up-leave-active {
  transition: all 0.2s cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.slide-up-enter-to,
.slide-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
