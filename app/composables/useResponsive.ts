/**
 * Responsive design composable for breakpoint detection and responsive logic
 * 
 * Provides reactive breakpoint detection, window size tracking, and utilities
 * for building responsive Vue components with TypeScript support.
 */

export const useResponsive = () => {
  const windowWidth = ref(0)
  const windowHeight = ref(0)
  const isClient = ref(false)
  
  // Standard Tailwind CSS breakpoints
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  } as const
  
  // Reactive breakpoint detection
  const isMobile = computed(() => windowWidth.value < breakpoints.md)
  const isTablet = computed(() => windowWidth.value >= breakpoints.md && windowWidth.value < breakpoints.lg)
  const isDesktop = computed(() => windowWidth.value >= breakpoints.lg)
  const isLargeScreen = computed(() => windowWidth.value >= breakpoints.xl)
  const isUltraWide = computed(() => windowWidth.value >= breakpoints['2xl'])
  
  // Device orientation detection
  const isPortrait = computed(() => windowHeight.value > windowWidth.value)
  const isLandscape = computed(() => windowWidth.value > windowHeight.value)
  
  // Custom breakpoint checker
  const isBreakpoint = (breakpoint: keyof typeof breakpoints) => {
    return windowWidth.value >= breakpoints[breakpoint]
  }
  
  // Range checker for between breakpoints
  const isBetween = (minBreakpoint: keyof typeof breakpoints, maxBreakpoint: keyof typeof breakpoints) => {
    return windowWidth.value >= breakpoints[minBreakpoint] && windowWidth.value < breakpoints[maxBreakpoint]
  }
  
  // Responsive value helper - returns different values based on breakpoint
  const responsive = <T>(values: {
    mobile?: T
    tablet?: T
    desktop?: T
    default: T
  }): T => {
    if (isMobile.value && values.mobile !== undefined) return values.mobile
    if (isTablet.value && values.tablet !== undefined) return values.tablet
    if (isDesktop.value && values.desktop !== undefined) return values.desktop
    return values.default
  }
  
  // Touch device detection
  const isTouchDevice = computed(() => {
    if (!isClient.value) return false
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })
  
  // Reduced motion preference
  const prefersReducedMotion = ref(false)
  
  // Update window dimensions
  const updateDimensions = () => {
    if (import.meta.client) {
      windowWidth.value = window.innerWidth
      windowHeight.value = window.innerHeight
    }
  }
  
  // Check reduced motion preference
  const checkReducedMotion = () => {
    if (import.meta.client) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      prefersReducedMotion.value = mediaQuery.matches
      mediaQuery.addEventListener('change', (e) => {
        prefersReducedMotion.value = e.matches
      })
    }
  }
  
  // Debounced resize handler for performance
  let resizeTimeout: NodeJS.Timeout | null = null
  const debouncedResize = () => {
    if (resizeTimeout) clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(updateDimensions, 100)
  }
  
  // Device pixel ratio for high-DPI displays
  const devicePixelRatio = ref(1)
  const updatePixelRatio = () => {
    if (import.meta.client) {
      devicePixelRatio.value = window.devicePixelRatio || 1
    }
  }
  
  onMounted(() => {
    isClient.value = true
    updateDimensions()
    updatePixelRatio()
    checkReducedMotion()
    
    window.addEventListener('resize', debouncedResize)
    window.addEventListener('orientationchange', updateDimensions)
  })
  
  onUnmounted(() => {
    if (import.meta.client) {
      window.removeEventListener('resize', debouncedResize)
      window.removeEventListener('orientationchange', updateDimensions)
    }
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }
  })
  
  return {
    // Window dimensions
    windowWidth: readonly(windowWidth),
    windowHeight: readonly(windowHeight),
    
    // Breakpoint detection
    isMobile: readonly(isMobile),
    isTablet: readonly(isTablet),
    isDesktop: readonly(isDesktop),
    isLargeScreen: readonly(isLargeScreen),
    isUltraWide: readonly(isUltraWide),
    
    // Orientation
    isPortrait: readonly(isPortrait),
    isLandscape: readonly(isLandscape),
    
    // Device capabilities
    isTouchDevice: readonly(isTouchDevice),
    devicePixelRatio: readonly(devicePixelRatio),
    prefersReducedMotion: readonly(prefersReducedMotion),
    
    // Utilities
    isBreakpoint,
    isBetween,
    responsive,
    breakpoints,
    
    // Client-side ready
    isClient: readonly(isClient)
  }
}

// Type definitions for better TypeScript support
export type BreakpointKey = keyof typeof useResponsive.breakpoints
export type ResponsiveValue<T> = {
  mobile?: T
  tablet?: T
  desktop?: T
  default: T
}

// Utility function for responsive classes
export const useResponsiveClasses = () => {
  const { responsive } = useResponsive()
  
  const getResponsiveClass = (classes: ResponsiveValue<string>) => {
    return responsive(classes)
  }
  
  return { getResponsiveClass }
}

// Hook for responsive styles
export const useResponsiveStyles = () => {
  const { responsive } = useResponsive()
  
  const getResponsiveStyle = <T>(styles: ResponsiveValue<T>) => {
    return responsive(styles)
  }
  
  return { getResponsiveStyle }
}