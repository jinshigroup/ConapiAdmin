import request from './request'
import type { ContentSchema } from '@/types/api'

export const schemaApi = {
  // 创建内容模型
  create(data: Partial<ContentSchema>): Promise<ContentSchema> {
    return request.post('/admin/schema', data)
  },
  
  // 获取内容模型列表
  getList(params?: { page?: number; size?: number; search?: string }): Promise<any> {
    return request.get('/admin/schema', { params })
  },
  
  // 获取内容模型详情
  getDetail(id: number): Promise<ContentSchema> {
    return request.get(`/admin/schema/${id}`)
  },
  
  // 更新内容模型
  update(id: number, data: Partial<ContentSchema>): Promise<ContentSchema> {
    return request.put(`/admin/schema/${id}`, data)
  },
  
  // 删除内容模型
  delete(id: number): Promise<void> {
    return request.delete(`/admin/schema/${id}`)
  },
  
  // 激活内容模型
  activate(id: number): Promise<ContentSchema> {
    return request.put(`/admin/schema/${id}/activate`)
  },
  
  // 停用内容模型
  deactivate(id: number): Promise<ContentSchema> {
    return request.put(`/admin/schema/${id}/deactivate`)
  }
}