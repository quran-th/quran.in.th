<template>
  <div class="flex items-center">
    <!-- Speed Display Button -->
    <button
      ref="speedButton"
      class="w-12 h-12 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95"
      @click="toggleSpeedMenu"
    >
      <span class="text-md font-semibold">{{ currentSpeed }}×</span>
    </button>

    <!-- Speed Selection Menu -->
    <Teleport to="body">
      <div
        v-if="showSpeedMenu"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click="closeSpeedMenu"
      >
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl p-6 mx-4 w-full max-w-xs shadow-2xl transform transition-all duration-300"
          :class="showSpeedMenu ? 'scale-100 opacity-100' : 'scale-95 opacity-0'"
          @click.stop
        >
          <!-- Header -->
          <div class="text-center mb-6">
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-100">ความเร็วเสียง</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">เลือกความเร็วการเล่น</p>
          </div>

          <!-- Speed Options -->
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="speed in speedOptions"
              :key="speed"
              class="aspect-square rounded-xl flex items-center justify-center font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              :class="[
                currentSpeed === speed
                  ? 'bg-[rgb(191,179,147)] dark:bg-[rgb(245,162,116)] text-white dark:text-slate-800 shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              ]"
              @click="() => selectSpeed(speed)"
            >
              {{ speed }}×
            </button>
          </div>

          <!-- Current Speed Indicator -->
          <div class="mt-6 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-center">
            <p class="text-sm text-slate-600 dark:text-slate-400">ความเร็วปัจจุบัน</p>
            <p class="text-lg font-bold text-slate-800 dark:text-slate-100">{{ currentSpeed }}×</p>
          </div>

          <!-- Close Button -->
          <button
            class="w-full mt-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            @click="closeSpeedMenu"
          >
            ปิด
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
/**
 * PlaybackSpeedControl Component
 *
 * Provides playback speed control with:
 * - Speed display button showing current rate
 * - Modal popup with speed selection grid
 * - Smooth transitions and visual feedback
 * - Integration with audio player speed control
 */

// Props for current speed and speed change handler
interface Props {
  currentSpeed?: number
  onSpeedChange?: (speed: number) => void
}

const props = withDefaults(defineProps<Props>(), {
  currentSpeed: 1,
  onSpeedChange: () => {}
})

// Events
const emit = defineEmits<{
  speedChange: [speed: number]
}>()

// Local state
const showSpeedMenu = ref(false)
const speedButton = ref<HTMLElement>()

// Speed options
const speedOptions = [0.75, 1, 1.25]

// Reactive current speed from props
const currentSpeed = toRef(props, 'currentSpeed')

// Methods
const toggleSpeedMenu = () => {
  showSpeedMenu.value = !showSpeedMenu.value
}

const closeSpeedMenu = () => {
  showSpeedMenu.value = false
}

const selectSpeed = (speed: number) => {
  emit('speedChange', speed)
  props.onSpeedChange?.(speed)
  closeSpeedMenu()
}

// Close menu when clicking outside or pressing escape
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && showSpeedMenu.value) {
      closeSpeedMenu()
    }
  }

  document.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})

// Watch for speed menu state changes for animation
watch(showSpeedMenu, (newValue) => {
  if (newValue) {
    // Prevent body scroll when menu is open
    document.body.style.overflow = 'hidden'
  } else {
    // Restore body scroll when menu is closed
    document.body.style.overflow = ''
  }
})

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>
