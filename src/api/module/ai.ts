import { streamRequest } from '@/utils/stream'
import type { Skill } from '../types/public'
import type { StreamResponse } from '../types'
import { request } from '@/utils/request'
import type { ConversationHistory, ConversationList } from '../types/ai'

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

// 获取所有会话列表
export const getAllConversationListAPI = () => {
  return request<ConversationList[]>({
    url: '/api/ai/conversation/all',
    method: 'GET',
  })
}

// 删除会话
export const deleteConversationAPI = (data: { conversation_id: string }) => {
  return request({
    url: '/api/ai/conversation/delete',
    method: 'POST',
    data,
  })
}

// 更新会话名称
export const updataConversationNameAPI = (params: { message_id: string }) => {
  return request({
    url: '/api/ai/conversation/update_conversation_title',
    method: 'get',
    params,
  })
}

// 获取用户可能询问的问题
export const getUserPossibleQuestionsAPI = (data: { message_id: string }) => {
  return request<{ question_list: string[] }>({
    url: '/api/ai/conversation/user_maybe_question',
    method: 'post',
    data,
  })
}
