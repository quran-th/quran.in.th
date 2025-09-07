<template>
  <div class="app-container">
    <!-- Header with Safe Area -->
    <header class="app-header safe-top">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1 class="text-heading">Quran</h1>
          <p class="text-caption">Listen & Reflect</p>
        </div>
        
        <!-- Profile/Settings -->
        <div class="flex items-center gap-3">
          <button class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <UIcon name="i-heroicons-user" class="w-4 h-4 text-white" />
          </button>
          
          <!-- Theme toggle -->
          <button @click="toggleDarkMode" class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <UIcon :name="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'" class="w-4 h-4" />
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
              <!-- Now Playing Header -->
              <div class="flex items-center justify-between mb-6">
                <div>
                  <p class="text-caption mb-1">Now Playing</p>
                  <p class="text-subheading font-semibold">{{ currentVerse.surahName }}</p>
                </div>
                <div class="flex gap-1">
                  <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                  <div class="w-2 h-2 bg-green-300 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
                </div>
              </div>

              <!-- Album Art / Hero Section -->
              <div class="hero-gradient p-8 mb-6 text-white relative overflow-hidden">
                <div class="absolute inset-0 bg-black/20"></div>
                <div class="relative z-10">
                  <!-- Verse Counter -->
                  <div class="flex items-center gap-2 mb-4">
                    <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <span class="text-xs font-semibold">{{ currentVerse.verseNumber }}</span>
                    </div>
                    <p class="text-sm opacity-90">of {{ totalVerses }}</p>
                  </div>
                  
                  <!-- Arabic Text -->
                  <Transition name="fade" mode="out-in">
                    <p 
                      :key="currentVerse.id"
                      class="arabic-text text-white mb-4" 
                      dir="rtl"
                    >
                      {{ currentVerse.arabic }}
                    </p>
                  </Transition>
                  
                  <!-- Decorative elements -->
                  <div class="absolute top-4 right-4 opacity-10">
                    <div class="w-16 h-16 rounded-full border-2 border-white"></div>
                  </div>
                  <div class="absolute bottom-4 left-4 opacity-10">
                    <div class="w-8 h-8 rounded-full bg-white"></div>
                  </div>
                </div>
              </div>

              <!-- Translation Section -->
              <Transition name="slide-up" mode="out-in">
                <div v-if="showTranslation" :key="currentVerse.id + '-translation'" class="mb-6">
                  <p class="text-body mb-2 italic">{{ currentVerse.transliteration }}</p>
                  <p class="text-subheading">{{ currentVerse.translation }}</p>
                </div>
              </Transition>

              <!-- Progress Bar -->
              <div class="mb-6">
                <div class="modern-slider">
                  <div 
                    class="modern-slider-progress" 
                    :style="{ width: progress + '%' }"
                  ></div>
                </div>
                <div class="flex justify-between text-caption mt-2">
                  <span>{{ formatTime(currentTime) }}</span>
                  <span>{{ formatTime(totalTime) }}</span>
                </div>
              </div>

              <!-- Player Controls -->
              <div class="flex items-center justify-center gap-6 mb-4">
                <button 
                  @click="previousVerse"
                  class="player-control"
                  :disabled="currentVerseIndex === 0"
                  :class="{ 'opacity-50': currentVerseIndex === 0 }"
                >
                  <UIcon name="i-heroicons-backward" class="w-5 h-5" />
                </button>
                
                <button 
                  @click="togglePlay"
                  class="player-control player-control-primary"
                >
                  <UIcon 
                    :name="isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'" 
                    class="w-6 h-6"
                    :class="{ 'ml-1': !isPlaying }"
                  />
                </button>
                
                <button 
                  @click="nextVerse"
                  class="player-control"
                  :disabled="currentVerseIndex === verses.length - 1"
                  :class="{ 'opacity-50': currentVerseIndex === verses.length - 1 }"
                >
                  <UIcon name="i-heroicons-forward" class="w-5 h-5" />
                </button>
              </div>

              <!-- Secondary Controls -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <button class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <UIcon name="i-heroicons-speaker-wave" class="w-4 h-4" />
                  </button>
                  <div class="w-16 modern-slider">
                    <div class="modern-slider-progress" :style="{ width: volume + '%' }"></div>
                  </div>
                </div>
                
                <button 
                  @click="showTranslation = !showTranslation"
                  class="flex items-center gap-2 px-3 py-1.5 rounded-full"
                  :class="showTranslation ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700'"
                >
                  <UIcon name="i-heroicons-language" class="w-4 h-4" />
                  <span class="text-caption">{{ showTranslation ? 'Hide' : 'Show' }}</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        <!-- Right Column - Controls & History -->
        <div class="controls-column">
          <!-- Quick Actions -->
          <section class="mb-8">
            <div class="grid grid-cols-1 gap-4">
              <!-- Reciter Selection -->
              <div class="modern-card p-4">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <UIcon name="i-heroicons-microphone" class="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p class="text-caption">Reciter</p>
                    <p class="text-body font-medium">{{ getCurrentReciterName() }}</p>
                  </div>
                </div>
                <USelect
                  v-model="selectedReciter"
                  :items="reciters"
                  placeholder="Choose Reciter"
                  size="sm"
                  class="w-full"
                  value-key="value"
                />
              </div>

              <!-- Surah Selection -->
              <div class="modern-card p-4">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <UIcon name="i-heroicons-book-open" class="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p class="text-caption">Surah</p>
                    <p class="text-body font-medium">{{ getCurrentSurahName() }}</p>
                  </div>
                </div>
                <USelect
                  v-model="selectedSurah"
                  :items="surahs"
                  placeholder="Choose Surah"
                  size="sm"
                  class="w-full"
                  value-key="value"
                />
              </div>
            </div>
          </section>

          <!-- Recent/Favorites -->
          <section>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-subheading font-semibold">Recent</h2>
              <button class="text-caption text-blue-600 dark:text-blue-400">View all</button>
            </div>
            
            <div class="space-y-3">
              <div 
                v-for="recent in recentSurahs" 
                :key="recent.id"
                class="modern-card p-4 flex items-center gap-4"
              >
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {{ recent.number }}
                </div>
                <div class="flex-1">
                  <p class="text-subheading font-medium">{{ recent.name }}</p>
                  <p class="text-caption">{{ recent.verses }} verses • {{ recent.type }}</p>
                </div>
                <button class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
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
          <span class="text-caption text-blue-600">Home</span>
        </button>
        
        <button class="flex flex-col items-center gap-1">
          <UIcon name="i-heroicons-book-open" class="w-5 h-5 text-gray-400" />
          <span class="text-caption text-gray-400">Browse</span>
        </button>
        
        <button class="flex flex-col items-center gap-1">
          <UIcon name="i-heroicons-heart" class="w-5 h-5 text-gray-400" />
          <span class="text-caption text-gray-400">Favorites</span>
        </button>
        
        <button class="flex flex-col items-center gap-1">
          <UIcon name="i-heroicons-user" class="w-5 h-5 text-gray-400" />
          <span class="text-caption text-gray-400">Profile</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Theme management
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const toggleDarkMode = () => {
  colorMode.value = isDark.value ? 'light' : 'dark'
}

