import request from './request'

export const assetApi = {
  // 获取签名图片 URL
  getSignedImageUrl(filePath: string): Promise<Blob> {
    return request.get(`/api/oss/${filePath}`, {
      responseType: 'blob'
    })
  }
}