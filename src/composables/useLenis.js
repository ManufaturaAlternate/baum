import { inject, provide } from 'vue'

const LENIS_KEY = Symbol('lenis')

export function provideLenis(lenis) {
  provide(LENIS_KEY, lenis)
}

export function useLenis() {
  return inject(LENIS_KEY, null)
}