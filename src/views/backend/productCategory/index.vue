<template>
  <div class="container">
    <!-- 标题 -->
    <div class="container-header">
      <div class="container-header-icon"></div>
      <h1 class="container-title">商品分类管理</h1>
    </div>

    <!-- 操作栏 -->
    <div class="container-actions">
      <a-input
        v-model:value="searchData.category_name"
        style="width: 240px"
        placeholder="搜索商品分类名称"
        allow-clear
      />
      <a-button type="primary" @click="handleSearch"> 搜索 </a-button>
    </div>

    <!-- 分类列表 -->
    <div class="table-list">
      <a-table
        :data-source="tableDataList.list"
        :columns="columns"
        :loading="loading"
        :pagination="{
          current: searchData.page_no,
          pageSize: searchData.page_size,
          total: tableDataList.total,
        }"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === ProductCategoryStatus.NORMAL ? 'green' : 'red'">
              {{ ProductCategoryStatusMap[record.status as ProductCategoryStatus] }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import {
  ProductCategoryStatus,
  ProductCategoryStatusMap,
  type ProductCategoryItem,
} from '@/api/types/backend/productCategory'
import { getProductCategoryListAPI } from '@/api/module/backend/productCategory'

const loading = ref(false)

const searchData = reactive({
  page_no: 1,
  page_size: 10,
  category_name: '',
})

const tableDataList = reactive<{
  list: ProductCategoryItem[]
  total: number
}>({
  list: [],
  total: 0,
})

const columns = [
  {
    title: '分类编码',
    dataIndex: 'category_code',
    key: 'category_code',
  },
  {
    title: '分类名称',
    dataIndex: 'category_name',
    key: 'category_name',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
  },
  {
    title: '更新时间',
    dataIndex: 'updated_at',
    key: 'updated_at',
  },
]

// 搜索
const handleSearch = () => {
  searchData.page_no = 1
  fetchCategoryList()
}

// 获取分类列表
const fetchCategoryList = async () => {
  loading.value = true
  try {
    const params = {
      page_no: searchData.page_no,
      page_size: searchData.page_size,
      category_name: searchData.category_name,
    }
    const res = await getProductCategoryListAPI(params)
    tableDataList.list = res.list || []
    tableDataList.total = res.total || 0
  } finally {
    loading.value = false
  }
}

// 表格分页、排序变更
const handleTableChange = (pagination: { current?: number; pageSize?: number }) => {
  if (pagination.current) {
    searchData.page_no = pagination.current
  }
  if (pagination.pageSize) {
    searchData.page_size = pagination.pageSize
  }
  fetchCategoryList()
}

fetchCategoryList()
</script>

<style scoped lang="scss">
.container {
  min-width: 1200px;
  width: 100%;

  .container-header {
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 10px;

    .container-header-icon {
      width: 4px;
      height: 24px;
      background: #1890ff;
      border-radius: 4px;
    }

    .container-title {
      font-size: 24px;
      font-weight: 600;
      color: #131313;
      margin: 0;
    }
  }

  .container-actions {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    gap: 16px;
  }

  .table-list {
    background: #fff;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  }
}
</style>
