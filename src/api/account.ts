import { request } from '@/utils/request'

// 获取用户信息
export const getUserInfoAPI = () => {
  return request({
    url: '/api/account/get_user_info',
    method: 'GET',
  })
}

// 用户登录
export const userLoginAPI = (data: { username: string; password: string }) => {
  return request<{ token: string }>({
    url: '/api/account/login',
    method: 'POST',
    data,
  })
}
