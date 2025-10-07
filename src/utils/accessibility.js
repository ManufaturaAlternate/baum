/**
 * Accessibility utility functions
 */

export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.getElementById('scroll-announcements')
  if (announcement) {
    announcement.setAttribute('aria-live', priority)
    announcement.textContent = message
    
    // Clear after announcement
    setTimeout(() => {
      announcement.textContent = ''
    }, 1000)
  }
}

export const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }
    
    if (e.key === 'Escape') {
      element.removeEventListener('keydown', handleKeyDown)
    }
  }
  
  element.addEventListener('keydown', handleKeyDown)
  firstElement?.focus()
  
  return () => element.removeEventListener('keydown', handleKeyDown)
}

export const setPageTitle = (title) => {
  document.title = `${title} | Britta Baumann Portfolio`
}

export const announcePageChange = (pageName) => {
  announceToScreenReader(`Navigated to ${pageName}`)
}

export const createLiveRegion = (id = 'live-region') => {
  if (!document.getElementById(id)) {
    const liveRegion = document.createElement('div')
    liveRegion.id = id
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    document.body.appendChild(liveRegion)
  }
  return document.getElementById(id)
}
