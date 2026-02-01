<template>
  <a-modal
    v-model:open="modelValue"
    width="800px"
    title="请选择知识库"
    :closable="false"
    :mask-closable="false"
    :cancel-button-props="{ style: { display: 'none' } }"
    @ok="handleOk"
  >
    <!-- 知识库列表 -->
    <a-table
      row-key="id"
      :columns="columns"
      :data-source="tableDataList.list"
      :row-selection="rowSelection"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'icon'">
          <a-image :width="40" :src="record.icon" />
        </template>
      </template>
    </a-table>
  </a-modal>
</template>

<script setup lang="ts">
import { getDatasetListAPI } from '@/api/module/dataset'
import type { DatasetItem } from '@/api/types/dataset'

const modelValue = defineModel<boolean>('modelValue')
const emit = defineEmits<{
  ok: [value: string[]]
}>()

const loading = ref(false)

// 搜索数据
const searchData = reactive({
  page_no: 1,
  page_size: 10,
  name: '',
})

// 多选：选中的 key 和行数据
const selectedRowKeys = ref<string[]>([])

const rowSelection = computed(() => ({
  type: 'checkbox' as const,
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys
  },
}))

// 知识库列表
const tableDataList = reactive({
  list: [] as DatasetItem[],
  total: 0,
})

// 知识库列表列
const columns = [
  {
    title: '知识库名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '知识库icon',
    dataIndex: 'icon',
    key: 'icon',
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
  },
]

// 获取知识库列表
const fetchDatasetList = async () => {
  loading.value = true
  try {
    const params = {
      page_no: searchData.page_no,
      page_size: searchData.page_size,
      name: searchData.name.trim(),
    }
    const res = await getDatasetListAPI(params)
    tableDataList.list = res.list || []
    tableDataList.total = res.total || 0
  } finally {
    loading.value = false
  }
}

const handleOk = () => {
  emit('ok', selectedRowKeys.value)
  modelValue.value = false
}

fetchDatasetList()
</script>

<style scoped lang="scss"></style>
