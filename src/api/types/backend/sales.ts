export enum SalesStatus {
  ACTIVE = 1,
  INACTIVE = 0,
}

export const SalesStatusMap = {
  [SalesStatus.ACTIVE]: '在职',
  [SalesStatus.INACTIVE]: '离职',
} as const

export interface SalesItem {
  id: number
  name: string
  email: string
  phone: string
  sales_no: string
  status: SalesStatus
}

export interface UpdateSalesItem {
  sales_id: number
  name: string
  email: string
  phone: string
}
