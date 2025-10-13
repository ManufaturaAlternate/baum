import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ChaosProject from '../views/ChaosProject.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/chaos-project',
    name: 'ChaosProject',
    component: ChaosProject
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    
    if (to.hash) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const el = document.querySelector(to.hash)
          if (el) {
            let offset = 0
            if (to.hash === '#bio-container') {
              offset = window.innerHeight * 0
            } else if (to.hash === '#contact-container') {
              offset = window.innerHeight * 0.1
            }
            
            const top = el.offsetTop - offset
            resolve({ top: Math.max(0, top), behavior: 'instant' })
          } else {
            resolve(false) // Don't scroll if element not found
          }
        }, 1200)
      })
    }
    
    return false // Preserve current scroll position when no hash
  }
})

export default router