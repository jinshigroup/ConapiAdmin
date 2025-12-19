import request from './request'
import type { User, ApiPageResult } from '@/types/api'

// 创建用户请求类型
export interface CreateUserRequest {
    email: string
    password: string
    name: string
    role?: string
}

// 更新用户请求类型
export interface UpdateUserRequest {
    email: string
    name: string
    role?: string
}

export const userApi = {
    // 创建用户
    create(data: CreateUserRequest): Promise<User> {
        return request.post('/rest/v1/user', data)
    },

    // 获取用户详情
    get(id: number): Promise<User> {
        return request.get(`/rest/v1/user/${id}`)
    },

    // 获取所有用户
    getList(): Promise<User[]> {
        return request.get('/rest/v1/user')
    },

    // 分页获取用户列表
    getPage(page: number, size: number): Promise<ApiPageResult<User>> {
        return request.get('/rest/v1/user/page', {
            params: { page, size }
        })
    },

    // 搜索用户
    search(keyword: string, page: number, size: number): Promise<ApiPageResult<User>> {
        return request.get('/rest/v1/user/search', {
            params: { keyword, page, size }
        })
    },

    // 更新用户
    update(id: number, data: UpdateUserRequest): Promise<User> {
        return request.put(`/rest/v1/user/${id}`, data)
    },

    // 删除用户
    delete(id: number): Promise<void> {
        return request.delete(`/rest/v1/user/${id}`)
    },

    // 重置用户密码
    resetPassword(id: number, newPassword: string): Promise<void> {
        return request.put(`/rest/v1/user/${id}/reset-password`, { newPassword })
    }
}