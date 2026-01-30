export enum Skill {
  DATASET_RETRIEVER = 'dataset_retriever',
  TEXT_TO_SQL = 'text_to_sql',
}

export const SKILL_LABEL = {
  [Skill.DATASET_RETRIEVER]: '知识库检索',
  [Skill.TEXT_TO_SQL]: '文本转SQL',
} as const

export interface SkillItem {
  label: typeof SKILL_LABEL
  value: (typeof Skill)[keyof typeof Skill]
}

/** 聊天流式响应类型 */
export enum ChatResponseType {
  PING = 'ping',
  DONE = 'done',
  ERROR = 'error',
  TOOL = 'tool',
  TOOL_RESULT = 'tool_result',
  SAVE_TOKEN = 'save_token',
  GENERATE = 'generate',
  CREATE_CONVERSATION = 'create_conversation',
}

export const CHAT_RESPONSE_TYPE_LABEL: Record<ChatResponseType, string> = {
  [ChatResponseType.PING]: '保持连通',
  [ChatResponseType.DONE]: '任务已完成',
  [ChatResponseType.ERROR]: '任务已失败',
  [ChatResponseType.TOOL]: '正在调用工具',
  [ChatResponseType.TOOL_RESULT]: '工具返回结果',
  [ChatResponseType.SAVE_TOKEN]: '正在保存Token',
  [ChatResponseType.GENERATE]: '正在生成内容',
  [ChatResponseType.CREATE_CONVERSATION]: '正在生成会话',
}
