/**
 * Reciter State Management
 * Manages current reciter selection and available reciters
 * SSR-friendly using useState pattern - removed circular dependencies
 */

interface ReciterState {
  currentReciterId: number
  availableReciters: Array<{
    id: string
    name: string
  }>
}

/**
 * Global Reciter State using useState pattern
 */
export const useReciterState = () => {
  return useState<ReciterState>('reciter-state', () => ({
    currentReciterId: 2, // Default to reciter 2
    availableReciters: [
      {
        id: "001",
        name: "บรรจง โซะมณี"
      },
      {
        id: "002",
        name: "อุมัร สุจิตวรรณศรี"
      }
    ]
  }))
}

/**
 * Reciter state actions and getters
 * Removed circular sync with useReciters to prevent recursive updates
 */
export const useReciterActions = () => {
  const reciterState = useReciterState()

  return {
    // State getters
    currentReciterId: computed(() => reciterState.value.currentReciterId),
    availableReciters: computed(() => reciterState.value.availableReciters),

    // Current reciter name computed directly from state
    currentReciterName: computed(() => {
      const reciter = reciterState.value.availableReciters.find(
        r => parseInt(r.id) === reciterState.value.currentReciterId
      )
      return reciter?.name || 'เลือกผู้อ่าน'
    }),

    // State actions - direct updates without circular sync
    setCurrentReciter: (reciterId: number) => {
      reciterState.value.currentReciterId = reciterId
    },

    selectReciter: async (reciterId: string) => {
      const numericReciterId = parseInt(reciterId)
      reciterState.value.currentReciterId = numericReciterId
    },

    // Utility methods
    getReciterNameById: (reciterId: number): string => {
      const reciter = reciterState.value.availableReciters.find(
        r => parseInt(r.id) === reciterId
      )
      return reciter?.name || 'Unknown Reciter'
    }
  }
}