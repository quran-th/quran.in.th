<template>
  <div>
    <!-- Mobile Layout -->
    <div class="md:hidden min-h-screen bg-[#e7e8f3] dark:bg-slate-800 relative">
      <!-- Mobile Header -->
      <header class="p-4 pt-12 safe-top">
        <div class="flex items-center justify-between mb-2">
          <div>
            <p class="text-sm text-slate-600 dark:text-slate-400">กำลังฟัง</p>
            <h1 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {{ getCurrentSurahName() }}
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
              <circle
cx="100" cy="100" r="90" stroke="rgba(100, 116, 139, 0.3)" stroke-width="4" fill="none"
                class="dark:stroke-slate-600" />
              <!-- Progress Ring -->
              <circle
cx="100" cy="100" r="90" stroke="#6366f1" stroke-width="4" fill="none"
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
              <button
                class="relative z-10 w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95"
                :disabled="!currentSurah || !currentReciter" 
                :class="{ 'bg-red-500': error }"
                @click="togglePlay()">
                <UIcon
v-if="!isLoading && !error" :name="isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'" class="w-6 h-6"
                  :class="{ 'ml-1': !isPlaying }" />
                <UIcon v-else-if="error" name="i-heroicons-exclamation-triangle" class="w-6 h-6" />
                <div v-else class="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
            เสียงแปลโดย {{ getCurrentReciterName }}
          </p>
          
          <!-- Enhanced Status Indicator -->
          <div v-if="error" class="mt-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
            <p class="text-red-600 dark:text-red-400 text-sm">
              เกิดข้อผิดพลาด - กรุณาลองใหม่
            </p>
          </div>
          
          <div v-else-if="isBuffering || isLoading" class="mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <p class="text-blue-600 dark:text-blue-400 text-sm">
              กำลังโหลดเสียง... {{ Math.round(loadProgress) }}%
              <span v-if="networkType === 'cellular'" class="ml-1">(📱 เซลลูลาร์)</span>
            </p>
          </div>
        </div>

        <!-- Primary Controls -->
        <div class="flex items-center justify-center gap-8 mb-6">
          <button
            class="w-12 h-12 rounded-full bg-white/80 dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-300 backdrop-blur-sm shadow-sm"
            :disabled="isFirstVerse" :class="{ 'opacity-50': isFirstVerse }" @click="previousVerse">
            <UIcon name="i-heroicons-backward" class="w-6 h-6" />
          </button>

          <button
            class="w-12 h-12 rounded-full bg-white/80 dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-300 backdrop-blur-sm shadow-sm"
            :disabled="isLastVerse" :class="{ 'opacity-50': isLastVerse }" @click="nextVerse">
            <UIcon name="i-heroicons-forward" class="w-6 h-6" />
          </button>

          <button
            class="w-12 h-12 rounded-full bg-white/80 dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-300 backdrop-blur-sm shadow-sm"
            @click="showSurahList = true">
            <UIcon name="i-heroicons-list-bullet" class="w-6 h-6" />
          </button>
        </div>

        <!-- Mobile Reciter Selector -->
        <div class="flex justify-center mb-6">
          <ReciterSelector 
            variant="mobile" 
            button-class="w-full max-w-xs bg-white/80 dark:bg-slate-700 backdrop-blur-sm shadow-sm"
            @reciter-changed="onReciterChanged" 
          />
        </div>

        <!-- Secondary Controls -->
        <div class="flex items-center justify-center gap-8">
          <button
            class="w-10 h-10 rounded-full bg-white/60 dark:bg-slate-700/70 flex items-center justify-center text-slate-700 dark:text-slate-400 backdrop-blur-sm"
            @click="cycleRepeatMode">
            <UIcon name="i-heroicons-arrow-path" class="w-5 h-5" />
          </button>

          <button
            class="w-10 h-10 rounded-full bg-white/60 dark:bg-slate-700/70 flex items-center justify-center text-slate-700 dark:text-slate-400 backdrop-blur-sm">
            <UIcon name="i-heroicons-plus" class="w-5 h-5" />
          </button>

          <button
            class="w-10 h-10 rounded-full bg-white/60 dark:bg-slate-700/70 flex items-center justify-center text-slate-700 dark:text-slate-400 backdrop-blur-sm"
            @click="toggleMute">
            <UIcon name="i-heroicons-adjustments-horizontal" class="w-5 h-5" />
          </button>

          <button
            class="w-10 h-10 rounded-full bg-white/60 dark:bg-slate-700/70 flex items-center justify-center text-slate-700 dark:text-slate-400 backdrop-blur-sm">
            <UIcon name="i-heroicons-arrow-path-rounded-square" class="w-5 h-5" />
          </button>
        </div>
      </main>

      <!-- Surah Selection Modal -->
      <div
