import type { BaseListResponse } from '@/api/types'
import type { Order, CreateOrder } from '@/api/types/backend/order'
import { request } from '@/utils/request'

export const getOrderListAPI = () => {
  return request<BaseListResponse<Order>>({
    url: '/api/manage/order/list',
    method: 'get',
  })
}

// 创建订单
export const createOrderAPI = (data: CreateOrder) => {
  return request<Order>({
    url: '/api/manage/order/create',
    method: 'post',
    data,
  })
}
