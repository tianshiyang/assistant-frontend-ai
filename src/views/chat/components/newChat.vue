<template>
  <div class="new-chat-container">
    <h1>你好，我是AI助手</h1>
    <SendMessage
      :is-conversation-loading="isConversationLoading"
      @send="handleSend"
      @stop="handleStopConversation"
    />
  </div>
</template>

<script setup lang="ts">
import SendMessage from './sendMessage.vue'
import type { Skill } from '@/api/types/public'

defineProps({
  isConversationLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  send: [payload: { question: string; skills?: Skill[] }, newChat: boolean]
  stop: []
}>()

const handleSend = (payload: { question: string; skills?: Skill[] }) => {
  emit('send', payload, true)
}

const handleStopConversation = () => {
  emit('stop')
}
</script>

<style scoped lang="scss">
.new-chat-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  min-width: 580px;
  gap: 40px;
  padding: 0 60px;
}
</style>
