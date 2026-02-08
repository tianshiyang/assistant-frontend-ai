export enum Skill {
  DATASET_RETRIEVER = 'dataset_retriever',
  WEB_SEARCH = 'web_search',
  // TEXT_TO_SQL = 'text_to_sql',
}

export const SKILL_LABEL = {
  [Skill.DATASET_RETRIEVER]: '知识库检索',
  // [Skill.TEXT_TO_SQL]: '文本转SQL',
  [Skill.WEB_SEARCH]: '联网搜索',
} as const

export interface SkillItem {
  label: (typeof SKILL_LABEL)[keyof typeof SKILL_LABEL]
  value: (typeof Skill)[keyof typeof Skill]
  icon: string
}

/** 聊天流式响应类型 */
export enum ChatResponseType {
  PING = 'ping',
  GET_TOOLS = 'get_tools',
  STOP = 'stop',
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
  [ChatResponseType.GET_TOOLS]: '正在获取所有可用工具',
  [ChatResponseType.DONE]: '任务已完成',
  [ChatResponseType.ERROR]: '任务已失败',
  [ChatResponseType.TOOL]: '正在调用工具',
  [ChatResponseType.TOOL_RESULT]: '工具返回结果',
  [ChatResponseType.SAVE_TOKEN]: '正在保存Token',
  [ChatResponseType.GENERATE]: '正在生成内容',
  [ChatResponseType.CREATE_CONVERSATION]: '正在生成会话',
  [ChatResponseType.STOP]: '任务已停止',
}
