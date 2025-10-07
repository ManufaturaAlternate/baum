import { useLenis } from './useLenis'

export function useScroll() {
  const lenis = useLenis()
  
  const scrollToElement = (element, options = {}) => {
    console.log('=== MANUAL SCROLL START ===')
    console.log('Element:', element?.id)
    
    if (!element) {
      console.warn('Element not found for scrolling')
      return
    }
    
    if (!lenis) {
      console.warn('Lenis not available, using native scroll')
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      })
      return
    }
    
    // Set manual scrolling flag immediately
    if (lenis.setManualScrolling) {
      lenis.setManualScrolling(true)
    }
    
    // Get current and target positions
    const startY = window.scrollY
    let targetY = element.offsetTop
    
    // Special handling for bio container - just center it normally
    if (element.id === 'bio-container') {
      const windowHeight = window.innerHeight
      // Simple centering without parallax compensation
      targetY = element.offsetTop - (windowHeight / 2) + (element.offsetHeight / 2)
      targetY = Math.max(0, targetY)
    }
    
    const distance = targetY - startY
    
    console.log('Start position:', startY)
    console.log('Target position (compensated):', targetY)
    console.log('Distance to scroll:', distance)
    
    // Manual animation instead of relying on Lenis duration
    const duration = 4000 // 4 seconds in milliseconds
    const startTime = performance.now()
    
    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Smooth easing function
      const eased = 1 - Math.pow(1 - progress, 4)
      
      // Calculate current position
      const currentY = startY + (distance * eased)
      
      try {
        // Use lenis.scrollTo with immediate: true for instant positioning
        lenis.scrollTo(currentY, { immediate: true })
        
        if (progress % 0.1 < 0.02) { // Log every 10% to reduce console spam
          console.log(`Manual scroll progress: ${(progress * 100).toFixed(0)}%`)
        }
      } catch (error) {
        console.error('Scroll animation error:', error)
        // Stop animation on error
        if (lenis.setManualScrolling) {
          lenis.setManualScrolling(false)
        }
        return
      }
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll)
      } else {
        console.log('MANUAL SCROLL COMPLETED')
        // Reset manual scrolling flag after completion
        setTimeout(() => {
          if (lenis.setManualScrolling) {
            lenis.setManualScrolling(false)
          }
        }, 1000)
      }
    }
    
    // Start the animation
    requestAnimationFrame(animateScroll)
  }
  
  const scrollToTop = (options = {}) => {
    if (!lenis) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    
    lenis.scrollTo(0, {
      duration: 3,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      ...options
    })
  }
  
  const scrollToPosition = (position, options = {}) => {
    if (!lenis) {
      window.scrollTo({ top: position, behavior: 'smooth' })
      return
    }
    
    lenis.scrollTo(position, {
      duration: 3,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      ...options
    })
  }

  return {
    scrollToElement,
    scrollToTop,
    scrollToPosition
  }
}