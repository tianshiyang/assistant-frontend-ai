<template>
  <div class="container">
    <!-- 标题 -->
    <div class="container-header">
      <div class="container-header-icon"></div>
      <h1 class="container-title">订单列表</h1>
    </div>

    <!-- 操作栏 -->
    <div class="container-actions">
      <a-input
        v-model:value="searchData.order_no"
        class="default-input-select"
        placeholder="搜索订单编号"
        allow-clear
      />
      <a-select
        v-model:value="searchData.order_status"
        class="default-input-select"
        placeholder="订单状态"
        allow-clear
        style="width: 120px"
      >
        <a-select-option v-for="(label, val) in OrderStatusMap" :key="val" :value="val">
          {{ label }}
        </a-select-option>
      </a-select>
      <a-button type="primary" @click="handleSearch"> 搜索 </a-button>
    </div>

    <!-- 订单列表 -->
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
          <template v-if="column.key === 'order_status'">
            <a-tag :color="getOrderStatusColor(record.order_status)">
              {{ getOrderStatusLabel(record.order_status) }}
            </a-tag>
          </template>
        </template>

        <template #expandedRowRender="{ record }">
          <a-table
            :columns="orderItemsColumns"
            :data-source="record.order_item"
            :pagination="false"
            row-key="id"
            size="small"
          />
        </template>
      </a-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { OrderStatus as OrderStatusType } from '@/api/types/backend/order'
import { OrderStatusMap, type Order } from '@/api/types/backend/order'
import { getOrderListAPI } from '@/api/module/backend/order'

const loading = ref(false)

const searchData = reactive({
  page_no: 1,
  page_size: 10,
  order_no: '',
  order_status: undefined as OrderStatusType | undefined,
})

const tableDataList = reactive<{
  list: Order[]
  total: number
}>({
  list: [],
  total: 0,
})

// 主表：订单列表
const columns = [
  {
    title: '订单编号',
    dataIndex: 'order_no',
    key: 'order_no',
  },
  {
    title: '订单日期',
    dataIndex: 'order_date',
    key: 'order_date',
  },
  {
    title: '销售',
    dataIndex: 'sales_name',
    key: 'sales_name',
  },
  {
    title: '订单状态',
    dataIndex: 'order_status',
    key: 'order_status',
  },
  {
    title: '订单金额',
    dataIndex: 'total_amount',
    key: 'total_amount',
  },
  {
    title: '已付金额',
    dataIndex: 'paid_amount',
    key: 'paid_amount',
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

// 展开行：订单明细
const orderItemsColumns = [
  {
    title: '商品名称',
    dataIndex: 'product_name',
    key: 'product_name',
    width: 100,
  },
  {
    title: '数量',
    dataIndex: 'quantity',
    key: 'quantity',
    width: 80,
  },
  {
    title: '单价',
    dataIndex: 'unit_price',
    key: 'unit_price',
  },
  {
    title: '小计',
    dataIndex: 'total_price',
    key: 'total_price',
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

const getOrderStatusColor = (status: OrderStatusType): string => {
  const colorMap: Record<string, string> = {
    pending: 'orange',
    paid: 'blue',
    completed: 'green',
    cancelled: 'red',
    created: 'default',
  }
  return colorMap[String(status)] ?? 'default'
}

const getOrderStatusLabel = (status: OrderStatusType): string => {
  return OrderStatusMap[status as keyof typeof OrderStatusMap] ?? String(status)
}

// 搜索
const handleSearch = () => {
  searchData.page_no = 1
  fetchOrderList()
}

// 获取订单列表
const fetchOrderList = async () => {
  loading.value = true
  try {
    const res = await getOrderListAPI()
    tableDataList.list = res.list || []
    tableDataList.total = res.total || 0
  } finally {
    loading.value = false
  }
}

// 表格分页变更
const handleTableChange = (pagination: { current?: number; pageSize?: number }) => {
  if (pagination.current) {
    searchData.page_no = pagination.current
  }
  if (pagination.pageSize) {
    searchData.page_size = pagination.pageSize
  }
  fetchOrderList()
}

fetchOrderList()
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

  .table-list {
    background: #fff;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  }
}
</style>
