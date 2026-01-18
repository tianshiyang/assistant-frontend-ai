<template>
  <a-form
    ref="formRef"
    :model="loginFormData"
    :rules="formRules"
    layout="vertical"
    class="login-form"
  >
    <a-form-item name="username">
      <a-input v-model:value="loginFormData.username" placeholder="请输入账号" allow-clear />
    </a-form-item>
    <a-form-item name="password">
      <a-input-password
        v-model:value="loginFormData.password"
        placeholder="请输入密码"
        allow-clear
      />
    </a-form-item>
    <a-form-item>
      <div class="create-account">
        没有账号？<a-button type="link" style="padding: 0" @click="handleGoRegister">
          创建账号
        </a-button>
      </div>
    </a-form-item>
    <a-form-item>
      <a-button
        type="primary"
        size="large"
        block
        :loading="loginFormData.confirmLoading"
        @click="handleLogin"
      >
        登录
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'ant-design-vue'

import { userLoginAPI } from '@/api/account'
import { setToken } from '@/utils/storage'

const router = useRouter()

const emit = defineEmits(['go-register'])

const loginFormData = reactive({
  username: '',
  password: '',
  confirmLoading: false,
})

const formRef = ref<FormInstance>()
const formRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 4, max: 32, message: '账号长度应在4-32个字符之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, max: 32, message: '密码长度应在8-32个字符之间', trigger: 'blur' },
  ],
}

const handleLogin = async () => {
  try {
    // 表单验证
    await formRef.value?.validate()

    // 验证通过后执行登录逻辑
    loginFormData.confirmLoading = true
    const res = await userLoginAPI({
      username: loginFormData.username,
      password: loginFormData.password,
    })
    setToken(res.token)
    router.push('/home')
  } finally {
    loginFormData.confirmLoading = false
  }
}

const handleGoRegister = async () => {
  emit('go-register')
}
</script>

<style scoped lang="scss">
.login-form {
  margin-top: 40px;
  padding: 0 30px;
  :deep(.ant-form-item-label) {
    padding-bottom: 8px;
    label {
      font-weight: 500;
      color: #131313;
    }
  }
  :deep(.ant-form-item) {
    margin-bottom: 24px;
  }
  .create-account {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
</style>
