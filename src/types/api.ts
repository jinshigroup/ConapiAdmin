// 通用响应类型
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

// 分页类型
export interface Pagination {
  page: number
  size: number
  total: number
  totalPages: number
}

export interface PageResult<T> {
  content: T[]
  // pagination: Pagination  // 移除嵌套的 pagination 对象
  // 直接包含分页属性
  page?: number
  size?: number
  totalElements?: number
  totalPages?: number
  first?: boolean
  last?: boolean
  numberOfElements?: number
}

// 或者创建一个新的类型来匹配实际的API响应结构
export interface ApiPageResult<T> {
  content: T[]
  pageable: {
    sort: { empty: boolean; unsorted: boolean; sorted: boolean }
    offset: number
    pageSize: number
    pageNumber: number
    unpaged: boolean
    paged: boolean
  }
  totalElements: number
  totalPages: number
  last: boolean
  size: number
  number: number
  sort: { empty: boolean; unsorted: boolean; sorted: boolean }
  numberOfElements: number
  first: boolean
  empty: boolean
}

// 用户相关类型
export interface User {
  id: number
  email: string
  name: string
  role: string
  active: boolean
  emailVerified: boolean
  tenantId: number
  lastLoginAt?: string
  loginCount: number
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
  expiresIn: number
}

export interface CreateTenantRequest {
  name: string
  subdomain: string
  planType?: string
  adminEmail: string
  adminPassword: string
  adminName?: string
}

// 内容模型相关类型
export interface FieldDefinition {
  name: string
  displayName: string
  type: string
  required?: boolean
  description?: string
  defaultValue?: any
  validations?: Record<string, any>
}

export interface ContentSchema {
  id: string
  tenantId: number
  name: string
  displayName: string
  description?: string
  definition: FieldDefinition[]
  settings: Record<string, any>
  status: 'active' | 'inactive' | 'archived'
  isSystem: boolean
  createdBy?: number
  createdAt: string
  updatedAt: string
}

// 内容条目相关类型
export interface Entry {
  id: number
  tenantId: number
  schemaId: string
  status: string
  version: number
  contentData: Record<string, any>
  contentHash: string
  publishedAt?: string
  scheduledAt?: string
  slug?: string
  createdBy: number
  updatedBy?: number
  createdAt: string
  updatedAt: string
}

export interface CreateEntryRequest {
  schemaId: string
  status?: string
  contentData: Record<string, any>
  scheduledAt?: string
  versionComment?: string
}

// 文件资源相关类型
export interface Asset {
  id: number
  tenantId: number
  filename: string
  filePath: string // 用于存储OSS路径
  fileSize: number
  mimeType: string
  metadata: Record<string, any>
  altText?: string
  caption?: string
  uploadBy: number
  createdAt: string
  updatedAt: string
}

export interface AssetDTO extends Asset {
  downloadUrl: string
  previewUrl?: string
  imageDimensions?: string
}