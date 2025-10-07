import { ref, onMounted, onUnmounted } from 'vue'
import { announceToScreenReader, setPageTitle } from '@/utils/accessibility'

export function useAccessibility() {
  const isReducedMotion = ref(false)
  const announcements = ref([])
  
  const checkReducedMotion = () => {
    isReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  
  const announce = (message, priority = 'polite') => {
    announceToScreenReader(message, priority)
    announcements.value.push({
      message,
      timestamp: Date.now()
    })
  }
  
  const updatePageTitle = (title) => {
    setPageTitle(title)
  }
  
  const handleKeyboardNavigation = (event) => {
    // Handle keyboard shortcuts
    if (event.altKey && event.key === '1') {
      document.querySelector('main')?.focus()
      announce('Jumped to main content')
    }
    
    if (event.altKey && event.key === '2') {
      document.querySelector('nav')?.focus()
      announce('Jumped to navigation')
    }
  }
  
  onMounted(() => {
    checkReducedMotion()
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', checkReducedMotion)
    
    document.addEventListener('keydown', handleKeyboardNavigation)
    
    return () => {
      mediaQuery.removeEventListener('change', checkReducedMotion)
      document.removeEventListener('keydown', handleKeyboardNavigation)
    }
  })
  
  return {
    isReducedMotion,
    announcements,
    announce,
    updatePageTitle,
    checkReducedMotion
  }
}
