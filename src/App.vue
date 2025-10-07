<template>
  <!-- Header as separate top-level element -->
  <Header />
  
  <main role="main" :aria-label="textData.accessibility.aria_labels.main">
    <div 
      id="canvas-container" 
      class="h-screen" 
      data-lenis-snap
      role="banner"
      :aria-label="textData.accessibility.aria_labels.hero"
    >
      <CanvasSection />
    </div>
    
    <div 
      id="bio-container" 
      class="w-full min-h-screen" 
      data-lenis-snap
      role="region"
      aria-labelledby="bio-heading"
      :aria-label="textData.accessibility.aria_labels.about"
    >
      <div class="bio-content" data-speed="0.2">
        <BioSection />
      </div>
    </div>
    
    <div 
      id="contact-container" 
      class="min-h-screen" 
      data-lenis-snap
      role="region"
      aria-labelledby="contact-heading"
      :aria-label="textData.accessibility.aria_labels.contact"
    >
      <ContactSection />
    </div>
    
    <Footer role="contentinfo" :aria-label="textData.accessibility.aria_labels.footer" />
  </main>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import Lenis from 'lenis'

import { provideHover } from './composables/useHover'
import { provideLenis } from './composables/useLenis'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import CanvasSection from './components/CanvasSection.vue'
import BioSection from './components/BioSection.vue'
import ContactSection from './components/ContactSection.vue'
import textData from '@/data/text.json'

provideHover()

const lenis = new Lenis({
  duration: 2.4, // Longer duration for extended smoothness
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -13 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 0.7, // Ultra-gentle
  lerp: 0.05, // Increased for more responsive manual scrolls
  smoothTouch: false,
  touchMultiplier: 2,
  syncTouch: true,
  syncTouchLerp: 0.06, // Increased for more responsive manual scrolls
  infinite: false
})

// Provide Lenis instance immediately after creation using the correct function
provideLenis(lenis)
console.log('Lenis provided:', lenis)

// Simplified snap implementation - no manual scroll interference
let snapElements = []
let isSnapping = false
let snapTimeout = null

const initSnap = () => {
  snapElements = Array.from(document.querySelectorAll('[data-lenis-snap]'))
}

const findClosestSnapPoint = () => {
  const scrollY = window.scrollY
  const windowHeight = window.innerHeight
  const scrollCenter = scrollY + windowHeight / 2
  
  let closestElement = null
  let minDistance = Infinity
  
  snapElements.forEach(element => {
    let snapTarget = element.offsetTop
    
    // For bio container, snap to where the text will be visually centered
    if (element.id === 'bio-container') {
      // The text is positioned 30% down from top of container (transform: -30%)
      // So we need to scroll to position that puts this 30% point at viewport center
      snapTarget = element.offsetTop + (element.offsetHeight * 0.3) - (windowHeight / 2)
    } else {
      // Regular centering for other elements
      snapTarget = element.offsetTop + (element.offsetHeight / 2) - (windowHeight / 2)
    }
    
    const distance = Math.abs(scrollY - snapTarget)
    
    if (distance < minDistance) {
      minDistance = distance
      closestElement = element
      closestElement._snapTarget = snapTarget // Store the target position
    }
  })
  
  return closestElement
}

const smoothSnapTo = (element) => {
  if (isSnapping || !element) return
  
  isSnapping = true
  
  // Use the calculated snap target
  const targetPosition = element._snapTarget || element.offsetTop
  
  lenis.scrollTo(targetPosition, {
    duration: 1.8,
    easing: (t) => {
      return 1 - Math.pow(1 - t, 3)
    },
    onComplete: () => {
      isSnapping = false
    }
  })
}

// Smooth RAF loop
let rafId = null
function raf(time) {
  lenis.raf(time)
  rafId = requestAnimationFrame(raf)
}

onMounted(() => {
  rafId = requestAnimationFrame(raf)
  
  // Initialize snap and parallax elements
  setTimeout(() => {
    initSnap()
    initParallax()
  }, 100)
  
  lenis.on('scroll', ({ velocity }) => {
    document.documentElement.style.setProperty('--scroll-velocity', velocity)
    
    // Update parallax on every scroll
    updateParallax()
    
    clearTimeout(snapTimeout)
    
    // Simple snap logic - only when velocity is very low
    if (!isSnapping && Math.abs(velocity) < 0.5) { // Adjusted threshold for quicker response
      snapTimeout = setTimeout(() => {
        if (!isSnapping) {
          const closestElement = findClosestSnapPoint()
          if (closestElement) {
            const currentY = window.scrollY
            const targetY = closestElement._snapTarget || closestElement.offsetTop
            const distance = Math.abs(currentY - targetY)
            
            if (distance > window.innerHeight * 0.01) {
              smoothSnapTo(closestElement)
            }
          }
        }
      }, 30) // Reduced delay to 30ms for quicker snapping
    }
  })

  // Optional: Add scroll listener for debugging
  lenis.on('scroll', ({ velocity }) => {
    document.documentElement.style.setProperty('--scroll-velocity', velocity)
  })

  // Add accessibility announcement for smooth scrolling
  const scrollAnnouncement = document.createElement('div')
  scrollAnnouncement.setAttribute('aria-live', 'polite')
  scrollAnnouncement.setAttribute('aria-atomic', 'true')
  scrollAnnouncement.className = 'sr-only'
  scrollAnnouncement.id = 'scroll-announcements'
  document.body.appendChild(scrollAnnouncement)
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  lenis.destroy()
})

// Parallax elements
let parallaxElements = []

const initParallax = () => {
  parallaxElements = Array.from(document.querySelectorAll('[data-speed]'))
}

const updateParallax = () => {
  const scrollY = window.scrollY
  
  parallaxElements.forEach(element => {
    const speed = parseFloat(element.dataset.speed)
    const yPos = -(scrollY * speed)
    element.style.transform = `translate3d(0, ${yPos}px, 0)`
  })
}

// Helper function to get current visible section
const getCurrentVisibleSection = () => {
  const scrollY = window.scrollY
  const windowHeight = window.innerHeight
  const scrollCenter = scrollY + windowHeight / 2
  
  if (scrollCenter <= window.innerHeight) return textData.accessibility.scroll_announcements.home
  
  const bioContainer = document.getElementById('bio-container')
  const contactContainer = document.getElementById('contact-container')
  
  if (bioContainer && scrollCenter >= bioContainer.offsetTop && scrollCenter < contactContainer.offsetTop) {
    return textData.accessibility.scroll_announcements.about
  }
  
  if (contactContainer && scrollCenter >= contactContainer.offsetTop) {
    return textData.accessibility.scroll_announcements.contact
  }
  
  return null
}
</script>

<style>
/* All styles moved to assets/main.css */
</style>