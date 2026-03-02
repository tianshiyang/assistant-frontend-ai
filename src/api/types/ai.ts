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

/** 管理端历史消息类型（/api/ai/conversation/messages & /api/manage/ai/chat） */
export enum ManageResponseType {
  STOP = 'stop',
  PING = 'ping',
  DONE = 'done',
  ERROR = 'error',
  TOOL_CALL = 'tool_call',
  TOOL_RESULT = 'tool_result',
  SAVE_TOKEN = 'save_token',
  GENERATE = 'generate',
  CREATE_CONVERSATION = 'create_conversation',
  REWRITE_QUESTION_START = 'rewrite_question_START',
  REWRITE_QUESTION_END = 'rewrite_question_END',
}

/** 管理端历史消息单条（/api/ai/conversation/messages 返回的扁平结构） */
export interface ManageConversationMessage {
  updated_time: number
  content: string | Record<string, unknown>
  type: ManageResponseType
  message_id: string
  conversation_id: string
  tool_call?: string
  _is_expanded?: boolean
}
