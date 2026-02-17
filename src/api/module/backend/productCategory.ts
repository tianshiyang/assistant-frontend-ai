import type { BaseListResponse } from '@/api/types'
import type { ProductCategoryItem } from '@/api/types/backend/productCategory'
import { request } from '@/utils/request'

export interface ProductCategoryListParams {
  page_no: number
  page_size: number
  category_name?: string
}

// 获取商品分类列表
export const getProductCategoryListAPI = (params: ProductCategoryListParams) => {
  return request<BaseListResponse<ProductCategoryItem>>({
    url: '/api/manage/product/category/list',
    method: 'get',
    params,
  })
}

