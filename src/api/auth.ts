import request from './request'
import type { LoginRequest, LoginResponse, User, ApiResponse } from '@/types/api'

export const authApi = {
  // 用户登录
  login(data: LoginRequest): Promise<LoginResponse> {
    return request.post('/admin/auth/login', data)
  },
  
  // 用户注册
  register(data: any): Promise<ApiResponse> {
    return request.post('/admin/auth/register', data)
  },
  
  // 获取当前用户信息
  getCurrentUser(): Promise<User> {
    return request.get('/admin/auth/me')
  },
  
  // 退出登录
  logout(): Promise<ApiResponse> {
    return request.post('/admin/auth/logout')
  },
  
  // 修改密码
  changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return request.put('/admin/auth/change-password', {
      currentPassword,
      newPassword
    })
  }
}