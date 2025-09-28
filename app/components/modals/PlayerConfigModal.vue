<template>
  <!-- Player Configuration Modal -->
  <div
v-if="isOpen" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
    @click="$emit('close')">
    <div
class="w-full bg-white dark:bg-slate-800 rounded-t-3xl max-h-[80vh] flex flex-col" :class="{
      'animate-slide-up': isOpen,
    }" @click.stop>
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-100">ตั้งค่าเครื่องเล่น</h3>
        <button
class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
          @click="$emit('close')">
          <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      <!-- Configuration Options -->
      <div class="flex-1 p-6">
        <div class="space-y-4">
          <!-- Shuffle Play Option -->
          <div
class="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-slate-700"
            :class="{ 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800': shufflePlay }"
            @click="toggleShufflePlay">
            <div class="flex items-center space-x-4">
              <div
class="w-12 h-12 rounded-full flex items-center justify-center"
                :class="shufflePlay
                  ? 'bg-indigo-100 dark:bg-indigo-900/50'
                  : 'bg-gray-100 dark:bg-gray-700'">
                <UIcon
name="i-lucide-shuffle" class="w-6 h-6"
                  :class="shufflePlay
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400'" />
              </div>
              <div>
                <h4 class="font-medium text-slate-900 dark:text-slate-100">เล่นแบบสุ่ม</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400">เล่นซูเราะฮฺแบบสุ่มลำดับ</p>
              </div>
            </div>
            <div class="flex items-center">
              <div
class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                :class="shufflePlay
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'border-gray-300 dark:border-gray-600'">
                <UIcon v-if="shufflePlay" name="i-heroicons-check" class="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <!-- Loop Play Option -->
          <div
class="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-slate-700"
            :class="{ 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800': loopPlay }"
            @click="toggleLoopPlay">
            <div class="flex items-center space-x-4">
              <div
class="w-12 h-12 rounded-full flex items-center justify-center"
                :class="loopPlay
                  ? 'bg-indigo-100 dark:bg-indigo-900/50'
                  : 'bg-gray-100 dark:bg-gray-700'">
                <UIcon
name="i-heroicons-arrow-path-rounded-square" class="w-6 h-6"
                  :class="loopPlay
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400'" />
              </div>
              <div>
                <h4 class="font-medium text-slate-900 dark:text-slate-100">เล่นซ้ำ</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400">เล่นซูเราะฮฺปัจจุบันซ้ำ</p>
              </div>
            </div>
            <div class="flex items-center">
              <div
class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                :class="loopPlay
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'border-gray-300 dark:border-gray-600'">
                <UIcon v-if="loopPlay" name="i-heroicons-check" class="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <!-- Auto Play Next Option -->
          <div
class="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-slate-700"
            :class="{ 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800': autoPlayNext }"
            @click="toggleAutoPlayNext">
            <div class="flex items-center space-x-4">
              <div
class="w-12 h-12 rounded-full flex items-center justify-center"
                :class="autoPlayNext
                  ? 'bg-indigo-100 dark:bg-indigo-900/50'
                  : 'bg-gray-100 dark:bg-gray-700'">
                <UIcon
name="i-lucide-infinity" class="w-6 h-6"
                  :class="autoPlayNext
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400'" />
              </div>
              <div>
                <h4 class="font-medium text-slate-900 dark:text-slate-100">เล่นต่อเนื่อง</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400">เล่นซูเราะฮฺถัดไปโดยอัตโนมัติ</p>
              </div>
            </div>
            <div class="flex items-center">
              <div
class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                :class="autoPlayNext
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'border-gray-300 dark:border-gray-600'">
                <UIcon v-if="autoPlayNext" name="i-heroicons-check" class="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props for modal state and configuration
interface Props {
  isOpen: boolean
  shufflePlay: boolean
  loopPlay: boolean
  autoPlayNext: boolean
  toggleShufflePlay: () => void
  toggleLoopPlay: () => void
  toggleAutoPlayNext: () => void
}

defineProps<Props>()

// Events
defineEmits<{
  close: []
}>()
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