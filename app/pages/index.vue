<template>
  <div class="app-container">
    <!-- Header with Safe Area -->
    <header class="app-header safe-top">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1 class="text-heading">อัลกุรอาน</h1>
          <p class="text-caption">ฟัง & ใคร่ครวญ</p>
        </div>

        <!-- Profile/Settings -->
        <div class="flex items-center gap-3">
          <button
            class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center"
          >
            <UIcon name="i-heroicons-user" class="w-4 h-4 text-white" />
          </button>

          <!-- Theme toggle -->
          <button
            @click="toggleDarkMode"
            class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
          >
            <UIcon
              :name="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
              class="w-4 h-4"
            />
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="desktop-layout">
        <!-- Left Column - Media Player -->
        <div class="media-column">
          <!-- Currently Playing Section -->
          <section class="responsive-mb-8">
            <div class="modern-card-elevated p-6">
              <!-- Verse Display Component -->
              <VerseDisplay
                :current-surah="currentSurah"
                :current-reciter="currentReciter"
                :current-verse-number="currentVerseNumber"
                :total-verses="totalVerses"
                :surah-name="currentSurahName"
                :is-loading="isLoading"
                :error="error"
                :show-translation="showTranslation"
                :current-verse="currentVerseData"
              />

              <!-- Progress Bar -->
              <div class="mb-6">
                <div class="modern-slider cursor-pointer" @click="seekToClick">
                  <div
                    class="modern-slider-progress"
                    :style="{ width: progress + '%' }"
                  ></div>
                </div>
                <div class="flex justify-between text-caption mt-2">
                  <span>{{ formatTime(currentTime) }}</span>
                  <span>{{ formatTime(duration) }}</span>
                </div>
              </div>

              <!-- Player Controls -->
              <div class="flex items-center justify-center gap-6 mb-4">
                <button
                  @click="previousVerse"
                  class="player-control"
                  :disabled="isFirstVerse"
                  :class="{
                    'opacity-50': isFirstVerse,
                  }"
                  title="Rewind 10 seconds"
                >
                  <UIcon name="i-heroicons-backward" class="w-5 h-5" />
                </button>

                <button
                  @click="togglePlay"
                  class="player-control player-control-primary"
                  :disabled="!currentSurah || !currentReciter"
                >
                  <UIcon
                    v-if="!isLoading"
                    :name="isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'"
                    class="w-6 h-6"
                    :class="{ 'ml-1': !isPlaying }"
                  />
                  <div
                    v-else
                    class="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent"
                  ></div>
                </button>

                <button
                  @click="nextVerse"
                  class="player-control"
                  :disabled="isLastVerse"
                  :class="{
                    'opacity-50': isLastVerse,
                  }"
                  title="Fast forward 10 seconds"
                >
                  <UIcon name="i-heroicons-forward" class="w-5 h-5" />
                </button>
              </div>

              <!-- Secondary Controls -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <button
                    @click="toggleMute"
                    class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                  >
                    <UIcon
                      :name="
                        isMuted
                          ? 'i-heroicons-speaker-x-mark'
                          : 'i-heroicons-speaker-wave'
                      "
                      class="w-4 h-4"
                    />
                  </button>
                  <div
                    class="w-16 modern-slider cursor-pointer"
                    @click="volumeClick"
                  >
                    <div
                      class="modern-slider-progress"
                      :style="{ width: volume + '%' }"
                    ></div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <!-- Repeat Mode -->
                  <button
                    @click="cycleRepeatMode"
                    class="flex items-center gap-1 px-2 py-1 rounded-full text-caption"
                    :class="
                      repeatMode !== 'none'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700'
                    "
                  >
                    <UIcon name="i-heroicons-arrow-path" class="w-3 h-3" />
                    <span v-if="repeatMode !== 'none'" class="text-xs">{{
                      repeatMode
                    }}</span>
                  </button>

                  <!-- Auto-play Toggle -->
                  <button
                    @click="autoPlay = !autoPlay"
                    class="flex items-center gap-1 px-2 py-1 rounded-full text-caption"
                    :class="
                      autoPlay
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700'
                    "
                  >
                    <UIcon name="i-heroicons-play-circle" class="w-3 h-3" />
                    <span class="text-xs">{{
                      autoPlay ? "เล่นอัตโนมัติ" : "เล่นอัตโนมัติ"
                    }}</span>
                  </button>

                  <!-- Translation Toggle - Hidden for now -->
                  <!-- <button
                    @click="showTranslation = !showTranslation"
                    class="flex items-center gap-2 px-3 py-1.5 rounded-full"
                    :class="
                      showTranslation
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700'
                    "
                  >
                    <UIcon name="i-heroicons-language" class="w-4 h-4" />
                    <span class="text-caption">{{
                      showTranslation ? "ซ่อน" : "แสดง"
                    }}</span>
                  </button> -->
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Right Column - Controls & History -->
        <div class="controls-column">
          <!-- Reciter Info Card -->
          <section class="mb-8">
            <ReciterInfoCard
              :reciter-name="getCurrentReciterName()"
              :translator-name="'อ.บรรจง โซ๊ะมณี'"
            />
          </section>

          <!-- Quick Actions -->
          <section class="mb-8">
            <div class="grid grid-cols-1 gap-4">
              <!-- Reciter Selection - Hidden for now -->
              <!-- <div class="modern-card p-4">
                <div class="flex items-center gap-3 mb-3">
                  <div
                    class="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center"
                  >
                    <UIcon
                      name="i-heroicons-microphone"
                      class="w-4 h-4 text-purple-600 dark:text-purple-400"
                    />
                  </div>
                  <div>
                    <p class="text-caption">นักอ่าน</p>
                    <p class="text-body font-medium">
                      {{ getCurrentReciterName() }}
                    </p>
                  </div>
                </div>
                <USelect
                  v-model="selectedReciter"
                  :items="reciterOptions"
                  placeholder="เลือกนักอ่าน"
                  size="sm"
                  class="w-full"
                  :loading="recitersLoading"
                />
              </div> -->

              <!-- Surah Selection -->
              <div class="modern-card p-4">
                <div class="flex items-center gap-3 mb-3">
                  <div
                    class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center"
                  >
                    <UIcon
                      name="i-heroicons-book-open"
                      class="w-4 h-4 text-green-600 dark:text-green-400"
                    />
                  </div>
                  <div>
                    <p class="text-caption">ซูเราะฮฺ</p>
                    <p class="text-body font-medium">
                      {{ getCurrentSurahName() }}
                    </p>
                  </div>
                </div>
                <USelect
                  v-model="selectedSurah"
                  :items="surahOptions"
                  placeholder="เลือกซูเราะฮฺ"
                  size="sm"
                  class="w-full"
                  :loading="surahsLoading"
                />
              </div>
            </div>
          </section>

          <!-- Recent/Favorites -->
          <section>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-subheading font-semibold">ล่าสุด</h2>
              <button class="text-caption text-blue-600 dark:text-blue-400">
                ดูทั้งหมด
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="recent in recentSurahs"
                :key="recent.id"
                class="modern-card p-4 flex items-center gap-4"
              >
                <div
                  class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold"
                >
                  {{ recent.number }}
                </div>
                <div class="flex-1">
                  <p class="text-subheading font-medium">
                    {{ recent.name }}
                  </p>
                  <p class="text-caption">
                    {{ recent.verses }} อายะฮฺ •
                    {{ recent.type }}
                  </p>
                </div>
                <button
                  class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                >
                  <UIcon name="i-heroicons-play" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <nav class="bottom-nav">
      <div class="flex items-center justify-around px-6">
        <button class="flex flex-col items-center gap-1">
          <UIcon name="i-heroicons-home" class="w-5 h-5 text-blue-600" />
          <span class="text-caption text-blue-600">หน้าแรก</span>
        </button>

        <button class="flex flex-col items-center gap-1">
          <UIcon name="i-heroicons-book-open" class="w-5 h-5 text-gray-400" />
          <span class="text-caption text-gray-400">เรียกดู</span>
        </button>

        <button class="flex flex-col items-center gap-1">
          <UIcon name="i-heroicons-heart" class="w-5 h-5 text-gray-400" />
          <span class="text-caption text-gray-400">รายการโปรด</span>
        </button>

        <button class="flex flex-col items-center gap-1">
          <UIcon name="i-heroicons-user" class="w-5 h-5 text-gray-400" />
          <span class="text-caption text-gray-400">โปรไฟล์</span>
        </button>
      </div>
    </nav>
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
const selectedSurah = ref<number | undefined>(undefined);

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
watch([selectedReciter, selectedSurah], ([reciterId, surahId]) => {
  if (reciterId && surahId) {
    loadNewAudio();
  }
});

const loadNewAudio = async () => {
  if (!selectedSurah.value || !selectedReciter.value) return;

  try {
    await loadAudio(selectedSurah.value, selectedReciter.value);

    // Update MediaSession metadata with Thai names
    const surah = getSurahById(selectedSurah.value);
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
      if (newSurahs.length > 0 && !selectedSurah.value) {
        selectedSurah.value = 1; // Al-Fatiha
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
