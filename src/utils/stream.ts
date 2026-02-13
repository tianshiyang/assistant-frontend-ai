import { fetchEventSource } from '@microsoft/fetch-event-source'
import { getToken } from './storage'
import { message } from 'ant-design-vue'
import type { StreamResponse } from '@/api/types'

export const streamRequest = <T = StreamResponse>({
  url,
  method,
  headers,
  data,
  onopen,
  onmessage,
  onerror,
  onclose,
}: {
  url: string
  method: 'get' | 'post' | 'GET' | 'POST'
  headers?: Record<string, string>
  data: any
  onopen?: (response: Response) => void
  onmessage?: (event: T) => void
  onerror?: (error: Error) => void
  onclose?: () => void
}) => {
  let controller: any

  // 关闭SSE连接
  const closeSSE = () => {
    if (controller) {
      controller.aborted()
      controller = null
    }
  }
  // 创建新的连接
  controller = new AbortController()
  fetchEventSource(url, {
    method,
    signal: controller.signal,
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...headers,
    },
    body: JSON.stringify(data),
    onopen: async response => {
      if (response.status !== 200) {
        message.error('SSE连接失败')
      } else if (response.ok) {
        onopen?.(response)
      }
      console.log('SSE连接已建立')
    },
    onmessage: event => {
      onmessage?.(JSON.parse(event.data))
    },
    onerror: error => {
      message.error(error)
      onerror?.(error)
      // 返回 null 禁用自动重连
      return null
    },
    onclose: () => {
      onclose?.()
    },
  })
  return {
    close: closeSSE,
  }
}
