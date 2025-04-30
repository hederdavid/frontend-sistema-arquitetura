import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Clientes from '@/views/admin/Clientes.vue'
import TelaInicial from '@/components/admin/TelaInicial.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      children: [
        { path: '/dashboard', component: TelaInicial, meta: { title: 'Dashboard' } },
        { path: '/clientes', component: Clientes, meta: { title: 'Clientes' } }
      ]
    },
    {
      path: '/:pathMatch(.*)*', // redireciona pra dashboard caso a rota não exista
      redirect: '/dashboard',
    },
  ],
})

export default router
