<template>
  <!-- Large Player Mode -->
  <div class="flex items-center justify-center min-h-[calc(100vh-200px)] animate-fade-in">
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
</template>

<script setup lang="ts">
// Props for desktop player state
interface Props {
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
  currentReciterId: number

  // Computed
  correctProgress: number

  // Methods
  previousVerse: () => void
  nextVerse: () => void
  togglePlay: () => Promise<void>
  seekToClick: (event: MouseEvent) => void
  onDesktopReciterChange: (event: Event) => Promise<void>
  toggleShufflePlay: () => void
  toggleLoopPlay: () => void
  toggleAutoPlayNext: () => void
  getCurrentSurahName: () => string
  getCurrentSurahRevelationPlace: () => string
  getCurrentSurahTotalDuration: () => string
  formatTimeWithHours: (seconds: number) => string
}

defineProps<Props>()
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