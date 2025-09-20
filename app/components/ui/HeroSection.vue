<template>
  <!-- Hero Section -->
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
              :disabled="isLoading" :class="{ 'bg-red-600 hover:bg-red-700': error }" @click="() => playFromHero()">
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
          <p class="text-white/60 text-sm mb-1">เสียงภาษาไทยโดย {{ getCurrentReciterName }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Props for hero section
// Use integrated app composable instead of props
const {
  // Audio player state
  isPlaying,
  isLoading,
  error,

  // Computed
  getCurrentReciterName,

  // Methods
  playFromHero
} = useAppIntegrated()
</script>
