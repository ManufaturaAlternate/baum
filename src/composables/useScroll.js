import { useLenis } from './useLenis'

export function useScroll() {
  const lenis = useLenis()
  
  const scrollToElement = (element, options = {}) => {
    if (!element || !lenis) {
      console.warn('Element or Lenis not available')
      return
    }
    
    let targetY
    
    if (element.id === 'bio-container') {
      // Use same calculation as snap logic
      const windowHeight = window.innerHeight
      targetY = element.offsetTop + (element.offsetHeight * 0.3) - (windowHeight / 2)
    } else {
      const windowHeight = window.innerHeight
      targetY = element.offsetTop + (element.offsetHeight / 2) - (windowHeight / 2)
    }
    
    targetY = Math.max(0, targetY)
    
    // Use Lenis's built-in scrollTo with proper options
    lenis.scrollTo(targetY, {
      duration: 3, // 3 seconds for smooth manual scroll
      easing: (t) => 1 - Math.pow(1 - t, 4), // Smooth easing
      ...options
    })
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