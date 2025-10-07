<template>
  <div class="cursor-none ">
    <header class="pt-2 pb-4 px-2 lg:px-4 flex fixed inset-x-0 top-0 justify-between text-black bg-transparent border-none z-10 fade-in-2">
      <div 
        class="relative group cursor-none" 
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
        @click="scrollToCanvas"
        role="button"
        tabindex="0"
        :aria-label="textData.accessibility.aria_labels.logo_button"
      >
        <span class="font-droulers absolute">{{ textData.header.name.first }}</span>
        <span class="absolute left-2 lg:left-3 transition-all duration-1000 ease-in-out opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-[-1rem] font-droulers">{{ textData.header.name.middle }}</span>
        <span class="font-droulers absolute ml-4 transition-all duration-1000 ease-in-out group-hover:ml-16 lg:group-hover:ml-20 whitespace-nowrap">{{ textData.header.name.last }}</span>
      </div>
      <a 
        href="/chaos.html" 
        class="relative group cursor-none inline-block"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
        :aria-label="textData.accessibility.aria_labels.chaos_link"
      >
        <span class="font-droulers transition-opacity duration-200 ease-in group-hover:opacity-0 block">{{ textData.header.chaos_project }}</span>
        <span class="font-droulers2 absolute inset-0 opacity-0 transition-opacity duration-200 ease-in group-hover:opacity-100 block">{{ textData.header.chaos_project }}</span>
      </a>
    </header>

    <!-- Custom Cursor -->
    <div class="cursor-container fade-in-3">
      <!-- Instant-following dot -->
      <div 
        class="cursor-dot"
        :style="{
          transform: `translate3d(${cursorX}px, ${cursorY}px, 0)`,
          opacity: isHidden ? 0 : 1
        }"
      ></div>
    
      <div class="cursor-mask"
      
        :style="{
         transform: `translate3d(${cursorX}px, ${cursorY}px, 0)`,
         width: isHovered ? '34px' : '28px',
         height: isHovered ? '34px' : '28px',
         margin: isHovered ? '-17px 0 0 -17px' : '-14px 0 0 -14px',
         opacity: isHidden ? 0 : 1
        }">



      </div>





      <!-- Smooth-following circle -->
      <div 
        class="cursor-circle"
        :style="{
         transform: `translate3d(${cursorX}px, ${cursorY}px, 0)`,
         width: isHovered ? '36px' : '26px',
         height: isHovered ? '36px' : '26px',
         margin: isHovered ? '-18px 0 0 -18px' : '-13px 0 0 -13px',
         opacity: isHidden ? 0 : 1
        }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCursor } from '../composables/useCursor'
import { useScroll } from '../composables/useScroll'
import { useHover } from '../composables/useHover'
import textData from '@/data/text.json'

const { cursorX, cursorY, isHidden } = useCursor()
const { scrollToElement } = useScroll()
const { isHovered, setHovered } = useHover()

function scrollToCanvas() {
  const canvasContainer = document.getElementById('canvas-container')
  if (canvasContainer) {
    scrollToElement(canvasContainer)
  }
}
</script>

