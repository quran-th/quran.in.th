<template>
  <div>
    <!-- Mobile Layout -->
    <MobileLayout
      v-if="isMobile"
      :is-dark="isDark"
      :toggle-dark-mode="toggleDarkMode"
      :is-playing="isPlaying"
      :is-loading="isLoading"
      :current-time="currentTime"
      :duration="duration"
      :current-surah="currentSurah"
      :current-reciter="currentReciter"
      :is-first-verse="isFirstVerse"
      :is-last-verse="isLastVerse"
      :error="error"
      :is-buffering="isBuffering"
      :network-type="networkType"
      :shuffle-play="shufflePlay"
      :loop-play="loopPlay"
      :auto-play-next="autoPlayNext"
      :surahs="surahs"
      :available-reciters="availableReciters"
      :current-reciter-id="currentReciterId"
      :get-current-reciter-name="getCurrentReciterName"
      :correct-progress="correctProgress"
      :play-from-hero="playFromHero"
      :previous-verse="previousVerse"
      :next-verse="nextVerse"
      :seek-to-click="seekToClick"
      :select-and-play-surah-from-card="selectAndPlaySurahFromCard"
      :select-reciter="selectReciter"
      :toggle-shuffle-play="toggleShufflePlay"
      :toggle-loop-play="toggleLoopPlay"
      :toggle-auto-play-next="toggleAutoPlayNext"
      :get-current-surah-name="getCurrentSurahName"
      :get-current-surah-revelation-place="getCurrentSurahRevelationPlace"
      :get-current-surah-total-duration="getCurrentSurahTotalDuration"
      :format-time-with-hours="formatTimeWithHours"
      :format-duration="formatDuration"
    />

    <!-- Desktop Layout -->
    <DesktopLayout
      v-else
      :is-dark="isDark"
      :toggle-dark-mode="toggleDarkMode"
      :is-playing="isPlaying"
      :is-loading="isLoading"
      :current-time="currentTime"
      :duration="duration"
      :current-surah="currentSurah"
      :current-reciter="currentReciter"
      :is-first-verse="isFirstVerse"
      :is-last-verse="isLastVerse"
      :error="error"
      :is-buffering="isBuffering"
      :network-type="networkType"
      :shuffle-play="shufflePlay"
      :loop-play="loopPlay"
      :auto-play-next="autoPlayNext"
      :surahs="surahs"
      :current-reciter-id="currentReciterId"
      :get-current-reciter-name="getCurrentReciterName"
      :correct-progress="correctProgress"
      :is-large-player-mode="isLargePlayerMode"
      :play-from-hero="playFromHero"
      :previous-verse="previousVerse"
      :next-verse="nextVerse"
      :toggle-play="togglePlay"
      :seek-to-click="seekToClick"
      :select-and-play-surah="selectAndPlaySurah"
      :on-desktop-reciter-change="onDesktopReciterChange"
      :toggle-player-mode="togglePlayerMode"
      :toggle-shuffle-play="toggleShufflePlay"
      :toggle-loop-play="toggleLoopPlay"
      :toggle-auto-play-next="toggleAutoPlayNext"
      :get-current-surah-name="getCurrentSurahName"
      :get-current-surah-revelation-place="getCurrentSurahRevelationPlace"
      :get-current-surah-total-duration="getCurrentSurahTotalDuration"
      :format-time-with-hours="formatTimeWithHours"
      :format-duration="formatDuration"
    />
  </div>
</template>

<script setup lang="ts">
// Import layout components
import MobileLayout from '~/components/layouts/MobileLayout.vue'
import DesktopLayout from '~/components/layouts/DesktopLayout.vue'

