<template>
  <div class="document-list-page">
    <div class="document-list-header">
      <div class="document-list-header-icon"></div>
      <h1 class="document-list-title">我的知识库</h1>
    </div>
    <a-form>
      <a-form-item>
        <a-input
          v-model:value="searchData.name"
          class="input-style"
          placeholder="请输入文档名称"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="handleSearch"> 搜索 </a-button>
      </a-form-item>
    </a-form>

    <a-table :data-source="tableData.list" :columns="columns">
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'status'">
          <!-- 文档状态 -->
          <a-tag v-if="text === DocumentStatus.PARSING" color="success">
            {{ DocumentStatusMap[text as DocumentStatus] }}
          </a-tag>
          <a-tag v-else-if="text === DocumentStatus.COMPLETED" color="success">
            {{ DocumentStatusMap[text as DocumentStatus] }}
          </a-tag>
          <a-tag v-if="text === DocumentStatus.ERROR" color="success">
            {{ DocumentStatusMap[text as DocumentStatus] }}
          </a-tag>
        </template>

        <template v-else-if="column.dataIndex === 'action'">
          <a-button type="link" @click="handleDownload(record)"> 下载 </a-button>
          <a-popconfirm
            title="确认删除该文档"
            ok-text="是"
            cancel-text="否"
            :disabled="deleteButtonDisabled(text)"
            @confirm="handleDelete(record)"
          >
            <a-button type="link" :disabled="deleteButtonDisabled(text)" danger> 删除 </a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { deleteDocumentAPI, getDocumentListAPI } from '@/api/module/document'
import { DocumentStatus, DocumentStatusMap, type DocumentItem } from '@/api/types/document'
import { message } from 'ant-design-vue'
const route = useRoute()

const searchData = reactive({
  dataset_id: route.params.dataset_id as string,
  name: '',
  page_no: 1,
  page_size: 10,
})

const tableData = reactive({
  list: [] as DocumentItem[],
  total: 0,
})

const columns = [
  {
    title: '文档名称',
    dataIndex: 'name',
  },
  {
    title: '文档字数',
    dataIndex: 'character_count',
  },
  {
    title: '文档token数',
    dataIndex: 'token_count',
  },
  {
    title: '文档状态',
    dataIndex: 'status',
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
  },
  {
    title: '操作',
    dataIndex: 'action',
  },
]

const deleteButtonDisabled = computed(() => {
  return (text: DocumentStatus) => {
    return text === DocumentStatus.COMPLETED
  }
})

// 搜索
const handleSearch = () => {
  searchData.page_no = 1
  getDocumentList()
}

// 获取文档列表
const getDocumentList = async () => {
  const res = await getDocumentListAPI(searchData)
  tableData.list = res.list
  tableData.total = res.total
}

// 下载
const handleDownload = (record: DocumentItem) => {
  window.open(record.oss_url, '_blank')
}

// 删除
const handleDelete = async (record: DocumentItem) => {
  await deleteDocumentAPI({
    document_id: record.id,
  })
  message.success('删除成功')
}
// 初始化
getDocumentList()
</script>

<style lang="scss" scoped>
.input-style {
  width: 240px;
}
.document-list-page {
  max-width: 1200px;
  width: 100%;
  .document-list-header {
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 10px;
    .document-list-header-icon {
      width: 4px;
      height: 24px;
      background: #1890ff;
      border-radius: 4px;
    }

    .document-list-title {
      font-size: 24px;
      font-weight: 600;
      color: #131313;
      margin: 0;
    }
  }
}
</style>