// Player state
const isPlaying = ref(false)
const progress = ref(25)
const volume = ref(80)
const showTranslation = ref(true)
const currentTime = ref(45)
const totalTime = ref(180)
const currentVerseIndex = ref(0)

// Selection state
const selectedReciter = ref('mishary')
const selectedSurah = ref('al-fatiha')

// Data
const verses = ref([
  {
    id: 1,
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    transliteration: 'Bismillah ir-Rahman ir-Raheem',
    translation: 'In the name of Allah, the Most Gracious, the Most Merciful',
    surahNumber: 1,
    surahName: 'Al-Fatiha',
    verseNumber: 1
  },
  {
    id: 2,
    arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    transliteration: 'Alhamdu lillahi rabbil alameen',
    translation: 'All praise is due to Allah, Lord of all the worlds',
    surahNumber: 1,
    surahName: 'Al-Fatiha',
    verseNumber: 2
  },
  {
    id: 3,
    arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
    transliteration: 'Ar-Rahman ir-Raheem',
    translation: 'The Most Gracious, the Most Merciful',
    surahNumber: 1,
    surahName: 'Al-Fatiha',
    verseNumber: 3
  },
  {
    id: 4,
    arabic: 'مَالِكِ يَوْمِ الدِّينِ',
    transliteration: 'Maliki yawmid deen',
    translation: 'Master of the Day of Judgment',
    surahNumber: 1,
    surahName: 'Al-Fatiha',
    verseNumber: 4
  },
  {
    id: 5,
    arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    transliteration: 'Iyyaka na\'budu wa iyyaka nastain',
    translation: 'You alone we worship, and You alone we ask for help',
    surahNumber: 1,
    surahName: 'Al-Fatiha',
    verseNumber: 5
  }
])

const reciters = [
  { value: 'mishary', label: 'Mishary Alafasy' },
  { value: 'abdul-basit', label: 'Abdul Basit' },
  { value: 'maher', label: 'Maher Al Mueaqly' },
  { value: 'sudais', label: 'Abdul Rahman Al-Sudais' }
]

const surahs = [
  { value: 'al-fatiha', label: 'Al-Fatiha' },
  { value: 'al-baqarah', label: 'Al-Baqarah' },
  { value: 'ali-imran', label: 'Ali Imran' },
  { value: 'an-nisa', label: 'An-Nisa' }
]

const recentSurahs = ref([
  { id: 1, number: '1', name: 'Al-Fatiha', verses: 7, type: 'Meccan' },
  { id: 2, number: '2', name: 'Al-Baqarah', verses: 286, type: 'Medinan' },
  { id: 36, number: '36', name: 'Ya-Sin', verses: 83, type: 'Meccan' },
])

// Computed
const currentVerse = computed(() => verses.value[currentVerseIndex.value])
const totalVerses = computed(() => verses.value.length)

// Methods
const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

const previousVerse = () => {
  if (currentVerseIndex.value > 0) {
    currentVerseIndex.value--
  }
}

const nextVerse = () => {
  if (currentVerseIndex.value < verses.value.length - 1) {
    currentVerseIndex.value++
  }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const getCurrentReciterName = () => {
  return reciters.find(r => r.value === selectedReciter.value)?.label || 'Select Reciter'
}

const getCurrentSurahName = () => {
  return surahs.find(s => s.value === selectedSurah.value)?.label || 'Select Surah'
}

// Page metadata
useSeoMeta({
  title: 'Quran - Listen & Reflect',
  description: 'Experience the Noble Quran with beautiful recitations and translations'
})
</script>