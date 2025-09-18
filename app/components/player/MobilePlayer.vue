<template>
  <!-- Compact Player Card -->
  <div class="relative rounded-2xl overflow-hidden mb-6 flex-shrink-0">
    <!-- Background Image -->
    <div class="absolute inset-0 bg-cover bg-center bg-no-repeat" style="background-image: url('/bg.webp')" />

    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-r from-[rgb(62,1,1)]/70 via-[rgb(62,1,1)]/50 to-[rgb(62,1,1)]/30 dark:from-[rgb(245,162,116)]/70 dark:via-[rgb(245,162,116)]/50 dark:to-[rgb(245,162,116)]/30" />

    <!-- Player Content -->
    <div class="relative z-10 p-6">
      <!-- Player Controls Row -->
      <div class="flex items-center gap-4 mb-4">
        <!-- Play Button -->
        <button
          class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:bg-white/30 active:scale-95"
          :disabled="isLoading" :class="{ 'bg-red-500/80': error }" @click="playFromHero">
          <UIcon v-if="!isLoading && !error" :name="isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'"
            class="w-6 h-6" :class="{ 'ml-1': !isPlaying }" />
          <UIcon v-else-if="error" name="i-heroicons-exclamation-triangle" class="w-6 h-6" />
          <div v-else class="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </button>

        <!-- Track Info -->
        <div class="flex-1 min-w-0">
          <h2 class="text-white font-semibold text-lg mb-1 truncate">
            ซูเราะฮฺ{{ getCurrentSurahName().split('.')[1]?.trim() || 'อัล-ฟาติหะฮฺ' }}
          </h2>

          <!-- Animated Track Information Container -->
          <div class="relative h-5 overflow-hidden">
            <Transition
              :name="currentStateInfo.direction"
              :duration="{ enter: 300, leave: 200 }"
              mode="out-in"
            >
              <!-- Normal Reciter Info -->
              <p
                v-if="currentStateInfo.state === 'normal'"
                key="reciter-info"
                class="text-white/70 text-sm truncate absolute top-0 left-0 right-0 h-full flex items-center"
              >
                โดย {{ getCurrentReciterName }}
              </p>

              <!-- Loading State -->
              <div
                v-else-if="currentStateInfo.state === 'loading'"
                key="loading-info"
                class="text-blue-300 text-xs absolute top-0 left-0 right-0 h-full flex items-center"
              >
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 animate-spin rounded-full border border-blue-300 border-t-transparent" />
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
                class="text-red-300 text-xs absolute top-0 left-0 right-0 h-full flex items-center justify-between"
              >
                <div class="flex items-center space-x-2">
                  <UIcon name="i-heroicons-exclamation-triangle" class="w-3 h-3" />
                  <span>เกิดข้อผิดพลาด - กรุณาลองใหม่</span>
                </div>
                <button
                  @click="clearError"
                  class="ml-2 text-red-400 hover:text-red-200 transition-colors"
                  :title="'ล้างข้อผิดพลาด'"
                >
                  <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Revelation Place Display -->
        <div class="flex items-center text-white/80 text-xs">
          <div class="px-2 py-1 bg-white/20 rounded-full">
            {{ getCurrentSurahRevelationPlace() }}
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="w-full">
        <div class="flex items-center justify-between mb-2">
          <span class="text-white/60 text-xs">{{ formatTimeWithHours(currentTime) || '0:00' }}</span>
          <span class="text-white/60 text-xs">{{ getCurrentSurahTotalDuration() || formatTimeWithHours(duration) || '0:00'
            }}</span>
        </div>
        <div class="w-full h-1 bg-white/20 rounded-full cursor-pointer" @click="seekToClick">
          <div class="h-full bg-white rounded-full transition-all duration-300"
            :style="{ width: correctProgress + '%' }" />
        </div>
      </div>

      <!-- Bottom Control Buttons -->
      <div class="flex items-center justify-center gap-4 mt-4">
        <button
          class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:bg-white/30 active:scale-95"
          :disabled="isFirstVerse" :class="{ 'opacity-50': isFirstVerse }" @click="previousVerse">
          <UIcon name="i-heroicons-backward" class="w-5 h-5" />
        </button>

        <button
          class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:bg-white/30 active:scale-95"
          :disabled="isLastVerse" :class="{ 'opacity-50': isLastVerse }" @click="nextVerse">
          <UIcon name="i-heroicons-forward" class="w-5 h-5" />
        </button>

        <button
          class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:bg-white/30 active:scale-95"
          @click="$emit('openConfig')">
          <UIcon v-if="shufflePlay" name="i-lucide-shuffle" class="w-5 h-5" />
          <UIcon v-else-if="loopPlay" name="i-heroicons-arrow-path-rounded-square" class="w-5 h-5" />
          <UIcon v-else name="i-lucide-infinity" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * MobilePlayer Component
 *
 * A compact circular player card optimized for mobile devices.
 * Features play controls, track info, progress bar, and configuration access.
 * Now uses useState-based state management instead of props.
 */

// Use integrated app composable instead of props
const {
  // Audio state
  isPlaying,
  isLoading,
  currentTime,
  duration,
  isFirstVerse,
  isLastVerse,
  error,
  isBuffering,
  networkType,

  // Player configuration
  shufflePlay,
  loopPlay,

  // Computed values
  getCurrentReciterName,
  correctProgress,

  // Methods
  playFromHero,
  previousVerse,
  nextVerse,
  seekToClick,
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

// Events
defineEmits<{
  openConfig: []
}>()
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

/* Slide Up Animation - for normal reciter info */
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
