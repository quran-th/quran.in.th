<template>
  <!-- Mobile Layout -->
  <div class="md:hidden min-h-screen bg-[#e7e8f3] dark:bg-slate-800 relative">
    <!-- Mobile Header -->
    <header class="p-4 pt-12 safe-top">
      <div class="flex items-center justify-between mb-2">
        <div>
          <p class="text-sm text-slate-600 dark:text-slate-400">Now playing</p>
          <h1 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {{ getCurrentSurahName() }} - {{ getCurrentReciterName() }}
          </h1>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="w-8 h-8 rounded-full bg-white/70 dark:bg-slate-700 flex items-center justify-center backdrop-blur-sm">
            <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </button>
          <button
            class="w-8 h-8 rounded-full bg-white/70 dark:bg-slate-700 flex items-center justify-center backdrop-blur-sm">
            <UIcon name="i-heroicons-list-bullet" class="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Circular Player -->
    <main class="px-6 pb-24 flex-1 flex flex-col">
      <!-- Time Display -->
      <div class="text-center mb-8">
        <p class="text-2xl font-light text-slate-800 dark:text-slate-300">{{ formatTime(currentTime) || '-3:15' }}</p>
      </div>

      <!-- Circular Progress Ring -->
      <div class="flex-1 flex items-center justify-center mb-8">
        <div class="relative">
          <!-- Progress Ring -->
          <svg class="w-72 h-72 transform -rotate-90" viewBox="0 0 200 200">
            <!-- Background Ring -->
            <circle cx="100" cy="100" r="90" stroke="rgba(100, 116, 139, 0.3)" stroke-width="4" fill="none"
              class="dark:stroke-slate-600" />
            <!-- Progress Ring -->
            <circle cx="100" cy="100" r="90" stroke="#6366f1" stroke-width="4" fill="none"
              :stroke-dasharray="`${565.48}`" :stroke-dashoffset="`${565.48 - (565.48 * progress / 100)}`"
              class="transition-all duration-300 dark:stroke-indigo-400" stroke-linecap="round" />
          </svg>

          <!-- Album Art and Play Button -->
          <div class="absolute inset-4 bg-white rounded-full flex items-center justify-center overflow-hidden">
            <!-- Album Artwork (placeholder) -->
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500">
              <!-- This would be actual album artwork -->
              <div class="w-full h-full flex items-center justify-center text-white font-bold text-4xl">
                {{ currentSurah || '1' }}
              </div>
            </div>

            <!-- Play Button Overlay -->
            <button @click="togglePlay"
              class="relative z-10 w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95"
              :disabled="!currentSurah || !currentReciter">
              <UIcon v-if="!isLoading" :name="isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'" class="w-6 h-6"
                :class="{ 'ml-1': !isPlaying }" />
              <div v-else class="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            </button>
          </div>
        </div>
      </div>

      <!-- Track Info -->
      <div class="text-center mb-8">
        <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
          {{ getCurrentSurahName().split('.')[1]?.trim() || 'อัล-ฟาติหะฮฺ' }}
        </h2>
        <p class="text-slate-700 dark:text-slate-400">
          {{ getCurrentReciterName() }}
        </p>
      </div>

      <!-- Primary Controls -->
      <div class="flex items-center justify-center gap-8 mb-6">
        <button @click="previousVerse"
          class="w-12 h-12 rounded-full bg-white/80 dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-300 backdrop-blur-sm shadow-sm"
          :disabled="isFirstVerse" :class="{ 'opacity-50': isFirstVerse }">
          <UIcon name="i-heroicons-backward" class="w-6 h-6" />
        </button>

        <button @click="nextVerse"
          class="w-12 h-12 rounded-full bg-white/80 dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-300 backdrop-blur-sm shadow-sm"
          :disabled="isLastVerse" :class="{ 'opacity-50': isLastVerse }">
          <UIcon name="i-heroicons-forward" class="w-6 h-6" />
        </button>

        <button @click="showSurahList = true"
          class="w-12 h-12 rounded-full bg-white/80 dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-300 backdrop-blur-sm shadow-sm">
          <UIcon name="i-heroicons-list-bullet" class="w-6 h-6" />
        </button>
      </div>

      <!-- Secondary Controls -->
      <div class="flex items-center justify-center gap-8">
        <button @click="cycleRepeatMode"
          class="w-10 h-10 rounded-full bg-white/60 dark:bg-slate-700/70 flex items-center justify-center text-slate-700 dark:text-slate-400 backdrop-blur-sm">
          <UIcon name="i-heroicons-arrow-path" class="w-5 h-5" />
        </button>

        <button
          class="w-10 h-10 rounded-full bg-white/60 dark:bg-slate-700/70 flex items-center justify-center text-slate-700 dark:text-slate-400 backdrop-blur-sm">
          <UIcon name="i-heroicons-plus" class="w-5 h-5" />
        </button>

        <button @click="toggleMute"
          class="w-10 h-10 rounded-full bg-white/60 dark:bg-slate-700/70 flex items-center justify-center text-slate-700 dark:text-slate-400 backdrop-blur-sm">
          <UIcon name="i-heroicons-adjustments-horizontal" class="w-5 h-5" />
        </button>

        <button
          class="w-10 h-10 rounded-full bg-white/60 dark:bg-slate-700/70 flex items-center justify-center text-slate-700 dark:text-slate-400 backdrop-blur-sm">
          <UIcon name="i-heroicons-arrow-path-rounded-square" class="w-5 h-5" />
        </button>
      </div>
    </main>

    <!-- Surah Selection Modal -->
    <div v-if="showSurahList" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
      @click="showSurahList = false">
      <div class="w-full bg-white dark:bg-slate-800 rounded-t-3xl max-h-[80vh] flex flex-col" @click.stop :class="{
        'animate-slide-up': showSurahList,
      }">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-100">เลือกซูเราะห์</h3>
          <button @click="showSurahList = false"
            class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <!-- Surah List -->
        <div class="flex-1 overflow-hidden">
          <!-- Table Header -->
          <div class="px-6 py-3 bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-gray-600">
            <div class="grid grid-cols-12 gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              <div class="col-span-2">#</div>
              <div class="col-span-10">ซูเราะห์</div>
            </div>
          </div>

          <!-- Scrollable List -->
          <div class="overflow-y-auto max-h-96">
            <div v-for="surah in surahs" :key="surah.id"
              class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              :class="{
                'bg-indigo-50 dark:bg-indigo-900/20': currentSurah === surah.id,
                'text-indigo-600 dark:text-indigo-400': currentSurah === surah.id
              }" @click="selectSurahFromModal(surah.id)">
              <div class="grid grid-cols-12 gap-4 items-center">
                <!-- Number -->
                <div class="col-span-2">
                  <div class="flex items-center">
                    <span v-if="currentSurah !== surah.id" class="text-slate-600 dark:text-slate-400 font-medium">{{
                      surah.id }}</span>
                    <UIcon v-else name="i-heroicons-speaker-wave" class="w-5 h-5 text-indigo-500" />
                  </div>
                </div>

                <!-- Surah Name -->
                <div class="col-span-10">
                  <div class="text-base font-medium text-slate-900 dark:text-slate-100 mb-1">
                    {{ surah.thaiName }}
                  </div>
                  <div class="text-sm text-slate-500 dark:text-slate-400">
                    {{ surah.englishName }} • {{ surah.versesCount }} อายะห์ •
                    <span class="inline-flex px-2 py-0.5 text-xs rounded-full" :class="surah.revelationType === 'Meccan'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'">
                      {{ surah.revelationType === 'Meccan' ? 'มักกะห์' : 'มะดีนะห์' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Large Screen Layout -->
  <div class="hidden md:block min-h-screen bg-slate-50 dark:bg-slate-900">

    <!-- Large Screen Header -->
    <header class="p-6">
      <div class="max-w-5xl mx-auto">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
              อัลกุรอาน
            </h1>
            <p class="text-slate-500 dark:text-slate-400">ฟัง & ใคร่ครวญ</p>
          </div>
          <div class="flex items-center gap-3">
            <button @click="toggleDarkMode"
              class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <UIcon :name="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="p-6">
      <div class="max-w-5xl mx-auto">
        <section class="mb-12">
          <!-- Hero Card -->
          <div class="relative rounded-2xl overflow-hidden h-64">
            <!-- Background Image -->
            <div class="absolute inset-0 bg-cover bg-center bg-no-repeat" style="background-image: url('/bg.webp')">
            </div>

            <!-- Gradient Overlay for better text readability -->
            <div class="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/10"></div>

            <!-- Additional shadow overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

            <!-- Content -->
            <div class="relative z-10 p-8 h-full flex flex-col justify-between">
              <div>
                <p class="text-white/80 text-sm mb-2"></p>
                <h3 class="text-white text-4xl font-bold mb-6">อัลกุรอาน<br>พร้อมคำแปลภาษาไทย</h3>

                <div class="flex gap-4">
                    <button
                    class="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-black/90 transition-colors flex items-center gap-2">
                    <UIcon name="i-heroicons-play" class="w-5 h-5" />
                    PLAY
                    </button>
                  <button
                    class="px-6 py-2 border border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-colors">
                    FOLLOW
                  </button>
                </div>
              </div>

              <div class="text-right">
                <p class="text-white/60 text-sm mb-1">© {{ new Date().getFullYear() }} Copyright</p>
              </div>
            </div>
          </div>
        </section>

        <!-- My Playlist Section -->
        <section>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">เพลย์ลิสต์</h2>
            <button class="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
              <span class="text-sm text-slate-500 dark:text-slate-400">ทั้งหมด {{ surahs.length }} รายการ</span>
            </button>
          </div>

          <!-- Playlist Table -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
            <!-- Table Header -->
            <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div class="grid grid-cols-12 gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                <div class="col-span-1">#</div>
                <div class="col-span-4">ซูเราะห์</div>
                <div class="col-span-2">โดย</div>
                <div class="col-span-2">เวลา</div>
                <div class="col-span-3">หมวด</div>
              </div>
            </div>

            <!-- Table Body -->
            <div class="max-h-96 overflow-y-auto">
              <div v-for="(surah, index) in surahs" :key="surah.id"
                class="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                @click="selectSurah(surah.id)">
                <div class="grid grid-cols-12 gap-4 items-center">
                  <!-- Number -->
                  <div class="col-span-1">
                    <div class="flex items-center">
                      <span v-if="currentSurah !== surah.id" class="text-slate-400 text-sm">{{ String(index +
                        1).padStart(2, '0') }}</span>
                      <UIcon v-else name="i-heroicons-speaker-wave" class="w-4 h-4 text-indigo-500" />
                    </div>
                  </div>

                  <!-- Title -->
                  <div class="col-span-4">
                    <p class="font-medium text-slate-900 dark:text-slate-100">{{ surah.thaiName }}</p>
                  </div>

                  <!-- Artist -->
                  <div class="col-span-2">
                    <p class="text-slate-500 dark:text-slate-400">{{ getCurrentReciterName() }}</p>
                  </div>

                  <!-- Time -->
                  <div class="col-span-2">
                    <p class="text-slate-500 dark:text-slate-400">3:23</p>
                  </div>

                  <!-- Album -->
                  <div class="col-span-3">
                    <p class="text-slate-500 dark:text-slate-400 truncate">อัลกุรอาน</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Mini Player (Fixed Bottom) -->
    <div class="fixed bottom-0 left-0 right-0 bg-slate-900 text-white px-6 py-4">
      <div class="flex items-center gap-4">
        <!-- Track Info -->
        <div class="flex items-center gap-3 flex-1">
          <div
            class="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">{{ currentSurah || '1' }}</span>
          </div>
          <div>
            <p class="font-medium">{{ getCurrentSurahName().split('.')[1]?.trim() || 'อัล-ฟาติหะฮฺ' }}</p>
            <p class="text-white/60 text-sm">{{ getCurrentReciterName() }}</p>
          </div>
        </div>

        <!-- Time and Controls -->
        <div class="flex items-center gap-4">
          <span class="text-white/60 text-sm">{{ formatTime(currentTime) || '-3:15' }}</span>
          <button @click="togglePlay"
            class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <UIcon :name="isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'" class="w-4 h-4"
              :class="{ 'ml-0.5': !isPlaying }" />
          </button>

          <!-- Progress Bar -->
          <div class="w-32 h-1 bg-white/20 rounded-full relative cursor-pointer" @click="seekToClick">
            <div class="h-full bg-white rounded-full transition-all duration-100" :style="{ width: progress + '%' }">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
// Theme management
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");

const toggleDarkMode = () => {
  colorMode.value = isDark.value ? "light" : "dark";
};

// Data composables
const {
  reciters,
  isLoading: recitersLoading,
  getReciterById,
  getReciterOptions,
} = useReciters();
const {
  surahs,
  isLoading: surahsLoading,
  getSurahById,
  getSurahOptions,
} = useSurahs();

// Audio player
const {
  isPlaying,
  isLoading,
  currentTime,
  duration,
  volume,
  isMuted,
  currentSurah,
  currentReciter,
  currentVerseNumber,
  totalVerses,
  isFirstVerse,
  isLastVerse,
  progress,
  showTranslation,
  repeatMode,
  autoPlay,
  error,
  loadAudio,
  togglePlay,
  previousVerse,
  nextVerse,
  seekToProgress,
  setVolume,
  toggleMute,
  formatTime,
  updateMediaMetadata,
  setAutoPlayMetadataCallback,
} = useAudioPlayer();

// Selection state
const selectedReciter = ref<number | undefined>(undefined);
const selectedSurahValue = ref<number | undefined>(undefined);

// Modal state
const showSurahList = ref(false);

// Computed properties
const reciterOptions = computed(() => getReciterOptions());
const surahOptions = computed(() => getSurahOptions());

const currentSurahName = computed(() => {
  if (!currentSurah.value) return "เลือกซูเราะฮฺ";
  const surah = getSurahById(currentSurah.value);
  return surah ? `${surah.id}. ${surah.thaiName}` : "ไม่ทราบซูเราะฮฺ";
});

const currentReciterName = computed(() => {
  if (!currentReciter.value) return "เลือกนักอ่าน";
  const reciter = getReciterById(currentReciter.value);
  return reciter ? reciter.name : "ไม่ทราบนักอ่าน";
});

const currentVerseData = computed(() => {
  // This would ideally come from verse text API, but for now we return basic data
  return {
    verse_key: `${currentSurah.value || 0}:${currentVerseNumber.value || 1}`,
    text_arabic: undefined, // Would come from verse text API
    transliteration: undefined, // Would come from verse text API
    translation: undefined, // Would come from verse text API
  };
});

// Recent surahs (mock data for now)
const recentSurahs = ref([
  {
    id: 1,
    number: "1",
    name: "ซูเราะฮฺ อัล-ฟาติหะฮฺ",
    verses: 7,
    type: "มักกะฮฺ",
  },
  {
    id: 2,
    number: "2",
    name: "ซูเราะฮฺ อัล-บะเกาะเราะฮฺ",
    verses: 286,
    type: "มะดีนะฮฺ",
  },
  { id: 36, number: "36", name: "ซูเราะฮฺ ยาสีน", verses: 83, type: "มักกะฮฺ" },
]);

// Watch for changes in selections and load audio automatically
watch([selectedReciter, selectedSurahValue], ([reciterId, surahId]) => {
  if (reciterId && surahId) {
    loadNewAudio();
  }
});

const loadNewAudio = async () => {
  if (!selectedSurahValue.value || !selectedReciter.value) return;

  try {
    await loadAudio(selectedSurahValue.value, selectedReciter.value);

    // Update MediaSession metadata with Thai names
    const surah = getSurahById(selectedSurahValue.value);
    const reciter = getReciterById(selectedReciter.value);

    if (surah && reciter) {
      const surahDisplayName = `ซูเราะฮฺ ${surah.thaiName}`;
      updateMediaMetadata(surahDisplayName, reciter.name);
    }
  } catch (err) {
    console.error("Failed to load audio:", err);
  }
};

// Seek controls
const seekToClick = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percentage = (clickX / rect.width) * 100;
  seekToProgress(Math.max(0, Math.min(100, percentage)));
};

const volumeClick = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percentage = (clickX / rect.width) * 100;
  setVolume(Math.max(0, Math.min(100, percentage)));
};

