<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <!-- <div class="px-4 pt-2 pb-4">
      <div class="flex items-center justify-between">
      </div>
    </div> -->

    <!-- Scrollable Content -->
    <div class="flex-1 flex flex-col min-h-0 px-2">
      <!-- Reciter Carousel -->
      <ReciterCarousel />

      <!-- Current Playing Mini Info (when audio is playing) -->
      <div
        v-if="isPlaying && currentSurah"
        class="mb-4 p-3 bg-gradient-to-r from-[rgb(191,179,147)]/20 to-[rgb(171,159,127)]/20 dark:from-[rgb(245,162,116)]/20 dark:to-[rgb(225,142,96)]/20 rounded-xl border border-[rgb(191,179,147)]/30 dark:border-[rgb(245,162,116)]/30"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center flex-1 min-w-0">
            <!-- Mini artwork placeholder -->
            <div class="w-10 h-10 bg-gradient-to-br from-[rgb(191,179,147)] to-[rgb(171,159,127)] dark:from-[rgb(245,162,116)] dark:to-[rgb(225,142,96)] rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <UIcon name="i-heroicons-musical-note" class="w-5 h-5 text-white dark:text-slate-800" />
            </div>

            <!-- Track info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                กำลังฟัง {{ getCurrentSurahName().split('.')[1]?.trim() || 'อัล-ฟาติหะฮฺ' }}
              </p>
              <p class="text-xs text-slate-600 dark:text-slate-400 truncate">
                {{ currentReciterName }}
              </p>
            </div>
          </div>

          <!-- Go to player button -->
          <button
            class="ml-3 w-8 h-8 bg-[rgb(191,179,147)] dark:bg-[rgb(245,162,116)] rounded-full flex items-center justify-center text-white dark:text-slate-800 hover:scale-105 transition-transform"
            @click="$emit('goToPlayer')"
          >
            <UIcon name="i-heroicons-chevron-up" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Enhanced Error Message (if any) -->
      <div
        v-if="error"
        class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
      >
        <div class="flex items-start">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-500 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
          <div class="flex-1 min-w-0">
            <p class="text-sm text-red-700 dark:text-red-300 mb-2">{{ error }}</p>
            <div class="flex items-center gap-3">
              <button
                class="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
                @click="retryLastSurah"
              >
                ลองใหม่
              </button>
              <span class="text-xs text-red-500 dark:text-red-400">•</span>
              <span class="text-xs text-red-500 dark:text-red-400">หรือลองเลือกซูเราะฮฺอื่น</span>
            </div>
          </div>
          <button
            class="ml-3 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex-shrink-0"
            @click="clearError"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Surah List Header -->
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">ซูเราะฮฺทั้งหมด</h2>
        <span class="text-sm text-slate-600 dark:text-slate-400">{{ surahs.length }} ซูเราะฮฺ</span>
      </div>

      <!-- Enhanced Surah List -->
      <div class="flex-1 min-h-0">
        <div class="relative h-full">
          <div ref="surahListContainer" class="space-y-3 h-full overflow-y-auto pb-4">
            <div
              v-for="surah in surahs"
              :key="surah.id"
              :ref="currentSurah === surah.id ? 'currentSurahElement' : undefined"
              :data-surah-id="surah.id"
              class="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              :class="{ 'opacity-70 pointer-events-none': loadingSurahId === surah.id }"
              @click="() => playSurahAndTransition(surah.id)"
            >
              <!-- Background Card -->
              <div class="bg-gradient-to-r from-[rgb(191,179,147)] to-[rgb(171,159,127)] dark:from-[rgb(35,32,48)] dark:to-[rgb(25,22,38)] p-2 md:p-4">
                <!-- Content -->
                <div class="flex items-center">
                  <!-- Surah Number/Artwork -->
                  <div class="w-14 h-14 bg-white/20 dark:bg-[rgb(191,179,147)] rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <span class="text-white dark:text-slate-800 font-bold text-lg">{{ surah.id }}</span>
                  </div>

                  <!-- Surah Info -->
                  <div class="flex-1 min-w-0">
                    <h3 class="text-white font-semibold text-md mb-1 truncate">
                      {{ surah.thaiName }}
                    </h3>
                    <div class="flex items-center text-white/70 text-xs">
                      <span>{{ surah.versesCount }} อายะห์</span>
                      <span class="mx-2">•</span>
                      <span v-if="surah.duration">{{ formatDuration(surah.duration) }}</span>
                      <span v-else>-</span>
                    </div>
                  </div>

                  <!-- Play Button -->
                  <button
                    class="w-12 h-12 backdrop-blur-sm rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 ml-3"
                    :class="currentSurah === surah.id
                      ? 'bg-white dark:bg-[rgb(191,179,147)] hover:bg-white/90 dark:hover:bg-[rgb(191,179,147)]/90'
                      : 'bg-white/20 hover:bg-white/30'"
                    :disabled="loadingSurahId === surah.id"
                    @click.stop="() => handlePlayButtonClick(surah.id)"
                  >
                    <!-- Loading spinner for this specific surah -->
                    <div
                      v-if="loadingSurahId === surah.id"
                      class="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"
                    />
                    <!-- Play/Pause icon -->
                    <UIcon
                      v-else
                      :name="currentSurah === surah.id && isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'"
                      class="w-6 h-6"
                      :class="{
                        'ml-0.5': !(currentSurah === surah.id && isPlaying),
                        'text-slate-800 dark:text-white': currentSurah === surah.id,
                        'text-white': currentSurah !== surah.id
                      }"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom fade overlay -->
          <div class="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-100 dark:from-slate-900 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * MobilePlaylistView Component
 *
 * The playlist view for mobile devices featuring:
 * - Reciter carousel for easy switching
 * - Enhanced surah list with artwork and metadata
 * - Mini playing indicator when audio is active
 * - Smooth transitions to player view
 */

