<template>
  <template v-if="!conversation_id">
    <NewChat @send="handleSend" />
  </template>
  <template v-else>
    <ChatView :messages="conversationHistory" @send="handleSend" />
  </template>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import NewChat from './components/newChat.vue'
import { ChatResponseType, type Skill } from '@/api/types/public'
import { chatAPI, getConversationHistoryAPI, updataConversationNameAPI } from '@/api/module/ai'
import type { ConversationHistory } from '@/api/types/ai'
import ChatView from './components/chatView.vue'
import { margeAiMessage } from './utils/margeAiMessage'
import dayjs from 'dayjs'
import emitter from '@/utils/eventBus'

const route = useRoute()
const router = useRouter()

// 会话id
const conversation_id = ref<string>(route.params.conversation_id as string)

// 会话历史记录
const conversationHistory = ref<ConversationHistory[]>([])

// 发送问题
const handleSend = (
  payload: { question: string; skills?: Skill[]; datasetIds?: string[] },
  newChat: boolean = false
) => {
  const data = {
    conversation_id: <string>conversation_id.value,
    question: payload.question,
    dataset_ids: payload.datasetIds,
    skills: payload.skills,
  }
  conversationHistory.value.push({
    conversation_id: '',
    id: '',
    question: payload.question,
    messages: [],
    answer: '',
    input_tokens: 0,
    output_tokens: 0,
    total_tokens: 0,
    created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  })
  chatAPI(data, {
    onmessage: async event => {
      if (event.type === ChatResponseType.CREATE_CONVERSATION) {
        // 创建会话
        router.push({
          name: 'chat',
          params: {
            conversation_id: event.content,
          },
        })
        const lastMessage = conversationHistory.value[conversationHistory.value.length - 1]!
        lastMessage.conversation_id = event.content
        lastMessage.id = event.message_id
        lastMessage.conversation_id = event.content
      } else if (
        [
          ChatResponseType.PING,
          ChatResponseType.SAVE_TOKEN,
          ChatResponseType.TOOL,
          ChatResponseType.TOOL_RESULT,
          ChatResponseType.DONE,
          ChatResponseType.ERROR,
          ChatResponseType.GENERATE,
        ].includes(event.type)
      ) {
        const lastMessage = conversationHistory.value[conversationHistory.value.length - 1]!
        lastMessage.messages.push(event)
        conversationHistory.value = margeAiMessage(conversationHistory.value)
        if (event.type === ChatResponseType.DONE && newChat) {
          // 新会话更新会话历史记录
          await updataConversationNameAPI({
            message_id: event.message_id,
          })
          emitter.emit('update-conversation-history')
        }
      }
    },
  })
}

// 初始化获取历史记录
const initGetHistory = async () => {
  if (!conversation_id.value) return
  const res = await getConversationHistoryAPI({
    conversation_id: conversation_id.value as string,
  })
  conversationHistory.value = margeAiMessage(res)
}

initGetHistory()
watch(
  () => route.params.conversation_id,
  () => {
    conversation_id.value = route.params.conversation_id as string
    initGetHistory()
  }
)
</script>

<style scoped lang="scss"></style>
