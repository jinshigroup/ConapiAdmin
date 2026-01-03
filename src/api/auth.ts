import request from './request'
import type { LoginRequest, LoginResponse, User, ApiResponse } from '../types/api.ts'

export const authApi = {
  // 用户登录
  login(data: LoginRequest): Promise<LoginResponse> {
    return request.post('/auth/login', data)
  },
  
  // 获取当前用户信息
  getCurrentUser(): Promise<User> {
    return request.get('/auth/me')
  },
  
  // 退出登录
  logout(): Promise<ApiResponse> {
    return request.post('/auth/logout')
  },
  
  // 修改密码
  changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return request.put('/auth/changePassword', {
      currentPassword,
      newPassword
    })
  }
}