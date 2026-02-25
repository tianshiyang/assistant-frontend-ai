import type { BaseListResponse } from '@/api/types'
import type {
  ProductItem,
  ProductListParams,
  UpdateProductParams,
} from '@/api/types/backend/product'
import { request } from '@/utils/request'

// 获取商品列表
export const getProductListAPI = (params: ProductListParams) => {
  return request<BaseListResponse<ProductItem>>({
    url: '/api/manage/product/list',
    method: 'get',
    params,
  })
}

// 获取商品详情
export const getProductDetailAPI = (params: { id: number | string }) => {
  return request<ProductItem>({
    url: `/api/manage/product/detail`,
    method: 'get',
    params,
  })
}

// 编辑商品
export const updateProductAPI = (data: UpdateProductParams) => {
  return request({
    url: '/api/manage/product/update',
    method: 'post',
    data,
  })
}
