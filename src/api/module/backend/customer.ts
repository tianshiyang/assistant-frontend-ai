import type { BaseListResponse } from '@/api/types'
import type {
  CustomerItem,
  CreateCustomerItem,
  UpdateCustomerItem,
} from '@/api/types/backend/customer'
import type { BaseListParams } from '@/api/types/dataset'
import { request } from '@/utils/request'

// 获取所有客户
export const getCustomerListAPI = (params: BaseListParams) => {
  return request<BaseListResponse<CustomerItem>>({
    url: '/api/manage/customer/list',
    method: 'get',
    params,
  })
}

// 创建客户
export const createCustomerAPI = (data: CreateCustomerItem) => {
  return request<CustomerItem>({
    url: `/api/manage/customer/create`,
    method: 'post',
    data,
  })
}

// 更新客户
export const updateCustomerAPI = (data: UpdateCustomerItem) => {
  return request<CustomerItem>({
    url: `/api/manage/customer/update`,
    method: 'post',
    data,
  })
}

// 获取客户详情
export const getCustomerDetailAPI = (params: { customer_id: number }) => {
  return request<CustomerItem>({
    url: `/api/manage/customer/detail`,
    method: 'get',
    params,
  })
}

// 获取所有客户列表
export const getAllCustomerListAPI = (params: { name?: string }) => {
  return request<CustomerItem[]>({
    url: '/api/manage/customer/all_list',
    method: 'get',
    params,
  })
}
