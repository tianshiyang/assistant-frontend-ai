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
      {
        path: '/backend/order/list',
        name: 'orderList',
        component: () => import('@/views/backend/order/index.vue'),
      },
      {
        path: '/backend/history/list/:conversation_id?',
        name: 'manageHistoryList',
        component: () => import('@/views/backend/history/index.vue'),
      },
      {
        path: '/backend/pdf/preview',
        name: 'pdfPreview',
        component: () => import('@/views/backend/documentProcessing/pdfProcessing/index.vue'),
      },
      {
        path: '/backend/text/delimiting',
        name: 'textDelimiting',
        component: () => import('@/views/backend/documentProcessing/media/index.vue'),
      },
    ],
  },
]
