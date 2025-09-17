<template>
  <div>
    <!-- Mobile Layout - No props needed! -->
    <MobileLayout v-if="isMobile" />

    <!-- Desktop Layout - No props needed! -->
    <DesktopLayout v-else />
  </div>
</template>

<script setup lang="ts">
// Import layout components
import MobileLayout from '~/components/layouts/MobileLayout.vue'
import DesktopLayout from '~/components/layouts/DesktopLayout.vue'

// Use integrated composable for responsive detection
const { isMobile } = useResponsiveState()

// Initialize integrated app state - all functionality now managed in composables!
useAppIntegrated()

// Initialize data composables for SSR support
const { loadSurahs, surahs } = useSurahs()
const { selectedReciter } = useReciters()

// Load surahs data for SSR - this runs on both server and client
const reciterId = selectedReciter.value?.reciter_id || 2
await loadSurahs(reciterId)

// Ensure surahs are loaded in the integrated composable
console.log(`Loaded ${surahs.value.length} surahs for reciter ${reciterId}`)

// Page metadata
useSeoMeta({
  title: "อัลกุรอาน - ฟังกุรอานพร้อมความหมายภาษาไทย",
  description: "สัมผัสกับอัลกุรอานที่สูงส่งพร้อมการอ่านที่ไพเราะและคำแปล",
})
</script>