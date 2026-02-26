<template>
  <a-modal
    :open="modelValue"
    :title="props.orderId ? '编辑订单' : '创建订单'"
    :confirm-loading="loading"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-form-item label="商品名称" name="product_id">
        <SelectProduct v-model="form.product_id" class="default-input-select" />
      </a-form-item>
      <a-form-item label="购买数量" name="quantity">
        <a-input-number
          v-model:value="form.quantity"
          class="default-input-select"
          placeholder="请输入购买数量"
        />
      </a-form-item>
      <a-form-item label="成单销售" name="sales_id">
        <SelectSales v-model="form.sales_id" class="default-input-select" />
      </a-form-item>
      <a-form-item label="成单客户" name="customer_id">
        <SelectCustomer v-model="form.customer_id" class="default-input-select" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { createOrderAPI } from '@/api/module/backend/order'
import SelectSales from '@/views/backend/sales/components/SelectSales.vue'
import SelectProduct from '@/views/backend/product/components/SelectProduct.vue'
import SelectCustomer from '@/views/backend/customer/components/SelectCustomer.vue'

interface Props {
  orderId: number | string
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
  product_id: undefined as unknown as number,
  quantity: undefined as unknown as number,
  sales_id: undefined as unknown as number,
  customer_id: undefined as unknown as number,
})

const rules = {
  product_id: [{ required: true, message: '请选择商品', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入购买数量', trigger: 'blur' }],
  sales_id: [{ required: true, message: '请选择成单销售', trigger: 'change' }],
  customer_id: [{ required: true, message: '请选择成单客户', trigger: 'change' }],
}

// 创建订单
const createOrder = async () => {
  formRef.value.validate().then(async () => {
    loading.value = true
    try {
      const params = {
        product_id: form.product_id,
        quantity: form.quantity,
        sales_id: form.sales_id,
        customer_id: form.customer_id,
      }

      await createOrderAPI(params)
      message.success('创建成功')
      emit('success')
      handleCancel()
    } finally {
      loading.value = false
    }
  })
}

// // 编辑订单
// const updateOrder = async () => {
//   formRef.value.validate().then(async () => {
//     loading.value = true
//     try {
//       const params = {
//         id: props.orderId as number,
//         name: form.name,
//         category_id: form.category_id as number,
//         standard_price: form.standard_price,
//         cost_price: form.cost_price,
//       }

//       await updateProductAPI(params)
//       message.success('编辑商品成功')
//       emit('success')
//       handleCancel()
//     } finally {
//       loading.value = false
//     }
//   })
// }

const handleConfirm = async () => {
  if (props.orderId) {
    // await updateOrder()
  } else {
    await createOrder()
  }
}

const handleCancel = () => {
  modelValue.value = false
}

// const getOrderDetail = async () => {
//   if (!props.orderId) return
//   const res = await getProductDetailAPI({
//     id: props.orderId,
//   })
//   form.name = res.name
//   form.category_id = res.category_id
//   form.cost_price = res.cost_price
//   form.standard_price = res.standard_price
// }

// getOrderDetail()
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
