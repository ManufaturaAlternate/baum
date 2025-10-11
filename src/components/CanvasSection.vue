<template> 
  <section 
    id="canvas-section"
    ref="targetRef"
    class="h-screen overflow-hidden fade-in-3"
  >
    <!-- Static image for small screens only -->
    <div class="block sm:hidden absolute inset-0">
      <img 
        :src="staticImageUrl || '/fallback-canvas.png'" 
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
  }
}

// Custom asset loader for CABLES that routes through our protected asset API
const createCustomAssetLoader = () => {
  return function(url, cb, errorCb, progressCb) {
    // Log the original request
    console.log(`CABLES requesting asset: ${url}`)
    
    // Check cache first
    if (assetCache.has(url)) {
      console.log(`Using cached asset for: ${url}`)
      return cb(assetCache.get(url))
    }
    
    // Extract filename and extension
    const filename = url.split('/').pop()
    const fileExt = filename.split('.').pop().toLowerCase()
    
    // Normalize the URL to handle different path formats
    let apiUrl
    
    // Case 1: Bare filename (e.g. "_DSF2140_Kopie_2.png")
    if (url.indexOf('/') === -1) {
      // For image files, check in cables/assets/
      if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExt)) {
        apiUrl = `/api/protected-assets/cables/assets/${url}`
      } 
      // For JS files, check in cables/js/
      else if (['js', 'glsl'].includes(fileExt)) {
        apiUrl = `/api/protected-assets/cables/js/${url}`
      }
      // For JSON files, check in cables/
      else if (fileExt === 'json') {
        apiUrl = `/api/protected-assets/cables/${url}`
      }
      // Default to cables/assets/ for other files
      else {
        apiUrl = `/api/protected-assets/cables/assets/${url}`
      }
    }
    // Case 2: Already has API prefix
    else if (url.startsWith('/api/protected-assets/')) {
      apiUrl = url
    }
    // Case 3: Has path but no API prefix
    else {
      // Clean up path - remove leading slashes
      const cleanPath = url.replace(/^\/+/, '')
      apiUrl = `/api/protected-assets/${cleanPath}`
    }
    
    console.log(`Fetching from API: ${apiUrl}`)
    
    // Fetch the asset
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          // If first attempt fails for bare filename, try alternate location
          if (url.indexOf('/') === -1 && response.status === 404) {
            console.log(`First attempt failed. Trying alternate location for: ${filename}`)
            
            // Try different location based on file type
            let alternateUrl
            if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExt)) {
              alternateUrl = `/api/protected-assets/images/${filename}`
            } else {
              alternateUrl = `/api/protected-assets/${filename}`
            }
            
            console.log(`Trying alternate URL: ${alternateUrl}`)
            return fetch(alternateUrl)
          }
          throw new Error(`Failed to fetch asset: ${response.status} ${response.statusText}`)
        }
        return response
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch asset: ${response.status} ${response.statusText}`)
        }
        
        // Handle different file types
        // Images: convert to object URL
        if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExt)) {
          return response.blob().then(blob => {
            const objectUrl = URL.createObjectURL(blob)
            console.log(`Created object URL for image: ${objectUrl}`)
            // Cache the result
            assetCache.set(url, objectUrl)
            cb(objectUrl)
          })
        }
        
        // JSON: parse and return object
        if (fileExt === 'json') {
          return response.json().then(data => {
            console.log(`Loaded JSON with ${Object.keys(data).length} keys`)
            // Cache the result
            assetCache.set(url, data)
            cb(data)
          })
        }
        
        // JavaScript, GLSL: return as text
        if (['js', 'glsl'].includes(fileExt)) {
          return response.text().then(text => {
            console.log(`Loaded text file with length ${text.length}`)
            // Cache the result
            assetCache.set(url, text)
            cb(text)
          })
        }
        
        // Default: return as blob with object URL
        return response.blob().then(blob => {
          const objectUrl = URL.createObjectURL(blob)
          console.log(`Created object URL for blob: ${objectUrl}`)
          // Cache the result
          assetCache.set(url, objectUrl)
          cb(objectUrl)
        })
      })
      .catch(err => {
        console.error(`Error loading asset ${url}:`, err)
        
        // For images, try to use a fallback image
        if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExt)) {
          console.warn(`Using fallback image for ${url}`)
          const fallbackUrl = '/fallback-image.png'
          fetch(fallbackUrl)
            .then(response => response.blob())
            .then(blob => {
              const objectUrl = URL.createObjectURL(blob)
              cb(objectUrl) // Provide fallback image
            })
            .catch(fallbackErr => {
              console.error('Even fallback image failed:', fallbackErr)
              if (errorCb) errorCb(err)
            })
        } else {
          if (errorCb) errorCb(err)
        }
      })
  }
}

// Initialize CABLES canvas with all necessary configuration
const initializeCanvas = async (canvas) => {
  // Set initial dimensions
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  
  // Hide canvas initially
  canvas.style.visibility = 'hidden'
  
  try {
    console.log('Loading CABLES configuration...')
    const patchData = await protectedAssets.getCablesConfig()
    console.log('CABLES configuration loaded:', Object.keys(patchData))
    
    // Create custom asset loader
    const customAssetLoader = createCustomAssetLoader()
    
    // Create new patch instance
    const patch = new window.CABLES.Patch({
      patch: patchData,           // Use directly loaded JSON data
      canvas: canvas,             // Target canvas
      glCanvasResizeToWindow: true,
      loadingAsset: customAssetLoader,  // Use our custom asset loader
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
  console.warn('Failed to load protected static image, using fallback')
  staticImageUrl.value = '/fallback-canvas.png'
}

const cleanupAssetCache = () => {
  // Revoke any object URLs to prevent memory leaks
  for (const [key, value] of assetCache.entries()) {
    if (typeof value === 'string' && value.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(value)
      } catch (e) {
        console.warn(`Failed to revoke URL: ${value}`, e)
      }
    }
  }
  assetCache.clear()
}

onMounted(async () => {
  // Debug output to verify service is working
  protectedAssets.logAssetInfo()
  
  // Load protected assets
  await loadProtectedAssets()
  
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
  
  // Clean up cached assets
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