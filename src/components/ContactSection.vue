<template>
  <section id="contact-section" class="fade-in-on-scroll bg-brand mx-auto min-h-full h-screen place-content-center">
    <p class="p-4 sm:p-8 md:p-16 font-droulers text-sm sm:text-base xl:text-lg place-self-center whitespace-pre-wrap text-pretty">
      A
    </p>
  </section>
</template>

<script setup>
import { useScroll } from '../composables/useScroll'

const { targetRef, isVisible } = useScroll(2000) 
</script>
