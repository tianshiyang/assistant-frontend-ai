<template>
  <a-layout class="history-layout">
    <a-layout-sider :width="240" class="history-sider">
      <HistorySidebar
        ref="sidebarRef"
        @new-chat="handleNewChat"
        @select="handleSelectHistory"
        @delete="handleDeleteHistory"
      />
    </a-layout-sider>
    <a-layout-content class="history-main">
      <HistoryContent
        :conversation-id="selectedConversationId"
        @conversation-created="handleConversationCreated"
      />
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HistorySidebar from './components/HistorySidebar.vue'
import HistoryContent from './components/HistoryContent.vue'
import type { HistoryItem } from './components/HistorySidebar.vue'

const route = useRoute()
const router = useRouter()

// null = 未选择，展示占位；'' = 新会话（可输入）；string = 选中的会话 id
const selectedConversationId = ref<string | null>(null)
const sidebarRef = ref<InstanceType<typeof HistorySidebar>>()

// 根据 URL 初始化和同步选中的会话 id
const syncFromRoute = () => {
  const id = route.params.conversation_id as string | undefined
  selectedConversationId.value = id && id.length ? id : null
}

syncFromRoute()

watch(
  () => route.params.conversation_id,
  () => {
    syncFromRoute()
  }
)

// 新会话：清除 URL 参数，仅在当前页开启新的对话框
const handleNewChat = () => {
  selectedConversationId.value = ''
  router.push({
    name: 'historyList',
    params: { conversation_id: undefined },
  })
}

// 点击左侧历史记录：将会话 id 写入 URL
const handleSelectHistory = (item: HistoryItem) => {
  selectedConversationId.value = item.id
  router.push({
    name: 'historyList',
    params: { conversation_id: item.id },
  })
}

// 删除历史记录：如果当前选中被删，清空选中，同时刷新列表
const handleDeleteHistory = (item: HistoryItem) => {
  if (selectedConversationId.value === item.id) {
    selectedConversationId.value = null
    router.push({
      name: 'historyList',
      params: { conversation_id: undefined },
    })
  }
  sidebarRef.value?.loadHistoryList()
}

// 管理端新对话创建：后端返回 create_conversation，content 为会话 id
const handleConversationCreated = (conversationId: string) => {
  selectedConversationId.value = conversationId
  router.push({
    name: 'historyList',
    params: { conversation_id: conversationId },
  })
  sidebarRef.value?.loadHistoryList()
}
</script>

<style scoped lang="scss">
.history-layout {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
  background: #fcfcfd;
}

.history-sider {
  flex-shrink: 0;
  height: 100%;
  overflow: hidden;
  background: #fcfcfd;
}

.history-main {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
  background: #fff;
}
</style>
