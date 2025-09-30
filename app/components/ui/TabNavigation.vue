<template>
  <!-- Tab Navigation -->
  <div class="px-0 mb-6 flex-shrink-0">
    <div class="flex bg-white/50 dark:bg-slate-700/50 rounded-lg p-1 backdrop-blur-sm">
      <button
class="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all"
        :class="activeTab === 'playing' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-600 dark:text-slate-400'"
        @click="$emit('updateTab', 'playing')">
        ซูเราะฮ์
      </button>
      <button
class="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all"
        :class="activeTab === 'reciters' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-600 dark:text-slate-400'"
        @click="$emit('updateTab', 'reciters')">
        เลือกผู้อ่าน
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props for tab navigation
interface Props {
  activeTab: string
}

defineProps<Props>()

// Events
defineEmits<{
  updateTab: [tab: string]
}>()
</script>
