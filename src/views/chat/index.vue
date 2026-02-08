<template>
  <template v-if="!conversation_id">
    <NewChat
      :is-conversation-loading="isConversationLoading"
      @send="handleSend"
      @stop="handleStopConversation"
    />
  </template>
  <template v-else>
    <ChatView
      :is-conversation-loading="isConversationLoading"
      :messages="conversationHistory"
      :questions="questions"
      @send="handleSend"
      @stop="handleStopConversation"
    />
  </template>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import NewChat from './components/newChat.vue'
import { ChatResponseType, Skill } from '@/api/types/public'
import {
  chatAPI,
  getConversationHistoryAPI,
  getUserPossibleQuestionsAPI,
  stopChatAPI,
  updataConversationNameAPI,
  type ChatPayloadRequest,
} from '@/api/module/ai'
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

// 用户可能询问的问题
const questions = ref<string[]>([])

// 是否正在与AI对话
const isConversationLoading = ref(false)

// 停止与AI对话
const handleStopConversation = async () => {
  await stopChatAPI({
    conversation_id: conversation_id.value as string,
  })
  isConversationLoading.value = false
}

// 发送问题
const handleSend = (
  payload: { question: string; skills?: Skill[]; datasetIds?: string[] },
  newChat: boolean = false
) => {
  isConversationLoading.value = true
  questions.value = []
  const data: ChatPayloadRequest = {
    conversation_id: <string>conversation_id.value,
    question: payload.question,
    skills: payload.skills,
  }
  if (payload.skills?.includes(Skill.DATASET_RETRIEVER)) {
    data.dataset_ids = payload.datasetIds
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
            conversation_id: event.conversation_id,
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
          ChatResponseType.STOP,
          ChatResponseType.GENERATE,
        ].includes(event.type)
      ) {
        const lastMessage = conversationHistory.value[conversationHistory.value.length - 1]!
        lastMessage.messages.push(event)
        conversationHistory.value = margeAiMessage(conversationHistory.value)
        if (
          [ChatResponseType.DONE, ChatResponseType.STOP, ChatResponseType.ERROR].includes(
            event.type
          )
        ) {
          isConversationLoading.value = false
        }
        if (event.type === ChatResponseType.DONE) {
          // 生成用户可能询问的问题
          getUserPossibleQuestionsAPI({
            message_id: event.message_id,
          }).then(res => {
            questions.value = res.question_list
          })
          if (newChat) {
            // 新会话更新会话历史记录
            await updataConversationNameAPI({
              message_id: event.message_id,
            })
            emitter.emit('update-conversation-history')
          }
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
