<!--
  Example Responsive Button Component
  
  Demonstrates best practices for building responsive components:
  - Mobile-first design approach
  - Touch-friendly sizing on mobile
  - Adaptive icon and text display
  - Performance-optimized responsive logic
-->

<template>
  <button 
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <!-- Loading state -->
    <div v-if="loading" :class="loadingClasses">
      <div class="animate-spin rounded-full border-2 border-current border-t-transparent" />
    </div>
    
    <!-- Icon -->
    <UIcon 
      v-else-if="icon" 
      :name="icon" 
      :class="iconClasses"
    />
    
    <!-- Text content -->
    <span 
      v-if="hasText && !hideTextOnMobile" 
      :class="textClasses"
    >
      <slot />
    </span>
    
    <!-- Mobile: Show text only on larger screens if hideTextOnMobile is true -->
    <span 
      v-else-if="hasText && hideTextOnMobile" 
      :class="responsiveTextClasses"
    >
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { useResponsive } from '~/composables/useResponsive'

interface Props {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  
  /** Size variant - automatically adapts for mobile */
  size?: 'sm' | 'md' | 'lg'
  
  /** Icon name from UIcon */
  icon?: string
  
  /** Show only icon on mobile, text on desktop */
  hideTextOnMobile?: boolean
  
  /** Icon position relative to text */
  iconPosition?: 'left' | 'right'
  
  /** Button is in loading state */
  loading?: boolean
  
  /** Button is disabled */
  disabled?: boolean
  
  /** Make button full width on mobile */
  fullWidthOnMobile?: boolean
  
  /** Custom responsive behavior */
  responsive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  iconPosition: 'left',
  responsive: true,
  hideTextOnMobile: false,
  fullWidthOnMobile: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const slots = useSlots()
const { isMobile, responsive } = useResponsive()

// Check if button has text content
const hasText = computed(() => {
  return slots.default && slots.default().some(node => 
    node.type === Text || 
    (typeof node.children === 'string' && node.children.trim())
  )
})

// Base button classes with responsive behavior
const buttonClasses = computed(() => {
  const base = [
    'inline-flex items-center justify-center',
    'font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ]
  
  // Variant styles
  const variants = {
    primary: [
      'bg-indigo-600 hover:bg-indigo-700 text-white',
      'focus:ring-indigo-500',
      'disabled:hover:bg-indigo-600'
    ],
    secondary: [
      'bg-gray-200 hover:bg-gray-300 text-gray-900',
      'focus:ring-gray-500',
      'disabled:hover:bg-gray-200'
    ],
    ghost: [
      'hover:bg-gray-100 text-gray-700',
      'focus:ring-gray-500'
    ],
    outline: [
      'border-2 border-gray-300 hover:border-gray-400',
      'text-gray-700 hover:bg-gray-50',
      'focus:ring-gray-500'
    ],
    danger: [
      'bg-red-600 hover:bg-red-700 text-white',
      'focus:ring-red-500',
      'disabled:hover:bg-red-600'
    ]
  }
  
  // Responsive sizing
  const sizes = {
    sm: props.responsive ? [
      'px-2 py-1 text-xs rounded-md',  // Mobile
      'md:px-3 md:py-2 md:text-sm md:rounded-lg'  // Desktop
    ] : ['px-3 py-2 text-sm rounded-lg'],
    
    md: props.responsive ? [
      'px-3 py-2 text-sm rounded-lg',  // Mobile (larger for touch)
      'md:px-4 md:py-2 md:text-base'   // Desktop
    ] : ['px-4 py-2 text-base rounded-lg'],
    
    lg: props.responsive ? [
      'px-4 py-3 text-base rounded-lg', // Mobile
      'md:px-6 md:py-3 md:text-lg md:rounded-xl' // Desktop
    ] : ['px-6 py-3 text-lg rounded-xl']
  }
  
  // Full width on mobile option
  const width = props.fullWidthOnMobile ? 'w-full md:w-auto' : 'w-auto'
  
  // Minimum touch target size on mobile (44px recommended)
  const touchTarget = props.responsive ? 'min-h-[44px] md:min-h-0' : ''
  
  return [
    ...base,
    ...variants[props.variant],
    ...sizes[props.size],
    width,
    touchTarget
  ].flat().join(' ')
})

// Loading spinner classes
const loadingClasses = computed(() => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  
  return [
    sizeMap[props.size],
    'flex items-center justify-center'
  ].join(' ')
})

// Icon classes with responsive sizing
const iconClasses = computed(() => {
  const sizeMap = {
    sm: props.responsive ? 'w-4 h-4 md:w-4 md:h-4' : 'w-4 h-4',
    md: props.responsive ? 'w-5 h-5 md:w-5 md:h-5' : 'w-5 h-5',
    lg: props.responsive ? 'w-6 h-6 md:w-6 md:h-6' : 'w-6 h-6'
  }
  
  const spacing = hasText.value && !props.hideTextOnMobile ? 
    (props.iconPosition === 'right' ? 'ml-2' : 'mr-2') : ''
  
  return [sizeMap[props.size], spacing].filter(Boolean).join(' ')
})

// Text classes
const textClasses = computed(() => {
  const base = 'truncate'
  const spacing = props.icon && props.iconPosition === 'right' ? 'mr-2' : ''
  
  return [base, spacing].filter(Boolean).join(' ')
})

// Responsive text classes (hidden on mobile, shown on desktop)
const responsiveTextClasses = computed(() => {
  const base = 'hidden md:inline-block truncate'
  const spacing = props.icon && props.iconPosition === 'right' ? 'mr-2' : ''
  
  return [base, spacing].filter(Boolean).join(' ')
})

// Handle click with loading state protection
const handleClick = (event: MouseEvent) => {
  if (!props.loading && !props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* Additional responsive optimizations */
button {
  /* Ensure minimum touch target on mobile */
  @apply touch-manipulation;
  
  /* Prevent text selection on button */
  user-select: none;
  -webkit-user-select: none;
  
  /* Optimize for mobile interactions */
  -webkit-tap-highlight-color: transparent;
}

/* Custom focus styles for better accessibility */
button:focus-visible {
  @apply ring-2 ring-offset-2;
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  button {
    transition: none;
  }
}
</style>