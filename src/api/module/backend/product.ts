import type { BaseListResponse } from '@/api/types'
import type { ProductItem, ProductListParams } from '@/api/types/backend/product'
import { request } from '@/utils/request'

export const getProductListAPI = (params: ProductListParams) => {
  return request<BaseListResponse<ProductItem>>({
    url: '/api/manage/product/list',
    method: 'get',
    params,
  })
}
