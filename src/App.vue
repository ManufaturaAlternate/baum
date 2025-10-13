<template>
  <Header />
  <main role="main" :aria-label="ariaMainLabel">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>
  <Footer />
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import Lenis from 'lenis'
import { provideLenis } from '@/composables/useLenis'
import { setScrollDefaults } from '@/composables/useScroll'
import { provideHover } from '@/composables/useHover'
import textData from '@/data/text.json'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

setScrollDefaults({ duration: 1.2, easing: t => 1 - (1 - t) ** 5 })
provideHover()

const ariaMainLabel = computed(() => textData?.accessibility?.aria_labels?.main ?? 'Main')

const lenis = new Lenis({ 
  duration: 1.0, 
  easing: (t) => 1 - (1 - t) ** 3 
})
provideLenis(lenis)

let rafId = 0
function raf(time) {
  lenis.raf(time)
  rafId = requestAnimationFrame(raf)
}

onMounted(() => {
  rafId = requestAnimationFrame(raf)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  lenis.destroy()
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from {
  opacity: 0;
}

.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>