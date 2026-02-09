// 获取token
export const getToken: () => string | null = () => {
  return localStorage.getItem('token')
}

// 设置token
export const setToken: (data: string) => void = (data: string) => {
  return localStorage.setItem('token', data || '')
}

// 删除token
export const removeToken: () => void = () => {
  return localStorage.removeItem('token')
}
