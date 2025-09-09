import type { Reciter } from '~/types/quran'

export const useReciters = () => {
  const recitersData = ref<Reciter[]>([])
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  const loadReciters = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      // Import the reciters data from app directory
      const { reciters } = await import('~/reciters.json')
      
      // Transform the data to our format
      recitersData.value = reciters.map((reciter: any) => ({
        id: reciter.id,
        reciter_id: reciter.reciter_id,
        name: reciter.name,
        translatedName: reciter.translated_name?.name || reciter.name,
        style: reciter.style?.name || 'Murattal',
        styleDescription: reciter.style?.description || '',
        qirat: reciter.qirat?.name || 'Hafs'
      }))
    } catch (err) {
      error.value = 'Failed to load reciters data'
      console.error('Error loading reciters:', err)
    } finally {
      isLoading.value = false
    }
  }

  const getReciterById = (reciterId: number): Reciter | undefined => {
    return recitersData.value.find(r => r.reciter_id === reciterId)
  }

  const getReciterOptions = () => {
    return recitersData.value.map(reciter => ({
      value: reciter.reciter_id,
      label: reciter.name,
      description: `${reciter.style} • ${reciter.qirat}`
    }))
  }

  // Load data on composable initialization
  if (process.client) {
    loadReciters()
  }

  return {
    reciters: readonly(recitersData),
    isLoading: readonly(isLoading),
    error: readonly(error),
    loadReciters,
    getReciterById,
    getReciterOptions
  }
}