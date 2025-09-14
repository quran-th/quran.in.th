<!--
  Responsive Modal Component Example
  
  Demonstrates adaptive modal behavior:
  - Mobile: Full-screen slide-up modal
  - Desktop: Centered overlay modal
  - Shared functionality with responsive presentation
-->

<template>
  <Teleport to="body">
    <Transition
      :name="transitionName"
      appear
      @enter="onEnter"
      @leave="onLeave"
    >
      <div
        v-if="isOpen"
        :class="overlayClasses"
        @click="handleOverlayClick"
      >
        <div
          :class="modalClasses"
          role="dialog"
          :aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="contentId"
          @click.stop
        >
          <!-- Modal Header -->
          <header :class="headerClasses">
            <div class="flex-1">
              <h2
                :id="titleId"
                :class="titleClasses"
              >
                <slot name="title">{{ title }}</slot>
              </h2>
              <p
                v-if="subtitle || $slots.subtitle"
                :class="subtitleClasses"
              >
                <slot name="subtitle">{{ subtitle }}</slot>
              </p>
            </div>
            
            <button
              :class="closeButtonClasses"
              :aria-label="closeLabel"
              @click="handleClose"
            >
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
            </button>
          </header>
          
          <!-- Modal Content -->
          <main
            :id="contentId"
            :class="contentClasses"
          >
            <slot />
          </main>
          
          <!-- Modal Actions -->
          <footer
            v-if="$slots.actions"
            :class="actionsClasses"
          >
            <slot name="actions" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useResponsive } from '~/composables/useResponsive'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'

interface Props {
  /** Whether the modal is open */
  isOpen: boolean
  
  /** Modal title */
  title?: string
  
  /** Modal subtitle */
  subtitle?: string
  
  /** Close button aria-label */
  closeLabel?: string
  
  /** Whether clicking overlay closes modal */
  closeOnOverlayClick?: boolean
  
  /** Whether ESC key closes modal */
  closeOnEscape?: boolean
  
  /** Size variant for desktop */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  
  /** Custom z-index */
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  closeLabel: 'Close modal',
  closeOnOverlayClick: true,
  closeOnEscape: true,
  size: 'md',
  zIndex: 50
})

const emit = defineEmits<{
  close: []
  'update:isOpen': [value: boolean]
}>()

const { isMobile, responsive } = useResponsive()

// Generate unique IDs for accessibility
const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`
const contentId = `modal-content-${Math.random().toString(36).substr(2, 9)}`

// Modal element reference for focus trap
const modalRef = ref<HTMLElement>()
const { activate, deactivate } = useFocusTrap(modalRef, {
  immediate: false,
  allowOutsideClick: true
})

// Responsive transition names
const transitionName = computed(() => {
  return responsive({
    mobile: 'modal-slide-up',
    default: 'modal-fade'
  })
})

// Overlay classes with responsive backdrop
const overlayClasses = computed(() => {
  const base = 'fixed inset-0 flex items-end md:items-center justify-center'
  const backdrop = 'bg-black/50 backdrop-blur-sm'
  const zIndex = `z-${props.zIndex}`
  
  return [base, backdrop, zIndex].join(' ')
})

// Modal container classes with responsive sizing
const modalClasses = computed(() => {
  const base = [
    'bg-white dark:bg-slate-800',
    'shadow-xl',
    'flex flex-col',
    'max-h-full overflow-hidden'
  ]
  
  // Mobile: full width, slide up from bottom
  const mobile = [
    'w-full',
    'rounded-t-3xl',
    'max-h-[90vh]'
  ]
  
  // Desktop: centered with size variants
  const sizeMap = {
    sm: 'md:max-w-sm',
    md: 'md:max-w-md',
    lg: 'md:max-w-lg',
    xl: 'md:max-w-xl',
    full: 'md:max-w-full md:m-4'
  }
  
  const desktop = [
    'md:w-full',
    sizeMap[props.size],
    'md:rounded-2xl',
    'md:max-h-[90vh]'
  ]
  
  return [...base, ...mobile, ...desktop].join(' ')
})

// Header classes with responsive padding
const headerClasses = computed(() => {
  return [
    'flex items-start justify-between',
    'p-4 md:p-6',
    'border-b border-gray-200 dark:border-gray-700',
    'flex-shrink-0'
  ].join(' ')
})

// Title classes with responsive typography
const titleClasses = computed(() => {
  return [
    'text-lg md:text-xl font-semibold',
    'text-gray-900 dark:text-gray-100',
    'leading-6'
  ].join(' ')
})

// Subtitle classes
const subtitleClasses = computed(() => {
  return [
    'text-sm text-gray-500 dark:text-gray-400',
    'mt-1'
  ].join(' ')
})

// Close button classes with touch-friendly sizing
const closeButtonClasses = computed(() => {
  return [
    'w-8 h-8 md:w-6 md:h-6',
    'rounded-full',
    'bg-gray-100 dark:bg-gray-700',
    'hover:bg-gray-200 dark:hover:bg-gray-600',
    'flex items-center justify-center',
    'text-gray-500 dark:text-gray-400',
    'transition-colors'
  ].join(' ')
})

// Content classes with responsive padding and scrolling
const contentClasses = computed(() => {
  return [
    'flex-1 overflow-y-auto',
    'p-4 md:p-6',
    'text-gray-700 dark:text-gray-300'
  ].join(' ')
})

// Actions classes with responsive layout
const actionsClasses = computed(() => {
  return [
    'flex-shrink-0',
    'p-4 md:p-6',
    'border-t border-gray-200 dark:border-gray-700',
    'flex flex-col-reverse md:flex-row',
    'gap-3 md:gap-2',
    'md:justify-end'
  ].join(' ')
})

// Event handlers
const handleClose = () => {
  emit('close')
  emit('update:isOpen', false)
}

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    handleClose()
  }
}

// Keyboard event handling
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnEscape) {
    handleClose()
  }
}

// Transition hooks
const onEnter = () => {
  activate()
  document.addEventListener('keydown', handleKeydown)
  document.body.style.overflow = 'hidden'
}

const onLeave = () => {
  deactivate()
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
}

// Watch for open state changes
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      activate()
    })
  } else {
    deactivate()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Mobile slide-up transition */
.modal-slide-up-enter-active,
.modal-slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-slide-up-enter-from {
  transform: translateY(100%);
}

.modal-slide-up-leave-to {
  transform: translateY(100%);
}

/* Desktop fade transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Backdrop transition */
.modal-slide-up-enter-active .modal-fade-enter-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Smooth scrolling for content */
.overflow-y-auto {
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

/* Focus styles for accessibility */
button:focus-visible {
  @apply ring-2 ring-indigo-500 ring-offset-2;
}

/* Prevent background scroll on mobile */
body:has(.modal-slide-up-enter-active) {
  overflow: hidden;
  touch-action: none;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .bg-white {
    @apply border-2 border-gray-900;
  }
  
  .dark .bg-slate-800 {
    @apply border-2 border-gray-100;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .modal-slide-up-enter-active,
  .modal-slide-up-leave-active,
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition-duration: 0.1s;
  }
}
</style>