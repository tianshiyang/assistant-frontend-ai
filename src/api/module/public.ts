import { request } from '@/utils/request'
import type { SkillItem } from '../types/public'

/** 获取所有技能列表 */
export const getSkillsDictAPI = () => {
  return request<SkillItem[]>({
    url: '/api/public/get_skills_dict',
    method: 'get',
  })
}
