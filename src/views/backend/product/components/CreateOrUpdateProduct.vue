<template>
  <a-modal
    :open="modelValue"
    :title="props.productId ? '编辑商品' : '创建商品'"
    :confirm-loading="loading"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-form-item label="商品名称" name="name">
        <a-input
          v-model:value="form.name"
          placeholder="请输入商品名称"
          @press-enter="handleConfirm"
        />
      </a-form-item>
      <a-form-item label="商品分类" name="category_id">
        <SelectProductCategory v-model="form.category_id" />
      </a-form-item>
      <a-form-item label="标准金额" name="standard_price">
        <a-input v-model:value="form.standard_price" placeholder="请输入标准售价" />
      </a-form-item>
      <a-form-item label="标准金额" name="cost_price">
        <a-input v-model:value="form.cost_price" placeholder="请输入成本价" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import SelectProductCategory from './SelectProductCategory.vue'
import { getProductDetailAPI, updateProductAPI } from '@/api/module/backend/product'

interface Props {
  productId: number | string
}

const modelValue = defineModel<boolean>('modelValue', { required: true })

interface Emits {
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const formRef = ref()
const form = reactive({
  name: undefined as unknown as string,
  category_id: undefined as unknown as number,
  standard_price: undefined as unknown as string,
  cost_price: undefined as unknown as string,
})

const rules = {
  name: [{ required: true, message: '请输入知识库名称', trigger: 'blur' }],
  category_id: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  standard_price: [{ required: true, message: '请输入标准售价', trigger: 'blur' }],
  cost_price: [{ required: true, message: '请输入标准售价', trigger: 'blur' }],
}

// 创建商品
const createProduct = async () => {
  if (!form.name.trim()) {
    message.warning('请输入知识库名称')
    return
  }

  loading.value = true
  try {
    // const params = {
    //   name: form.name.trim(),
    // }

    // await createDatasetAPI(params)
    message.success('创建成功')
    emit('success')
    handleCancel()
  } finally {
    loading.value = false
  }
}

// 编辑商品
const updateProduct = async () => {
  formRef.value.validate().then(async () => {
    loading.value = true
    try {
      const params = {
        id: props.productId as number,
        name: form.name,
        category_id: form.category_id as number,
        standard_price: form.standard_price,
        cost_price: form.cost_price,
      }

      await updateProductAPI(params)
      message.success('编辑商品成功')
      emit('success')
      handleCancel()
    } finally {
      loading.value = false
    }
  })
}

const handleConfirm = async () => {
  if (props.productId) {
    await updateProduct()
  } else {
    await createProduct()
  }
}

const handleCancel = () => {
  modelValue.value = false
}

const getProductDetail = async () => {
  if (!props.productId) return
  const res = await getProductDetailAPI({
    id: props.productId,
  })
  form.name = res.name
  form.category_id = res.category_id
  form.cost_price = res.cost_price
  form.standard_price = res.standard_price
}

getProductDetail()
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
