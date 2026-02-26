<template>
  <a-modal
    :open="modelValue"
    title="订单支付"
    :confirm-loading="loading"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <a-descriptions bordered size="small" :column="1" style="margin-bottom: 16px">
      <a-descriptions-item label="订单编号">
        {{ orderDetail?.order_no }}
      </a-descriptions-item>
      <a-descriptions-item label="订单总金额">
        {{ orderDetail?.total_amount }}
      </a-descriptions-item>
      <a-descriptions-item label="已付金额">
        {{ orderDetail?.paid_amount }}
      </a-descriptions-item>
      <a-descriptions-item label="本次最多可支付">
        {{ remainAmountText }}
      </a-descriptions-item>
    </a-descriptions>

    <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
      <a-form-item label="支付金额" name="pay_amount">
        <a-input-number
          v-model:value="form.pay_amount"
          class="default-input-select"
          :min="0.01"
          :max="remainAmount"
          :precision="2"
          :step="0.01"
          :disabled="remainAmount <= 0"
          placeholder="请输入支付金额"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { Order } from '@/api/types/backend/order'
import { getOrderDetailAPI, payOrderAPI } from '@/api/module/backend/order'

interface Props {
  orderId: number
}

const modelValue = defineModel<boolean>('modelValue', { required: true })

interface Emits {
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const orderDetail = ref<Order>()
const formRef = ref()
const form = reactive({
  pay_amount: undefined as number | undefined,
})

const rules = {
  pay_amount: [
    { required: true, message: '请输入支付金额', trigger: 'blur' },
    {
      validator: async (_rule: unknown, value: number) => {
        if (remainAmount.value <= 0) {
          throw new Error('当前订单无需再支付')
        }
        if (!value || value <= 0) {
          throw new Error('请输入大于 0 的支付金额')
        }
        if (value > remainAmount.value) {
          throw new Error('支付金额不能大于剩余应付金额')
        }
      },
      trigger: 'blur',
    },
  ],
}

const remainAmount = computed(() => {
  if (!orderDetail.value) return 0
  const total = Number(orderDetail.value.total_amount || 0)
  const paid = Number(orderDetail.value.paid_amount || 0)
  const remain = total - paid
  return remain > 0 ? Number(remain.toFixed(2)) : 0
})

const remainAmountText = computed(() => {
  return remainAmount.value.toFixed(2)
})

const loadOrderDetail = async () => {
  if (!props.orderId) return
  loading.value = true
  try {
    const res = await getOrderDetailAPI({ order_id: props.orderId })
    orderDetail.value = res
    if (remainAmount.value > 0) {
      form.pay_amount = remainAmount.value
    } else {
      form.pay_amount = undefined
    }
  } finally {
    loading.value = false
  }
}

const handleConfirm = async () => {
  if (!props.orderId) {
    message.warning('订单信息异常，请刷新后重试')
    return
  }

  formRef.value.validate().then(async () => {
    if (!form.pay_amount) return
    loading.value = true
    try {
      await payOrderAPI({
        order_id: props.orderId,
        pay_amount: Number(form.pay_amount.toFixed(2)),
      })
      message.success('支付成功')
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

loadOrderDetail()
</script>
