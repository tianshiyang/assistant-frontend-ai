import { createRouter, createWebHistory } from 'vue-router'
import { loginRouter } from './loginRouter'
import { homeRouter } from './homeRouter'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...loginRouter, ...homeRouter],
})

export default router
