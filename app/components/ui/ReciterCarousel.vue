<template>
  <div class="mb-6">
    <!-- Horizontal Scrollable Carousel -->
    <div class="relative">
      <div
        ref="carouselContainer"
        class="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 px-1"
        style="scroll-behavior: smooth;"
        @scroll="updateActiveIndex"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <div
          v-for="(reciter, index) in availableReciters"
          :key="reciter.id"
          class="flex-shrink-0 snap-center cursor-pointer transition-all duration-300"
          :class="[
            'w-full max-w-[280px] h-32',
            currentReciterId === parseInt(reciter.id)
              ? 'transform scale-105'
              : 'opacity-80 hover:opacity-95'
          ]"
          @click="selectReciterAndScroll(reciter.id, index)"
        >
          <!-- Reciter Card -->
          <div
            class="w-full h-full rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden"
            :class="[
              currentReciterId === parseInt(reciter.id)
                ? 'bg-gradient-to-br from-[rgb(191,179,147)] to-[rgb(171,159,127)] dark:from-[rgb(245,162,116)] dark:to-[rgb(225,142,96)] shadow-md border-2 border-white/20'
                : 'bg-white/90 dark:bg-slate-700/90 shadow-lg border border-slate-200/50 dark:border-slate-600/50'
            ]"
          >
            <!-- Background Pattern -->
            <div
              v-if="currentReciterId === parseInt(reciter.id)"
              class="absolute inset-0 opacity-10"
              style="background-image: radial-gradient(circle at 50% 50%, white 1px, transparent 1px); background-size: 20px 20px;"
            />

            <!-- Reciter Icon -->
            <div
              class="w-12 h-12 flex items-center justify-center mb-3 transition-all duration-300 relative z-10"
              :class="[
                currentReciterId === parseInt(reciter.id)
                  ? 'text-white dark:text-slate-800'
                  : 'text-slate-600 dark:text-slate-300'
              ]"
            >
              <UIcon name="i-heroicons-microphone" class="w-6 h-6" />
            </div>

            <!-- Reciter Name -->
            <span
              class="text-base font-semibold leading-tight transition-all duration-300 relative z-10 px-2"
              :class="[
                currentReciterId === parseInt(reciter.id)
                  ? 'text-white dark:text-slate-800 drop-shadow-sm'
                  : 'text-slate-700 dark:text-slate-200'
              ]"
            >
              {{ reciter.name }}
            </span>

            <!-- Active Indicator -->
            <div
              v-if="currentReciterId === parseInt(reciter.id)"
              class="flex items-center mt-2 relative z-10"
            >
              <div class="w-3 h-3 bg-white dark:bg-slate-800 rounded-full mr-2 transition-all duration-300 shadow-sm" />
              <span class="text-xs text-white/90 dark:text-slate-800/90 font-medium">กำลังใช้งาน</span>
            </div>

            <!-- Tap indicator for non-active cards -->
            <div
              v-else
              class="mt-2 relative z-10"
            >
              <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">แตะเพื่อเลือก</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll Indicators -->
      <div class="flex justify-center mt-4 gap-1.5">
        <div
          v-for="(reciter, index) in availableReciters"
          :key="`indicator-${reciter.id}`"
          class="transition-all duration-300 cursor-pointer"
          :class="[
            currentReciterId === parseInt(reciter.id)
              ? 'w-6 h-2 bg-[rgb(191,179,147)] dark:bg-[rgb(245,162,116)] rounded-full'
              : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full hover:bg-slate-400 dark:hover:bg-slate-500'
          ]"
          @click="selectReciterAndScroll(reciter.id, index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ReciterCarousel Component
 *
 * A horizontal scrollable carousel for selecting reciters.
 * Features smooth scrolling, snap alignment, and visual indicators.
 */

// Use integrated app composable
const {
  availableReciters,
  currentReciterId,
  selectReciter
} = useAppIntegrated()

// Template refs
const carouselContainer = ref<HTMLElement>()

// Local state
const activeIndex = ref(0)
const touchStartX = ref(0)
const isDragging = ref(false)

// Methods
const selectReciterAndScroll = (reciterId: string, index: number) => {
  selectReciter(reciterId)
  scrollToReciter(index)
}

const scrollToReciter = (index: number) => {
  if (carouselContainer.value) {
    const container = carouselContainer.value
    const cardWidth = 288 // 280px width + 8px gap (4px on each side)
    const scrollPosition = index * cardWidth - (container.clientWidth / 2) + (cardWidth / 2)

    container.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior: 'smooth'
    })
  }
}

const updateActiveIndex = () => {
  if (carouselContainer.value && !isDragging.value) {
    const container = carouselContainer.value
    const cardWidth = 288
    const scrollLeft = container.scrollLeft
    const centerPosition = scrollLeft + (container.clientWidth / 2)
    const newIndex = Math.round(centerPosition / cardWidth)
    const clampedIndex = Math.max(0, Math.min(newIndex, availableReciters.value.length - 1))

    // Only update reciter if the index has actually changed
    if (activeIndex.value !== clampedIndex) {
      activeIndex.value = clampedIndex
      const newReciter = availableReciters.value[clampedIndex]
      if (newReciter && currentReciterId.value !== parseInt(newReciter.id)) {
        selectReciter(newReciter.id)
      }
    }
  }
}

// Touch handling methods
const handleTouchStart = (event: TouchEvent) => {
  if (event.touches?.[0]) {
    touchStartX.value = event.touches[0].clientX
  }
  isDragging.value = true
}

const handleTouchMove = (_event: TouchEvent) => {
  if (!isDragging.value) return
  // Allow natural touch scrolling
}

const handleTouchEnd = (_event: TouchEvent) => {
  isDragging.value = false
  // Delay the active index update to allow scroll to settle
  setTimeout(() => {
    updateActiveIndex()
  }, 100)
}

// Auto-scroll to current reciter on mount
onMounted(() => {
  const currentIndex = availableReciters.value.findIndex(
    reciter => parseInt(reciter.id) === currentReciterId.value
  )
  if (currentIndex !== -1) {
    nextTick(() => {
      scrollToReciter(currentIndex)
    })
  }
})

// Watch for reciter changes to auto-scroll
watch(currentReciterId, (newReciterId) => {
  const currentIndex = availableReciters.value.findIndex(
    reciter => parseInt(reciter.id) === newReciterId
  )
  if (currentIndex !== -1) {
    scrollToReciter(currentIndex)
  }
})
</script>

<style scoped>
/* Hide scrollbar for webkit browsers */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
