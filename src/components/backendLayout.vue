<template>
  <div class="change-system" @click="handleChangeSystem">
    <SwapOutlined />
    <span>AI助手</span>
  </div>
  <a-layout class="layout-container">
    <a-layout-sider :width="200" class="layout-sider">
      <div class="layout-sider-header">
        <img class="layout-sider-header-logo" src="@/assets/images/assistant.png" alt="logo" />
        <div class="layout-sider-header-text">后台系统</div>
      </div>
      <a-menu
        v-model:selected-keys="selectedKeys"
        mode="vertical"
        theme="light"
        :inline-collapsed="true"
        class="layout-menu"
        @click="handleMenuClick"
      >
        <a-menu-item-group title="人员管理">
          <a-menu-item key="/backend/sales/list">
            <template #icon>
              <UserOutlined />
            </template>
            <span>销售管理</span>
          </a-menu-item>
          <a-menu-item key="/backend/customer/list">
            <template #icon>
              <TeamOutlined />
            </template>
            <span>客户管理</span>
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
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { UserOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import UserInfo from './userInfo.vue'
import { getAllConversationListAPI } from '@/api/module/ai'
import type { ConversationList } from '@/api/types/ai'
import emitter from '@/utils/eventBus'
import { SwapOutlined } from '@ant-design/icons-vue'

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

// 初始化
updateSelectedKeys()

// 切换到后台系统
const handleChangeSystem = () => {
  router.push({
    path: '/chat',
  })
}

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

.change-system {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    color: #1890ff;
  }
}
</style>
