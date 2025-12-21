import request from './request'
import type { ContentSchema } from '../types/api.ts'

export const schemaApi = {
  // 创建内容模型
  create(data: Partial<ContentSchema>): Promise<ContentSchema> {
    return request.post('/rest/v1/schema', data)
  },
  
  // 获取内容模型列表
  getList(params?: { page?: number; size?: number; search?: string }): Promise<any> {
    return request.get('/rest/v1/schema', { params })
  },
  
  // 获取内容模型详情
  getDetail(id: number): Promise<ContentSchema> {
    return request.get(`/rest/v1/schema/${id}`)
  },
  
  // 更新内容模型
  update(id: number, data: Partial<ContentSchema>): Promise<ContentSchema> {
    return request.put(`/rest/v1/schema/${id}`, data)
  },
  
  // 删除内容模型
  delete(id: number): Promise<void> {
    return request.delete(`/rest/v1/schema/${id}`)
  },
  
  // 激活内容模型
  activate(id: number): Promise<ContentSchema> {
    return request.put(`/rest/v1/schema/${id}/activate`)
  },
  
  // 停用内容模型
  deactivate(id: number): Promise<ContentSchema> {
    return request.put(`/rest/v1/schema/${id}/deactivate`)
  }
}