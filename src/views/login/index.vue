<template>
  <div class="container">
    <a-modal
      v-model:open="modelData.open"
      :mask-closable="false"
      :closable="false"
      centered
      width="800px"
      wrap-class-name="login-box_20260117"
      :footer="null"
    >
      <div class="login-box">
        <div class="login-box-left">
          <div class="top-box">
            <img class="logo" src="@/assets/images/assistant.png" alt="logo" />
            <div class="logo-text">AI助手</div>
          </div>
          <Login v-if="modelData.type === 'login'" @go-register="modelData.type = 'register'" />
          <Register v-if="modelData.type === 'register'" @go-login="modelData.type = 'login'" />
        </div>
        <div class="login-box-right">
          <a-button type="primary" @click="modelData.type = 'register'">创建新账号</a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import Login from './components/login.vue'
import Register from './components/register.vue'

const modelData = reactive({
  open: true,
  confirmLoading: false,
  type: 'login' as 'login' | 'register',
})
</script>

<style scoped lang="scss">
.container {
  width: 100vw;
  height: 100vh;
  background-image: url('@/assets/images/login-bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-box {
  display: flex;
  align-items: center;

  .login-box-left {
    width: 450px;
    background: #fff;
    border-radius: 12px;
    padding: 38px 0;
    .top-box {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      .logo {
        width: 36px;
        height: 36px;
      }
      .logo-text {
        color: #131313;
        font-weight: 500;
        font-size: 36px;
      }
    }
  }
}
</style>

<style lang="scss">
.login-box_20260117 {
  .ant-modal-content {
    padding: 8px;
    border-radius: 16px;
    background:
      radial-gradient(21% 28% at 77% 4%, rgb(214, 217, 249) 0%, rgba(214, 217, 249, 0) 100%),
      radial-gradient(23% 34% at 56% 10%, rgb(234, 235, 247) 0%, rgba(238, 238, 246, 0) 100%),
      radial-gradient(
        52% 67% at 101% 105%,
        rgb(199, 197, 255) 0%,
        rgb(206, 205, 255) 34%,
        rgb(228, 230, 252) 97%
      ),
      rgb(228, 230, 252);
  }
}
</style>