v-if="showSurahList" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
        @click="showSurahList = false">
        <div
class="w-full bg-white dark:bg-slate-800 rounded-t-3xl max-h-[80vh] flex flex-col" :class="{
          'animate-slide-up': showSurahList,
        }" @click.stop>
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-100">เลือกซูเราะห์</h3>
            <button
class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
              @click="showSurahList = false">
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
              <div
v-for="surah in surahs" :key="surah.id"
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
                      <UIcon v-else name="i-heroicons-speaker-wave" class="w-5 h-5 text-slate-800" />
                    </div>
                  </div>

                  <!-- Surah Name -->
                  <div class="col-span-10">
                    <div class="text-base font-medium text-slate-900 dark:text-slate-100 mb-1">
                      {{ surah.thaiName }}
                    </div>
                    <div class="text-sm text-slate-500 dark:text-slate-400">
                      {{ surah.englishName }} • {{ surah.versesCount }} อายะห์ •
                      <span v-if="surah.duration">{{ formatDuration(surah.duration) }} • </span>
                      <span
class="inline-flex px-2 py-0.5 text-xs rounded-full" :class="surah.revelationType === 'Meccan'
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
    <div class="hidden md:block min-h-screen bg-slate-50 dark:bg-slate-900 ">

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
              <button
class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
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
                      :disabled="isLoading" :class="{ 'bg-red-600 hover:bg-red-700': error }"
                      @click="playFromHero">
                      <UIcon
v-if="!isLoading && !error" :name="isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'" class="w-5 h-5"
                        :class="{ 'ml-0.5': !isPlaying }" />
                      <UIcon v-else-if="error" name="i-heroicons-exclamation-triangle" class="w-5 h-5" />
                      <div v-else class="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
                <!-- Desktop Reciter Selector -->
                <ReciterSelector 
                  variant="desktop" 
                  button-class=""
                  @reciter-changed="onReciterChanged" 
                />
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
                <div
v-for="(surah, index) in surahs" :key="surah.id"
                  class="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                  @click="selectAndPlaySurah(surah.id)">
                  <div class="grid grid-cols-12 gap-4 items-center">
                    <!-- Number -->
                    <div class="col-span-1">
                      <div class="flex items-center">
                        <span v-if="currentSurah !== surah.id" class="text-slate-400 text-sm">{{ String(index +
                          1).padStart(2, '0') }}</span>
                        <UIcon
v-else name="i-heroicons-speaker-wave"
                          class="w-4 h-4 text-slate-800 dark:text-slate-100" />
                      </div>
                    </div>

                    <!-- Title -->
                    <div class="col-span-3">
                      <p class="font-medium text-slate-900 dark:text-slate-100">{{ surah.thaiName }}</p>
                    </div>

                    <div class="col-span-1">
                      <span
class="inline-flex px-2 py-0.5 text-xs rounded-full" :class="surah.revelationType === 'Meccan'
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
      </main>

      <!-- Mini Player (Fixed Bottom) -->
      <div class="fixed bottom-0 left-0 right-0 bg-slate-900 dark:bg-slate-950 text-white px-6 py-4">
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
            <span class="text-white/60 text-sm">{{ formatTime(currentTime) || '-3:15' }}</span>
            <button
              class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              @click="togglePlay">
              <UIcon
