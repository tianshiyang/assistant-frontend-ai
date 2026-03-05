import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', () => {
  const isConversationLoading = ref(false)

  const setIsConversationLoading = (status: boolean) => {
    isConversationLoading.value = status
  }

  return {
    isConversationLoading,
    setIsConversationLoading,
  }
})
