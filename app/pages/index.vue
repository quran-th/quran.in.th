<template>
  <div>
    <!-- Mobile Layout -->
    <div class="md:hidden h-screen bg-[#e7e8f3] dark:bg-[rgb(14,13,34)] relative flex flex-col">
      <!-- Mobile Header -->
      <header class="p-4 pt-12 safe-top flex-shrink-0">
        <div class="flex items-center justify-between mb-2">
          <div>
            <p class="text-sm text-slate-600 dark:text-slate-400">quran.in.th</p>
            <h1 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
              อัลกุรอาน
            </h1>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="w-8 h-8 rounded-full bg-white/70 dark:bg-slate-700 flex items-center justify-center backdrop-blur-sm"
              @click="toggleDarkMode">
              <UIcon :name="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
                class="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </button>
          </div>
        </div>
      </header>

      <!-- Compact Mobile Player - Always Visible -->
      <main class="px-4 pb-6 flex flex-col flex-1 min-h-0">
        <!-- Compact Player Card -->
        <div class="relative rounded-2xl overflow-hidden mb-6 flex-shrink-0">
          <!-- Background Image -->
          <div class="absolute inset-0 bg-cover bg-center bg-no-repeat" style="background-image: url('/bg.webp')" />

          <!-- Gradient Overlay -->
          <div class="absolute inset-0 bg-gradient-to-r from-[rgb(62,1,1)]/70 via-[rgb(62,1,1)]/50 to-[rgb(62,1,1)]/30 dark:from-[rgb(245,162,116)]/70 dark:via-[rgb(245,162,116)]/50 dark:to-[rgb(245,162,116)]/30" />

          <!-- Player Content -->
          <div class="relative z-10 p-6">
            <!-- Player Controls Row -->
            <div class="flex items-center gap-4 mb-4">
              <!-- Play Button -->
              <button
                class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:bg-white/30 active:scale-95"
                :disabled="!currentSurah || !currentReciter" :class="{ 'bg-red-500/80': error }" @click="togglePlay()">
                <UIcon v-if="!isLoading && !error" :name="isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'"
                  class="w-6 h-6" :class="{ 'ml-1': !isPlaying }" />
                <UIcon v-else-if="error" name="i-heroicons-exclamation-triangle" class="w-6 h-6" />
                <div v-else class="w-6 h-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </button>

              <!-- Track Info -->
              <div class="flex-1 min-w-0">
                <h2 class="text-white font-semibold text-lg mb-1 truncate">
                  ซูเราะฮฺ{{ getCurrentSurahName().split('.')[1]?.trim() || 'อัล-ฟาติหะฮฺ' }}
                </h2>
                <p class="text-white/70 text-sm truncate">
                  โดย {{ getCurrentReciterName }}
                </p>

                <!-- Status Indicator -->
                <div v-if="error" class="mt-1">
                  <p class="text-red-300 text-xs">
                    เกิดข้อผิดพลาด - กรุณาลองใหม่
                  </p>
                </div>

                <div v-else-if="isBuffering || isLoading" class="mt-1">
                  <p class="text-blue-300 text-xs">
                    กำลังโหลดเสียง...
                    <span v-if="networkType === 'cellular'" class="ml-1">(📱 เซลลูลาร์)</span>
                  </p>
                </div>
              </div>

              <!-- Revelation Place Display -->
              <div class="flex items-center text-white/80 text-xs">
                <div class="px-2 py-1 bg-white/20 rounded-full">
                  {{ getCurrentSurahRevelationPlace() }}
                </div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full">
              <div class="flex items-center justify-between mb-2">
                <span class="text-white/60 text-xs">{{ formatTimeWithHours(currentTime) || '0:00' }}</span>
                <span class="text-white/60 text-xs">{{ getCurrentSurahTotalDuration() || formatTimeWithHours(duration) || '0:00'
                  }}</span>
              </div>
              <div class="w-full h-1 bg-white/20 rounded-full cursor-pointer" @click="seekToClick">
                <div class="h-full bg-white rounded-full transition-all duration-300"
                  :style="{ width: correctProgress + '%' }" />
              </div>
            </div>

            <!-- Bottom Control Buttons -->
            <div class="flex items-center justify-center gap-4 mt-4">
              <button
                class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:bg-white/30 active:scale-95"
                :disabled="isFirstVerse" :class="{ 'opacity-50': isFirstVerse }" @click="previousVerse">
                <UIcon name="i-heroicons-backward" class="w-5 h-5" />
              </button>

              <button
                class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:bg-white/30 active:scale-95"
                :disabled="isLastVerse" :class="{ 'opacity-50': isLastVerse }" @click="nextVerse">
                <UIcon name="i-heroicons-forward" class="w-5 h-5" />
              </button>

              <button
                class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:bg-white/30 active:scale-95"
                @click="showPlayerConfig = true">
                <UIcon v-if="shufflePlay" name="i-lucide-shuffle" class="w-5 h-5" />
                <UIcon v-else-if="loopPlay" name="i-heroicons-arrow-path-rounded-square" class="w-5 h-5" />
                <UIcon v-else name="i-lucide-infinity" class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="px-0 mb-6 flex-shrink-0">
          <div class="flex bg-white/50 dark:bg-slate-700/50 rounded-lg p-1 backdrop-blur-sm">
            <button class="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all"
              :class="activeTab === 'playing' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-600 dark:text-slate-400'"
              @click="activeTab = 'playing'">
              ซูเราะฮ์
            </button>
            <button class="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all"
              :class="activeTab === 'reciters' ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-600 dark:text-slate-400'"
              @click="activeTab = 'reciters'">
              เลือกผู้อ่าน
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div v-if="activeTab === 'playing'" class="flex-1 flex flex-col min-h-0">
          <!-- Surah Cards List -->
          <div class="flex flex-col flex-1 min-h-0">
            <div class="relative flex-1 min-h-0">
              <div class="space-y-3 h-full overflow-y-auto">
                <div v-for="surah in surahs" :key="surah.id"
                  class="relative rounded-2xl overflow-hidden cursor-pointer transition-transform active:scale-98"
                  @click="selectAndPlaySurahFromCard(surah.id)">
                  <!-- Background inspired by hero section -->
                  <div class="bg-gradient-to-r from-[rgb(191,179,147)] to-[rgb(171,159,127)] dark:from-[rgb(35,32,48)] dark:to-[rgb(25,22,38)] p-4">
                    <!-- Content -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center flex-1">
                        <!-- Surah thumbnail similar to track info -->
                        <div class="w-12 h-12 bg-white/20 dark:bg-[rgb(191,179,147)] rounded-lg flex items-center justify-center mr-3">
                          <span class="text-white dark:text-slate-800 font-bold text-sm">{{ surah.id }}</span>
                        </div>
                        <div class="flex-1">
                          <h3 class="text-white font-semibold mb-1">
                            {{ surah.thaiName }}
                          </h3>
                          <div class="flex items-center text-white/70 text-xs">
                            <span>{{ surah.versesCount }} อายะห์</span>
                            <span class="mx-2">•</span>
                            <span v-if="surah.duration">{{ formatDuration(surah.duration) }}</span>
                            <span v-else>-</span>
                          </div>
                        </div>
                      </div>

                      <!-- Play button -->
                      <button
                        class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                        @click.stop="selectAndPlaySurahFromCard(surah.id)">
                        <UIcon :name="currentSurah === surah.id && isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'"
                          class="w-5 h-5 text-white" :class="{ 'ml-0.5': !(currentSurah === surah.id && isPlaying) }" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Bottom gradient overlay for scroll indication -->
              <div class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#e7e8f3] dark:from-[rgb(14,13,34)] to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        <!-- Reciter Selection Tab Content -->
        <div v-else-if="activeTab === 'reciters'" class="flex-1 flex flex-col min-h-0">
          <div class="mb-4">
            <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">เลือกผู้อ่าน</h2>
            <p class="text-sm text-slate-600 dark:text-slate-400">เลือกเสียงที่คุณต้องการฟัง</p>
          </div>

          <div class="relative flex-1 min-h-0">
            <div class="space-y-3 h-full overflow-y-auto">
              <div v-for="reciter in availableReciters" :key="reciter.id"
                class="relative rounded-2xl overflow-hidden cursor-pointer transition-transform active:scale-98"
                @click="selectReciter(reciter.id)">
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
                            <div v-if="currentReciterId === parseInt(reciter.id)"
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
                      <div v-if="currentReciterId === parseInt(reciter.id)"
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

      </main>

      <!-- Player Configuration Modal -->
      <div v-if="showPlayerConfig" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
        @click="showPlayerConfig = false">
        <div class="w-full bg-white dark:bg-slate-800 rounded-t-3xl max-h-[80vh] flex flex-col" :class="{
          'animate-slide-up': showPlayerConfig,
        }" @click.stop>
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-100">ตั้งค่าเครื่องเล่น</h3>
            <button class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
              @click="showPlayerConfig = false">
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          <!-- Configuration Options -->
          <div class="flex-1 p-6">
            <div class="space-y-4">
              <!-- Shuffle Play Option -->
              <div class="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-slate-700"
                :class="{ 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800': shufflePlay }"
                @click="toggleShufflePlay">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center"
                    :class="shufflePlay
                      ? 'bg-indigo-100 dark:bg-indigo-900/50'
                      : 'bg-gray-100 dark:bg-gray-700'">
                    <UIcon name="i-lucide-shuffle" class="w-6 h-6"
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
                  <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                    :class="shufflePlay
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-gray-300 dark:border-gray-600'">
                    <UIcon v-if="shufflePlay" name="i-heroicons-check" class="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              <!-- Loop Play Option -->
              <div class="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-slate-700"
                :class="{ 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800': loopPlay }"
                @click="toggleLoopPlay">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center"
                    :class="loopPlay
                      ? 'bg-indigo-100 dark:bg-indigo-900/50'
                      : 'bg-gray-100 dark:bg-gray-700'">
                    <UIcon name="i-heroicons-arrow-path-rounded-square" class="w-6 h-6"
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
                  <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                    :class="loopPlay
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-gray-300 dark:border-gray-600'">
                    <UIcon v-if="loopPlay" name="i-heroicons-check" class="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              <!-- Auto Play Next Option -->
              <div class="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-slate-700"
                :class="{ 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800': autoPlayNext }"
                @click="toggleAutoPlayNext">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center"
                    :class="autoPlayNext
                      ? 'bg-indigo-100 dark:bg-indigo-900/50'
                      : 'bg-gray-100 dark:bg-gray-700'">
                    <UIcon name="i-lucide-infinity" class="w-6 h-6"
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
                  <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
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
    </div>

    <!-- Large Screen Layout -->
    <div class="hidden md:block min-h-screen bg-slate-50 dark:bg-slate-900 ">

      <!-- Large Screen Header -->
      <header class="p-6">
        <div class="max-w-5xl mx-auto">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
                อัลกุรอาน
              </h1>
              <p class="text-slate-500 dark:text-slate-400">ฟัง & ใคร่ครวญ</p>
            </div>
            <div class="flex items-center gap-3">
              <button class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                @click="toggleDarkMode">
                <UIcon :name="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="p-6">
        <div class="max-w-5xl mx-auto">
          <section class="mb-12">
            <!-- Hero Card -->
            <div class="relative rounded-2xl overflow-hidden h-64">
              <!-- Background Image -->
              <div class="absolute inset-0 bg-cover bg-center bg-no-repeat" style="background-image: url('/bg.webp')" />

              <!-- Gradient Overlay for better text readability -->
              <div class="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/10" />

              <!-- Additional shadow overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <!-- Content -->
              <div class="relative z-10 p-8 h-full flex flex-col justify-between">
                <div>
                  <p class="text-white/80 text-sm mb-2" />
                  <h3 class="text-white text-4xl font-bold mb-6">อัลกุรอาน<br>พร้อมคำแปลภาษาไทย</h3>

                  <div class="flex gap-4">
                    <button
                      class="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-black/90 transition-colors flex items-center gap-2 cursor-pointer"
                      :disabled="isLoading" :class="{ 'bg-red-600 hover:bg-red-700': error }" @click="playFromHero">
                      <UIcon v-if="!isLoading && !error" :name="isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'"
                        class="w-5 h-5" :class="{ 'ml-0.5': !isPlaying }" />
                      <UIcon v-else-if="error" name="i-heroicons-exclamation-triangle" class="w-5 h-5" />
                      <div v-else
                        class="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {{ error ? 'เกิดข้อผิดพลาด' : isLoading ? 'กำลังโหลด' : isPlaying ? 'หยุด' : 'เริ่ม' }}
                    </button>
                  </div>
                </div>

                <div class="text-right">
                  <p class="text-white/60 text-sm mb-1">เสียงแปลโดย {{ getCurrentReciterName }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- My Playlist Section -->
          <section>
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">เพลย์ลิสต์</h2>
              <div class="flex items-center gap-4">
                <!-- Desktop Reciter Selector - Simple Dropdown -->
                <div class="relative">
                  <select
                    class="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                    :value="currentReciterId" @change="onDesktopReciterChange">
                    <option value="1">บรรจง โซะมณี</option>
                    <option value="2">อุมัร สุจิตวรรณศรี</option>
                  </select>
                </div>
                <button class="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  <span class="text-sm text-slate-500 dark:text-slate-400">ทั้งหมด {{ surahs.length }} รายการ</span>
                </button>
              </div>
            </div>

            <!-- Playlist Table -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden mb-[80px]">
              <!-- Table Header -->
              <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <div class="grid grid-cols-12 gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <div class="col-span-1">#</div>
                  <div class="col-span-3">ซูเราะห์</div>
                  <div class="col-span-1">ประเภท</div>
                  <div class="col-span-3">เวลา</div>
                  <div class="col-span-4">ผู้อ่าน</div>
                </div>
              </div>

              <!-- Table Body -->
              <div class="max-h-96 overflow-y-auto">
                <div v-for="(surah, index) in surahs" :key="surah.id"
                  class="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                  @click="selectAndPlaySurah(surah.id)">
                  <div class="grid grid-cols-12 gap-4 items-center">
                    <!-- Number -->
                    <div class="col-span-1">
                      <div class="flex items-center">
                        <span v-if="currentSurah !== surah.id" class="text-slate-400 text-sm">{{ String(index +
                          1).padStart(2, '0') }}</span>
                        <UIcon v-else name="i-heroicons-speaker-wave"
                          class="w-4 h-4 text-slate-800 dark:text-slate-100" />
                      </div>
                    </div>

                    <!-- Title -->
                    <div class="col-span-3">
                      <p class="font-medium text-slate-900 dark:text-slate-100">{{ surah.thaiName }}</p>
                    </div>

                    <div class="col-span-1">
                      <span class="inline-flex px-2 py-0.5 text-xs rounded-full" :class="surah.revelationType === 'Meccan'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'">
                        {{ surah.revelationType === 'Meccan' ? 'มักกิยะห์' : 'มะดะนียะห์' }}
                      </span>
                    </div>


                    <!-- Time -->
                    <div class="col-span-3">
                      <p class="text-slate-500 dark:text-slate-400">
                        <span v-if="surah.duration">{{ formatDuration(surah.duration) }}</span>
                        <span v-else>-</span>
                      </p>
                    </div>

                    <!-- Reciter info -->
                    <div class="col-span-4">
                      <p class="text-slate-500 dark:text-slate-400 text-xs">
                        เสียงแปลโดย {{ getCurrentReciterName }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <!-- Mini Player (Fixed Bottom) -->
      <div class="fixed bottom-0 left-0 right-0 bg-slate-900 dark:bg-slate-950 text-white px-6 py-4">
        <div class="flex items-center gap-4">
          <!-- Track Info -->
          <div class="flex items-center gap-3 flex-1">
            <div
              class="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">{{ currentSurah || '1' }}</span>
            </div>
            <div>
              <p class="font-medium">{{ getCurrentSurahName().split('.')[1]?.trim() || 'อัล-ฟาติหะฮฺ' }}</p>
              <p class="text-white/60 text-sm">เสียงแปลโดย {{ getCurrentReciterName }}</p>
            </div>
          </div>

          <!-- Time and Controls -->
          <div class="flex items-center gap-4">
            <span class="text-white/60 text-sm">{{ formatTimeWithHours(currentTime) || '0:00' }}</span>
            <button
              class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              @click="togglePlay">
              <UIcon :name="isPlaying ? 'i-heroicons-pause' : 'i-heroicons-play'" class="w-4 h-4"
                :class="{ 'ml-0.5': !isPlaying }" />
            </button>

            <!-- Progress Bar -->
            <div class="w-32 h-1 bg-white/20 rounded-full relative cursor-pointer" @click="seekToClick">
              <div class="h-full bg-white rounded-full transition-all duration-100"
                :style="{ width: correctProgress + '%' }" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Theme management
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");

const toggleDarkMode = () => {
  colorMode.value = isDark.value ? "light" : "dark";
};

// Data composables
const {
  surahs,
  getSurahById,
  formatDuration,
  loadSurahs
} = useSurahs();

const {
  selectedReciter,
  getCurrentReciterName,
  setSelectedReciter
} = useReciters();

// Audio player - Native HTML5 audio for reliable streaming
const {
  isPlaying,
  isLoading,
  currentTime,
  duration,
  currentSurah,
  currentReciter,
  isFirstVerse,
  isLastVerse,
  loadAudio,
  togglePlay,
  previousVerse,
  nextVerse,
  seekTo,
  seekToProgress,
  updateMediaMetadata,
  setAutoPlayMetadataCallback,
  error,
  // Enhanced streaming state
  isBuffering,
  networkType,
  // Player configuration
  playerMode,
  shufflePlay,
  loopPlay,
  autoPlayNext,
  toggleShufflePlay,
  toggleLoopPlay,
  toggleAutoPlayNext
} = useAudioPlayer();

// Selection state  
const selectedSurahValue = ref<number | undefined>(undefined);
const currentReciterId = ref<number>(1); // Default to first reciter

// Modal state
const showPlayerConfig = ref(false);

// Tab state
const activeTab = ref('playing');

// Mobile reciter data
const availableReciters = ref([
  {
    id: "001",
    name: "บรรจง โซะมณี"
  },
  {
    id: "002",
    name: "อุมัร สุจิตวรรณศรี"
  }
]);

// Computed properties - removed unused computed values

const currentSurahName = computed(() => {
  if (!currentSurah.value) return "เลือกซูเราะฮฺ";
  const surah = getSurahById(currentSurah.value);
  return surah ? `${surah.id}. ${surah.thaiName}` : "ไม่ทราบซูเราะฮฺ";
});

// Watch for changes in surah selection and load audio automatically  
watch(selectedSurahValue, (surahId) => {
  if (surahId) {
    loadNewAudio();
  }
});

const loadNewAudio = async () => {
  if (!selectedSurahValue.value) return;

  try {
    // Use current selected reciter
    await loadAudio(selectedSurahValue.value, currentReciterId.value);

    // Update MediaSession metadata with Thai names
    const surah = getSurahById(selectedSurahValue.value);

    if (surah) {
      const surahDisplayName = `ซูเราะฮฺ ${surah.thaiName}`;
      const reciterName = getCurrentReciterName.value;
      updateMediaMetadata(surahDisplayName, `เสียงแปลโดย ${reciterName}`);
    }
  } catch (err) {
    console.error("Failed to load audio:", err);
  }
};

// Seek controls with metadata duration
const seekToClick = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percentage = (clickX / rect.width) * 100;

  // Use metadata duration for accurate seeking
  const metadataDuration = getCurrentSurahDurationSeconds();
  if (metadataDuration > 0) {
    const seekTime = (percentage / 100) * metadataDuration;
    seekTo(Math.max(0, Math.min(metadataDuration, seekTime)));
  } else {
    // Fallback to original method
    seekToProgress(Math.max(0, Math.min(100, percentage)));
  }
};

// Removed unused volumeClick function


// Helper methods
const getCurrentSurahName = () => {
  return currentSurahName.value;
};

// Get current surah revelation place in Thai
const getCurrentSurahRevelationPlace = () => {
  if (!currentSurah.value) return 'มักกิยะฮ์'; // Default to Makkah

  const surah = getSurahById(currentSurah.value);
  if (!surah) return 'มักกิยะฮ์';

  // Convert revelationType to Thai
  return surah.revelationType === 'Meccan' ? 'มักกิยะฮ์' : 'มะดะนียะฮ์';
};

// Get current surah total duration from metadata
const getCurrentSurahTotalDuration = () => {
  if (!currentSurah.value) return '0:00';

  const surah = getSurahById(currentSurah.value);
  if (!surah || !surah.duration) return '0:00';

  return formatDuration(surah.duration);
};

// Get current surah duration in seconds from metadata
const getCurrentSurahDurationSeconds = () => {
  if (!currentSurah.value) return 0;

  const surah = getSurahById(currentSurah.value);
  return surah?.duration || 0;
};

// Computed property for correct progress calculation using metadata duration
const correctProgress = computed(() => {
  const metadataDuration = getCurrentSurahDurationSeconds();
  return metadataDuration > 0 ? (currentTime.value / metadataDuration) * 100 : 0;
});

// Enhanced time formatter that supports hours
const formatTimeWithHours = (seconds: number): string => {
  if (!seconds || !isFinite(seconds)) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Auto-play method for large screen surah selection
const selectAndPlaySurah = async (surahId: number) => {
  selectedSurahValue.value = surahId;

  // Auto-play the selected surah
  await playSelectedAudio();
};

// Auto-play method for mobile surah cards
const selectAndPlaySurahFromCard = async (surahId: number) => {
  selectedSurahValue.value = surahId;

  // Auto-play the selected surah
  await playSelectedAudio();
};

// Play from hero button - toggle play/pause or start new audio
const playFromHero = async () => {
  // If audio is currently playing, just toggle pause
  if (isPlaying.value) {
    await togglePlay();
    return;
  }

  // If audio is paused but loaded, resume playing
  if (currentSurah.value && !isPlaying.value) {
    await togglePlay();
    return;
  }

  // If no surah selected or no audio loaded, default to first surah and load
  if (!selectedSurahValue.value) {
    selectedSurahValue.value = 1; // Al-Fatiha
  }

  // Auto-play the selected audio
  await playSelectedAudio();
};

// Helper method to play selected audio with auto-play
const playSelectedAudio = async () => {
  if (!selectedSurahValue.value) return;

  try {
    console.log(`🎵 Attempting to load Surah ${selectedSurahValue.value} with reciter ${currentReciterId.value}`);

    // Load the audio with current selected reciter
    await loadAudio(selectedSurahValue.value, currentReciterId.value);

    // Small delay to ensure audio is fully loaded
    await new Promise(resolve => setTimeout(resolve, 100));

    // Auto-play immediately after loading
    console.log('🎵 Audio loaded, attempting to play...');
    await togglePlay();

    // Update MediaSession metadata
    const surah = getSurahById(selectedSurahValue.value);

    if (surah) {
      const surahDisplayName = `ซูเราะฮฺ ${surah.thaiName}`;
      const reciterName = getCurrentReciterName.value;
      updateMediaMetadata(surahDisplayName, `เสียงแปลโดย ${reciterName}`);
      console.log(`🎵 Now playing: ${surahDisplayName} by ${reciterName}`);
    }
  } catch (err) {
    console.error("❌ Failed to load and play audio:", err);

    // Show user-friendly error message
    if (err instanceof Error) {
      if (err.message.includes('not available')) {
        console.warn('⚠️ Audio file not found, this is expected in development without audio files');
      } else if (err.message.includes('play')) {
        console.warn('⚠️ Auto-play blocked by browser policy. User interaction required.');
      }
    }
  }
};

// Removed unused placeholder functions

// Player configuration modal functions are now handled by the composable

// Select reciter from tab (mobile)
const selectReciter = async (reciterId: string) => {
  const numericReciterId = parseInt(reciterId);
  await onReciterChanged(numericReciterId);
  // Switch back to playing tab after selection
  activeTab.value = 'playing';
};

// Handle desktop reciter selection
const onDesktopReciterChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const reciterId = parseInt(target.value);
  await onReciterChanged(reciterId);
};

// Handle reciter change
const onReciterChanged = async (reciterId: number) => {
  console.log(`🎵 Reciter changing to ID: ${reciterId}`);

  // Update the composable state first - this will trigger reactive updates
  setSelectedReciter(reciterId);
  currentReciterId.value = reciterId;

  console.log(`🎵 Reciter changed to: ${getCurrentReciterName.value}`);

  // Load surahs for the new reciter
  console.log(`📚 Loading surahs for reciter ${reciterId}`);
  await loadSurahs(reciterId);
  console.log(`📚 Loaded ${surahs.value.length} surahs for reciter ${reciterId}`);

  // If audio is currently loaded, reload and auto-play with new reciter
  if (selectedSurahValue.value) {
    console.log(`🎵 Reloading audio with new reciter for Surah ${selectedSurahValue.value}`);
    await playSelectedAudio(); // This will reload and auto-play with new reciter
  } else if (currentSurah.value) {
    // If no selectedSurahValue but we have currentSurah, use that
    selectedSurahValue.value = currentSurah.value;
    console.log(`🎵 Reloading current Surah ${currentSurah.value} with new reciter`);
    await playSelectedAudio();
  }
};

// Initialize with default values
onMounted(() => {
  // Watch for selectedReciter changes and load surahs accordingly
  watch(
    () => selectedReciter.value,
    async (newReciter) => {
      if (newReciter) {
        console.log(`🎵 Reciter initialized: ${newReciter.name} (ID: ${newReciter.reciter_id})`);
        // Load surahs for the selected reciter
        await loadSurahs(newReciter.reciter_id);
        console.log(`📚 Surahs loaded for reciter ${newReciter.reciter_id}`);
      }
    },
    { immediate: true }
  );

  // Set default surah (Al-Fatiha) when surahs are loaded
  watch(
    () => surahs.value,
    (newSurahs) => {
      if (newSurahs.length > 0 && !selectedSurahValue.value) {
        selectedSurahValue.value = 1; // Al-Fatiha
        console.log(`🎯 Default surah set: Al-Fatiha (1)`);
      }
    },
    { immediate: true },
  );

  // Watch for reciter changes and update current reciter ID
  watch(selectedReciter, (newReciter, oldReciter) => {
    if (newReciter) {
      currentReciterId.value = newReciter.reciter_id;

      // Update metadata for current playing surah when reciter changes
      if (currentSurah.value) {
        const surah = getSurahById(currentSurah.value);
        if (surah) {
          const surahDisplayName = `ซูเราะฮฺ ${surah.thaiName}`;
          const reciterName = getCurrentReciterName.value;
          updateMediaMetadata(surahDisplayName, `เสียงแปลโดย ${reciterName}`);
          console.log(`🎵 Watch triggered: Updated metadata for ${surahDisplayName} by ${reciterName}`);
        }
      }

      // Log reciter change for debugging
      if (oldReciter && newReciter.reciter_id !== oldReciter.reciter_id) {
        console.log(`🎵 Watch: Reciter changed from ${oldReciter.name} to ${newReciter.name}`);
      }
    }
  }, { immediate: true });

  // Set up auto-play metadata update callback
  setAutoPlayMetadataCallback((surahId: number) => {
    const surah = getSurahById(surahId);

    if (surah) {
      const surahDisplayName = `ซูเราะฮฺ ${surah.thaiName}`;
      const reciterName = getCurrentReciterName.value;
      updateMediaMetadata(surahDisplayName, `เสียงแปลโดย ${reciterName}`);
      console.log(`🎵 Auto-play callback: Updated metadata for ${surahDisplayName} by ${reciterName}`);
    }
  });
});

// Page metadata
useSeoMeta({
  title: "อัลกุรอาน - ฟัง & ใคร่ครวญ",
  description: "สัมผัสกับอัลกุรอานที่สูงส่งพร้อมการอ่านที่ไพเราะและคำแปล",
});
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
