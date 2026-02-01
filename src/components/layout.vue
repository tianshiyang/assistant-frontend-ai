<template>
  <a-layout class="layout-container">
    <a-layout-sider :width="200" class="layout-sider">
      <div class="layout-sider-header">
        <img class="layout-sider-header-logo" src="@/assets/images/assistant.png" alt="logo" />
        <div class="layout-sider-header-text">AI助手</div>
      </div>
      <a-menu
        v-model:selected-keys="selectedKeys"
        mode="inline"
        theme="light"
        class="layout-menu"
        @click="handleMenuClick"
      >
        <a-menu-item key="/chat">
          <template #icon>
            <ChatIcon class="svg-icon" />
          </template>
          <span>新对话</span>
        </a-menu-item>

        <a-menu-item-group title="常用功能">
          <a-menu-item key="/dataset">
            <template #icon>
              <DatasetIcon class="svg-icon" />
            </template>
            <span>我的知识库</span>
          </a-menu-item>
        </a-menu-item-group>

        <a-menu-item-group title="最近对话" class="conversation-list">
          <a-menu-item
            v-for="item in conversationList"
            :key="'/chat/' + item.id"
            @mouseenter="item.isHover = true"
            @mouseleave="item.isHover = false"
          >
            <div class="conversation-item-box">
              <a-tooltip :title="item.name">
                <div class="conversation-name">{{ item.name }}</div>
              </a-tooltip>
              <div
                v-if="item.isHover"
                class="conversation-icon"
                @click="handleDeleteConversation(item)"
              >
                <DeleteOutlined />
              </div>
            </div>
          </a-menu-item>
        </a-menu-item-group>
      </a-menu>

      <div class="user-info-box">
        <UserInfo />
      </div>
    </a-layout-sider>
    <a-layout-content class="layout-content">
      <router-view />
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts" setup>
import { createVNode, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ChatIcon from './icons/ChatIcon.vue'
import DatasetIcon from './icons/DatasetIcon.vue'
import { message, Modal } from 'ant-design-vue'
import UserInfo from './userInfo.vue'
import { deleteConversationAPI, getAllConversationListAPI } from '@/api/module/ai'
import type { ConversationList } from '@/api/types/ai'
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import emitter from '@/utils/eventBus'

interface ConversationItem extends ConversationList {
  isHover: boolean
}

const router = useRouter()
const route = useRoute()

const selectedKeys = ref<string[]>([])

const conversationList = ref<ConversationItem[]>([])

// 根据当前路由设置选中的菜单项
const updateSelectedKeys = () => {
  const path = route.path
  selectedKeys.value = [path]
}

// 获取历史会话
const getAllConversationList = async () => {
  const res = await getAllConversationListAPI()
  conversationList.value = res.map(item => {
    return {
      ...item,
      isHover: false,
    }
  })
}

// 菜单点击处理
const handleMenuClick = ({ key }: { key: string }) => {
  if (key === route.path && key === '/chat') {
    message.info('当前已经是最新对话')
    return
  }
  router.push(key)
}

// 删除会话
const handleDeleteConversation = (item: ConversationItem) => {
  Modal.confirm({
    content: `确定要删除会话 ${item.name} 吗？`,
    icon: createVNode(ExclamationCircleOutlined),
    onOk: async () => {
      await deleteConversationAPI({ conversation_id: item.id })
      await getAllConversationList()
      router.push({
        name: 'chat',
        params: {
          conversation_id: conversationList.value[0]?.id,
        },
      })
      message.success('删除会话成功')
    },
    cancelText: '取消',
    onCancel() {
      Modal.destroyAll()
    },
  })
}

// 初始化
updateSelectedKeys()

// 监听路由变化，更新选中项
watch(
  () => route.path,
  () => {
    updateSelectedKeys()
  },
  { immediate: true }
)

// 监听更新会话历史记录
emitter.on('update-conversation-history', getAllConversationList)

getAllConversationList()
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  overflow: hidden;
  background: #fcfcfd;
}
:deep(.ant-menu-light) {
  background: #fcfcfd;
}

.layout-sider {
  position: relative;
  background: #fcfcfd;
  border-right: 1px solid rgba(6, 10, 38, 0.03);
  overflow-y: auto;
  overflow-x: hidden;

  .layout-sider-header {
    display: flex;
    align-items: center;
    padding: 16px;
    gap: 10px;
    .layout-sider-header-logo {
      width: 22px;
      height: 22px;
    }
    .layout-sider-header-text {
      font-size: 18px;
      font-weight: 500;
      color: #131313;
    }
  }

  .layout-menu {
    height: 100%;
    border-right: none;

    .conversation-item-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .conversation-name {
        font-size: 14px;
        font-weight: 500;
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .conversation-icon {
        cursor: pointer;
        :hover {
          fill: #1890ff;
        }
      }
    }

    .conversation-list {
      max-height: 300px;
      overflow-y: auto;
    }

    :deep(.ant-menu-item-selected) {
      .svg-icon {
        .icon-path {
          fill: #1890ff;
        }
      }
    }
  }
}

:deep(.ant-menu-item-group-list) {
  max-height: 400px;
  overflow-y: auto;
}

.layout-content {
  background-color: #fff;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
}

.user-info-box {
  position: absolute;
  left: 10px;
  bottom: 10px;
}
</style>
