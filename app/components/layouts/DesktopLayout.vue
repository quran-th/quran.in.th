<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
    <!-- Large Screen Header -->
    <header class="p-6">
      <div class="max-w-5xl mx-auto">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
              อัลกุรอาน
            </h1>
            <p class="text-slate-500 dark:text-slate-400">ฟังกุรอานพร้อมความหมายภาษาไทย</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              class="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              :class="isLargePlayerMode
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
              @click="togglePlayerMode">
              <UIcon :name="isLargePlayerMode ? 'i-heroicons-list-bullet' : 'i-heroicons-play-circle'" class="w-4 h-4 mr-1" />
              {{ isLargePlayerMode ? 'เพลย์ลิสต์' : 'โหมดเล่น' }}
            </button>
            <button class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
              @click="toggleDarkMode">
              <UIcon :name="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="p-6">
      <div class="max-w-5xl mx-auto">
        <!-- Default Playlist Mode -->
        <div v-if="!isLargePlayerMode" class="animate-fade-in">
          <section class="mb-12">
            <!-- Hero Card -->
            <div class="relative rounded-2xl overflow-hidden h-64">
              <!-- Background Image -->
              <div class="absolute inset-0 bg-cover bg-center bg-no-repeat" style="background-image: url('/bg.webp')" />

              <!-- Gradient Overlay for better text readability -->
              <div class="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/10" />

              <!-- Additional shadow overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <!-- Content -->
              <div class="relative z-10 p-8 h-full flex flex-col justify-between">
                <div>
                  <p class="text-white/80 text-sm mb-2" />
                  <h3 class="text-white text-4xl font-bold mb-6">อัลกุรอาน<br>พร้อมคำแปลภาษาไทย</h3>

                  <div class="flex gap-4">
                    <button
                      class="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-black/90 transition-colors flex items-center gap-2 cursor-pointer"
                      :disabled="isLoading" :class="{ 'bg-red-600 hover:bg-red-700': error }" @click="playFromHero">
                      <UIcon v-if="!isLoading && !error" :name="isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'"
                        class="w-5 h-5" :class="{ 'ml-0.5': !isPlaying }" />
                      <UIcon v-else-if="error" name="i-heroicons-exclamation-triangle" class="w-5 h-5" />
                      <div v-else
                        class="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {{ error ? 'เกิดข้อผิดพลาด' : isLoading ? 'กำลังโหลด' : isPlaying ? 'หยุด' : 'เริ่ม' }}
                    </button>
                  </div>
                </div>

                <div class="text-right">
                  <p class="text-white/60 text-sm mb-1">เสียงแปลโดย {{ getCurrentReciterName }}</p>
                </div>
              </div>
            </div>
          </section>

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
                    <option value="1">บรรจง โซะมณี</option>
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
                  @click="selectAndPlaySurah(surah.id)">
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
                        เสียงแปลโดย {{ getCurrentReciterName }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Large Player Mode -->
        <div v-else class="flex items-center justify-center min-h-[calc(100vh-200px)] animate-fade-in">
          <div class="w-full max-w-2xl mx-auto">
            <!-- Large Album Art Section -->
            <div class="text-center mb-8">
              <div class="relative w-60 h-60 mx-auto mb-6">
                <!-- Album Art Container -->
                <div class="w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 dark:from-indigo-400 dark:via-purple-500 dark:to-pink-600">
                  <div class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80" style="background-image: url('/bg.webp')" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div class="relative z-10 flex items-center justify-center h-full">
                    <div class="text-center text-white">
                      <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="text-3xl font-bold">{{ currentSurah || '1' }}</span>
                      </div>
                      <div class="px-3 py-1 bg-white/20 rounded-full">
                        <span class="text-sm">{{ getCurrentSurahRevelationPlace() }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Track Info -->
              <div class="mb-8">
                <h2 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {{ getCurrentSurahName().split('.')[1]?.trim() || 'อัล-ฟาติหะฮฺ' }}
                </h2>
                <div class="flex items-center justify-center gap-2">
                  <span class="text-lg text-slate-600 dark:text-slate-400">เสียงแปลโดย</span>
                  <!-- Reciter Selector in Player Mode -->
                  <div class="relative">
                    <select
                      class="px-3 py-2 border border-[rgb(191,179,147)]/30 dark:border-[rgb(171,159,127)]/30 rounded-full bg-gradient-to-r from-[rgb(191,179,147)]/10 to-[rgb(171,159,127)]/10 dark:from-[rgb(35,32,48)] dark:to-[rgb(25,22,38)] text-slate-900 dark:text-[rgb(191,179,147)] text-sm appearance-none pr-8 shadow-sm hover:shadow-md transition-all"
                      :value="currentReciterId" @change="onDesktopReciterChange">
                      <option value="1">บรรจง โซะมณี</option>
                      <option value="2">อุมัร สุจิตวรรณศรี</option>
                    </select>
                    <UIcon name="i-heroicons-chevron-down" class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(191,179,147)] dark:text-[rgb(171,159,127)] pointer-events-none" />
                  </div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="mb-8">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm text-slate-500 dark:text-slate-400">{{ formatTimeWithHours(currentTime) || '0:00' }}</span>
                  <span class="text-sm text-slate-500 dark:text-slate-400">{{ getCurrentSurahTotalDuration() || formatTimeWithHours(duration) || '0:00' }}</span>
                </div>
                <div class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer" @click="seekToClick">
                  <div class="h-full bg-gradient-to-r from-[rgb(191,179,147)] to-[rgb(171,159,127)] dark:from-[rgb(191,179,147)] dark:to-[rgb(171,159,127)] rounded-full transition-all duration-300"
                    :style="{ width: correctProgress + '%' }" />
                </div>
              </div>

              <!-- Large Player Controls -->
              <div class="flex items-center justify-center gap-6 mb-8">
                <!-- Previous -->
                <button
                  class="w-14 h-14 rounded-full bg-gradient-to-br from-[rgb(191,179,147)] to-[rgb(171,159,127)] dark:from-[rgb(191,179,147)] dark:to-[rgb(171,159,127)] hover:from-[rgb(201,189,157)] hover:to-[rgb(181,169,137)] dark:hover:from-[rgb(201,189,157)] dark:hover:to-[rgb(181,169,137)] flex items-center justify-center transition-all active:scale-95 shadow-md hover:shadow-lg"
                  :disabled="isFirstVerse" :class="{ 'opacity-50': isFirstVerse }" @click="previousVerse">
                  <UIcon name="i-heroicons-backward" class="w-6 h-6 text-white" />
                </button>

                <!-- Play/Pause -->
                <button
                  class="w-20 h-20 rounded-full bg-gradient-to-br from-[rgb(191,179,147)] to-[rgb(171,159,127)] dark:from-[rgb(191,179,147)] dark:to-[rgb(171,159,127)] hover:from-[rgb(201,189,157)] hover:to-[rgb(181,169,137)] dark:hover:from-[rgb(201,189,157)] dark:hover:to-[rgb(181,169,137)] flex items-center justify-center text-white transition-all active:scale-95 shadow-xl"
                  :disabled="!currentSurah || !currentReciter" @click="togglePlay()">
                  <UIcon v-if="!isLoading && !error" :name="isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'"
                    class="w-8 h-8 text-white" :class="{ 'ml-1': !isPlaying }" />
                  <UIcon v-else-if="error" name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-white" />
                  <div v-else class="w-8 h-8 animate-spin rounded-full border-3 border-white border-t-transparent" />
                </button>

                <!-- Next -->
                <button
                  class="w-14 h-14 rounded-full bg-gradient-to-br from-[rgb(191,179,147)] to-[rgb(171,159,127)] dark:from-[rgb(191,179,147)] dark:to-[rgb(171,159,127)] hover:from-[rgb(201,189,157)] hover:to-[rgb(181,169,137)] dark:hover:from-[rgb(201,189,157)] dark:hover:to-[rgb(181,169,137)] flex items-center justify-center transition-all active:scale-95 shadow-md hover:shadow-lg"
                  :disabled="isLastVerse" :class="{ 'opacity-50': isLastVerse }" @click="nextVerse">
                  <UIcon name="i-heroicons-forward" class="w-6 h-6 text-white" />
                </button>
              </div>

              <!-- Player Mode Controls -->
              <div class="flex items-center justify-center gap-4">
                <button
                  class="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                  :class="shufflePlay
                    ? 'bg-gradient-to-br from-[rgb(191,179,147)] to-[rgb(171,159,127)] dark:from-[rgb(191,179,147)] dark:to-[rgb(171,159,127)] text-white shadow-lg hover:shadow-xl hover:from-[rgb(201,189,157)] hover:to-[rgb(181,169,137)]'
                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'"
                  @click="toggleShufflePlay">
                  <UIcon name="i-lucide-shuffle" class="w-5 h-5" />
                </button>

                <button
                  class="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                  :class="loopPlay
                    ? 'bg-gradient-to-br from-[rgb(191,179,147)] to-[rgb(171,159,127)] dark:from-[rgb(191,179,147)] dark:to-[rgb(171,159,127)] text-white shadow-lg hover:shadow-xl hover:from-[rgb(201,189,157)] hover:to-[rgb(181,169,137)]'
                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'"
                  @click="toggleLoopPlay">
                  <UIcon name="i-heroicons-arrow-path-rounded-square" class="w-5 h-5" />
                </button>

                <button
                  class="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                  :class="autoPlayNext
                    ? 'bg-gradient-to-br from-[rgb(191,179,147)] to-[rgb(171,159,127)] dark:from-[rgb(191,179,147)] dark:to-[rgb(171,159,127)] text-white shadow-lg hover:shadow-xl hover:from-[rgb(201,189,157)] hover:to-[rgb(181,169,137)]'
                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'"
                  @click="toggleAutoPlayNext">
                  <UIcon name="i-lucide-infinity" class="w-5 h-5" />
                </button>
              </div>

              <!-- Status Messages -->
              <div v-if="error" class="mt-6">
                <p class="text-red-500 text-sm">
                  เกิดข้อผิดพลาด - กรุณาลองใหม่
                </p>
              </div>

              <div v-else-if="isBuffering || isLoading" class="mt-6">
                <p class="text-blue-500 text-sm">
                  กำลังโหลดเสียง...
                  <span v-if="networkType === 'cellular'" class="ml-1">(📱 เซลลูลาร์)</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Mini Player (Fixed Bottom) - Hide in Player Mode -->
    <div v-if="!isLargePlayerMode" class="fixed bottom-0 left-0 right-0 bg-slate-900 dark:bg-slate-950 text-white px-6 py-4">
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
  currentReciterId: number

  // Computed
  getCurrentReciterName: string
  correctProgress: number

  // Desktop-specific state
  isLargePlayerMode: boolean

  // Methods
  playFromHero: () => Promise<void>
  previousVerse: () => void
  nextVerse: () => void
  togglePlay: () => Promise<void>
  seekToClick: (event: MouseEvent) => void
  selectAndPlaySurah: (surahId: number) => Promise<void>
  onDesktopReciterChange: (event: Event) => Promise<void>
  togglePlayerMode: () => void
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