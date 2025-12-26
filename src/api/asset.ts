import request from './request'
import type { AssetDTO, ApiPageResult } from '../types/api.ts'

export const assetApi = {
  // 上传文件
  upload(file: File): Promise<AssetDTO> {
    const formData = new FormData()
    formData.append('file', file)
    
    return request.post('/rest/v1/asset/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  // 创建资源记录（用于OSS上传后创建数据库记录）
  create(data: { previewUrl: string; filename: string; fileSize: number; mimeType: string }) {
    return request.post('/rest/v1/asset/create', data)
  },
  
  // 获取资源列表
  getList(params?: {
    page?: number
    size?: number
    sort?: string
    direction?: string
  }): Promise<ApiPageResult<AssetDTO>> {
    return request.get('/rest/v1/asset', { params })
  },
  
  // 获取资源详情
  getDetail(id: number): Promise<AssetDTO> {
    return request.get(`/rest/v1/asset/${id}`)
  },
  
  // 更新资源信息
  update(id: number, data: { altText?: string; caption?: string }): Promise<AssetDTO> {
    return request.put(`/rest/v1/asset/${id}`, data)
  },
  
  // 删除资源
  delete(id: number): Promise<void> {
    return request.delete(`/rest/v1/asset/${id}`)
  },
  
  // 搜索资源
  search(keyword: string): Promise<AssetDTO[]> {
    return request.get('/rest/v1/asset/search', { params: { keyword } })
  },

  // 获取签名图片 URL
  getSignedImageUrl(filePath: string): Promise<Blob> {
    return request.get(`/oss/${filePath}`, {
      responseType: 'blob'
    })
  }
}