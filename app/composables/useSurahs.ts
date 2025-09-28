import type { Surah, SurahApiResponse, SurahApiData } from '~/types/quran'

export const useSurahs = () => {
  const surahsData = useState<Surah[]>('surahs', () => [])
  const isLoading = useState<boolean>('surahs-loading', () => true)
  const error = useState<string | null>('surahs-error', () => null)
  const currentReciterId = useState<number | null>('surahs-reciter-id', () => null)

  const loadSurahs = async (reciterId: number) => {
    try {
      isLoading.value = true
      error.value = null

      // Load surahs for specific reciter from API
      const response = await $fetch<SurahApiResponse>(`/api/surahs/${reciterId}`)

      // Convert API response to Surah format
      surahsData.value = response.surahs.map((data: SurahApiData) => ({
        id: data.id,
        name: data.name || data.thaiName || `Surah ${data.id}`,
        thaiName: data.thaiName || data.name || `Surah ${data.id}`,
        arabicName: data.thaiName || data.name || `Surah ${data.id}`,
        englishName: data.englishName || getEnglishSurahName(data.id),
        revelationType: data.revelationType || getSurahRevelationType(data.id),
        versesCount: data.versesCount || getSurahVersesCount(data.id),
        order: data.id,
        // Audio metadata
        duration: data.duration,
        fileSize: data.fileSize,
        bitRate: data.bitRate,
        format: data.format,
        codec: data.codec,
        originalFilename: data.originalFilename,
        newFilename: data.newFilename
      })).sort((a, b) => a.id - b.id) // Sort by surah ID

      currentReciterId.value = reciterId
      console.log(`📚 Loaded ${surahsData.value.length} surahs for reciter ${reciterId}`)

    } catch (err) {
      error.value = 'Failed to load surahs data'
      console.error('Error loading surahs:', err)
      // Set empty array on error to prevent UI issues
      surahsData.value = []
    } finally {
      isLoading.value = false
    }
  }

  const getSurahById = (id: number): Surah | undefined => {
    return surahsData.value.find(s => s.id === id)
  }

  const formatDuration = (seconds: number): string => {
    if (!seconds) return '0:00'

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 B'

    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  // Helper functions for surah metadata
  const getEnglishSurahName = (id: number): string => {
    const names: Record<number, string> = {
      1: 'Al-Fatiha', 2: 'Al-Baqarah', 3: 'Ali Imran', 4: 'An-Nisa', 5: 'Al-Maidah',
      6: 'Al-Anam', 7: 'Al-Araf', 8: 'Al-Anfal', 9: 'At-Tawbah', 10: 'Yunus',
      11: 'Hud', 12: 'Yusuf', 13: 'Ar-Rad', 14: 'Ibrahim', 15: 'Al-Hijr',
      16: 'An-Nahl', 17: 'Al-Isra', 18: 'Al-Kahf', 19: 'Maryam', 20: 'Taha',
      21: 'Al-Anbiya', 22: 'Al-Hajj', 23: 'Al-Muminun', 24: 'An-Nur', 25: 'Al-Furqan',
      26: 'Ash-Shuara', 27: 'An-Naml', 28: 'Al-Qasas', 29: 'Al-Ankabut', 30: 'Ar-Rum',
      31: 'Luqman', 32: 'As-Sajdah', 33: 'Al-Ahzab', 34: 'Saba', 35: 'Fatir',
      36: 'Ya-Sin', 37: 'As-Saffat', 38: 'Sad', 39: 'Az-Zumar', 40: 'Ghafir',
      41: 'Fussilat', 42: 'Ash-Shura', 43: 'Az-Zukhruf', 44: 'Ad-Dukhan', 45: 'Al-Jathiyah',
      46: 'Al-Ahqaf', 47: 'Muhammad', 48: 'Al-Fath', 49: 'Al-Hujurat', 50: 'Qaf',
      51: 'Adh-Dhariyat', 52: 'At-Tur', 53: 'An-Najm', 54: 'Al-Qamar', 55: 'Ar-Rahman',
      56: 'Al-Waqiah', 57: 'Al-Hadid', 58: 'Al-Mujadila', 59: 'Al-Hashr', 60: 'Al-Mumtahanah',
      61: 'As-Saff', 62: 'Al-Jumuah', 63: 'Al-Munafiqun', 64: 'At-Taghabun', 65: 'At-Talaq',
      66: 'At-Tahrim', 67: 'Al-Mulk', 68: 'Al-Qalam', 69: 'Al-Haqqah', 70: 'Al-Maarij',
      71: 'Nuh', 72: 'Al-Jinn', 73: 'Al-Muzzammil', 74: 'Al-Muddaththir', 75: 'Al-Qiyamah',
      76: 'Al-Insan', 77: 'Al-Mursalat', 78: 'An-Naba', 79: 'An-Naziat', 80: 'Abasa',
      81: 'At-Takwir', 82: 'Al-Infitar', 83: 'Al-Mutaffifin', 84: 'Al-Inshiqaq', 85: 'Al-Buruj',
      86: 'At-Tariq', 87: 'Al-Ala', 88: 'Al-Ghashiyah', 89: 'Al-Fajr', 90: 'Al-Balad',
      91: 'Ash-Shams', 92: 'Al-Layl', 93: 'Ad-Duha', 94: 'Ash-Sharh', 95: 'At-Tin',
      96: 'Al-Alaq', 97: 'Al-Qadr', 98: 'Al-Bayyinah', 99: 'Az-Zalzalah', 100: 'Al-Adiyat',
      101: 'Al-Qariah', 102: 'At-Takathur', 103: 'Al-Asr', 104: 'Al-Humazah', 105: 'Al-Fil',
      106: 'Quraysh', 107: 'Al-Maun', 108: 'Al-Kawthar', 109: 'Al-Kafirun', 110: 'An-Nasr',
      111: 'Al-Masad', 112: 'Al-Ikhlas', 113: 'Al-Falaq', 114: 'An-Nas'
    }
    return names[id] || `Surah ${id}`
  }

  const getSurahRevelationType = (id: number): 'Meccan' | 'Medinan' => {
    // Medinan surahs (revealed in Medina)
    const medinanSurahs = [2, 3, 4, 5, 8, 9, 22, 24, 33, 47, 48, 49, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 76, 98, 110]
    return medinanSurahs.includes(id) ? 'Medinan' : 'Meccan'
  }

  const getSurahVersesCount = (id: number): number => {
    const verseCounts: Record<number, number> = {
      1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
      11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
      21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
      31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
      41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
      51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
      61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
      71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
      81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
      91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
      101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
      111: 5, 112: 4, 113: 5, 114: 6
    }
    return verseCounts[id] || 0
  }

  // Initialize with empty state - data will be loaded when reciter is selected
  // No automatic loading on initialization since reciterId is now required

  return {
    surahs: readonly(surahsData),
    isLoading: readonly(isLoading),
    error: readonly(error),
    currentReciterId: readonly(currentReciterId),
    loadSurahs,
    getSurahById,
    formatDuration,
    formatFileSize
  }
}
