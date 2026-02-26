<template>
  <div class="container">
    <!-- 标题 -->
    <div class="container-header">
      <div class="container-header-icon"></div>
      <h1 class="container-title">商品列表</h1>
    </div>

    <!-- 操作栏 -->
    <div class="container-actions">
      <a-input
        v-model:value="searchData.product_no"
        class="default-input-select"
        placeholder="搜索商品编号"
        allow-clear
      />
      <a-input
        v-model:value="searchData.name"
        class="default-input-select"
        placeholder="搜索商品名称"
        allow-clear
      />
      <SelectProductCategory v-model="searchData.category_id" class="default-input-select" />
      <a-button type="primary" @click="handleSearch"> 搜索 </a-button>
      <a-button type="primary" @click="handleCreateProduct"> 新增商品 </a-button>
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
            <a-tag :color="record.status === ProductStatus.ON_SALE ? 'green' : 'red'">
              {{ ProductStatusMap[record.status as ProductStatus] }}
            </a-tag>
          </template>
          <template v-if="column.key === 'operation'">
            <a-button type="link" @click="handleEditProduct(record)">编辑</a-button>
            <a-popconfirm
              :title="`确定要删除【${record.name}】吗？`"
              ok-text="是"
              cancel-text="否"
              @confirm="handleDeleteProduct(record)"
            >
              <!-- ok-text="Yes"
              cancel-text="No" -->
              <a-button type="link">删除</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </div>
  </div>

  <!-- 编辑商品弹窗 -->
  <CreateOrUpdateProduct
    v-if="createOrUpdateData.visible"
    v-model="createOrUpdateData.visible"
    :product-id="createOrUpdateData.productId"
    @success="fetchCategoryList"
  />
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { deleteProductAPI, getProductListAPI } from '@/api/module/backend/product'
import { ProductStatus, ProductStatusMap, type ProductItem } from '@/api/types/backend/product'
import SelectProductCategory from './components/SelectProductCategory.vue'
import CreateOrUpdateProduct from './components/CreateOrUpdateProduct.vue'
import { message } from 'ant-design-vue'

const loading = ref(false)

const searchData = reactive({
  page_no: 1,
  page_size: 10,
  name: '',
  category_id: undefined,
  product_no: undefined,
})

const tableDataList = reactive<{
  list: ProductItem[]
  total: number
}>({
  list: [],
  total: 0,
})

const columns = [
  {
    title: '商品编码',
    dataIndex: 'product_no',
    key: 'product_no',
  },
  {
    title: '商品名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '商品分类',
    dataIndex: 'category_name',
    key: 'category_name',
  },
  {
    title: '标准价格',
    dataIndex: 'standard_price',
    key: 'standard_price',
  },
  {
    title: '成本价',
    dataIndex: 'cost_price',
    key: 'cost_price',
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
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
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
      name: searchData.name,
      category_id: searchData.category_id,
      product_no: searchData.product_no,
    }
    const res = await getProductListAPI(params)
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

const createOrUpdateData = reactive({
  visible: false,
  productId: '' as unknown as number,
})

// 新增商品
const handleCreateProduct = () => {
  createOrUpdateData.visible = true
  createOrUpdateData.productId = '' as unknown as number
}

// 编辑商品
const handleEditProduct = (product: ProductItem) => {
  createOrUpdateData.visible = true
  createOrUpdateData.productId = product.id
}

// 删除商品
const handleDeleteProduct = async (product: ProductItem) => {
  await deleteProductAPI({ id: product.id })
  message.success('删除成功')
  fetchCategoryList()
}

// 获取分类列表
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
