<template>
  <div class="dataset-page">
    <!-- 标题 -->
    <div class="dataset-header">
      <div class="dataset-header-icon"></div>
      <h1 class="dataset-title">我的知识库</h1>
    </div>

    <!-- 操作栏 -->
    <div class="dataset-actions">
      <a-input
        v-model:value="searchData.name"
        style="width: 300px"
        placeholder="搜索知识库名称"
        allow-clear
        @press-enter="handleSearch"
      />
      <a-button type="primary" @click="handleCreate"> 新建知识库 </a-button>
    </div>

    <!-- 知识库列表 -->
    <div class="dataset-list">
      <a-spin :spinning="loading">
        <div v-if="!tableDataList.list.length" class="empty-state">
          <inbox-outlined class="empty-icon" />
          <p class="empty-text">暂无知识库</p>
        </div>
        <div v-else class="dataset-cards">
          <div
            v-for="item in tableDataList.list"
            :key="item.id"
            class="dataset-card"
            @click="handleCardClick(item)"
          >
            <div class="card-header">
              <div class="card-title">
                <img :src="item.icon" class="card-title-icon" />
                <div class="card-title-text">{{ item.name }}</div>
              </div>
              <a-dropdown :trigger="['click']">
                <a-button type="text" class="card-more" @click.stop>
                  <more-outlined />
                </a-button>
                <template #overlay>
                  <a-menu @click="handleMenuClick($event, item)">
                    <a-menu-item key="delete"> 删除 </a-menu-item>
                    <a-menu-item key="update"> 编辑 </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
            <div v-if="item.description" class="card-description">
              {{ item.description }}
            </div>
            <div class="card-footer">
              {{ item.created_at }}
            </div>
          </div>
        </div>
      </a-spin>
    </div>

    <!-- 分页 -->
    <div v-if="tableDataList.total > 0" class="dataset-pagination">
      <a-pagination
        v-model:current="searchData.page_no"
        v-model:page-size="searchData.page_size"
        :total="tableDataList.total"
        @change="handlePageChange"
      />
    </div>

    <!-- 新建知识库弹窗 -->
    <CreateOrUpdateDatasetModal
      v-if="createOrUpdateDatasetData.visible"
      v-model="createOrUpdateDatasetData.visible"
      :dataset-id="createOrUpdateDatasetData.datasetId"
      @success="fetchDatasetList"
    />
  </div>
</template>

<script lang="ts" setup>
import { message, Modal } from 'ant-design-vue'
import { MoreOutlined, InboxOutlined } from '@ant-design/icons-vue'
import { getDatasetListAPI, deleteDatasetAPI } from '@/api/dataset'
import CreateOrUpdateDatasetModal from './components/CreateOrUpdateDatasetModal.vue'
import type { DatasetItem } from '@/api/types/dataset'

const loading = ref(false)

const searchData = reactive({
  page_no: 1,
  page_size: 10,
  name: '',
})

const tableDataList = reactive({
  list: [] as DatasetItem[],
  total: 0,
})

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
    const res = await getDatasetListAPI(params)
    tableDataList.list = res.list || []
    tableDataList.total = res.total || 0
  } finally {
    loading.value = false
  }
}

const createOrUpdateDatasetData = reactive({
  datasetId: '',
  visible: false,
})

// 新建知识库
const handleCreate = () => {
  createOrUpdateDatasetData.visible = true
  createOrUpdateDatasetData.datasetId = ''
}

// 编辑知识库
const handleEdit = (item: DatasetItem) => {
  createOrUpdateDatasetData.visible = true
  createOrUpdateDatasetData.datasetId = item.id
}

const handleDelete = (item: DatasetItem) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除知识库"${item.name}"吗？`,
    onOk: async () => {
      await deleteDatasetAPI({ dataset_id: item.id })
      message.success('删除成功')
      fetchDatasetList()
    },
  })
}

// 删除知识库
const handleMenuClick = (event: any, item: DatasetItem) => {
  if (event.key === 'update') {
    handleEdit(item)
  } else if (event.key === 'delete') {
    handleDelete(item)
  }
}

// 卡片点击
const handleCardClick = (item: DatasetItem) => {
  // TODO: 跳转到知识库详情页
  console.log('点击知识库:', item)
}

// 分页变化
const handlePageChange = () => {
  fetchDatasetList()
}

fetchDatasetList()
</script>

<style scoped lang="scss">
.dataset-page {
  max-width: 1200px;

  .dataset-header {
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 10px;
    .dataset-header-icon {
      width: 4px;
      height: 24px;
      background: #1890ff;
      border-radius: 4px;
    }

    .dataset-title {
      font-size: 24px;
      font-weight: 600;
      color: #131313;
      margin: 0;
    }
  }

  .dataset-actions {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    gap: 16px;
  }

  .dataset-list {
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