// Composables
const { isMobile } = useResponsive()

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
  formatDuration,
  loadSurahs
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
  duration,
  currentSurah,
  currentReciter,
  isFirstVerse,
  isLastVerse,
  loadAudio,
  togglePlay,
  previousVerse,
  nextVerse,
  seekTo,
  seekToProgress,
  updateMediaMetadata,
  setAutoPlayMetadataCallback,
  error,
  // Enhanced streaming state
  isBuffering,
  networkType,
  // Player configuration
  shufflePlay,
  loopPlay,
  autoPlayNext,
  toggleShufflePlay,
  toggleLoopPlay,
  toggleAutoPlayNext
} = useAudioPlayer();

// Selection state - initialize with saved surah from localStorage
const savedSurah = currentSurah.value || 1; // Get saved surah or default to Al-Fatiha
const selectedSurahValue = ref<number | undefined>(savedSurah);
const currentReciterId = ref<number>(currentReciter.value || 2); // Use localStorage or default to reciter 2

console.log(`🎯 Initialized selectedSurahValue with: ${savedSurah} ${savedSurah === currentSurah.value ? '(from localStorage)' : '(default Al-Fatiha)'}`)

// Large screen player mode state
const isLargePlayerMode = ref(false);

// Toggle player mode function
const togglePlayerMode = () => {
  isLargePlayerMode.value = !isLargePlayerMode.value;
};

// Mobile reciter data
const availableReciters = ref([
  {
    id: "001",
    name: "บรรจง โซะมณี"
  },
  {
    id: "002",
    name: "อุมัร สุจิตวรรณศรี"
  }
]);

// Computed properties
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

// Seek controls with metadata duration
const seekToClick = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percentage = (clickX / rect.width) * 100;

  // Use metadata duration for accurate seeking
  const metadataDuration = getCurrentSurahDurationSeconds();
  if (metadataDuration > 0) {
    const seekTime = (percentage / 100) * metadataDuration;
    seekTo(Math.max(0, Math.min(metadataDuration, seekTime)));
  } else {
    // Fallback to original method
    seekToProgress(Math.max(0, Math.min(100, percentage)));
  }
};

// Helper methods
const getCurrentSurahName = () => {
  return currentSurahName.value;
};

// Get current surah revelation place in Thai
const getCurrentSurahRevelationPlace = () => {
  if (!currentSurah.value) return 'มักกิยะฮ์'; // Default to Makkah

  const surah = getSurahById(currentSurah.value);
  if (!surah) return 'มักกิยะฮ์';

  // Convert revelationType to Thai
  return surah.revelationType === 'Meccan' ? 'มักกิยะฮ์' : 'มะดะนียะฮ์';
};

// Get current surah total duration from metadata
const getCurrentSurahTotalDuration = () => {
  if (!currentSurah.value) return '0:00';

  const surah = getSurahById(currentSurah.value);
  if (!surah || !surah.duration) return '0:00';

  return formatDuration(surah.duration);
};

// Get current surah duration in seconds from metadata
const getCurrentSurahDurationSeconds = () => {
  if (!currentSurah.value) return 0;

  const surah = getSurahById(currentSurah.value);
  return surah?.duration || 0;
};

// Computed property for correct progress calculation using metadata duration
const correctProgress = computed(() => {
  const metadataDuration = getCurrentSurahDurationSeconds();
  return metadataDuration > 0 ? (currentTime.value / metadataDuration) * 100 : 0;
});

