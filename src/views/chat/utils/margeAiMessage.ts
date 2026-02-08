import type { StreamResponse } from '@/api/types'
import type { ConversationHistory } from '@/api/types/ai'
import { ChatResponseType } from '@/api/types/public'

export const transformMessageItem = (aiMessage: ConversationHistory) => {
  // 格式化每个消息中的ai返回的message
  const messages: StreamResponse[] = []
  // AI输出内容文本
  aiMessage.messages.forEach(messageChunk => {
    if (messageChunk.type === ChatResponseType.TOOL_RESULT) {
      // 处理工具返回结果
      messageChunk._is_expanded = true
      if (typeof messageChunk.content === 'string') {
        messageChunk.content = JSON.parse(messageChunk.content)
      }
      messages.push(messageChunk)
    } else if (messageChunk.type === ChatResponseType.DONE) {
      // 处理完成，折叠所有工具返回结果
      messages.forEach(item => {
        if (item.type === ChatResponseType.TOOL_RESULT) {
          item._is_expanded = false
        }
      })
      messages.push(messageChunk)
    } else if (
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
          lastMessage.content += messageChunk.content
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
  message.forEach(item => {
    result.push(transformMessageItem(item))
  })
  return result
}
