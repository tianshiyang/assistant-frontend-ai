import { request } from '@/utils/request'

export const getUserInfoAPI = () => {
  return request({
    url: '/api/account/get_user_info',
    method: 'GET',
  })
}
