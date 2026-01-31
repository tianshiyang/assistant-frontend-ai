import type { StreamResponse } from './index'

// 会话历史记录
export interface ConversationHistory {
  id: string
  conversation_id: string
  question: string
  messages: StreamResponse[]
  answer: string
  input_tokens: number
  output_tokens: number
  total_tokens: number
  created_at: string
  updated_at: string
}

// 会话列表
export interface ConversationList {
  id: string
  name: string
  user_id: string
  created_at: string
  updated_at: string
}
