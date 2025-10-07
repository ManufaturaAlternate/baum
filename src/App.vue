<template>
  <main role="main" aria-label="Britta Baumann Portfolio">
    <div 
      id="canvas-container" 
      class="h-screen" 
      data-lenis-snap
      role="banner"
      aria-label="Hero section with canvas animation"
    >
      <CanvasSection />
      <Header />
    </div>
    
    <div 
      id="bio-container" 
      class="w-full min-h-screen" 
      data-lenis-snap
      role="region"
      aria-labelledby="bio-heading"
      aria-label="About Britta Baumann"
    >
      <BioSection />
    </div>
    
    <div 
      id="contact-container" 
      class="min-h-screen" 
      data-lenis-snap
      role="region"
      aria-labelledby="contact-heading"
      aria-label="Contact information"
    >
      <ContactSection />
    </div>
    
    <Footer role="contentinfo" aria-label="Site footer" />
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

provideHover()

const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -13 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 0.98,
  lerp: 0.025,  // Lower value = smoother
  smoothTouch: false,
  touchMultiplier: 2,
  syncTouch: true,
  syncTouchLerp: 0.075,
  infinite: false,
  snapType: 'mandatory',
  snapDirections: {
    y: true,
    x: false
  },
  snapSizes: {
    y: 100,  // percentage of viewport height
    x: 100
    }
})

provideLenis(lenis)

// Smooth RAF loop
let rafId = null
function raf(time) {
  lenis.raf(time)
  rafId = requestAnimationFrame(raf)
}

onMounted(() => {
  rafId = requestAnimationFrame(raf)
  
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
</script>

<style>
html.lenis {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto;
}

.lenis.lenis-stopped {
  overflow: hidden;
}

.sticky {
  position: sticky;
  will-change: transform;
  transform: translateZ(0);
}

:root {
  --scroll-velocity: 0;
}

/* Screen reader only class for accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus styles for keyboard navigation */
*:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Skip to content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #3b82f6;
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 6px;
}
</style>