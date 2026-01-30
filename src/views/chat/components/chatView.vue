<template>
  <div class="chat-view">
    <div class="messages-box"></div>
    <div class="input-box">
      <SendMessage :min-rows="2" :max-rows="2" @send="handleSend" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ConversationHistory } from '@/api/types/ai'
import type { Skill } from '@/api/types/public'
import SendMessage from './sendMessage.vue'

defineProps({
  messages: {
    type: Array as PropType<ConversationHistory[]>,
    required: true,
  },
})

const handleSend = (payload: { question: string; skills?: Skill[] }) => {
  console.log(payload)
}
</script>

<style scoped lang="scss">
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  .messages-box {
    flex: 1;
    overflow-y: auto;
  }
  .input-box {
    :deep(.send-message-box) {
      .input-wrap {
        max-height: 80px;
      }
      width: 100%;
    }
  }
}
</style>
