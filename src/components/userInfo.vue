<template>
  <a-popover
    v-model:open="popoverVisible"
    placement="bottomRight"
    :overlay-style="{ width: '280px' }"
    trigger="click"
  >
    <template #content>
      <div v-if="loading" class="user-info-loading">
        <a-spin size="small" />
      </div>
      <div v-else-if="userInfo" class="user-info-content">
        <div class="user-info-header">
          <a-avatar :src="userInfo.avatar_url" :size="36" class="user-avatar">
            <user-outlined />
          </a-avatar>
          <span class="username">{{ userInfo.username }}</span>
        </div>
        <div class="user-info-details">
          <div class="info-item">
            <span class="info-label">邮箱：</span>
            <span class="info-value">{{ userInfo.email }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">注册时间：</span>
            <span class="info-value">{{ userInfo.created_at }}</span>
          </div>
        </div>
        <div class="user-info-logout">
          <a-button danger @click="handleLogout">退出登录</a-button>
        </div>
      </div>
    </template>
    <a-avatar :src="avatarUrl" :size="32" class="user-avatar-trigger" @click.stop>
      <user-outlined />
    </a-avatar>
  </a-popover>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { UserOutlined } from '@ant-design/icons-vue'
import { getUserInfoAPI } from '@/api/module/account'
import { removeToken } from '@/utils/storage'
import { useRouter } from 'vue-router'

const router = useRouter()

interface UserInfo {
  id?: string
  username: string
  email: string
  avatar_url: string
  created_at: string
}

const popoverVisible = ref(false)
const loading = ref(false)
const userInfo = ref<UserInfo | null>(null)
const avatarUrl = ref('')

// 获取用户信息
const fetchUserInfo = async () => {
  if (userInfo.value) return // 已加载过，不再重复加载

  loading.value = true
  const data = await getUserInfoAPI()
  userInfo.value = data as UserInfo
  avatarUrl.value = userInfo.value.avatar_url
  loading.value = false
}

const handleLogout = async () => {
  removeToken()
  router.push('/login')
}

fetchUserInfo()
</script>

<style scoped lang="scss">
.user-avatar-trigger {
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    opacity: 0.8;
  }
}

.user-info-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.user-info-content {
  .user-info-header {
    padding: 12px;
    border-radius: 8px;
    background-color: rgba(6, 10, 38, 0.03);
    display: flex;
    align-items: center;
    gap: 12px;

    .user-avatar {
      flex-shrink: 0;
    }

    .username {
      font-size: 16px;
      font-weight: 500;
      color: #131313;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-info-text {
      flex: 1;
      min-width: 0;

      .username {
        font-size: 16px;
        font-weight: 500;
        color: #131313;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .uid {
        font-size: 12px;
        color: #999;
      }
    }
  }

  .user-info-details {
    margin-top: 12px;
    padding-left: 12px;
    .info-item {
      display: flex;
      margin-bottom: 8px;
      font-size: 14px;

      &:last-child {
        margin-bottom: 0;
      }

      .info-label {
        color: #666;
        min-width: 70px;
        flex-shrink: 0;
      }

      .info-value {
        color: #131313;
        flex: 1;
        word-break: break-all;
      }
    }
  }

  .user-info-logout {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 12px;
  }
}
</style>
