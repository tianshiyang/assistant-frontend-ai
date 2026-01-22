export enum DocumentStatus {
  PARSING = 'parsing',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export const DocumentStatusMap = {
  [DocumentStatus.PARSING]: '解析中',
  [DocumentStatus.COMPLETED]: '已完成',
  [DocumentStatus.ERROR]: '失败',
} as const

export interface DocumentItem {
  id: string
  name: string
  oss_url: string
  created_at: string
  character_count: number
  token_count: number
  status: DocumentStatus
}

export interface DocumentListParams {
  dataset_id: string
  name?: string
  page_no: number
  page_size: number
}
