import { streamRequest } from '@/utils/stream'
import type { Skill } from '../types/public'
import type { EventSourceMessage } from '@microsoft/fetch-event-source'

export const chatAPI = (
  data: {
    conversation_id: string
    question: string
    dataset_ids?: string[]
    skills?: Skill[]
  },
  options?: {
    onmessage?: (event: EventSourceMessage) => void
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
