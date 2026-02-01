import type { ChatResponseType } from './public'

export interface BaseListResponse<T> {
  list: T[]
  total: number
  pages: number
}

export interface StreamResponse {
  // 基础流信息
  type: ChatResponseType
  tool_call: any
  updated_time: number
  content: any
  message_id: string
  conversation_id: string
}
