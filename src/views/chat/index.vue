<template>
  <template v-if="!conversation_id">
    <NewChat @send="handleSend" />
  </template>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import NewChat from './components/newChat.vue'
import type { Skill } from '@/api/types/public'
import { chatAPI } from '@/api/module/ai'

const route = useRoute()
const router = useRouter()

// 会话id
const conversation_id = computed(() => {
  return route.params.dataset_id
})

const handleSend = (payload: { question: string; skills?: Skill[] }) => {
  console.log(payload)
  const data = {
    conversation_id: <string>conversation_id.value,
    question: payload.question,
    // dataset_ids: payload.dataset_ids,
    skills: payload.skills,
  }
  chatAPI(data, {
    onmessage: event => {
      console.log(event)
    },
    onerror: error => {
      console.log(error)
    },
    onclose: () => {
      console.log('close')
    },
  })
}
</script>

<style scoped lang="scss"></style>
