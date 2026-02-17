// 商品分类状态
export enum ProductCategoryStatus {
  NORMAL = 1,
  DISABLED = 2,
}

export const ProductCategoryStatusMap = {
  [ProductCategoryStatus.NORMAL]: '正常',
  [ProductCategoryStatus.DISABLED]: '禁用',
} as const

export interface ProductCategoryItem {
  id: number
  category_code: string
  category_name: string
  status: ProductCategoryStatus
  created_at: string
  updated_at: string
}
