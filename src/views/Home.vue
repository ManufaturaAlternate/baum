<template>
  <main role="main" :aria-label="textData.accessibility.aria_labels.main">
    <div id="canvas-container" class="h-screen" data-lenis-snap role="banner" :aria-label="textData.accessibility.aria_labels.hero">
      <CanvasSection />
    </div>

    <div id="bio-container" class="w-full min-h-screen" data-lenis-snap role="region" aria-labelledby="bio-heading" :aria-label="textData.accessibility.aria_labels.about">
      <div class="bio-content" data-speed="0.2">
        <BioSection />
      </div>
    </div>

    <div id="contact-container" class="min-h-screen" data-lenis-snap role="region" aria-labelledby="contact-heading" :aria-label="textData.accessibility.aria_labels.contact">
      <ContactSection />
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLenis } from '@/composables/useLenis'
import textData from '@/data/text.json'
import CanvasSection from '@/components/CanvasSection.vue'
import BioSection from '@/components/BioSection.vue'
import ContactSection from '@/components/ContactSection.vue'

const canvasSection = ref(null)
const router = useRouter()
const lenis = useLenis()

let sections = []
let isSnapping = false
let snapTimeout = null
let lastScrollTime = 0
let isNavigating = false

// Disable snap during route transitions
router.beforeEach(() => {
  isNavigating = true
})

router.afterEach(() => {
  setTimeout(() => { isNavigating = false }, 1500)
})

onMounted(() => {
  if (!lenis) return

  sections = [
    { element: canvasSection.value?.$el, speed: 0.3 },
    { element: document.querySelector('.bio-content'), speed: 0.12 },
    { element: document.querySelector('.contact-content'), speed: 0.08 }
  ].filter(s => s.element)

  sections.forEach(section => {
    const offset = (section.speed - 1) * section.element.offsetHeight
    section._snapTarget = section.element.offsetTop + offset
  })

  const handleScroll = () => {
    if (isSnapping || isNavigating) return
    lastScrollTime = Date.now()
    
    clearTimeout(snapTimeout)
    snapTimeout = setTimeout(() => {
      if (Date.now() - lastScrollTime < 100 || isNavigating) return
      snapToNearest()
    }, 150)
  }

  const snapToNearest = () => {
    if (isSnapping || !lenis || isNavigating) return
    
    const scrollY = window.scrollY || window.pageYOffset
    const windowHeight = window.innerHeight
    const threshold = windowHeight * 0.3

    let closest = null
    let minDist = Infinity

    sections.forEach(section => {
      const target = section._snapTarget ?? section.element.offsetTop
      const dist = Math.abs(scrollY - target)
      if (dist < minDist && dist < threshold) {
        minDist = dist
        closest = section
      }
    })

    if (closest) smoothSnapTo(closest.element)
  }

  const smoothSnapTo = (element) => {
    if (!lenis || isSnapping || !element || isNavigating) return
    isSnapping = true
    const target = element._snapTarget ?? element.offsetTop

    lenis.scrollTo(target, {
      duration: 0.8,
      easing: (t) => 1 - (1 - t) ** 4,
      onComplete: () => { isSnapping = false }
    })
  }

  lenis.on('scroll', handleScroll)

  onUnmounted(() => {
    clearTimeout(snapTimeout)
    if (lenis?.off) lenis.off('scroll', handleScroll)
  })
})
</script>

<style>
/* styles in assets/main.css */
</style>