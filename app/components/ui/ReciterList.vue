<template>
  <!-- Reciter Selection Content -->
  <div class="flex-1 flex flex-col min-h-0">
    <div class="mb-4">
      <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">เลือกผู้อ่าน</h2>
      <p class="text-sm text-slate-600 dark:text-slate-400">เลือกเสียงที่คุณต้องการฟัง</p>
    </div>

    <div class="relative flex-1 min-h-0">
      <div class="space-y-3 h-full overflow-y-auto">
        <div
v-for="reciter in availableReciters" :key="reciter.id"
          class="relative rounded-2xl overflow-hidden cursor-pointer transition-transform active:scale-98"
          @click="() => selectReciter(reciter.id)">
          <!-- Background Card -->
          <div class="bg-gradient-to-r from-[rgb(191,179,147)] to-[rgb(171,159,127)] dark:from-[rgb(35,32,48)] dark:to-[rgb(25,22,38)] p-6">
            <!-- Content -->
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center mb-2">
                  <div class="w-12 h-12 bg-white/20 dark:bg-[rgb(191,179,147)] rounded-full flex items-center justify-center mr-3">
                    <UIcon name="i-heroicons-microphone" class="w-6 h-6 text-white dark:text-slate-800" />
                  </div>
                  <div>
                    <h3 class="text-white font-semibold text-lg mb-1">
                      {{ reciter.name }}
                    </h3>
                    <div class="flex items-center">
                      <div
v-if="currentReciterId === parseInt(reciter.id)"
                        class="flex items-center text-white/80 text-sm">
                        <UIcon name="i-heroicons-check-circle" class="w-4 h-4 mr-1" />
                        กำลังใช้งาน
                      </div>
                      <div v-else class="text-white/60 text-sm">
                        แตะเพื่อเลือก
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Selection Indicator -->
              <div class="flex items-center">
                <div
v-if="currentReciterId === parseInt(reciter.id)"
                  class="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <UIcon name="i-heroicons-check" class="w-4 h-4 text-indigo-500" />
                </div>
                <div v-else class="w-6 h-6 border-2 border-white/40 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Bottom gradient overlay for scroll indication -->
      <div class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#e7e8f3] dark:from-[rgb(14,13,34)] to-transparent pointer-events-none" />
    </div>
  </div>
</template>

<script setup lang="ts">
// Use integrated app composable instead of props
const {
  // Data
  availableReciters,
  currentReciterId,

  // Methods
  selectReciter
} = useAppIntegrated()
</script>
