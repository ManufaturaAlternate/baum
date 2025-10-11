<template> 
  <section 
    id="canvas-section"
    ref="targetRef"
    class="h-screen overflow-hidden fade-in-3"
  >
    <!-- Static image for small screens only -->
    <div class="block sm:hidden absolute inset-0">
      <img 
        :src="staticImageUrl || '../assets/canvas-static.png'" 
        alt="Static Canvas" 
        class="w-full h-full object-cover" 
        @error="handleImageError"
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
import protectedAssets from '../services/protectedAssets'

const targetRef = ref(null)
const glcanvas = ref(null)
const isLoaded = ref(false)
const staticImageUrl = ref(null)
const { isVisible } = useScroll(2000)
let patchInstance = null

const loadProtectedAssets = async () => {
  try {
    console.log('Loading protected static image...')
    // Load static image for mobile - now directly from Base64
    staticImageUrl.value = await protectedAssets.getStaticImage()
    console.log('Static image loaded successfully')
  } catch (error) {
    console.error('Failed to load protected static image:', error)
    // Use fallback image from public folder
    staticImageUrl.value = '/canvas-static-fallback.png'
  }
}

const initializeCanvas = async (canvas) => {
  // Set initial dimensions
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  
  // Hide canvas initially
  canvas.style.visibility = 'hidden'
  
  try {
    // Check if CABLES is properly loaded
    if (!window.CABLES || !window.CABLES.Patch) {
      console.error('CABLES library not loaded properly')
      throw new Error('CABLES library not available')
    }

    console.log('Loading CABLES configuration...')
    // Fetch protected CABLES config - now directly decoded
    const patchData = await protectedAssets.getCablesConfig()
    console.log('CABLES config loaded:', patchData)
    
    const assetPath = protectedAssets.getCablesAssetsPath()
    const jsPath = protectedAssets.getCablesOpsPath()

    const patch = new window.CABLES.Patch({
      prefixAssetPath: '',
      assetPath: assetPath,
      jsPath: jsPath,
      canvas: canvas,
      glCanvasResizeToWindow: true,
      onError: (initiator, ...args) => {
        console.error('[CABLES Error]', initiator, ...args)
      },
      onAssetLoadError: (assetPath, error) => {
        console.error('[CABLES Asset Error]', assetPath, error)
      },
      onPatchLoaded: (patch) => {
        console.log('CABLES Patch loaded successfully!')
        isLoaded.value = true
        // Show canvas after a brief delay
        setTimeout(() => {
          canvas.style.visibility = 'visible'
          canvas.style.opacity = '1'
        }, 50)
      },
      onFinishedLoading: (patch) => {
        console.log('CABLES finished loading!')
      },
      settings: { 
        alpha: true, 
        premultipliedAlpha: true,
        preserveDrawingBuffer: true,
        antialias: true
      }
    })
    
    // Manually deserialize the patch data
    if (patch.deSerialize && patchData) {
      patch.deSerialize(patchData)
    }
    
    return patch
  } catch (error) {
    console.error('Error loading CABLES assets:', error)
    throw error
  }
}

const handleImageError = () => {
  console.warn('Failed to load protected static image, using fallback')
}

onMounted(async () => {
  // Load protected assets first
  await loadProtectedAssets()
  
  if (window.CABLES && window.CABLES.Patch) {
    console.log('CABLES is available, initializing...')
    
    const canvas = glcanvas.value
    if (!canvas) return
    
    try {
      patchInstance = await initializeCanvas(canvas)
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
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}
</style>