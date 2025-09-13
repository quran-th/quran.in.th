<template>
  <div class="reciter-selector">
    <!-- This is now handled within the UModal default slot -->

    <!-- Reciter Selection Button -->
    <UButton
      variant="soft"
      color="neutral"
      size="sm"
      :class="buttonClass"
      @click="showModal = true"
    >
      <template #leading>
        <UIcon name="i-heroicons-user" class="w-4 h-4" />
      </template>
      {{ getCurrentReciterName }}
      <template #trailing>
        <UIcon name="i-heroicons-chevron-down" class="w-4 h-4" />
      </template>
    </UButton>

    <!-- Reciter Selection Modal -->
    <UModal v-model:open="showModal" title="เลือกผู้อ่าน">
      <template #body>
        <!-- Reciters List -->
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="reciter in availableReciters"
            :key="reciter.reciter_id"
            :class="[
              'p-3 rounded-lg cursor-pointer transition-colors border',
              selectedReciterId === reciter.reciter_id
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            ]"
            @click="selectReciter(reciter.reciter_id)"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-slate-900 dark:text-slate-100">
                  {{ reciter.name }}
                </p>
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  {{ reciter.styleDescription }}
                </p>
              </div>
              <UIcon
                v-if="selectedReciterId === reciter.reciter_id"
                name="i-heroicons-check-circle"
                class="w-5 h-5 text-indigo-600 dark:text-indigo-400"
              />
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <!-- OK Button positioned at bottom right -->
        <div class="flex justify-end">
          <UButton
            color="primary"
            size="lg"
            @click="confirmSelection"
            class="px-8"
          >
            ตกลง
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'mobile' | 'desktop'
  buttonClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'mobile',
  buttonClass: ''
})

// Composables
const { 
  selectedReciter, 
  availableReciters, 
  getCurrentReciterName, 
  setSelectedReciter 
} = useReciters()

// Local state
const showModal = ref(false)
const selectedReciterId = ref<number>(1) // Default to first reciter

// Modal now uses v-model:open for proper programmatic control

// Initialize selected reciter
watch(selectedReciter, (newReciter) => {
  if (newReciter) {
    selectedReciterId.value = newReciter.reciter_id
  }
}, { immediate: true })

// Methods
const selectReciter = (reciterId: number) => {
  selectedReciterId.value = reciterId
}

const confirmSelection = () => {
  setSelectedReciter(selectedReciterId.value)
  showModal.value = false // Close the modal programmatically
  
  // Emit event for parent components to handle reciter change
  emit('reciterChanged', selectedReciterId.value)
}

// Emit events
const emit = defineEmits<{
  reciterChanged: [reciterId: number]
}>()
</script>

<style scoped>
.reciter-selector {
  @apply relative;
}

/* Custom scrollbar for dark mode */
.dark .max-h-64::-webkit-scrollbar {
  width: 6px;
}

.dark .max-h-64::-webkit-scrollbar-track {
  background-color: rgb(30 41 59); /* slate-800 */
  border-radius: 0.375rem; /* rounded */
}

.dark .max-h-64::-webkit-scrollbar-thumb {
  background-color: rgb(71 85 105); /* slate-600 */
  border-radius: 0.375rem; /* rounded */
}

.dark .max-h-64::-webkit-scrollbar-thumb:hover {
  background-color: rgb(100 116 139); /* slate-500 */
}
</style>