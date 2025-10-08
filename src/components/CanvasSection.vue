<template> 
  <section 
    id="canvas-section"
    ref="targetRef"
    class="h-screen overflow-hidden fade-in-3"
  >
    <!-- Static image for small screens only -->
    <div class="block sm:hidden absolute inset-0">
      <img 
        src="../assets/canvas-static.png" 
        alt="Static Canvas" 
        class="w-full h-full object-cover" 
      />
    </div>
    <!-- Canvas container -->
    <div class="hidden sm:block absolute inset-0">
      <canvas 
        ref="glcanvas" 
        id="glcanvas" 
        tabindex="1" 
        class="absolute top-0 left-0 w-full h-full"
      ></canvas>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useScroll } from '../composables/useScroll'

const targetRef = ref(null) // Ensure targetRef is defined as a ref
const glcanvas = ref(null)
const isLoaded = ref(false)
const { isVisible } = useScroll(2000)
let patchInstance = null

const initializeCanvas = (canvas) => {
  // Set initial dimensions
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  
  // Hide canvas initially
  canvas.style.visibility = 'hidden'
  
  return new window.CABLES.Patch({
    patchFile: '/BaumIntro.json',
    prefixAssetPath: '',
    assetPath: '/assets/',
    jsPath: '/',
    canvas: canvas,
    glCanvasResizeToWindow: true,
    onError: (initiator, ...args) => {
      console.error('[CABLES Error]', initiator, ...args)
    },
    onPatchLoaded: (patch) => {
      console.log('CABLES Patch loaded successfully')
      isLoaded.value = true
      // Show canvas after a brief delay
      setTimeout(() => {
        canvas.style.visibility = 'visible'
      }, 50)
    },
    onFinishedLoading: (patch) => {
      console.log('CABLES finished loading')
    },
    settings: { 
      alpha: true, 
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
      antialias: true
    }
  })
}

onMounted(() => {
  if (window.CABLES && window.CABLES.Patch) {
    console.log('CABLES is available, initializing...')
    
    const canvas = glcanvas.value
    if (!canvas) return
    
    try {
      patchInstance = initializeCanvas(canvas)
    } catch (error) {
      console.error('Error initializing CABLES patch:', error)
    }
  }
})

onUnmounted(() => {
  if (patchInstance) {
    patchInstance.dispose()
  }
})
</script>

<style scoped>
#glcanvas {
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
</style>