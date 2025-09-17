import { ref, computed, onMounted, onUnmounted } from 'vue'

export const useResponsive = () => {
  const windowWidth = ref(0)
  const windowHeight = ref(0)

  // Tailwind CSS breakpoints
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  }

  const updateDimensions = () => {
    if (typeof window !== 'undefined') {
      windowWidth.value = window.innerWidth
      windowHeight.value = window.innerHeight
    }
  }

  onMounted(() => {
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', updateDimensions)
    }
  })

  // Computed breakpoint detection
  const isMobile = computed(() => windowWidth.value < breakpoints.md) // < 768px
  const isTablet = computed(() => windowWidth.value >= breakpoints.md && windowWidth.value < breakpoints.lg) // 768px - 1023px
  const isDesktop = computed(() => windowWidth.value >= breakpoints.lg) // >= 1024px

  // Specific breakpoint checks
  const isSmallMobile = computed(() => windowWidth.value < breakpoints.sm) // < 640px
  const isLargeMobile = computed(() => windowWidth.value >= breakpoints.sm && windowWidth.value < breakpoints.md) // 640px - 767px
  const isSmallDesktop = computed(() => windowWidth.value >= breakpoints.lg && windowWidth.value < breakpoints.xl) // 1024px - 1279px
  const isLargeDesktop = computed(() => windowWidth.value >= breakpoints.xl) // >= 1280px

  // Orientation detection
  const isLandscape = computed(() => windowWidth.value > windowHeight.value)
  const isPortrait = computed(() => windowHeight.value > windowWidth.value)

  // Current breakpoint name
  const currentBreakpoint = computed(() => {
    if (windowWidth.value < breakpoints.sm) return 'xs'
    if (windowWidth.value < breakpoints.md) return 'sm'
    if (windowWidth.value < breakpoints.lg) return 'md'
    if (windowWidth.value < breakpoints.xl) return 'lg'
    if (windowWidth.value < breakpoints['2xl']) return 'xl'
    return '2xl'
  })

  return {
    // Dimensions
    windowWidth: readonly(windowWidth),
    windowHeight: readonly(windowHeight),

    // Primary breakpoints (matches your current md: logic)
    isMobile: readonly(isMobile),
    isTablet: readonly(isTablet),
    isDesktop: readonly(isDesktop),

    // Specific breakpoints
    isSmallMobile: readonly(isSmallMobile),
    isLargeMobile: readonly(isLargeMobile),
    isSmallDesktop: readonly(isSmallDesktop),
    isLargeDesktop: readonly(isLargeDesktop),

    // Orientation
    isLandscape: readonly(isLandscape),
    isPortrait: readonly(isPortrait),

    // Utilities
    currentBreakpoint: readonly(currentBreakpoint),

    // Manual dimension update (useful for testing)
    updateDimensions
  }
}