import type { BaseListResponse } from '@/api/types'
import type { SalesItem, UpdateSalesItem } from '@/api/types/backend/sales'
import type { BaseListParams } from '@/api/types/dataset'
import { request } from '@/utils/request'

// 获取所有销售
export const getSalesListAPI = (params: BaseListParams) => {
  return request<BaseListResponse<SalesItem>>({
    url: '/api/manage/sales/get_all_sales',
    method: 'get',
    params,
  })
}

// 更新销售
export const updateSalesAPI = (data: UpdateSalesItem) => {
  return request<SalesItem>({
    url: `/api/manage/sales/update_sales`,
    method: 'post',
    data,
  })
}

// 获取销售详情
export const getSalesDetailAPI = (params: { sales_id: number }) => {
  return request<SalesItem>({
    url: `/api/manage/sales/detail_by_id`,
    method: 'get',
    params,
  })
}

export const getAllSalesListAPI = (params: { name?: string }) => {
  return request<SalesItem[]>({
    url: '/api/manage/sales/all_no_pagination',
    method: 'get',
    params,
  })
}
