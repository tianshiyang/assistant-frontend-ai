import { request } from '@/utils/request'
import type { BaseListResponse } from '../types'
import type { DocumentItem, DocumentListParams } from '../types/document'

// 获取知识库文档列表
export const getDocumentListAPI = (params: DocumentListParams) => {
  return request<BaseListResponse<DocumentItem>>({
    url: '/api/document/list',
    method: 'get',
    params,
  })
}

// 删除知识库文档
export const deleteDocumentAPI = (data: { document_id: string }) => {
  return request({
    url: `/api/document/delete`,
    method: 'post',
    data,
  })
}

// 上传知识库文档
export const uploadDocumentAPI = (data: { oss_url: string; dataset_id: string }) => {
  return request({
    url: `/api/document/upload`,
    method: 'post',
    data,
  })
}
