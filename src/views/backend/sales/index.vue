<template>
  <div class="container">
    <!-- 标题 -->
    <div class="container-header">
      <div class="container-header-icon"></div>
      <h1 class="container-title">销售管理</h1>
    </div>

    <!-- 操作栏 -->
    <div class="container-actions">
      <a-input
        v-model:value="searchData.name"
        style="width: 240px"
        placeholder="搜索销售名称"
        allow-clear
      />
      <a-button type="primary" @click="handleSearch"> 搜索 </a-button>
    </div>

    <!-- 销售列表 -->
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
        @change="fetchDatasetList"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getSalesListAPI } from '@/api/module/backend/sales'
import type { SalesItem } from '@/api/types/backend/sales'

const loading = ref(false)

const searchData = reactive({
  page_no: 1,
  page_size: 10,
  name: '',
})

const tableDataList = reactive({
  list: [] as SalesItem[],
  total: 0,
})

const columns = [
  {
    title: '销售编号',
    dataIndex: 'sales_no',
    key: 'sales_no',
  },
  {
    title: '销售名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '销售邮箱',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: '销售手机号',
    dataIndex: 'phone',
    key: 'phone',
  },
]
// 搜索
const handleSearch = () => {
  searchData.page_no = 1
  fetchDatasetList()
}

// 获取知识库列表
const fetchDatasetList = async () => {
  loading.value = true
  try {
    const params = {
      page_no: searchData.page_no,
      page_size: searchData.page_size,
      name: searchData.name.trim(),
    }
    const res = await getSalesListAPI(params)
    tableDataList.list = res.list || []
    tableDataList.total = res.total || 0
  } finally {
    loading.value = false
  }
}

fetchDatasetList()
</script>

<style scoped lang="scss">
.container {
  max-width: 1200px;
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

  .create-button-box {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 24px;
  }

  .table-list {
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 0;
      color: #999;

      .empty-icon {
        font-size: 64px;
        margin-bottom: 16px;
      }

      .empty-text {
        font-size: 16px;
        margin: 0;
      }
    }

    .dataset-cards {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;

      .dataset-card {
        width: 240px;
        background: #fff;
        border: 1px solid #e8e8e8;
        border-radius: 8px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: #1890ff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;

          .card-title {
            font-size: 16px;
            font-weight: 500;
            display: flex;
            color: #131313;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            .card-title-icon {
              width: 24px;
              height: 24px;
              border-radius: 50%;
              margin-right: 8px;
            }
          }

          .card-more {
            opacity: 0;
            transition: opacity 0.3s;
          }
        }

        &:hover .card-more {
          opacity: 1;
        }

        .card-description {
          font-size: 14px;
          color: #666;
          line-height: 1.5;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid #f0f0f0;
          font-size: 12px;
          color: #999;
        }
      }
    }
  }

  .dataset-pagination {
    display: flex;
    justify-content: center;
    margin-top: 32px;
  }
}
</style>
