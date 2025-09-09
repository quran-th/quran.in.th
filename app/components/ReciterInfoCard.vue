<template>
  <div class="w-full">
    <div
      class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 p-4 md:p-5 lg:p-6"
    >
      <div class="flex flex-col gap-3">
        <!-- Arabic Reciter -->
        <div class="flex items-center gap-3">
          <div
            class="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500 text-white"
          >
            <UIcon name="i-heroicons-user" class="w-4 h-4 md:w-4 md:h-4" />
          </div>
          <div class="flex-1 min-w-0">
            <p
              class="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300 mb-0.5"
            >
              กอรีย์
            </p>
            <p
              class="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-100 m-0 leading-tight"
            >
              {{ reciterName }}
            </p>
          </div>
        </div>

        <!-- Thai Translator -->
        <div class="flex items-center gap-3">
          <div
            class="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-amber-500 text-white"
          >
            <UIcon name="i-heroicons-language" class="w-4 h-4 md:w-4 md:h-4" />
          </div>
          <div class="flex-1 min-w-0">
            <p
              class="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300 mb-0.5"
            >
              ภาษาไทยโดย
            </p>
            <p
              class="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-100 m-0 leading-tight"
            >
              {{ translatorName }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  reciterName?: string;
  translatorName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  reciterName: "Saad al-Ghamdi",
  translatorName: "อ.บรรจง โซ๊ะมณี",
});
</script>

<!-- Styles moved to Tailwind utilities in template -->
