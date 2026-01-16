// 获取token
export const getToken: () => string | null = () => {
  return localStorage.getItem('token')
}

// 设置token
export const setToken: (data: string) => void = (data: string) => {
  return localStorage.setItem('token', data || '')
}
