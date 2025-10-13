import { ref, provide, inject } from 'vue'

// Symbol for providing/injecting hover state
const hoverKey = Symbol('hover')

export function provideHover() {
  const isHovered = ref(false)
  const setHovered = (v) => { isHovered.value = v }
  provide(hoverKey, { isHovered, setHovered })
  return { isHovered, setHovered }
}

export function useHover() {
  const hover = inject(hoverKey, null)
  if (hover) return hover
  // Fallback to avoid hard crashes
  const isHovered = ref(false)
  const setHovered = (v) => { isHovered.value = v }
  return { isHovered, setHovered }
}