const cycleRepeatMode = () => {
  const modes: Array<"none" | "one" | "all"> = ["none", "one", "all"];
  const currentMode = repeatMode.value || "none";
  const currentIndex = modes.indexOf(currentMode);
  const nextIndex = (currentIndex + 1) % modes.length;
  const nextMode = modes[nextIndex] as "none" | "one" | "all";
  repeatMode.value = nextMode;
};

// Helper methods
const getCurrentReciterName = () => {
  return currentReciterName.value;
};

const getCurrentSurahName = () => {
  return currentSurahName.value;
};

// Add missing method for large screen layout
const selectSurah = (surahId: number) => {
  selectedSurahValue.value = surahId;
};

// Add missing method for mobile layout (placeholder)
const formatSurahDuration = (surahId: number) => {
  // This would calculate actual duration - for now return placeholder
  return '3:23';
};

// Add missing method for mobile layout (placeholder) 
const toggleFavorite = (surahId: number) => {
  // This would handle favorite toggle logic
  console.log('Toggle favorite for surah:', surahId);
};

// Modal surah selection
const selectSurahFromModal = (surahId: number) => {
  selectedSurahValue.value = surahId;
  showSurahList.value = false;
};

// Initialize with default values
onMounted(() => {
  // Set default reciter (first available)
  watch(
    () => reciters.value,
    (newReciters) => {
      if (newReciters.length > 0 && !selectedReciter.value) {
        selectedReciter.value = newReciters[0]?.reciter_id;
      }
    },
    { immediate: true },
  );

  // Set default surah (Al-Fatiha)
  watch(
    () => surahs.value,
    (newSurahs) => {
      if (newSurahs.length > 0 && !selectedSurahValue.value) {
        selectedSurahValue.value = 1; // Al-Fatiha
      }
    },
    { immediate: true },
  );

  // Set up auto-play metadata update callback
  setAutoPlayMetadataCallback((surahId: number, reciterId: number) => {
    const surah = getSurahById(surahId);
    const reciter = getReciterById(reciterId);

    if (surah && reciter) {
      const surahDisplayName = `ซูเราะฮฺ ${surah.thaiName}`;
      updateMediaMetadata(surahDisplayName, reciter.name);
    }
  });
});

// Page metadata
useSeoMeta({
  title: "อัลกุรอาน - ฟัง & ใคร่ครวญ",
  description: "สัมผัสกับอัลกุรอานที่สูงส่งพร้อมการอ่านที่ไพเราะและคำแปล",
});
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
