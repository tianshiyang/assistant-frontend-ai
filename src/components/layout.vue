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
            <ChatIcon />
          </template>
          <span>新对话</span>
        </a-menu-item>
        <!-- 可以在这里添加更多菜单项 -->
      </a-menu>
    </a-layout-sider>
    <a-layout-content class="layout-content">
      <div class="content-wrapper">
        <router-view />
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ChatIcon from './icons/ChatIcon.vue'
import { message } from 'ant-design-vue'

const router = useRouter()
const route = useRoute()

const selectedKeys = ref<string[]>([])

// 根据当前路由设置选中的菜单项
const updateSelectedKeys = () => {
  const path = route.path
  selectedKeys.value = [path]
}

// 初始化时设置选中项
updateSelectedKeys()

// 监听路由变化，更新选中项
watch(
  () => route.path,
  () => {
    updateSelectedKeys()
  },
  { immediate: true }
)

// 菜单点击处理
const handleMenuClick = ({ key }: { key: string }) => {
  if (key === route.path && key === '/chat') {
    message.info('当前已经是最新对话')
    return
  }
  router.push(key)
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  overflow: hidden;
}

.layout-sider {
  background: #fff;
  border-right: 1px solid #f0f0f0;
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

    // 选中状态下，图标变为蓝色（与文字颜色一致）
    :deep(.ant-menu-item-selected) {
      .chat-icon {
        .icon-path {
          fill: #1890ff; // Ant Design Vue 的主题蓝色
        }
      }
    }

    // 悬停状态下也使用蓝色
    :deep(.ant-menu-item:hover) {
      .chat-icon {
        .icon-path {
          fill: #1890ff;
        }
      }
    }
  }
}

.layout-content {
  background: #f0f2f5;
  overflow-y: auto;
  overflow-x: hidden;

  .content-wrapper {
    min-height: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 24px;
  }
}
</style>
