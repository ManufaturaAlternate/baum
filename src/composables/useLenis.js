import { ref, provide, inject } from 'vue'

const lenisKey = Symbol('lenis')

export function provideLenis(lenis) {
  provide(lenisKey, lenis)
}

export function useLenis() {
  const lenis = inject(lenisKey)
  if (!lenis) {
    throw new Error('useLenis must be used with provideLenis')
  }
  return lenis
}