:name="isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'" class="w-4 h-4"
                :class="{ 'ml-0.5': !isPlaying }" />
            </button>

            <!-- Progress Bar -->
            <div class="w-32 h-1 bg-white/20 rounded-full relative cursor-pointer" @click="seekToClick">
              <div
class="h-full bg-white rounded-full transition-all duration-100"
                :style="{ width: progress + '%' }" />
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
  surahs,
  getSurahById,
  formatDuration
} = useSurahs();

const {
  selectedReciter,
  getCurrentReciterName,
  setSelectedReciter
} = useReciters();

// Audio player - Native HTML5 audio for reliable streaming
const {
  isPlaying,
  isLoading,
  currentTime,
  currentSurah,
  currentReciter,
  isFirstVerse,
  isLastVerse,
  progress,
  repeatMode,
  loadAudio,
  togglePlay,
  previousVerse,
  nextVerse,
  seekToProgress,
  toggleMute,
  formatTime,
  updateMediaMetadata,
  setAutoPlayMetadataCallback,
  error,
  // Enhanced streaming state
  isBuffering,
  loadProgress,
  networkType
} = useAudioPlayer();

// Selection state  
const selectedSurahValue = ref<number | undefined>(undefined);
const currentReciterId = ref<number>(1); // Default to first reciter

// Modal state
const showSurahList = ref(false);

// Computed properties - removed unused computed values

const currentSurahName = computed(() => {
  if (!currentSurah.value) return "เลือกซูเราะฮฺ";
  const surah = getSurahById(currentSurah.value);
  return surah ? `${surah.id}. ${surah.thaiName}` : "ไม่ทราบซูเราะฮฺ";
});

// Watch for changes in surah selection and load audio automatically  
watch(selectedSurahValue, (surahId) => {
  if (surahId) {
    loadNewAudio();
  }
});

