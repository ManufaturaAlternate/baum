import { ref, onMounted, onUnmounted } from 'vue'

export function useCursor() {
  const cursorX = ref(0)
  const cursorY = ref(0)
  const isHidden = ref(true)

  const updateCursor = (e) => {
    cursorX.value = e.clientX
    cursorY.value = e.clientY
    isHidden.value = false
  }

  const hideCursor = () => {
    isHidden.value = true
  }

  onMounted(() => {
    document.addEventListener('mousemove', updateCursor)
    document.addEventListener('mouseleave', hideCursor)
  })

  onUnmounted(() => {
    document.removeEventListener('mousemove', updateCursor)
    document.removeEventListener('mouseleave', hideCursor)
  })

  return {
    cursorX,
    cursorY,
    isHidden
  }
}