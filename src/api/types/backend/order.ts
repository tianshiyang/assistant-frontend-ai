/** 订单明细（子项） */
export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  unit_price: string
  total_price: string
  created_at: string
  updated_at: string
}

/** 订单状态 */
export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  CREATED = 'created',
}

export const OrderStatusMap = {
  [OrderStatus.PENDING]: '待支付',
  [OrderStatus.PAID]: '已支付',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.CANCELLED]: '已取消',
  [OrderStatus.CREATED]: '已创建',
}

/** 订单（含销售姓名与订单明细） */
export interface Order {
  id: number
  order_no: string
  customer_id: number
  sales_id: number
  order_date: string
  order_status: OrderStatus
  total_amount: string
  paid_amount: string
  created_at: string
  updated_at: string
  sales_name: string
  order_item: OrderItem[]
}

export interface CreateOrder {
  sales_id: number
  customer_id: number
  product_id: number
  quantity: number
}
