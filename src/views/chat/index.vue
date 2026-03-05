<template>
  <template v-if="!conversation_id">
    <NewChat
      :is-conversation-loading="chatStore.isConversationLoading"
      @send="handleSend"
      @stop="handleStopConversation"
    />
  </template>
  <template v-else>
    <ChatView
      :is-conversation-loading="chatStore.isConversationLoading"
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
  createConversationAPI,
  getConversationHistoryAPI,
  getUserPossibleQuestionsAPI,
  stopChatAPI,
  updataConversationNameAPI,
  type ChatPayloadRequest,
} from '@/api/module/ai'
import { ConversationType, type ConversationHistory } from '@/api/types/ai'
import ChatView from './components/chatView.vue'
import { margeAiMessage } from './utils/margeAiMessage'
import dayjs from 'dayjs'
import emitter from '@/utils/eventBus'
import { useChatStore } from '@/stores/chatStore'

const route = useRoute()
const router = useRouter()

const chatStore = useChatStore()

// 会话id
const conversation_id = ref<string>(route.params.conversation_id as string)

// 会话历史记录
const conversationHistory = ref<ConversationHistory[]>([])

// 用户可能询问的问题
const questions = ref<string[]>([])

// 停止与AI对话
const handleStopConversation = async () => {
  await stopChatAPI({
    conversation_id: conversation_id.value as string,
  })
  chatStore.setIsConversationLoading(false)
}

// 创建回话
const createConversation = async (payload: {
  question: string
  skills?: Skill[]
  datasetIds?: string[]
}) => {
  const res = await createConversationAPI({
    question: payload.question,
    conversation_type: ConversationType.SKILLS,
  })
  conversation_id.value = res.id
  emitter.emit('update-conversation-history')

  router.push({
    name: 'chat',
    params: {
      conversation_id: conversation_id.value,
    },
  })
}

// 发送问题
const handleSend = async (
  payload: { question: string; skills?: Skill[]; datasetIds?: string[] },
  newChat: boolean = false
) => {
  chatStore.setIsConversationLoading(true)
  questions.value = []
  conversationHistory.value.push({
    conversation_id: conversation_id.value,
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
  if (newChat) {
    await createConversation(payload)
  }
  const data: ChatPayloadRequest = {
    conversation_id: <string>conversation_id.value,
    question: payload.question,
    skills: payload.skills,
  }
  if (payload.skills?.includes(Skill.DATASET_RETRIEVER)) {
    data.dataset_ids = payload.datasetIds
  }
  chatAPI(data, {
    onmessage: async event => {
      if (
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
          chatStore.setIsConversationLoading(false)
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
    if (chatStore.isConversationLoading) {
      return
    }
    conversationHistory.value = []
    conversation_id.value = route.params.conversation_id as string
    initGetHistory()
  }
)
</script>

<style scoped lang="scss"></style>
