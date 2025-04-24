import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/:pathMatch(.*)*', // redireciona pra dashboard caso a rota não exista
      redirect: '/dashboard',
    },
  ],
})

export default router
