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
