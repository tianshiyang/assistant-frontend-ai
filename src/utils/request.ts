import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { getToken } from './storage'
import { message } from 'ant-design-vue'

enum ResponseCode {
  SUCCESS = 'success', // 成功
  ERROR = 'error', // 普通的失败
  UNAUTHORIZED = 'unauthorized', // 未授权
  VALIDATE_ERROR = 'validate_error', // 参数验证错误
}

const api = axios.create({
  // 默认地址请求地址，可在 .env.** 文件中修改
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    return config
  },
  error => {
    // 请求失败
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    if (response.data.code === ResponseCode.SUCCESS) {
      // 正常返回：处理成功的处理
      return Promise.resolve(response)
    } else {
      // 正常返回：处理失败的处理
      return Promise.reject(response)
    }
  },
  error => {
    return Promise.reject(error.response)
  }
)

interface Response<T = unknown> {
  data: T
  code: ResponseCode
  message: string
}

export function request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  return new Promise((resolve, reject) => {
    api({ ...config, headers: { Authorization: `Bearer ${getToken()}` } })
      .then((res: AxiosResponse<Response<T>>) => {
        const result = res.data
        return resolve(result.data)
      })
      .catch((error: AxiosResponse<Response<T>>) => {
        console.log(error)
        switch (error.status) {
          case 200:
            switch (error.data.code) {
              case ResponseCode.ERROR:
                message.error(error.data.message)
                return reject(error.data.message)
              case ResponseCode.VALIDATE_ERROR:
                message.error(error.data.message)
                return reject(error.data.message)
              case ResponseCode.UNAUTHORIZED:
                location.href = '/login'
                message.error(error.data.message)
                return reject('登录失效，请重新登录')
            }
            break
          case 400:
            // 是否需要自定义catch
            message.error(error.data.message)
            break
          case 401:
            message.error('登录失效，请重新登录')
            break
          case 403:
            message.error('登录失效，请重新登录')
            break
          case 404:
            // 是否需要自定义catch
            message.error('服务器错误，请稍后重试')
            break
          default:
            break
        }
        return reject(error.data)
      })
  })
}
