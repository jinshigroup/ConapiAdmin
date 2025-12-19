import request from './request'
import type { Entry, CreateEntryRequest } from '@/types/api'

export const contentApi = {
  // 创建内容条目
  create(data: CreateEntryRequest): Promise<Entry> {
    return request.post('/rest/v1/entry', data)
  },
  
  // 获取内容条目列表
  getList(params?: {
    schemaId?: number
    status?: string
    search?: string
    page?: number
    size?: number
    sort?: string
    direction?: string
  }): Promise<any> {
    return request.get('/rest/v1/entry', { params })
  },
  
  // 获取内容条目详情
  getDetail(id: number): Promise<Entry> {
    return request.get(`/rest/v1/entry/${id}`)
  },
  
  // 更新内容条目
  update(id: number, data: CreateEntryRequest): Promise<Entry> {
    return request.put(`/rest/v1/entry/${id}`, data)
  },
  
  // 删除内容条目
  delete(id: number): Promise<void> {
    return request.delete(`/rest/v1/entry/${id}`)
  },
  
  // 发布内容条目
  publish(id: number): Promise<Entry> {
    return request.put(`/rest/v1/entry/${id}/publish`)
  },
  
  // 取消发布内容条目
  unpublish(id: number): Promise<Entry> {
    return request.put(`/rest/v1/entry/${id}/unpublish`)
  },
  
  // 获取版本历史
  getVersions(id: number): Promise<any[]> {
    return request.get(`/rest/v1/entry/${id}/versions`)
  },
  
  // 回滚到指定版本
  revertToVersion(id: number, version: number): Promise<Entry> {
    return request.put(`/rest/v1/entry/${id}/revert/${version}`)
  }
}