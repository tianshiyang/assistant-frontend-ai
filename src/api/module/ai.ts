import { streamRequest } from '@/utils/stream'
import type { Skill } from '../types/public'
import type { StreamResponse } from '../types'
import { request } from '@/utils/request'
import type { ConversationHistory } from '../types/ai'

// 获取当前会话下的历史记录
export const getConversationHistoryAPI = (params: { conversation_id: string }) => {
  return request<ConversationHistory[]>({
    url: '/api/ai/conversation/messages',
    method: 'GET',
    params,
  })
}

// 与AI进行对话
export const chatAPI = (
  data: {
    conversation_id: string
    question: string
    dataset_ids?: string[]
    skills?: Skill[]
  },
  options?: {
    onmessage?: (event: StreamResponse) => void
    onerror?: (error: Error) => void
    onclose?: () => void
  }
) => {
  return streamRequest({
    url: '/api/ai/chat',
    method: 'POST',
    data,
    onmessage: options?.onmessage,
    onerror: options?.onerror,
    onclose: options?.onclose,
  })
}
