// 知识库列表返回值
export interface DatasetItem {
  id: string
  name: string
  description: string
  icon: string
  created_at: string
  updated_at: string
}

// 创建知识库接口
export interface CreateDatasetParams {
  name: string
  description: string
  icon: string
}

// 获取知识库列表请求参数
export interface BaseListParams {
  name?: string
  page_no: number
  page_size: number
}

// 删除知识库请求参数
export interface DeleteDatasetParams {
  dataset_id: string
}

// 获取知识库详情请求参数
export interface GetDatasetDetailParams {
  dataset_id: string
}

// 更新知识库请求参数
export interface UpdateDatasetParams {
  dataset_id: string
  name: string
  description: string
  icon: string
}
