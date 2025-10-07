import { ref, provide, inject } from 'vue'

// Symbol for providing/injecting hover state
const hoverKey = Symbol('hover')

export function provideHover() {
  const isHovered = ref(false)
  
  const setHovered = (value) => {
    isHovered.value = value
  }

  provide(hoverKey, {
    isHovered,
    setHovered
  })

  return {
    isHovered,
    setHovered
  }
}

export function useHover() {
  const hover = inject(hoverKey)
  
  if (!hover) {
    throw new Error('useHover must be used with provideHover')
  }
  
  return hover
}