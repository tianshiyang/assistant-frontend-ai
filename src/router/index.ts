import { createRouter, createWebHistory } from 'vue-router'
import { loginRouter } from './loginRouter'
import { homeRouter } from './homeRouter'
import { backendRouter } from './backendRouter'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...loginRouter, ...homeRouter, ...backendRouter],
})

export default router
