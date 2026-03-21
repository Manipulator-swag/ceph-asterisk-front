import { createRouter, createWebHistory } from 'vue-router'
import VatsView from '@/views/VatsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: VatsView,
    },
    {
      path: '/details',
      name: 'details',
      component: () => import('@/views/CdrView.vue'),
    },
    {
      path: '/logs',
      name: 'logs',
      component: () => import('@/views/LogsView.vue'),
    },
    {
      path: '/audio',
      name: 'audio',
      component: () => import('@/views/AudioView.vue'),
    },
    {
      path: '/constructor',
      name: 'constructor',
      component: () => import('@/views/ConstructorView.vue'),
    },
  ],
})

export default router