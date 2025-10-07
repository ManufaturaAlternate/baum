<template>
  <footer class="p-4 flex w-full fixed inset-x-0 bottom-0 justify-between text-black bg-transparent border-none text-center fade-in-2">

     <div class="flex gap-4">
      <p class="relative group text-left whitespace-pre-line inline-block"
       @mouseenter="setHovered(true)"
        @mouseleave="setHovered(false)">
        <span class="font-droulers transition-opacity duration-200 ease-in group-hover:opacity-0 block">{{ textData.footer.left.works }}</span>
        <span class="font-droulers2 absolute inset-0 opacity-0 transition-opacity duration-200 ease-in group-hover:opacity-100 block">{{ textData.footer.left.works }}</span>
      </p>
      <p class="relative group text-left whitespace-pre-line inline-block"
       @mouseenter="setHovered(true)"
        @mouseleave="setHovered(false)">
        <span class="font-droulers transition-opacity duration-200 ease-in group-hover:opacity-0 block">{{ textData.footer.left.editions }}</span>
        <span class="font-droulers2 absolute inset-0 opacity-0 transition-opacity duration-200 ease-in group-hover:opacity-100 block">{{ textData.footer.left.editions }}</span>
      </p>
    </div>
    
    <div class="flex gap-4">
      <p 
        class="cursor-pointer relative group text-right inline-block" 
        @click="scrollToBio"
        @mouseenter="setHovered(true)"
        @mouseleave="setHovered(false)"
      >
        <span class="font-droulers transition-opacity duration-200 ease-in group-hover:opacity-0 block">{{ textData.footer.right.bio }}</span>
        <span class="font-droulers2 absolute inset-0 opacity-0 transition-opacity duration-200 ease-in group-hover:opacity-100 block">{{ textData.footer.right.bio }}</span>
      </p>
      <p 
        class="cursor-pointer relative group text-right inline-block"
         @mouseenter="setHovered(true)"
        @mouseleave="setHovered(false)" 
        @click="scrollToContact"
      >
        <span class="font-droulers transition-opacity duration-200 ease-in group-hover:opacity-0 block">{{ textData.footer.right.contact }}</span>
        <span class="font-droulers2 absolute inset-0 opacity-0 transition-opacity duration-200 ease-in group-hover:opacity-100 block">{{ textData.footer.right.contact }}</span>
      </p>
    </div>
  </footer>
</template>

<script setup>
import { useScroll } from '../composables/useScroll'
import { useHover } from '../composables/useHover'
import textData from '@/data/text.json'

const { scrollToElement } = useScroll()
const { isHovered, setHovered } = useHover()

function scrollToBio() {
  const bioContainer = document.getElementById('bio-container')
  if (bioContainer) {
    scrollToElement(bioContainer)
  }
}

function scrollToContact() {
  const contactContainer = document.getElementById('contact-container')
  if (contactContainer) {
    scrollToElement(contactContainer)
  }
}
</script>



