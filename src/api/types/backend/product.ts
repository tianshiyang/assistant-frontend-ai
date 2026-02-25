export interface ProductListParams {
  name?: string
  category_id?: number | string
  page_no?: number
  page_size?: number
  product_no?: string
}

export enum ProductStatus {
  ON_SALE = 1, // 上架
  OFF_SALE = 2, // 下架
}

export const ProductStatusMap = {
  [ProductStatus.ON_SALE]: '上架',
  [ProductStatus.OFF_SALE]: '下架',
}

export interface ProductItem {
  id: number
  product_no: string
  name: string
  category_id: number
  standard_price: string
  cost_price: string
  status: ProductStatus
  created_at: string
  updated_at: string
  category_name: string
}

export interface UpdateProductParams {
  id: number
  name: string
  category_id: number
  standard_price: string
  cost_price: string
}

export interface CreateProductParams {
  name: string
  category_id: number
  standard_price: string
  cost_price: string
}
