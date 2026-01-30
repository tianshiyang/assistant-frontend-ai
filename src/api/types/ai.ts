import type { StreamResponse } from './index'

// 会话历史记录
export interface ConversationHistory {
  id: string
  conversation_id: string
  question: string
  messages: StreamResponse[]
  created_at: string
}
