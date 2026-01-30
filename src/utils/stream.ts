import { fetchEventSource, type EventSourceMessage } from '@microsoft/fetch-event-source'
import { getToken } from './storage'

export const streamRequest = ({
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
  onmessage?: (event: EventSourceMessage) => void
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
      onopen?.(response)
      console.log('SSE连接已建立', response)
    },
    onmessage: event => {
      onmessage?.(event)
      console.log('SSE消息', event)
    },
    onerror: error => {
      onerror?.(error)
      console.error('SSE连接错误', error)
    },
    onclose: () => {
      onclose?.()
      console.log('SSE连接关闭')
    },
  })
  return {
    close: closeSSE,
  }
}
