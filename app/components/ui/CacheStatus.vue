<template>
  <UCard v-if="showCacheStatus" class="w-full max-w-md mx-auto">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Cache Status</h3>
        <UButton
          icon="i-heroicons-x-mark-20-solid"
          variant="ghost"
          @click="showCacheStatus = false"
        />
      </div>
    </template>

    <div class="space-y-4">
      <!-- Service Worker Status -->
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600 dark:text-gray-400">Service Worker</span>
        <UBadge
          :color="isServiceWorkerReady ? 'success' : 'error'"
          variant="soft"
        >
          {{ isServiceWorkerReady ? 'Active' : 'Inactive' }}
        </UBadge>
      </div>

      <!-- Cache Statistics -->
      <div v-if="cacheEfficiency" class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-400">Audio Cached</span>
          <span class="text-sm font-medium">{{ cacheEfficiency.audioCached }} files</span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-400">Static Cached</span>
          <span class="text-sm font-medium">{{ cacheEfficiency.staticCached }} files</span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-400">Total Entries</span>
          <span class="text-sm font-medium">{{ cacheEfficiency.totalCached }}</span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 dark:text-gray-400">Cache Version</span>
          <span class="text-xs font-mono text-gray-500">{{ cacheEfficiency.version }}</span>
        </div>
      </div>

      <!-- Cache Actions -->
      <div class="flex gap-2 pt-2 border-t dark:border-gray-700">
        <UButton
          size="sm"
          variant="outline"
          :loading="loading"
          @click="refreshStats"
        >
          Refresh
        </UButton>

        <UButton
          size="sm"
          variant="outline"
          color="warning"
          @click="updateServiceWorker"
        >
          Update SW
        </UButton>

        <UButton
          size="sm"
          variant="outline"
          color="error"
          @click="clearCaches"
        >
          Clear Cache
        </UButton>
      </div>

      <!-- Last Update -->
      <div v-if="lastUpdate" class="text-xs text-gray-500 text-center">
        Last updated: {{ formatDate(lastUpdate) }}
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false
})

const emit = defineEmits<Emits>()

// Use cache monitor composable
const {
  isServiceWorkerReady,
  lastUpdate,
  getCacheStats,
  updateServiceWorker,
  clearAllCaches,
  cacheEfficiency
} = useCacheMonitor()

// Local state
const loading = ref(false)

// Two-way binding for visibility
const showCacheStatus = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// Methods
const refreshStats = async () => {
  loading.value = true
  try {
    await getCacheStats()
  } catch (error) {
    console.error('Failed to refresh cache stats:', error)
  } finally {
    loading.value = false
  }
}

const clearCaches = async () => {
  if (confirm('Are you sure you want to clear all caches? This will remove all downloaded audio files.')) {
    await clearAllCaches()
  }
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}

// Auto-refresh stats when component becomes visible
watch(showCacheStatus, (visible) => {
  if (visible) {
    refreshStats()
  }
})
</script>
