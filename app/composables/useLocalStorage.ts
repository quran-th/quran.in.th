const STORAGE_KEY = 'quran-th-player-state'

export interface StoredPlayerState {
  currentSurah: number | null
  currentReciter: number | null
  playerMode: 'autoNext' | 'shuffle' | 'loop' | 'none'
  volume: number
  playbackRate: number
  showTranslation: boolean
}

export const useLocalStorage = () => {
  // Check if we're on client side
  const isClient = () => import.meta.client && typeof window !== 'undefined'

  const getDefaultState = (): StoredPlayerState => ({
    currentSurah: null, // Will be set randomly for new users
    currentReciter: 2, // Default reciter 002
    playerMode: 'autoNext', // Default to auto-play next surah
    volume: 80,
    playbackRate: 1.0,
    showTranslation: true
  })

  const getRandomSurah = (): number => {
    // Generate random surah between 1-114
    return Math.floor(Math.random() * 114) + 1
  }

  // Load player state from localStorage
  const loadPlayerState = (): StoredPlayerState => {
    if (!isClient()) {
      const defaultState = getDefaultState()
      // Set random surah for new users on client
      return defaultState
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        // First time user - set random surah
        const defaultState = getDefaultState()
        defaultState.currentSurah = getRandomSurah()

        console.log(`📱 New user detected - setting random surah: ${defaultState.currentSurah}, default reciter: ${defaultState.currentReciter}`)

        // Save the initial state
        savePlayerState(defaultState)
        return defaultState
      }

      const parsed = JSON.parse(stored) as StoredPlayerState

      // Validate and merge with defaults to handle missing properties
      const state = {
        ...getDefaultState(),
        ...parsed
      }

      console.log(`📱 Loaded player state from localStorage:`, state)
      return state

    } catch (error) {
      console.warn('Failed to load player state from localStorage:', error)
      const defaultState = getDefaultState()
      defaultState.currentSurah = getRandomSurah()
      return defaultState
    }
  }

  // Save player state to localStorage
  const savePlayerState = (state: StoredPlayerState) => {
    if (!isClient()) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      console.log('📱 Player state saved to localStorage')
    } catch (error) {
      console.warn('Failed to save player state to localStorage:', error)
    }
  }

  // Update specific parts of the state
  const updateSurah = (surahId: number) => {
    const currentState = loadPlayerState()
    currentState.currentSurah = surahId
    savePlayerState(currentState)
  }

  const updateReciter = (reciterId: number) => {
    const currentState = loadPlayerState()
    currentState.currentReciter = reciterId
    savePlayerState(currentState)
  }

  const updatePlayerMode = (mode: 'autoNext' | 'shuffle' | 'loop' | 'none') => {
    const currentState = loadPlayerState()
    currentState.playerMode = mode
    savePlayerState(currentState)
  }

  const updateVolume = (volume: number) => {
    const currentState = loadPlayerState()
    currentState.volume = volume
    savePlayerState(currentState)
  }

  const updatePlaybackRate = (rate: number) => {
    const currentState = loadPlayerState()
    currentState.playbackRate = rate
    savePlayerState(currentState)
  }

  const updateShowTranslation = (show: boolean) => {
    const currentState = loadPlayerState()
    currentState.showTranslation = show
    savePlayerState(currentState)
  }

  // Clear all stored data (for debugging or user reset)
  const clearPlayerState = () => {
    if (!isClient()) return

    try {
      localStorage.removeItem(STORAGE_KEY)
      console.log('📱 Player state cleared from localStorage')
    } catch (error) {
      console.warn('Failed to clear player state from localStorage:', error)
    }
  }

  return {
    loadPlayerState,
    savePlayerState,
    updateSurah,
    updateReciter,
    updatePlayerMode,
    updateVolume,
    updatePlaybackRate,
    updateShowTranslation,
    clearPlayerState,
    getRandomSurah
  }
}