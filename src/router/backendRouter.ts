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
      {
        path: '/backend/customer/list',
        name: 'customerList',
        component: () => import('@/views/backend/customer/index.vue'),
      },
      {
        path: '/backend/product/category/list',
        name: 'productCategoryList',
        component: () => import('@/views/backend/productCategory/index.vue'),
      },
      {
        path: '/backend/product/list',
        name: 'productList',
        component: () => import('@/views/backend/product/index.vue'),
      },
    ],
  },
]
