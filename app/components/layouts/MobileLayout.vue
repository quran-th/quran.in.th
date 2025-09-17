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
              <p class="text-white/70 text-sm truncate">
                โดย {{ getCurrentReciterName }}
              </p>

              <!-- Status Indicator -->
              <div v-if="error" class="mt-1">
                <p class="text-red-300 text-xs">
                  เกิดข้อผิดพลาด - กรุณาลองใหม่
                </p>
              </div>

              <div v-else-if="isBuffering || isLoading" class="mt-1">
                <p class="text-blue-300 text-xs">
                  กำลังโหลดเสียง...
                  <span v-if="networkType === 'cellular'" class="ml-1">(📱 เซลลูลาร์)</span>
                </p>
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
              @click="showPlayerConfig = true">
              <UIcon v-if="shufflePlay" name="i-lucide-shuffle" class="w-5 h-5" />
              <UIcon v-else-if="loopPlay" name="i-heroicons-arrow-path-rounded-square" class="w-5 h-5" />
              <UIcon v-else name="i-lucide-infinity" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

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
    <div v-if="showPlayerConfig" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
      @click="showPlayerConfig = false">
      <div class="w-full bg-white dark:bg-slate-800 rounded-t-3xl max-h-[80vh] flex flex-col" :class="{
        'animate-slide-up': showPlayerConfig,
      }" @click.stop>
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-100">ตั้งค่าเครื่องเล่น</h3>
          <button class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
            @click="showPlayerConfig = false">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <!-- Configuration Options -->
        <div class="flex-1 p-6">
          <div class="space-y-4">
            <!-- Shuffle Play Option -->
            <div class="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-slate-700"
              :class="{ 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800': shufflePlay }"
              @click="toggleShufflePlay">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-full flex items-center justify-center"
                  :class="shufflePlay
                    ? 'bg-indigo-100 dark:bg-indigo-900/50'
                    : 'bg-gray-100 dark:bg-gray-700'">
                  <UIcon name="i-lucide-shuffle" class="w-6 h-6"
                    :class="shufflePlay
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400'" />
                </div>
                <div>
                  <h4 class="font-medium text-slate-900 dark:text-slate-100">เล่นแบบสุ่ม</h4>
                  <p class="text-sm text-slate-500 dark:text-slate-400">เล่นซูเราะฮฺแบบสุ่มลำดับ</p>
                </div>
              </div>
              <div class="flex items-center">
                <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                  :class="shufflePlay
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-gray-300 dark:border-gray-600'">
                  <UIcon v-if="shufflePlay" name="i-heroicons-check" class="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            <!-- Loop Play Option -->
            <div class="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-slate-700"
              :class="{ 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800': loopPlay }"
              @click="toggleLoopPlay">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-full flex items-center justify-center"
                  :class="loopPlay
                    ? 'bg-indigo-100 dark:bg-indigo-900/50'
                    : 'bg-gray-100 dark:bg-gray-700'">
                  <UIcon name="i-heroicons-arrow-path-rounded-square" class="w-6 h-6"
                    :class="loopPlay
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400'" />
                </div>
                <div>
                  <h4 class="font-medium text-slate-900 dark:text-slate-100">เล่นซ้ำ</h4>
                  <p class="text-sm text-slate-500 dark:text-slate-400">เล่นซูเราะฮฺปัจจุบันซ้ำ</p>
                </div>
              </div>
              <div class="flex items-center">
                <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                  :class="loopPlay
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-gray-300 dark:border-gray-600'">
                  <UIcon v-if="loopPlay" name="i-heroicons-check" class="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            <!-- Auto Play Next Option -->
            <div class="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-slate-700"
              :class="{ 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800': autoPlayNext }"
              @click="toggleAutoPlayNext">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-full flex items-center justify-center"
                  :class="autoPlayNext
                    ? 'bg-indigo-100 dark:bg-indigo-900/50'
                    : 'bg-gray-100 dark:bg-gray-700'">
                  <UIcon name="i-lucide-infinity" class="w-6 h-6"
                    :class="autoPlayNext
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400'" />
                </div>
                <div>
                  <h4 class="font-medium text-slate-900 dark:text-slate-100">เล่นต่อเนื่อง</h4>
                  <p class="text-sm text-slate-500 dark:text-slate-400">เล่นซูเราะฮฺถัดไปโดยอัตโนมัติ</p>
                </div>
              </div>
              <div class="flex items-center">
                <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                  :class="autoPlayNext
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-gray-300 dark:border-gray-600'">
                  <UIcon v-if="autoPlayNext" name="i-heroicons-check" class="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

const props = defineProps<Props>()

// Local state for mobile layout
const activeTab = ref('playing')
const showPlayerConfig = ref(false)
</script>

<style scoped>
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
</style>