<template>
  <footer class="p-4 flex w-full fixed inset-x-0 bottom-0 justify-between text-black bg-transparent border-none text-center fade-in-2">

     <div class="flex gap-4">
      <p class="relative group text-left whitespace-pre-line"
       @mouseenter="setHovered(true)"
        @mouseleave="setHovered(false)">
        <span class="font-droulers transition-opacity duration-200 ease-in group-hover:opacity-0">Works</span>
        <span class="font-droulers2 absolute left-0 top-0 opacity-0 transition-opacity duration-200 ease-in group-hover:opacity-100">Works</span>
      </p>
      <p class="relative group text-left whitespace-pre-line"
       @mouseenter="setHovered(true)"
        @mouseleave="setHovered(false)">
        <span class="font-droulers transition-opacity duration-200 ease-in group-hover:opacity-0">Editions</span>
        <span class="font-droulers2 absolute left-0 top-0 opacity-0 transition-opacity duration-200 ease-in group-hover:opacity-100">Editions</span>
      </p>
    </div>
    
    <div class="flex gap-4">
      <p 
        class="cursor-pointer relative group text-right" 
        @click="scrollToBio"
        @mouseenter="setHovered(true)"
        @mouseleave="setHovered(false)"
      >
        <span class="font-droulers transition-opacity duration-200 ease-in group-hover:opacity-0">Bio</span>
        <span class="font-droulers2 absolute right-0 top-0 opacity-0 transition-opacity duration-200 ease-in group-hover:opacity-100">Bio</span>
      </p>
      <p 
        class="cursor-pointer relative group text-right"
         @mouseenter="setHovered(true)"
        @mouseleave="setHovered(false)" 
        @click="scrollToContact"
      >
        <span class="font-droulers transition-opacity duration-200 ease-in group-hover:opacity-0">Contact</span>
        <span class="font-droulers2 absolute right-0 top-0 opacity-0 transition-opacity duration-200 ease-in group-hover:opacity-100">Contact</span>
      </p>
    </div>
  </footer>
</template>

<script setup>
import { useScroll } from '../composables/useScroll'
import { useHover } from '../composables/useHover'

const { scrollToElement } = useScroll()
const { isHovered, setHovered } = useHover()

function scrollToBio() {
  const bioSection = document.getElementById('bio-section')
  if (bioSection) {
    scrollToElement(bioSection)
  }
}

function scrollToContact() {
  const contactSection = document.getElementById('contact-section')
  if (contactSection) {
    scrollToElement(contactSection)
  }
}
</script>


