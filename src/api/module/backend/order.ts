import type { BaseListResponse } from '@/api/types'
import type { Order, CreateOrder } from '@/api/types/backend/order'
import { request } from '@/utils/request'

// 订单列表
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

// 订单详情
export const getOrderDetailAPI = (params: { order_id: number }) => {
  return request<Order>({
    url: '/api/manage/order/detail',
    method: 'get',
    params,
  })
}

// 订单支付
export const payOrderAPI = (data: { order_id: number; pay_amount: number }) => {
  return request<Order>({
    url: '/api/manage/order/pay',
    method: 'post',
    data,
  })
}

// 取消支付
export const cancelPayOrderAPI = (data: { order_id: number }) => {
  return request<Order>({
    url: '/api/manage/order/cancel_pay',
    method: 'post',
    data,
  })
}

// 删除订单
export const deleteOrderAPI = (data: { order_id: number }) => {
  return request<Order>({
    url: '/api/manage/order/delete',
    method: 'post',
    data,
  })
}
