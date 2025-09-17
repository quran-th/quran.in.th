<template>
  <div class="h-screen bg-[#e7e8f3] dark:bg-[rgb(14,13,34)] relative flex flex-col">
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
        :get-current-reciter-name="getCurrentReciterName"
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
      <div class="px-0 mb-6 flex-shrink-0">
        <div class="flex bg-white/50 dark:bg-slate-700/50 rounded-lg p-1 backdrop-blur-sm">
          <button class="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all"
            :class="activeTab === 'playing' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-600 dark:text-slate-400'"
            @click="activeTab = 'playing'">
            ซูเราะฮ์
          </button>
          <button class="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all"
            :class="activeTab === 'reciters' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-600 dark:text-slate-400'"
            @click="activeTab = 'reciters'">
            เลือกผู้อ่าน
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div v-if="activeTab === 'playing'" class="flex-1 flex flex-col min-h-0">
        <!-- Surah Cards List -->
        <div class="flex flex-col flex-1 min-h-0">
          <div class="relative flex-1 min-h-0">
            <div class="space-y-3 h-full overflow-y-auto">
              <div v-for="surah in surahs" :key="surah.id"
                class="relative rounded-2xl overflow-hidden cursor-pointer transition-transform active:scale-98"
                @click="selectAndPlaySurahFromCard(surah.id)">
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
                      @click.stop="selectAndPlaySurahFromCard(surah.id)">
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
      </div>

      <!-- Reciter Selection Tab Content -->
      <div v-else-if="activeTab === 'reciters'" class="flex-1 flex flex-col min-h-0">
        <div class="mb-4">
          <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">เลือกผู้อ่าน</h2>
          <p class="text-sm text-slate-600 dark:text-slate-400">เลือกเสียงที่คุณต้องการฟัง</p>
        </div>

        <div class="relative flex-1 min-h-0">
          <div class="space-y-3 h-full overflow-y-auto">
            <div v-for="reciter in availableReciters" :key="reciter.id"
              class="relative rounded-2xl overflow-hidden cursor-pointer transition-transform active:scale-98"
              @click="selectReciter(reciter.id)">
              <!-- Background Card -->
              <div class="bg-gradient-to-r from-[rgb(191,179,147)] to-[rgb(171,159,127)] dark:from-[rgb(35,32,48)] dark:to-[rgb(25,22,38)] p-6">
                <!-- Content -->
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center mb-2">
                      <div class="w-12 h-12 bg-white/20 dark:bg-[rgb(191,179,147)] rounded-full flex items-center justify-center mr-3">
                        <UIcon name="i-heroicons-microphone" class="w-6 h-6 text-white dark:text-slate-800" />
                      </div>
                      <div>
                        <h3 class="text-white font-semibold text-lg mb-1">
                          {{ reciter.name }}
                        </h3>
                        <div class="flex items-center">
                          <div v-if="currentReciterId === parseInt(reciter.id)"
                            class="flex items-center text-white/80 text-sm">
                            <UIcon name="i-heroicons-check-circle" class="w-4 h-4 mr-1" />
                            กำลังใช้งาน
                          </div>
                          <div v-else class="text-white/60 text-sm">
                            แตะเพื่อเลือก
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Selection Indicator -->
                  <div class="flex items-center">
                    <div v-if="currentReciterId === parseInt(reciter.id)"
                      class="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <UIcon name="i-heroicons-check" class="w-4 h-4 text-indigo-500" />
                    </div>
                    <div v-else class="w-6 h-6 border-2 border-white/40 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Bottom gradient overlay for scroll indication -->
          <div class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#e7e8f3] dark:from-[rgb(14,13,34)] to-transparent pointer-events-none" />
        </div>
      </div>

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

// Props for shared state
interface Props {
  // Theme
  isDark: boolean
  toggleDarkMode: () => void

  // Audio player state
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  currentSurah: number | null
  currentReciter: any
  isFirstVerse: boolean
  isLastVerse: boolean
  error: any
  isBuffering: boolean
  networkType: string | null

  // Player configuration
  shufflePlay: boolean
  loopPlay: boolean
  autoPlayNext: boolean

  // Data
  surahs: any[]
  availableReciters: any[]
  currentReciterId: number

  // Computed
  getCurrentReciterName: string
  correctProgress: number

  // Methods
  playFromHero: () => Promise<void>
  previousVerse: () => void
  nextVerse: () => void
  seekToClick: (event: MouseEvent) => void
  selectAndPlaySurahFromCard: (surahId: number) => Promise<void>
  selectReciter: (reciterId: string) => Promise<void>
  toggleShufflePlay: () => void
  toggleLoopPlay: () => void
  toggleAutoPlayNext: () => void
  getCurrentSurahName: () => string
  getCurrentSurahRevelationPlace: () => string
  getCurrentSurahTotalDuration: () => string
  formatTimeWithHours: (seconds: number) => string
  formatDuration: (seconds: number) => string
}

defineProps<Props>()

// Local state for mobile layout
const activeTab = ref('playing')
const showPlayerConfig = ref(false)
</script>