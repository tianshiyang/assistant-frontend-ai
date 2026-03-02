<template>
  <a-layout class="history-layout">
    <a-layout-sider :width="240" class="history-sider">
      <HistorySidebar
        @new-chat="handleNewChat"
        @select="handleSelectHistory"
        @delete="handleDeleteHistory"
      />
    </a-layout-sider>
    <a-layout-content class="history-main">
      <HistoryContent :placeholder-text="contentPlaceholder" />
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import HistorySidebar from './components/HistorySidebar.vue'
import HistoryContent from './components/HistoryContent.vue'
import type { HistoryItem } from './components/HistorySidebar.vue'

const contentPlaceholder = ref('请从左侧选择一条历史记录，或点击「新会话」开始新对话')

const handleNewChat = () => {
  contentPlaceholder.value = '请从左侧选择一条历史记录，或点击「新会话」开始新对话'
}

const handleSelectHistory = (item: HistoryItem) => {
  contentPlaceholder.value = `当前选中：${item.title}（具体内容待实现）`
}

const handleDeleteHistory = (_item: HistoryItem) => {
  // 后续可调删除接口并刷新列表
  contentPlaceholder.value = '请从左侧选择一条历史记录，或点击「新会话」开始新对话'
}
</script>

<style scoped lang="scss">
.history-layout {
  height: 100%;
  overflow: hidden;
  background: #fcfcfd;
}

.history-sider {
  height: 100%;
  overflow: hidden;
  background: #fcfcfd;
}

.history-main {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
  background: #fff;
}
</style>
