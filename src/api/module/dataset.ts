import { request } from '@/utils/request'
import type { BaseListResponse } from '../types'
import type {
  CreateDatasetParams,
  DatasetItem,
  BaseListParams,
  DeleteDatasetParams,
  GetDatasetDetailParams,
  UpdateDatasetParams,
} from '../types/dataset'

// 获取知识库列表
export const getDatasetListAPI = (params: BaseListParams) => {
  return request<BaseListResponse<DatasetItem>>({
    url: '/api/dataset/list',
    method: 'get',
    params,
  })
}

// 创建知识库
export const createDatasetAPI = (data: CreateDatasetParams) => {
  return request<DatasetItem>({
    url: '/api/dataset/create',
    method: 'post',
    data,
  })
}

// 删除知识库
export const deleteDatasetAPI = (data: DeleteDatasetParams) => {
  return request({
    url: `/api/dataset/delete`,
    method: 'post',
    data,
  })
}

// 获取知识库详情
export const getDatasetDetailAPI = (params: GetDatasetDetailParams) => {
  return request<DatasetItem>({
    url: `/api/dataset/detail`,
    method: 'get',
    params,
  })
}

// 编辑知识库
export const updateDatasetAPI = (data: UpdateDatasetParams) => {
  return request<DatasetItem>({
    url: `/api/dataset/update`,
    method: 'post',
    data,
  })
}
