import type { BaseListResponse } from '@/api/types'
import type { Order } from '@/api/types/backend/order'
import { request } from '@/utils/request'

export const getOrderListAPI = () => {
  return request<BaseListResponse<Order>>({
    url: '/api/manage/order/list',
    method: 'get',
  })
}
