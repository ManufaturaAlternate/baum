<template>
  <main>
    <div id="canvas-container" class="h-screen" data-lenis-snap>
      <CanvasSection />
    <Header />

    
    </div>
    <div id="bio-container" class="w-full min-h-screen" data-lenis-snap>
      <BioSection />
    </div>
    <div id="contact-container" class="min-h-screen" data-lenis-snap>
      <ContactSection />
    </div>
    <Footer />
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
</style>