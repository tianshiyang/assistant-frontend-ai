import type { StreamResponse } from '@/api/types'
import type { ConversationHistory } from '@/api/types/ai'
import { ChatResponseType } from '@/api/types/public'

export const transformMessageItem = (aiMessage: ConversationHistory) => {
  // 格式化每个消息中的ai返回的message
  const messages: StreamResponse[] = []
  // AI输出内容文本
  aiMessage.messages.forEach(messageChunk => {
    // 防御性检查：确保 messageChunk 对象存在
    if (!messageChunk) {
      return
    }

    if (messageChunk.type === ChatResponseType.TOOL_RESULT) {
      // 处理工具返回结果
      messageChunk._is_expanded = true
      if (typeof messageChunk.content === 'string') {
        try {
          messageChunk.content = JSON.parse(messageChunk.content)
        } catch (e) {
          // JSON解析失败，保留原始内容
          console.error('Failed to parse message content:', e)
        }
      }
      // 防御性检查：确保 content 存在且为对象后再访问其属性
      if (messageChunk.content && typeof messageChunk.content === 'object') {
        messages.push(messageChunk)
      }
    } else if (messageChunk.type === ChatResponseType.DONE) {
      // 处理完成，折叠所有工具返回结果
      messages.forEach(item => {
        if (item && item.type === ChatResponseType.TOOL_RESULT) {
          item._is_expanded = false
        }
      })
      messages.push(messageChunk)
    } else if (
      messageChunk.type &&
      [
        ChatResponseType.PING,
        ChatResponseType.ERROR,
        ChatResponseType.SAVE_TOKEN,
        ChatResponseType.TOOL,
        ChatResponseType.STOP,
      ].includes(messageChunk.type)
    ) {
      // 直接存入即可，不需要处理
      messages.push(messageChunk)
    } else if (messageChunk.type === ChatResponseType.GENERATE) {
      const lastMessage = messages[messages.length - 1]
      if (!lastMessage) {
        // 最后一条消息不存在，也就是第一条消息就是生成内容的情况
        messages.push(messageChunk)
      } else {
        if (lastMessage.type !== ChatResponseType.GENERATE) {
          // 还没有添加进去
          messages.push(messageChunk)
        } else {
          // 已经添加进去了，需要合并
          // 防御性检查：确保 content 是字符串再拼接
          if (typeof lastMessage.content === 'string' && typeof messageChunk.content === 'string') {
            lastMessage.content += messageChunk.content
          }
        }
      }
    }
  })
  return {
    ...aiMessage,
    messages,
  }
}

export const margeAiMessage = (message: ConversationHistory[]) => {
  // 格式化消息列表
  const result: ConversationHistory[] = []
  if (!Array.isArray(message)) {
    console.error('margeAiMessage received non-array input:', message)
    return result
  }
  message.forEach(item => {
    if (item) {
      result.push(transformMessageItem(item))
    }
  })
  return result
}