// Enhanced time formatter that supports hours
const formatTimeWithHours = (seconds: number): string => {
  if (!seconds || !isFinite(seconds)) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Auto-play method for large screen surah selection
const selectAndPlaySurah = async (surahId: number) => {
  selectedSurahValue.value = surahId;

  // Auto-play the selected surah
  await playSelectedAudio();
};

// Auto-play method for mobile surah cards
const selectAndPlaySurahFromCard = async (surahId: number) => {
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

  // If no surah selected or no audio loaded, use saved surah or default to Al-Fatiha
  if (!selectedSurahValue.value) {
    selectedSurahValue.value = currentSurah.value || 1; // Prioritize saved surah
    console.log(`🎵 playFromHero: Selected surah ${selectedSurahValue.value} ${currentSurah.value ? '(from localStorage)' : '(default Al-Fatiha)'}`);
  }

  // Auto-play the selected audio
  await playSelectedAudio();
};

// Restore saved session automatically (surah + position)
const restoreSavedSession = async () => {
  if (!currentSurah.value) {
    console.log('🔄 No saved session to restore');
    return false;
  }

  try {
    console.log(`🔄 Restoring saved session: Surah ${currentSurah.value} at ${currentTime.value || 0}s`);

    // Ensure the saved surah is selected
    if (selectedSurahValue.value !== currentSurah.value) {
      selectedSurahValue.value = currentSurah.value;
    }

    // Load the saved audio (this will automatically restore position via onload handler)
    await loadAudio(currentSurah.value, currentReciterId.value);

    // Update MediaSession metadata
    const surah = getSurahById(currentSurah.value);
    if (surah) {
      const surahDisplayName = `ซูเราะฮฺ ${surah.thaiName}`;
      const reciterName = getCurrentReciterName.value;
      updateMediaMetadata(surahDisplayName, `เสียงแปลโดย ${reciterName}`);
    }

    console.log(`✅ Session restored: Surah ${currentSurah.value} ready for playback`);
    return true;

  } catch (error) {
    console.error('❌ Failed to restore saved session:', error);
    return false;
  }
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

// Select reciter from tab (mobile)
const selectReciter = async (reciterId: string) => {
  const numericReciterId = parseInt(reciterId);
  await onReciterChanged(numericReciterId);
};

// Handle desktop reciter selection
const onDesktopReciterChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const reciterId = parseInt(target.value);
  await onReciterChanged(reciterId);
};

// Handle reciter change
const onReciterChanged = async (reciterId: number) => {
  console.log(`🎵 Reciter changing to ID: ${reciterId}`);

  // Update the composable state first - this will trigger reactive updates
  setSelectedReciter(reciterId);
  currentReciterId.value = reciterId;

  console.log(`🎵 Reciter changed to: ${getCurrentReciterName.value}`);

  // Load surahs for the new reciter
  console.log(`📚 Loading surahs for reciter ${reciterId}`);
  await loadSurahs(reciterId);
  console.log(`📚 Loaded ${surahs.value.length} surahs for reciter ${reciterId}`);

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

  // Watch for selectedReciter changes and load surahs accordingly
  watch(
    () => selectedReciter.value,
    async (newReciter) => {
      if (newReciter) {
        console.log(`🎵 Reciter initialized: ${newReciter.name} (ID: ${newReciter.reciter_id})`);
        // Load surahs for the selected reciter
        await loadSurahs(newReciter.reciter_id);
        console.log(`📚 Surahs loaded for reciter ${newReciter.reciter_id}`);
      }
    },
    { immediate: true }
  );

  // Auto-restore saved session when surahs are loaded
  watch(
    () => surahs.value,
    async (newSurahs) => {
      if (newSurahs.length > 0 && selectedSurahValue.value) {
        // Attempt to restore saved session automatically
        console.log(`📚 Surahs loaded (${newSurahs.length} items), attempting session restore...`);

        if (currentSurah.value && currentSurah.value !== 1) {
          // We have a saved session that's not Al-Fatiha, restore it
          const restored = await restoreSavedSession();
          if (restored) {
            console.log(`✅ Auto-restored saved session for Surah ${currentSurah.value}`);
          } else {
            console.log(`⚠️ Failed to restore saved session, will use current selection`);
          }
        } else {
          console.log(`🎯 Using default or selected surah: ${selectedSurahValue.value}`);
        }
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
  title: "อัลกุรอาน - ฟังกุรอานพร้อมความหมายภาษาไทย",
  description: "สัมผัสกับอัลกุรอานที่สูงส่งพร้อมการอ่านที่ไพเราะและคำแปล",
});
</script>