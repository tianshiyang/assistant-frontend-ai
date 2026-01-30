export interface BaseListResponse<T> {
  list: T[]
  total: number
  pages: number
}

export type { SkillItem } from './public'
export { AI_SKILL } from './public'
