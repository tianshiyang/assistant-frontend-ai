<template>
  <a-modal
    :open="modelValue"
    :title="isEdit ? '编辑客户' : '新增客户'"
    :confirm-loading="loading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-form-item label="客户名称" name="name">
        <a-input v-model:value="form.name" placeholder="请输入客户名称" />
      </a-form-item>
      <a-form-item label="客户邮箱" name="email">
        <a-auto-complete
          v-model:value="form.email"
          placeholder="请输入邮箱"
          :options="options"
          @search="handleSearch"
        >
          <template #option="{ value: val }">
            {{ val.split('@')[0] }} @
            <span style="font-weight: bold">{{ val.split('@')[1] }}</span>
          </template>
        </a-auto-complete>
      </a-form-item>
      <a-form-item label="客户手机号" name="phone">
        <a-input v-model:value="form.phone" maxlength="11" placeholder="请输入客户手机号" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  getCustomerDetailAPI,
  createCustomerAPI,
  updateCustomerAPI,
} from '@/api/module/backend/customer'
import { CustomerStatus } from '@/api/types/backend/customer'

interface Props {
  customer_id: number
}

const modelValue = defineModel<boolean>('modelValue', { required: true })

interface Emits {
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const rules = {
  name: [{ required: true, message: '请输入客户名称', trigger: 'change' }],
  email: [{ required: true, message: '请输入客户邮箱', trigger: 'change' }],
  phone: [{ required: true, message: '请输入客户手机号', trigger: 'change' }],
}

const isEdit = computed(() => props.customer_id > 0)

const options = ref<{ value: string }[]>([])

const handleSearch = (val: string) => {
  let res: { value: string }[]
  if (!val || val.indexOf('@') >= 0) {
    res = []
  } else {
    res = ['gmail.com', '163.com', 'qq.com'].map(domain => ({ value: `${val}@${domain}` }))
  }
  options.value = res
}

const loading = ref(false)
const form = reactive({
  name: '',
  email: '',
  phone: '',
  status: CustomerStatus.NORMAL,
})

const formRef = ref()

// 提交表单
const handleSubmit = async () => {
  formRef.value.validate().then(async () => {
    loading.value = true
    try {
      if (isEdit.value) {
        // 编辑客户
        const params = {
          customer_id: props.customer_id,
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          status: form.status,
        }
        await updateCustomerAPI(params)
        message.success('更新成功')
      } else {
        // 新增客户
        const params = {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
        }
        await createCustomerAPI(params)
        message.success('创建成功')
      }
      emit('success')
      handleCancel()
    } finally {
      loading.value = false
    }
  })
}

const handleCancel = () => {
  modelValue.value = false
}

// 获取客户详情
const getCustomerInfo = async () => {
  if (!props.customer_id) return
  const res = await getCustomerDetailAPI({
    customer_id: props.customer_id,
  })
  form.name = res.name
  form.email = res.email
  form.phone = res.phone
  form.status = res.status
}

if (props.customer_id) {
  getCustomerInfo()
}
</script>

<style scoped lang="scss">
.icon-upload {
  .icon-upload-area {
    position: relative;
    width: 100px;
    height: 100px;
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    overflow: hidden;

    &:hover {
      border-color: #1890ff;
    }

    .icon-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .icon-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #fafafa;
      gap: 8px;
      color: #999;
      font-size: 14px;
    }

    .upload-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }
  }

  .icon-actions {
    margin-top: 8px;
  }
}
</style>
