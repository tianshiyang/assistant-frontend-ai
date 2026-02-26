<template>
  <a-select
    v-model:value="modelValue"
    show-search
    allow-clear
    :filter-option="false"
    :options="options"
    :loading="loading"
    placeholder="请选择商品"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
import { debounce } from 'lodash'
import { getAllProductListAPI } from '@/api/module/backend/product'

// 双向绑定的值：使用分类编码作为值
const modelValue = defineModel<number | undefined>({
  default: undefined,
})

interface SelectOption {
  label: string
  value: number
}

const options = ref<SelectOption[]>([])
const loading = ref(false)

const fetchOptions = async (name?: string) => {
  loading.value = true
  try {
    const res = await getAllProductListAPI({
      name,
    })
    const list = Array.isArray(res) ? res : []
    options.value = list.map(item => ({
      label: item.name,
      value: item.id,
    }))
  } finally {
    loading.value = false
  }
}

// 防抖搜索
const handleSearch = debounce((value: string) => {
  fetchOptions(value)
}, 300)

// 初始加载一次
fetchOptions()
</script>
