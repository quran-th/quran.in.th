/**
 * UI State Management
 * Manages theme, responsive state, and UI preferences
 * SSR-friendly using useState pattern
 */

interface UIState {
  // Player UI state
  isLargePlayerMode: boolean

  // Selection state
  selectedSurahValue: number | undefined
}

/**
 * Global UI State using useState pattern
 * Prevents server-side memory leaks
 */
export const useUIState = () => {
  return useState<UIState>('ui-state', () => ({
    isLargePlayerMode: false,
    selectedSurahValue: undefined
  }))
}

/**
 * Theme management actions
 * Integrates with Nuxt's useColorMode directly without circular dependencies
 */
export const useThemeActions = () => {
  const colorMode = useColorMode()

  // Force reactivity by returning the colorMode directly
  const isDark = computed(() => colorMode.value === 'dark')

  const toggleDarkMode = () => {
    // Explicitly toggle to ensure proper state change
    colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
  }

  return {
    isDark: readonly(isDark),
    colorMode: readonly(colorMode),
    toggleDarkMode
  }
}

/**
 * Responsive state management
 * Reactive breakpoint detection without UI state sync
 */
export const useResponsiveState = () => {
  // Use existing responsive composable directly
  const responsive = useResponsive()

  return {
    isMobile: responsive.isMobile,
    isDesktop: responsive.isDesktop
  }
}

/**
 * Player mode management
 * Large screen player mode toggle
 */
export const usePlayerModeActions = () => {
  const uiState = useUIState()

  return {
    isLargePlayerMode: computed(() => uiState.value.isLargePlayerMode),

    togglePlayerMode: () => {
      uiState.value.isLargePlayerMode = !uiState.value.isLargePlayerMode
    },

    setPlayerMode: (isLarge: boolean) => {
      uiState.value.isLargePlayerMode = isLarge
    }
  }
}

/**
 * Selection state management
 * Manages current selections across components
 */
export const useSelectionState = () => {
  const uiState = useUIState()

  return {
    selectedSurahValue: computed({
      get: () => uiState.value.selectedSurahValue,
      set: (value: number | undefined) => {
        uiState.value.selectedSurahValue = value
      }
    }),

    setSelectedSurah: (surahId: number | undefined) => {
      uiState.value.selectedSurahValue = surahId
    },

    clearSelection: () => {
      uiState.value.selectedSurahValue = undefined
    }
  }
}
