import { ref, onMounted, onUnmounted } from 'vue'

export function useScroll(duration = 1950) {
  const targetRef = ref(null)
  const isVisible = ref(false)

  const scrollToElement = (element) => {
    if (!element) return
    
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset
    const startPosition = window.pageYOffset
    const distance = targetPosition - startPosition
    let start = null

    function easeInOut(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    }

    function step(timestamp) {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const ease = easeInOut(progress)
      window.scrollTo(0, startPosition + distance * ease)
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }

    window.requestAnimationFrame(step)
  }

  onMounted(() => {
    if (!targetRef.value) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            isVisible.value = true
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(targetRef.value)

    onUnmounted(() => {
      observer.disconnect()
    })
  })

  return {
    targetRef,
    isVisible,
    scrollToElement
  }
}