const loadNewAudio = async () => {
  if (!selectedSurahValue.value) return;

  try {
    // Use current selected reciter
    await loadAudio(selectedSurahValue.value, currentReciterId.value);

    // Update MediaSession metadata with Thai names
    const surah = getSurahById(selectedSurahValue.value);

    if (surah) {
      const surahDisplayName = `ซูเราะฮฺ ${surah.thaiName}`;
      const reciterName = getCurrentReciterName.value;
      updateMediaMetadata(surahDisplayName, `เสียงแปลโดย ${reciterName}`);
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

// Removed unused volumeClick function

const cycleRepeatMode = () => {
  const modes: Array<"none" | "one" | "all"> = ["none", "one", "all"];
  const currentMode = repeatMode.value || "none";
  const currentIndex = modes.indexOf(currentMode);
  const nextIndex = (currentIndex + 1) % modes.length;
  const nextMode = modes[nextIndex] as "none" | "one" | "all";
  repeatMode.value = nextMode;
};

// Helper methods
const getCurrentSurahName = () => {
  return currentSurahName.value;
};

// Auto-play method for large screen surah selection
const selectAndPlaySurah = async (surahId: number) => {
  selectedSurahValue.value = surahId;

  // Auto-play the selected surah
  await playSelectedAudio();
};

// Play from hero button - toggle play/pause or start new audio
const playFromHero = async () => {
  // If audio is currently playing, just toggle pause
  if (isPlaying.value) {
    await togglePlay();
    return;
  }

  // If audio is paused but loaded, resume playing
  if (currentSurah.value && !isPlaying.value) {
    await togglePlay();
    return;
  }

  // If no surah selected or no audio loaded, default to first surah and load
  if (!selectedSurahValue.value) {
    selectedSurahValue.value = 1; // Al-Fatiha
  }

  // Auto-play the selected audio
  await playSelectedAudio();
};

// Helper method to play selected audio with auto-play
const playSelectedAudio = async () => {
  if (!selectedSurahValue.value) return;

  try {
    console.log(`🎵 Attempting to load Surah ${selectedSurahValue.value} with reciter ${currentReciterId.value}`);

    // Load the audio with current selected reciter
    await loadAudio(selectedSurahValue.value, currentReciterId.value);

    // Small delay to ensure audio is fully loaded
    await new Promise(resolve => setTimeout(resolve, 100));

    // Auto-play immediately after loading
    console.log('🎵 Audio loaded, attempting to play...');
    await togglePlay();

    // Update MediaSession metadata
    const surah = getSurahById(selectedSurahValue.value);

    if (surah) {
      const surahDisplayName = `ซูเราะฮฺ ${surah.thaiName}`;
      const reciterName = getCurrentReciterName.value;
      updateMediaMetadata(surahDisplayName, `เสียงแปลโดย ${reciterName}`);
      console.log(`🎵 Now playing: ${surahDisplayName} by ${reciterName}`);
    }
  } catch (err) {
    console.error("❌ Failed to load and play audio:", err);

    // Show user-friendly error message
    if (err instanceof Error) {
      if (err.message.includes('not available')) {
        console.warn('⚠️ Audio file not found, this is expected in development without audio files');
      } else if (err.message.includes('play')) {
        console.warn('⚠️ Auto-play blocked by browser policy. User interaction required.');
      }
    }
  }
};

// Removed unused placeholder functions

// Modal surah selection
const selectSurahFromModal = (surahId: number) => {
  selectedSurahValue.value = surahId;
  showSurahList.value = false;
};

// Handle reciter change
const onReciterChanged = async (reciterId: number) => {
  console.log(`🎵 Reciter changing to ID: ${reciterId}`);
  
  // Update the composable state first - this will trigger reactive updates
  setSelectedReciter(reciterId);
  currentReciterId.value = reciterId;
  
  console.log(`🎵 Reciter changed to: ${getCurrentReciterName.value}`);
  
  // If audio is currently loaded, reload and auto-play with new reciter
  if (selectedSurahValue.value) {
    console.log(`🎵 Reloading audio with new reciter for Surah ${selectedSurahValue.value}`);
    await playSelectedAudio(); // This will reload and auto-play with new reciter
  } else if (currentSurah.value) {
    // If no selectedSurahValue but we have currentSurah, use that
    selectedSurahValue.value = currentSurah.value;
    console.log(`🎵 Reloading current Surah ${currentSurah.value} with new reciter`);
    await playSelectedAudio();
  }
};

// Initialize with default values
onMounted(() => {
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

  // Watch for reciter changes and update current reciter ID
  watch(selectedReciter, (newReciter, oldReciter) => {
    if (newReciter) {
      currentReciterId.value = newReciter.reciter_id;
      
      // Update metadata for current playing surah when reciter changes
      if (currentSurah.value) {
        const surah = getSurahById(currentSurah.value);
        if (surah) {
          const surahDisplayName = `ซูเราะฮฺ ${surah.thaiName}`;
          const reciterName = getCurrentReciterName.value;
          updateMediaMetadata(surahDisplayName, `เสียงแปลโดย ${reciterName}`);
          console.log(`🎵 Watch triggered: Updated metadata for ${surahDisplayName} by ${reciterName}`);
        }
      }
      
      // Log reciter change for debugging
      if (oldReciter && newReciter.reciter_id !== oldReciter.reciter_id) {
        console.log(`🎵 Watch: Reciter changed from ${oldReciter.name} to ${newReciter.name}`);
      }
    }
  }, { immediate: true });

  // Set up auto-play metadata update callback
  setAutoPlayMetadataCallback((surahId: number) => {
    const surah = getSurahById(surahId);

    if (surah) {
      const surahDisplayName = `ซูเราะฮฺ ${surah.thaiName}`;
      const reciterName = getCurrentReciterName.value;
      updateMediaMetadata(surahDisplayName, `เสียงแปลโดย ${reciterName}`);
      console.log(`🎵 Auto-play callback: Updated metadata for ${surahDisplayName} by ${reciterName}`);
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
