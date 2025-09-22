<template>
  <div class="relative">
    <!-- Settings Button -->
    <button
      ref="triggerRef"
      class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all active:scale-95"
      @click="toggleDropdown"
    >
      <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5" />
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 top-12 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
      >
        <!-- Theme Toggle Item -->
        <button
          class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between"
          @click="handleThemeToggle"
        >
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-moon" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">โทนสีมืด</span>
          </div>
          <!-- Toggle Switch -->
          <div
            class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
            :class="isDark ? 'bg-[rgb(191,179,147)]' : 'bg-gray-300'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="isDark ? 'translate-x-5' : 'translate-x-0.5'"
            />
          </div>
        </button>

        <!-- Divider -->
        <hr class="border-gray-200 dark:border-gray-700 my-1">

        <!-- About Item -->
        <button
          class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3"
          @click="handleAboutClick"
        >
          <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">เกี่ยวกับ</span>
        </button>
      </div>
    </Transition>

    <!-- Backdrop to close dropdown -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="closeDropdown"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * SettingsDropdown Component
 *
 * Dropdown menu for mobile header settings including:
 * - Theme toggle (light/dark mode)
 * - About modal trigger
 */

// Use colorMode directly to avoid reactivity issues
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

// Dropdown state
const isOpen = ref(false)
const triggerRef = ref<HTMLElement>()

// Events
const emit = defineEmits<{
  showAbout: []
}>()

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const toggleDarkMode = () => {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
}

const handleThemeToggle = () => {
  toggleDarkMode()
  closeDropdown()
}

const handleAboutClick = () => {
  emit('showAbout')
  closeDropdown()
}
</script>
