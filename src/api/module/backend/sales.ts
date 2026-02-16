import type { BaseListResponse } from '@/api/types'
import type { SalesItem } from '@/api/types/backend/sales'
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
