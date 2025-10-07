<template>
  <section 
    id="bio-section"
    class="sticky top-0 h-[100vh] bg-brand overflow-hidden"
  >
    <div 
      class="max-w-3xl mx-auto px-4 absolute top-1/2 left-1/2 w-full"
      style="transform: translate3d(-50%, -50%, 0);"
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
// Simplified BioSection without scroll handlers that conflict with manual scroll
</script>

<style scoped>
.sticky {
  position: sticky;
  will-change: transform;
  transform: translateZ(0);
}
</style>