// Import components
import ReciterCarousel from '~/components/ui/ReciterCarousel.vue'

// Use integrated app composable
const {
  // Audio state
  isPlaying,
  currentSurah,
  error,

  // Data
  surahs,

  // Computed
  currentReciterName,

  // Methods
  playFromHero,
  togglePlay,
  clearError,
  getCurrentSurahName,
  formatDuration
} = useAppIntegrated()

// Local loading state for individual surah cards
const loadingSurahId = ref<number | null>(null)

// Track last attempted surah for retry functionality
const lastAttemptedSurahId = ref<number | null>(null)

// Template refs
const surahListContainer = ref<HTMLElement>()
const _currentSurahElement = ref<HTMLElement>()

// Events
const emit = defineEmits<{
  goToPlayer: []
  openSettings: []
}>()

// Methods
// Handle play button clicks with proper play/pause logic
const handlePlayButtonClick = async (surahId: number) => {
  // If clicking on the currently selected surah
  if (currentSurah.value === surahId) {
    // Just toggle play/pause without restarting
    await togglePlay()
  } else {
    // Different surah - play from beginning
    await playFromHero(surahId)
  }
}

const playSurahAndTransition = async (surahId: number) => {
  try {
    // Track the attempted surah for retry functionality
    lastAttemptedSurahId.value = surahId

    // Set loading state for this specific surah card
    loadingSurahId.value = surahId

    // Clear any previous errors before attempting to play
    clearError()

    // Play the surah
    await playFromHero(surahId)

    // Wait for audio to actually start loading
    await nextTick()

    // Wait a bit to ensure loading state is processed
    await new Promise(resolve => setTimeout(resolve, 100))

    // Check if audio is playing or if there's an error
    if (isPlaying.value) {
      // Success - transition to player view
      emit('goToPlayer')
    } else if (error.value) {
      // Error occurred - error banner will show automatically
      console.log('🔄 Audio failed to load, staying on playlist for user retry')
    } else {
      // Still loading or paused - don't transition yet
      console.log('🔄 Audio still processing, staying on playlist')
    }
  } catch (err) {
    console.error('❌ Failed to play surah:', err)

    // If no error was set by the audio player, set a generic one
    if (!error.value) {
      // Force error to show in UI by setting it manually
      error.value = 'เกิดข้อผิดพลาดในการโหลดเสียง กรุณาลองใหม่'
    }
  } finally {
    // Always clear loading state
    loadingSurahId.value = null
  }
}

// Retry the last attempted surah
const retryLastSurah = async () => {
  if (lastAttemptedSurahId.value) {
    await playSurahAndTransition(lastAttemptedSurahId.value)
  }
}

// Scroll to current playing surah or last attempted surah (for error cases)
const scrollToCurrentSurah = () => {
  const targetSurahId = currentSurah.value || lastAttemptedSurahId.value
  if (targetSurahId && surahListContainer.value) {
    setTimeout(() => {
      // Find the target surah element
      const targetElement = surahListContainer.value?.querySelector(`[data-surah-id="${targetSurahId}"]`)
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }
    }, 100) // Small delay to ensure DOM is updated
  }
}

// Watch for currentSurah changes and scroll when playlist view loads
watch(currentSurah, () => {
  scrollToCurrentSurah()
}, { immediate: true })

// Watch for lastAttemptedSurahId changes (for error cases)
watch(lastAttemptedSurahId, () => {
  scrollToCurrentSurah()
})

// Also scroll when component mounts
onMounted(() => {
  scrollToCurrentSurah()
})
</script>
