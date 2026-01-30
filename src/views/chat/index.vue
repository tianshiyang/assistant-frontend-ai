<template>
  <template v-if="!conversation_id">
    <NewChat @send="handleSend" />
  </template>
  <template v-else>
    <ChatView :messages="conversationHistory" />
  </template>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import NewChat from './components/newChat.vue'
import { ChatResponseType, type Skill } from '@/api/types/public'
import { chatAPI, getConversationHistoryAPI } from '@/api/module/ai'
import type { ConversationHistory } from '@/api/types/ai'
import ChatView from './components/chatView.vue'
import { margeAiMessage } from './utils/margeAiMessage'

const route = useRoute()
const router = useRouter()

// 会话id
const conversation_id = ref<string>()

// 会话历史记录
const conversationHistory = ref<ConversationHistory[]>([])

// 发送问题
const handleSend = (payload: { question: string; skills?: Skill[] }) => {
  const data = {
    conversation_id: <string>conversation_id.value,
    question: payload.question,
    dataset_ids: ['2fb02169-29f9-4ffc-91a4-49f7ef4eb39e'],
    skills: payload.skills,
  }
  chatAPI(data, {
    onmessage: event => {
      if (event.type === ChatResponseType.CREATE_CONVERSATION) {
        // 创建会话
        router.push({
          name: 'chat',
          params: {
            conversation_id: event.content,
          },
        })
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

// 初始化参数
const initParams = () => {
  conversation_id.value = route.params.conversation_id as string
}

// 初始化
initParams()
initGetHistory()
</script>

<style scoped lang="scss"></style>
