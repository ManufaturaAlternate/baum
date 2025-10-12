<template> 
  <section 
    id="canvas-section"
    ref="targetRef"
    class="h-screen overflow-hidden fade-in-3"
  >
    <!-- Static image for small screens only -->
    <div class="block sm:hidden absolute inset-0">
      <img 
        v-if="staticImageUrl"
        :src="staticImageUrl" 
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
let assetCache = new Map()

// Load static image for fallback
const loadProtectedAssets = async () => {
  try {
    staticImageUrl.value = await protectedAssets.getStaticImage()
    console.log('Protected static image loaded successfully')
  } catch (error) {
    console.error('Failed to load protected static image:', error)
    throw error;
  }
}

// Convert blob to data URL
const blobToDataURL = async (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Pre-load all textures and replace paths with data URLs in the patch data
const preloadTextures = async (patchData) => {
  console.log('[PRELOAD] Starting texture preload...')
  
  if (!patchData.ops) {
    console.log('[PRELOAD] No ops found in patch data')
    return patchData
  }
  
  const textureLoadPromises = []
  
  patchData.ops.forEach((op, opIndex) => {
    if (op.objName === 'Ops.Gl.Texture_v2' && op.portsIn) {
      op.portsIn.forEach((port, portIndex) => {
        if (port.name === 'File' && port.value) {
          const originalPath = port.value
          console.log(`[PRELOAD] Found texture: ${originalPath}`)
          
          // Create promise to load this texture
          const loadPromise = (async () => {
            try {
              // Extract filename
              const filename = originalPath.split('/').pop()
              const assetPath = `${protectedAssets.getCablesAssetsPath()}${filename}`
              
              console.log(`[PRELOAD] Loading texture from: ${assetPath}`)
              
              // Fetch the asset as blob
              const url = protectedAssets.getAssetUrl(assetPath)
              const response = await fetch(url)
              
              if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`)
              }
              
              const blob = await response.blob()
              
              // Convert blob to data URL instead of object URL
              const dataUrl = await blobToDataURL(blob)
              
              console.log(`[PRELOAD] Got data URL for ${filename} (length: ${dataUrl.length})`)
              
              // Replace the path in the patch data with the data URL
              patchData.ops[opIndex].portsIn[portIndex].value = dataUrl
              
              // Cache it
              assetCache.set(originalPath, dataUrl)
              assetCache.set(filename, dataUrl)
              
              console.log(`[PRELOAD] Replaced texture path for ${filename}`)
            } catch (error) {
              console.error(`[PRELOAD] Error loading texture ${originalPath}:`, error)
            }
          })()
          
          textureLoadPromises.push(loadPromise)
        }
      })
    }
  })
  
  // Wait for all textures to load
  if (textureLoadPromises.length > 0) {
    console.log(`[PRELOAD] Waiting for ${textureLoadPromises.length} texture(s) to load...`)
    await Promise.all(textureLoadPromises)
    console.log('[PRELOAD] All textures loaded!')
  } else {
    console.log('[PRELOAD] No textures found to preload')
  }
  
  return patchData
}

// Initialize CABLES canvas with all necessary configuration
const initializeCanvas = async (canvas) => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas.style.visibility = 'hidden'
  
  try {
    console.log('Loading CABLES configuration...')
    let patchData = await protectedAssets.getCablesConfig()
    console.log('CABLES configuration loaded:', Object.keys(patchData))
    
    // Pre-load all textures and replace paths with data URLs
    patchData = await preloadTextures(patchData)
    
    console.log('[CABLES INIT] Creating patch with preloaded textures')
    
    const patch = new window.CABLES.Patch({
      patch: patchData,
      canvas: canvas,
      glCanvasResizeToWindow: true,
      onError: (initiator, ...args) => {
        console.error('[CABLES Error]', initiator, ...args)
      },
      onPatchLoaded: (patch) => {
        console.log('CABLES Patch loaded successfully!')
        isLoaded.value = true
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
    
    console.log('CABLES patch initialized')
    return patch
    
  } catch (error) {
    console.error('Error initializing CABLES patch:', error)
    throw error
  }
}

const handleImageError = () => {
  console.error('Failed to load protected static image')
}

const cleanupAssetCache = () => {
  // No need to revoke data URLs
  assetCache.clear()
}

onMounted(async () => {
  protectedAssets.logAssetInfo()
  
  try {
    await loadProtectedAssets()
  } catch (error) {
    console.error('Failed to load protected assets:', error)
  }
  
  if (window.CABLES && window.CABLES.Patch) {
    console.log('CABLES is available, initializing...')
    
    const canvas = glcanvas.value
    if (!canvas) {
      console.error('Canvas element not available')
      return
    }
    
    try {
      patchInstance = await initializeCanvas(canvas)
    } catch (error) {
      console.error('Error initializing CABLES patch:', error)
    }
  } else {
    console.error('CABLES library not available. Make sure scripts are loaded correctly.')
  }
})

onUnmounted(() => {
  if (patchInstance) {
    try {
      patchInstance.dispose()
      patchInstance = null
    } catch (error) {
      console.error('Error disposing CABLES patch:', error)
    }
  }
  
  cleanupAssetCache()
  protectedAssets.clearCache()
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