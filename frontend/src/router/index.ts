import { createRouter, createWebHistory } from 'vue-router'
import VatsView from '@/views/VatsView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'home',
      component: VatsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/details',
      name: 'details',
      component: () => import('@/views/CdrView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/logs',
      name: 'logs',
      component: () => import('@/views/LogsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/audio',
      name: 'audio',
      component: () => import('@/views/AudioView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/constructor',
      name: 'constructor',
      component: () => import('@/views/ConstructorView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      const isAuthed = await authStore.checkAuth()
      if (!isAuthed) {
        next('/login')
        return
      }
    }
    next()
  } 
  else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  }
  else {
    next()
  }
})

export default router