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
// Props for player state
interface Props {
  // Audio player state
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  isFirstVerse: boolean
  isLastVerse: boolean
  error: any
  isBuffering: boolean
  networkType: string | null

  // Player configuration
  shufflePlay: boolean
  loopPlay: boolean

  // Computed values
  getCurrentReciterName: string
  correctProgress: number

  // Methods
  playFromHero: () => Promise<void>
  previousVerse: () => void
  nextVerse: () => void
  seekToClick: (event: MouseEvent) => void
  getCurrentSurahName: () => string
  getCurrentSurahRevelationPlace: () => string
  getCurrentSurahTotalDuration: () => string
  formatTimeWithHours: (seconds: number) => string
}

defineProps<Props>()

// Events
defineEmits<{
  openConfig: []
}>()
</script>
