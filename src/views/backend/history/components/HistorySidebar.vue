<template>
  <div class="history-sidebar">
    <div class="history-sidebar-actions">
      <a-button type="primary" block class="new-chat-btn" @click="handleNewChat">
        <span>新会话</span>
      </a-button>
    </div>

    <a-spin :spinning="loading" class="history-sidebar-spin">
      <a-menu
        v-model:selected-keys="selectedKeys"
        mode="inline"
        theme="light"
        class="history-sidebar-menu"
        @click="handleSelect"
      >
        <a-menu-item-group title="历史记录" class="history-list">
          <a-menu-item
            v-for="item in historyList"
            :key="item.id"
            @mouseenter="item.isHover = true"
            @mouseleave="item.isHover = false"
          >
            <div class="history-item-box">
              <a-tooltip :title="item.title">
                <div class="history-item-title">{{ item.title }}</div>
              </a-tooltip>
              <div v-if="item.isHover" class="history-item-icon" @click.stop="handleDelete(item)">
                <DeleteOutlined />
              </div>
            </div>
          </a-menu-item>
          <div v-if="!loading && !historyList.length" class="history-empty">暂无历史记录</div>
        </a-menu-item-group>
      </a-menu>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { createVNode, ref } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { getAllConversationListAPI, deleteConversationAPI } from '@/api/module/ai'
import type { ConversationList } from '@/api/types/ai'

export interface HistoryItem {
  id: string
  title: string
  isHover?: boolean
}

interface Emits {
  (e: 'new-chat'): void
  (e: 'select', item: HistoryItem): void
  (e: 'delete', item: HistoryItem): void
}

const emit = defineEmits<Emits>()

const historyList = ref<HistoryItem[]>([])
const selectedKeys = ref<string[]>([])
const loading = ref(false)

function mapConversationToHistory(list: ConversationList[]): HistoryItem[] {
  return list.map(item => ({
    id: item.id,
    title: item.name,
    isHover: false,
  }))
}

async function loadHistoryList() {
  loading.value = true
  try {
    const res = await getAllConversationListAPI({ type: 'manage' })
    historyList.value = mapConversationToHistory(res || [])
  } finally {
    loading.value = false
  }
}

const handleNewChat = () => {
  selectedKeys.value = []
  emit('new-chat')
}

const handleSelect = ({ key }: { key: string }) => {
  selectedKeys.value = [key]
  const item = historyList.value.find(i => i.id === key)
  if (item) emit('select', item)
}

const handleDelete = (item: HistoryItem) => {
  Modal.confirm({
    content: `确定要删除会话「${item.title}」吗？`,
    icon: createVNode(ExclamationCircleOutlined),
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      await deleteConversationAPI({ conversation_id: item.id })
      await loadHistoryList()
      emit('delete', item)
      message.success('删除成功')
    },
  })
}

loadHistoryList()

defineExpose({
  historyList,
  selectedKeys,
  loadHistoryList,
})
</script>

<style scoped lang="scss">
.history-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fcfcfd;
  border-right: 1px solid rgba(6, 10, 38, 0.03);

  .history-sidebar-header {
    display: flex;
    align-items: center;
    padding: 16px;
    gap: 10px;
    flex-shrink: 0;

    .history-sidebar-header-logo {
      width: 22px;
      height: 22px;
    }
    .history-sidebar-header-text {
      font-size: 18px;
      font-weight: 500;
      color: #131313;
    }
  }

  .history-sidebar-actions {
    padding: 0 16px 16px;
    flex-shrink: 0;

    .new-chat-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
  }

  .history-sidebar-spin {
    flex: 1;
    min-height: 0;
    :deep(.ant-spin-container) {
      height: 100%;
    }
  }

  .history-sidebar-menu {
    height: 100%;
    border-right: none;
    overflow-y: auto;

    .history-item-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;

      .history-item-title {
        font-size: 14px;
        font-weight: 500;
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .history-item-icon {
        cursor: pointer;
        color: #999;
        &:hover {
          color: #1890ff;
        }
      }
    }

    .history-list {
      max-height: 100%;
      overflow-y: auto;
    }

    .history-empty {
      padding: 16px;
      font-size: 14px;
      color: #999;
      text-align: center;
    }
  }
}

:deep(.ant-menu-light) {
  background: #fcfcfd;
}

:deep(.ant-menu-item-group-list) {
  max-height: 100%;
  overflow-y: auto;
}
</style>
