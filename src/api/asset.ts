import request from './request'
import type { AssetDTO, ApiPageResult } from '@/types/api'

export const assetApi = {
  // 上传文件
  upload(file: File): Promise<AssetDTO> {
    const formData = new FormData()
    formData.append('file', file)
    
    return request.post('/admin/asset/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 获取资源列表
  getList(params?: {
    page?: number
    size?: number
    sort?: string
    direction?: string
  }): Promise<ApiPageResult<AssetDTO>> {
    return request.get('/admin/asset', { params })
  },
  
  // 获取资源详情
  getDetail(id: number): Promise<AssetDTO> {
    return request.get(`/admin/asset/${id}`)
  },
  
  // 更新资源信息
  update(id: number, data: { altText?: string; caption?: string }): Promise<AssetDTO> {
    return request.put(`/admin/asset/${id}`, data)
  },
  
  // 删除资源
  delete(id: number): Promise<void> {
    return request.delete(`/admin/asset/${id}`)
  },
  
  // 搜索资源
  search(keyword: string): Promise<AssetDTO[]> {
    return request.get('/admin/asset/search', { params: { keyword } })
  }
}