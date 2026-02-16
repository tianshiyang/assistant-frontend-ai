export const backendRouter = [
  {
    path: '/backend',
    redirect: '/backend/sales/list',
    component: () => import('@/components/backendLayout.vue'),
    children: [
      {
        path: '/backend/sales/list',
        name: 'salesList',
        component: () => import('@/views/backend/sales/index.vue'),
      },
    ],
  },
]
