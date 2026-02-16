// 客户状态
export enum CustomerStatus {
  NORMAL = 1,
  DISABLED = 2,
}

export const CustomerStatusMap = {
  [CustomerStatus.NORMAL]: '正常',
  [CustomerStatus.DISABLED]: '禁用',
} as const

export interface CustomerItem {
  id: number
  customer_no: string
  name: string
  email: string
  phone: string
  status: CustomerStatus
  deleted: number
  created_at: string
  updated_at: string
}

export interface CreateCustomerItem {
  name: string
  email: string
  phone: string
}

export interface UpdateCustomerItem {
  customer_id: number
  name: string
  email: string
  phone: string
  status?: CustomerStatus
}
