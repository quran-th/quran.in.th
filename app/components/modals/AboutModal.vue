<template>
  <!-- About Modal -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    @click="$emit('close')"
  >
    <div
      class="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden"
      :class="{
        'animate-fade-in': isOpen,
      }"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-100">เกี่ยวกับแอป</h3>
        <button
          class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          @click="$emit('close')"
        >
          <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      <!-- Modal Content -->
      <div class="p-6">
        <div class="text-center space-y-4">
          <!-- App Icon/Logo -->
          <div class="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <UIcon name="i-heroicons-book-open" class="w-8 h-8 text-white" />
          </div>

          <!-- App Title -->
          <div>
            <h4 class="text-2xl font-bold text-slate-900 dark:text-slate-100">อัลกุรอาน</h4>
            <p class="text-sm text-slate-600 dark:text-slate-400">พร้อมความหมายภาษาไทย</p>
          </div>

          <!-- Build Information -->
          <div class="space-y-3">
            <div class="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-slate-700 dark:text-slate-300">เวอร์ชัน</span>
                  <span class="text-sm text-slate-600 dark:text-slate-400">{{ appVersion }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-slate-700 dark:text-slate-300">อัพเดทเมื่อ</span>
                  <span class="text-sm text-slate-600 dark:text-slate-400">{{ formattedBuildTime }}</span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                พบปัญหาในการใช้งานหรือมีข้อเสนอแนะ <br >
                ติดต่อได้ที่ Facebook Page: <br >
                <a
                href="https://www.facebook.com/quran.in.th"
                target="_blank"
                rel="noopener noreferrer"
                class="text-[rgb(173,162,131)]"
                >
                facebook.com/quran.in.th
                </a>
            </p>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-6 pb-6">
        <button
          class="w-full bg-[rgb(191,179,147)] hover:bg-[rgb(173,162,131)] text-white font-medium py-3 px-4 rounded-lg transition-colors active:scale-95"
          @click="$emit('close')"
        >
          ปิด
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * AboutModal Component
 *
 * Modal displaying app information including:
 * - App title and description
 * - Version from package.json
 * - Build timestamp formatted in Thai locale
 */

// Props
interface Props {
  isOpen: boolean
}

defineProps<Props>()

// Events
defineEmits<{
  close: []
}>()

// Get build information from runtime config
const config = useRuntimeConfig()
const appVersion = config.public.appVersion
const buildTime = config.public.buildTime

// Format build time in Thai locale
const formattedBuildTime = computed(() => {
  const date = new Date(buildTime)
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Bangkok'
  }).format(date)
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
</style>
