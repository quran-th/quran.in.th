<template>
  <div class="verse-display space-y-4 mb-8">
    <!-- Status -->
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-500">
          {{ isLoading ? "กำลังโหลด..." : "กำลังเล่น" }}
        </p>
        <p class="text-lg font-semibold">{{ surahName }}</p>
      </div>
      <div v-if="!isLoading" class="flex gap-1">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <div
          class="w-2 h-2 bg-green-400 rounded-full animate-pulse"
          style="animation-delay: 0.2s"
        ></div>
        <div
          class="w-2 h-2 bg-green-300 rounded-full animate-pulse"
          style="animation-delay: 0.4s"
        ></div>
      </div>
    </div>

    <!-- Verse Display -->
    <div
      class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl"
    >
      <!-- Verse Number -->
      <div class="flex items-center gap-2 mb-4">
        <div
          class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
        >
          <span class="text-sm font-bold">{{ currentVerseNumber }}</span>
        </div>
        <span class="text-sm opacity-90">of {{ totalVerses }}</span>
      </div>

      <!-- Content -->
      <div v-if="isLoading" class="text-center py-8">
        <div
          class="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="text-sm opacity-90">กำลังโหลด...</p>
      </div>

      <div v-else-if="error" class="text-center py-8">
        <p class="text-sm opacity-90">{{ error }}</p>
      </div>

      <div v-else class="text-center py-4">
        <!-- Arabic Text -->
        <p class="text-2xl leading-loose mb-4 font-serif" dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <p class="text-sm opacity-75">
          ซูเราะฮฺ {{ currentSurah || 1 }}:{{ currentVerseNumber }}
        </p>
      </div>
    </div>

    <!-- Translation - Hidden for now -->
    <!-- <div v-if="showTranslation" class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
      <p class="text-center text-gray-600 dark:text-gray-400">
        คำแปลและตัวสะกดจะแสดงเมื่อข้อมูลอายะฮฺถูกโหลด
      </p>
    </div> -->
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentSurah: number | null;
  currentReciter: number | null;
  currentVerseNumber: number;
  totalVerses: number;
  surahName: string;
  isLoading: boolean;
  error: string | null;
  showTranslation: boolean;
  currentVerse?: {
    verse_key: string;
    text_arabic?: string;
    transliteration?: string;
    translation?: string;
  } | null;
}

defineProps<Props>();
</script>

<style scoped>
/* Simple, clean styles */
.verse-display {
  width: 100%;
}
</style>
