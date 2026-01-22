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
      {
        path: '/dataset',
        name: 'dataset',
        component: () => import('@/views/dataset/index.vue'),
      },
      {
        path: '/document/:dataset_id/list',
        name: 'documentList',
        component: () => import('@/views/document/documentList.vue'),
      },
    ],
  },
]
