<template>
  <a-modal
    :open="modelValue"
    title="编辑销售"
    :confirm-loading="loading"
    @ok="updateSales"
    @cancel="handleCancel"
  >
    <a-form :model="form" layout="vertical">
      <a-form-item label="销售名称" name="name">
        <a-input v-model:value="form.name" placeholder="请输入销售名称" />
      </a-form-item>
      <a-form-item label="销售邮箱" name="icon">
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
      <a-form-item label="销售手机号" name="description">
        <a-input v-model:value="form.phone" placeholder="请输入销售手机号" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { getSalesDetailAPI, updateSalesAPI } from '@/api/module/backend/sales'

interface Props {
  sales_id: number
}

const modelValue = defineModel<boolean>('modelValue', { required: true })

interface Emits {
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

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
})

// 编辑销售
const updateSales = async () => {
  if (!form.name.trim()) {
    message.warning('请输入知识库名称')
    return
  }

  loading.value = true
  try {
    const params = {
      sales_id: props.sales_id,
      name: form.name.trim(),
      phone: form.phone,
      email: form.email,
    }

    await updateSalesAPI(params)
    message.success('创建成功')
    emit('success')
    handleCancel()
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  modelValue.value = false
}

const getSalesInfo = async () => {
  if (!props.sales_id) return
  const res = await getSalesDetailAPI({
    sales_id: props.sales_id,
  })
  form.name = res.name
  form.email = res.email
  form.phone = res.phone
}

getSalesInfo()
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
