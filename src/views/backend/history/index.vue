<template>
  <a-layout class="history-layout">
    <a-layout-sider :width="240" class="history-sider">
      <HistorySidebar ref="historySidebarRef" />
    </a-layout-sider>
    <a-layout-content class="history-main">
      <HistoryContent @refresh-history-list="handleRefreshHistoryList" />
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts" setup>
import HistorySidebar from './components/HistorySidebar.vue'
import HistoryContent from './components/HistoryContent.vue'

const historySidebarRef = ref<InstanceType<typeof HistorySidebar>>()
const handleRefreshHistoryList = () => {
  historySidebarRef.value?.loadHistoryList()
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
