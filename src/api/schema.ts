import request from './request'
import type { ContentSchema } from '../types/api.ts'

export const schemaApi = {
  // 创建内容模型
  create(data: Partial<ContentSchema>): Promise<ContentSchema> {
    return request.post('/schema', data)
  },
  
  // 获取内容模型列表
  getList(params?: { page?: number; size?: number; search?: string }): Promise<any> {
    return request.get('/schema', { params })
  },
  
  // 获取内容模型详情
  getDetail(id: string): Promise<ContentSchema> {
    return request.get(`/schema/${id}`)
  },
  
  // 更新内容模型
  update(id: string, data: Partial<ContentSchema>): Promise<ContentSchema> {
    return request.put(`/schema/${id}`, data)
  },
  
  // 删除内容模型
  delete(id: string): Promise<void> {
    return request.delete(`/schema/${id}`)
  },
}