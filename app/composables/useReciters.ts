import { reciters } from '~/data/reciters'
import type { Reciter } from '~/types/quran'

export const useReciters = () => {
  // Reactive state for current selected reciter
  const selectedReciter = useState<Reciter | null>('selectedReciter', () => null)

  // Reactive state for available reciters
  const availableReciters = useState<Reciter[]>('availableReciters', () => reciters)

  // Get reciter by ID
  const getReciterById = (id: number): Reciter | undefined => {
    return availableReciters.value.find(reciter => reciter.reciter_id === id)
  }

  // Set selected reciter
  const setSelectedReciter = (reciterId: number) => {
    const reciter = getReciterById(reciterId)
    if (reciter) {
      selectedReciter.value = reciter
      // Persist to localStorage for next session
      if (import.meta.client) {
        localStorage.setItem('selectedReciterId', reciterId.toString())
      }
    }
  }

  // Get current selected reciter name for display - computed for reactivity
  const getCurrentReciterName = computed((): string => {
    if (!selectedReciter.value) return 'เลือกผู้อ่าน'
    return selectedReciter.value.name
  })

  // Initialize with default reciter or from localStorage
  const initializeReciter = () => {
    if (import.meta.client) {
      const savedReciterId = localStorage.getItem('selectedReciterId')
      if (savedReciterId) {
        setSelectedReciter(parseInt(savedReciterId))
      } else {
        // Default to reciter 2 (อุมัร สุจิตวรรณศรี)
        setSelectedReciter(2)
      }
    } else {
      // Server-side default
      setSelectedReciter(2)
    }
  }

  // Initialize on composable creation
  onMounted(() => {
    initializeReciter()
  })

  return {
    // State
    selectedReciter,
    availableReciters,

    // Methods
    getReciterById,
    setSelectedReciter,
    getCurrentReciterName,
    initializeReciter
  }
}
