export interface BaseListResponse<T> {
  list: T[]
  total: number
  pages: number
}
