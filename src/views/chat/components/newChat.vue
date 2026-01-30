<template>
  <div class="new-chat-container">
    <h1>你好，我是AI助手</h1>
    <SendMessage @send="handleSend" />
  </div>
</template>

<script setup lang="ts">
import SendMessage from './sendMessage.vue'
import type { Skill } from '@/api/types/public'

const emit = defineEmits<{
  send: [payload: { question: string; skills?: Skill[] }]
}>()

const handleSend = (payload: { question: string; skills?: Skill[] }) => {
  emit('send', payload)
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
