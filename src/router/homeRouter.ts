export const homeRouter = [
  {
    path: '/',
    redirect: '/chat',
    component: () => import('@/components/layout.vue'),
    children: [
      {
        path: '/chat',
        name: 'chat',
        component: () => import('@/views/chat/index.vue'),
      },
    ],
  },
]
