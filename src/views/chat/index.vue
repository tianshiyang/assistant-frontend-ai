<template>
  <template v-if="!conversation_id">
    <NewChat @send="handleSend" />
  </template>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import NewChat from './components/newChat.vue'
import type { Skill } from '@/api/types/public'

const route = useRoute()
const router = useRouter()

// 会话id
const conversation_id = computed(() => {
  return route.params.dataset_id
})

const handleSend = (payload: { question: string; skills?: Skill[] }) => {
  console.log(payload)
}
</script>

<style scoped lang="scss"></style>
