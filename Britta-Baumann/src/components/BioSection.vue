<template>
  <section 
    id="bio-section"
    ref="targetRef"
    class="sticky top-0 h-[60vh] bg-brand overflow-hidden"
    :class="{ 'visible': isVisible }"
  >
    <div 
      class="max-w-3xl mx-auto px-4 absolute top-1/2 left-1/2 w-full"
      :style="{
        transform: `translate3d(-50%, calc(-50% + ${scrollProgress}px), 0)`,
        opacity: opacity,
        transition: 'opacity 0.6s var(--bezier-smooth)'
      }"
    >

      <p class="font-droulers text-black text-sm sm:text-base xl:text-lg whitespace-pre-wrap text-pretty">
        Britta Baumann is a German conceptual artist working with photography, video, and installation. 
        She studied photography and Multimedia Art at Belas-Artes da Universidade de Lisboa, Faculty 
        of Fine Arts and at the University of Applied Sciences and Arts, Dortmund.
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useScroll } from '../composables/useScroll'
import { useLenis } from '../composables/useLenis'

const { targetRef, isVisible } = useScroll(2000)
const scrollProgress = ref(0)
const normalizedProgress = ref(0)

let lenis = null
let scrollHandler = null

const opacity = computed(() => {
  return Math.max(0, Math.min(1, 1 - Math.abs(normalizedProgress.value - 0.5) * 2))
})

onMounted(() => {
  try {
    lenis = useLenis()
    if (lenis) {
      scrollHandler = ({ scroll, progress }) => {
        const section = targetRef.value
        if (!section) return

        const rect = section.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const sectionHeight = section.offsetHeight
        
        // Calculate scroll progress relative to viewport
        normalizedProgress.value = (viewportHeight - rect.top) / (viewportHeight + sectionHeight)
        
        // Smooth parallax effect
        scrollProgress.value = rect.top * 0.3
      }
      
      lenis.on('scroll', scrollHandler)
    }
  } catch (error) {
    console.warn('Lenis not available:', error)
  }
})

onBeforeUnmount(() => {
  if (lenis && scrollHandler) {
    lenis.off('scroll', scrollHandler)
  }
})
</script>

<style scoped>
.sticky {
  position: sticky;
  will-change: transform;
  transform: translateZ(0);
}
</style>