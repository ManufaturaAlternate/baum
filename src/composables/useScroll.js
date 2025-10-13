import { nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useLenis } from '@/composables/useLenis'

const defaults = {
  duration: 0.8,
  easing: (t) => 1 - (1 - t) ** 4,
  align: 'center',
  offset: 0
}

export function setScrollDefaults(opts = {}) {
  Object.assign(defaults, opts)
}

export function useScroll() {
  const router = useRouter()
  const lenis = useLenis() // inject once in setup

  const computeTargetY = (el, { align = defaults.align, offset = defaults.offset } = {}) => {
    const rect = el.getBoundingClientRect()
    const y0 = (window.scrollY || 0) + rect.top
    const h = window.innerHeight
    const pos = {
      start: y0 + offset,
      center: y0 + rect.height / 2 - h / 2 + offset,
      end: y0 + rect.height - h + offset
    }
    return Math.max(0, pos[align] ?? pos.center)
  }

  const scrollWithLenis = (y, options = {}) => {
    const { duration = defaults.duration, easing = defaults.easing, onComplete } = options
    
    console.log('[scrollWithLenis] lenis:', !!lenis, 'duration:', duration, 'target:', y)
    
    if (lenis?.scrollTo) {
      console.log('[scrollWithLenis] Using Lenis scrollTo')
      lenis.scrollTo(y, { 
        duration, 
        easing,
        onComplete: () => {
          console.log('[scrollWithLenis] Animation complete')
          onComplete?.()
        }
      })
    } else {
      console.log('[scrollWithLenis] Fallback to native scroll')
      window.scrollTo({ top: y, behavior: 'smooth' })
      onComplete?.()
    }
  }

  const scrollToElement = (el, options = {}) => {
    if (!el) return
    scrollWithLenis(computeTargetY(el, options), options)
  }

  const waitFor = (selector, { timeout = 1500 } = {}) =>
    new Promise((resolve, reject) => {
      const start = performance.now()
      const loop = () => {
        const el = document.querySelector(selector)
        if (el) return resolve(el)
        if (performance.now() - start > timeout) return reject(new Error('waitFor timeout'))
        requestAnimationFrame(loop)
      }
      loop()
    })

  const scrollToHash = async (hash, options = {}) => {
    console.log('[scrollToHash] Called with:', hash, 'options:', options)
    if (!hash) return
    const sel = hash.startsWith('#') ? hash : `#${hash}`
    let el = document.querySelector(sel)
    const currentPath = router.currentRoute.value.path
    console.log('[scrollToHash] Element found:', !!el, 'Current path:', currentPath)
    
    if (el && currentPath === '/') {
      // Element exists on home page → smooth scroll with Lenis
      scrollToElement(el, options)
    } else {
      // Different view or element not found → navigate with hash (instant position)
      await router.push({ path: '/', hash: sel })
    }
  }

  return { scrollToElement, scrollToHash }
}