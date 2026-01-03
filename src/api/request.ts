import axios from 'axios'
import type { ApiResponse } from '../types/api.ts'
import { useUserStore } from '../stores/user.ts'

const request = axios.create({
  baseURL:(import.meta.env.VITE_API_BASE_URL || ''),
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const token = userStore.token
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { data } = response
    
    if (data && typeof data === 'object' && 'success' in data) {
      const apiResponse = data as ApiResponse
      
      if (!apiResponse.success) {
        // 不再在这里显示错误消息，由调用方处理
        return Promise.reject(new Error(apiResponse.message))
      }
      
      return apiResponse.data
    }
    
    return data
  },
  (error) => {
    const { status} = error.response || {}
    
    if (status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      // 不再在这里显示错误消息，由调用方处理
      window.location.href = '/login'
    } else if (status === 403) {
      // 不再在这里显示错误消息，由调用方处理
    } else if (status === 500) {
      // 不再在这里显示错误消息，由调用方处理
    } else {
      // 不再在这里显示错误消息，由调用方处理
    }
    
    return Promise.reject(error)
  }
)

export default request