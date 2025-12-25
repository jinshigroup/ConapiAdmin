<!-- src/views/Asset.vue -->
<template>
  <div class="media-page">
    <div class="page-header">
      <h1 class="page-title">{{ t('media.title') }}</h1>
      <div class="page-actions">
        <el-button type="primary" icon="Upload" @click="handleUpload">
          {{ t('media.upload') }}
        </el-button>
      </div>
    </div>

    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <form @submit.prevent="() => false">
              <el-input
                v-model="searchKeyword"
                :placeholder="t('media.searchPlaceholder')"
                clearable
                style="width: 200px; margin-right: 10px"
                @clear="handleSearch"
                @keyup.enter="handleSearch"
              >
                <template #append>
                  <el-button icon="Search" @click.prevent="handleSearch" />
                </template>
              </el-input>
            </form>
          </div>
          <div class="header-right">
            <el-button text icon="Refresh" @click="fetchAssets">
              {{ t('common.refresh') }}
            </el-button>
          </div>
        </div>
      </template>

      <div v-loading="loading" class="media-content">
        <el-row :gutter="20">
          <el-col
            v-for="asset in assets"
            :key="asset.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            :xl="4"
            class="asset-item-col"
          >
            <el-card
              class="asset-card"
              :class="{ selected: selectedAssets.includes(asset.id) }"
              @click="toggleSelectAsset(asset.id)"
            >
              <div class="asset-preview">
                <div v-if="isVideo(asset)" class="video-preview">
                  <div class="video-wrapper" @click.stop="playVideo(asset.previewUrl)">
                    <div class="no-preview">
                      <el-icon :size="40"><VideoPlay /></el-icon>
                      <div>点击播放视频</div>
                    </div>
                    <div class="video-overlay">
                      <el-icon class="play-icon"><VideoPlay /></el-icon>
                    </div>
                  </div>
                </div>
                <el-image
                  v-else
                  :src="asset.previewUrl ? imageUrls[asset.previewUrl] : ''"
                  :alt="asset.altText || asset.filename"
                  fit="cover"
                  class="asset-image"
                  :preview-src-list="[asset.previewUrl ? imageUrls[asset.previewUrl] : '']"
                  :preview-teleported="true"
                  hide-on-click-modal
                >
                  <template #error>
                    <div class="image-slot">
                      <el-icon v-if="isImage(asset)" :size="40"><Picture /></el-icon>
                      <el-icon v-else :size="40"><Document /></el-icon>
                      <div v-if="asset.previewUrl">图片加载失败</div>
                    </div>
                  </template>
                </el-image>
              </div>
              <div class="asset-info">
                <div class="asset-name" :title="asset.filename">
                  {{ asset.filename }}
                </div>
                <div class="asset-meta">
                  <span class="file-size">{{ formatFileSize(asset.fileSize) }}</span>
                  <span v-if="asset.imageDimensions" class="dimensions">{{ asset.imageDimensions }}</span>
                </div>
                <div class="asset-date">
                  {{ formatDate(asset.createdAt) }}
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <div v-if="assets.length === 0 && !loading" class="no-assets">
          <el-empty :description="t('media.noAssets')" />
        </div>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            background
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 批量操作栏 -->
    <div v-if="selectedAssets.length > 0" class="batch-actions">
      <el-button type="danger" icon="Delete" @click="handleBatchDelete">
        {{ t('media.deleteSelected') }} ({{ selectedAssets.length }})
      </el-button>
      <el-button @click="clearSelection">
        {{ t('media.clearSelection') }}
      </el-button>
    </div>

    <!-- 上传对话框 - 使用OSS上传组件 -->
    <el-dialog
      v-model="uploadDialogVisible"
      :title="t('media.upload')"
      width="600px"
      @close="handleUploadDialogClose"
    >
      <OssUploadComponent
        ref="ossUploadRef"
        @upload-success="handleUploadSuccess"
        @upload-progress="handleUploadProgress"
        @upload-error="handleUploadError"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">{{ t('common.cancel') }}</el-button>
          <el-button
            type="primary"
            :loading="uploading"
            @click="submitOssUpload"
          >
            {{ t('common.confirm') }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 资源详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="t('media.assetDetail')"
      width="600px"
    >
      <el-form
        v-if="currentAsset"
        :model="detailForm"
        label-width="100px"
      >
        <el-form-item :label="t('media.preview')">
          <el-image
              :src="currentAsset.previewUrl ? imageUrls[currentAsset.previewUrl] : ''"
              :alt="currentAsset.altText || currentAsset.filename"
              fit="cover"
              class="detail-image"
              :preview-src-list="[currentAsset.previewUrl ? imageUrls[currentAsset.previewUrl] : '']"
              :preview-teleported="true"
              hide-on-click-modal
          />
        </el-form-item>
        <el-form-item :label="t('media.filename')">
          <el-input v-model="currentAsset.filename" readonly />
        </el-form-item>
        <el-form-item :label="t('media.fileSize')">
          <el-input :value="formatFileSize(currentAsset.fileSize)" readonly />
        </el-form-item>
        <el-form-item v-if="currentAsset.imageDimensions" :label="t('media.dimensions')">
          <el-input :value="currentAsset.imageDimensions" readonly />
        </el-form-item>
        <el-form-item :label="t('media.mimeType')">
          <el-input v-model="currentAsset.mimeType" readonly />
        </el-form-item>
        <el-form-item :label="t('media.uploadTime')">
          <el-input :value="formatDate(currentAsset.createdAt)" readonly />
        </el-form-item>
        <el-form-item :label="t('media.altText')">
          <el-input
            v-model="detailForm.altText"
            type="textarea"
            :rows="2"
            :placeholder="t('media.altTextPlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="t('media.caption')">
          <el-input
            v-model="detailForm.caption"
            type="textarea"
            :rows="3"
            :placeholder="t('media.captionPlaceholder')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="updateAssetDetail">{{ t('common.save') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox} from 'element-plus'
import { useI18n } from 'vue-i18n'
import { assetApi } from '../api/asset.ts'
import type { AssetDTO } from '../types/api.ts'
import { formatDate } from '../utils/date.ts'
import { useUserStore } from '../stores/user.ts'
import { VideoPlay, Picture, Document } from '@element-plus/icons-vue'
import OssUploadComponent from '../components/OssUpload.vue' // 引入OSS上传组件

const { t } = useI18n()

// 数据状态
const loading = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0) // 添加上传进度
const assets = ref<AssetDTO[]>([])
const uploadDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const selectedAssets = ref<number[]>([])
const currentAsset = ref<AssetDTO | null>(null)

// 存储已获取的图片URL
const imageUrls = ref<Record<string, string>>({})

// 分页配置
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 搜索关键词
const searchKeyword = ref('')

// 详情表单
const detailForm = reactive({
  altText: '',
  caption: ''
})

// 上传成功的文件路径列表
const uploadedFilePaths = ref<string[]>([])

// 判断是否为图片
const isImage = (asset: AssetDTO) => {
  return asset.mimeType && asset.mimeType.startsWith('image/')
}

// 判断是否为视频
const isVideo = (asset: AssetDTO) => {
  return asset.mimeType && asset.mimeType.startsWith('video/')
}

// 获取带认证的图片URL - 修改为使用内网路径
const getAuthenticatedImageUrl = async (previewUrl: string) => {
  // 如果已经获取过该URL，直接返回
  if (imageUrls.value[previewUrl]) {
    console.log('使用缓存的图片URL:', previewUrl, '->', imageUrls.value[previewUrl]);
    return imageUrls.value[previewUrl]
  }

  if (!previewUrl) return ''

  try {
    console.log('开始获取图片:', previewUrl);

    // 使用内网下载路径
    const imageUrl = previewUrl.startsWith('/oss/') ?
        `${window.location.origin}${previewUrl}` :
        previewUrl;

    // 存储URL映射
    imageUrls.value[previewUrl] = imageUrl;
    console.log('图片URL处理完成:', previewUrl, '->', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('处理图片URL失败:', error);
    return '';
  }
}

// 获取带认证的视频URL
const getAuthenticatedVideoUrl = async (videoUrl: string) => {
  // 如果已经获取过该URL，直接返回
  if (imageUrls.value[videoUrl]) {
    console.log('使用缓存的视频URL:', videoUrl, '->', imageUrls.value[videoUrl]);
    return imageUrls.value[videoUrl];
  }

  if (!videoUrl) {return '';}

  try {
    console.log('开始获取视频:', videoUrl);

    // 使用 fetch API 获取图片数据
    const token = useUserStore().token;
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(videoUrl, { headers });

    console.log('视频响应数据:', response);


    const blob = await response.blob();
    console.log('图片响应数据:', blob);


    // 创建本地对象URL
    const videoUrlObj = URL.createObjectURL(blob);
    // 存储URL映射
    imageUrls.value[videoUrl] = videoUrlObj;
    console.log('视频获取成功:', videoUrl, '->', videoUrlObj);
    return videoUrlObj;
  } catch (error: any) {
    console.error('获取视频失败:', error);
    return '';
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取资源列表
const fetchAssets = async () => {
  try {
    loading.value = true
    const response = await assetApi.getList({
      page: pagination.page - 1,
      size: pagination.size
    })

    assets.value = response.content
    pagination.total = response.totalElements || 0

    console.log('获取到资源列表:', assets.value);

    // 预加载所有图片
    const imageAssets = assets.value.filter(asset => isImage(asset) && asset.previewUrl);
    console.log('需要预加载的图片资源:', imageAssets);

    // 预加载图片
    await Promise.all(imageAssets.map(async (asset) => {
      console.log('预加载图片:', asset.previewUrl);
      if (asset.previewUrl) {
        await getAuthenticatedImageUrl(asset.previewUrl)
      }
    }))

    console.log('所有资源预加载完成，当前imageUrls:', imageUrls.value);
  } catch (error) {
    console.error('获取资源列表失败:', error)
    ElMessage.error(t('media.fetchFailed'))
  } finally {
    loading.value = false
  }
}

// 更新资源详情
const updateAssetDetail = async () => {
  if (!currentAsset.value) return

  try {
    await assetApi.update(currentAsset.value.id, {
      altText: detailForm.altText,
      caption: detailForm.caption
    })

    ElMessage.success(t('media.updateSuccess'))
    detailDialogVisible.value = false
    fetchAssets()
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error(t('media.updateFailed'))
  }
}

// 处理上传
const handleUpload = () => {
  uploadDialogVisible.value = true
  uploadedFilePaths.value = [] // 重置上传文件列表
  uploadProgress.value = 0
}

// OSS上传成功回调
const handleUploadSuccess = (filePath: string) => {
  uploadedFilePaths.value.push(filePath)
  ElMessage.success(t('media.uploadSuccess'))
}

// OSS上传进度回调
const handleUploadProgress = (progress: number) => {
  uploadProgress.value = progress
}

// OSS上传错误回调
const handleUploadError = (error: Error) => {
  console.error('OSS上传失败:', error)
  ElMessage.error(t('media.uploadFailed'))
  uploading.value = false
}

// 提交OSS上传
const submitOssUpload = async () => {
  if (uploadedFilePaths.value.length === 0) {
    ElMessage.warning(t('media.noFilesSelected'))
    return
  }

  try {
    uploading.value = true

    // 调用后端API创建资源记录
    const createPromises = uploadedFilePaths.value.map(filePath => {
      return assetApi.create({
        previewUrl: filePath, // OSS路径
        filename: getFileNameFromPath(filePath),
        fileSize: 0, // 文件大小在OSS中获取
        mimeType: getMimeTypeFromPath(filePath)
      })
    })

    await Promise.all(createPromises)

    ElMessage.success(t('media.uploadSuccess'))
    uploadDialogVisible.value = false
    fetchAssets()
  } catch (error) {
    console.error('创建资源记录失败:', error)
    ElMessage.error(t('media.uploadFailed'))
  } finally {
    uploading.value = false
  }
}

// 从路径获取文件名
const getFileNameFromPath = (path: string): string => {
  return path.split('/').pop() || path
}

// 从路径获取MIME类型
const getMimeTypeFromPath = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase() || ''
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv'
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

// 处理上传对话框关闭
const handleUploadDialogClose = () => {
  uploadedFilePaths.value = []
  uploadProgress.value = 0
}

// 切换选择资源
const toggleSelectAsset = (assetId: number) => {
  const index = selectedAssets.value.indexOf(assetId)
  if (index > -1) {
    selectedAssets.value.splice(index, 1)
  } else {
    selectedAssets.value.push(assetId)
  }
}

// 清除选择
const clearSelection = () => {
  selectedAssets.value = []
}

// 处理批量删除
const handleBatchDelete = async () => {
  if (selectedAssets.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      t('media.deleteConfirmMulti', { count: selectedAssets.value.length }),
      t('common.confirm'),
      {
        type: 'warning'
      }
    )

    const deletePromises = selectedAssets.value.map(id => assetApi.delete(id))
    await Promise.all(deletePromises)

    ElMessage.success(t('media.deleteSuccess'))
    selectedAssets.value = []
    fetchAssets()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error(t('media.deleteFailed'))
    }
  }
}

// 处理搜索
const handleSearch = async (event?: Event) => {
  // 阻止事件的默认行为，防止表单提交导致页面跳转
  if (event && event.preventDefault) {
    event.preventDefault()
  }

  try {
    loading.value = true
    // 如果有搜索关键词，使用搜索API，否则获取所有资源
    if (searchKeyword.value.trim()) {
      const result = await assetApi.search(searchKeyword.value.trim()).catch(error => {
        // 特别处理搜索API的错误，防止因401导致跳转到登录页
        if (error.response && error.response.status === 401) {
          ElMessage.error(t('common.sessionExpired'))
          return []
        }
        throw error
      })
      assets.value = result
      pagination.total = result.length
    } else {
      // 如果搜索关键词为空，则重新加载所有资源
      await fetchAssets()
    }
  } catch (error) {
    console.error('搜索资源失败:', error)
    ElMessage.error(t('media.searchFailed'))
  } finally {
    loading.value = false
  }
}

// 处理页面大小变化
const handleSizeChange = (val: number) => {
  pagination.size = val
  pagination.page = 1
  fetchAssets()
}

// 处理当前页变化
const handleCurrentChange = (val: number) => {
  pagination.page = val
  fetchAssets()
}

// 播放视频
const playVideo = async (videoUrl: string | undefined) => {
  console.log('尝试播放视频，URL为:', videoUrl);

  // 检查URL是否有效
  if (!videoUrl || videoUrl.trim() === '') {
    console.error('视频URL为空或无效');
    ElMessage.error('视频URL无效，无法播放');
    return;
  }

  try {
    // 获取带认证的视频URL
    const authenticatedVideoUrl = await getAuthenticatedVideoUrl(videoUrl);

    if (!authenticatedVideoUrl) {
      // 错误信息已经在 getAuthenticatedVideoUrl 中显示
      console.log('无法获取视频数据');
      return;
    }

    // 创建视频播放模态框
    createVideoModal(authenticatedVideoUrl);
  } catch (error: any) {
    console.error('播放视频失败:', error);
    ElMessage.error('视频播放失败: ' + (error.message || '未知错误'));
  }
};

// 创建视频播放模态框
const createVideoModal = (videoSrc: string) => {
  console.log('创建视频播放模态框，视频源:', videoSrc);

  // 创建视频播放模态框
  const modal = document.createElement('div');
  modal.className = 'video-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;

  // 创建视频元素
  const video = document.createElement('video');
  video.src = videoSrc;
  video.controls = true;
  video.autoplay = true; // 启用自动播放
  video.playsInline = true; // iOS Safari兼容
  video.muted = true; // 静音以允许自动播放
  video.style.cssText = `
    max-width: 95%;
    max-height: 95%;
    outline: none;
    background: black;
  `;

  // 添加加载提示
  const loadingIndicator = document.createElement('div');
  loadingIndicator.textContent = '视频加载中...';
  loadingIndicator.style.cssText = `
    position: absolute;
    color: white;
    font-size: 16px;
  `;
  modal.appendChild(loadingIndicator);

  // 添加错误处理
  video.addEventListener('error', (e) => {
    console.error('视频播放出错:', e);
    loadingIndicator.textContent = '视频播放出错，请检查控制台了解详细信息';
    ElMessage.error('视频播放出错，请检查控制台了解详细信息');
  });

  // 视频开始加载
  video.addEventListener('loadstart', () => {
    console.log('视频开始加载');
    loadingIndicator.textContent = '视频加载中...';
  });

  // 视频可以播放
  video.addEventListener('canplay', () => {
    console.log('视频可以播放');
    if (modal.contains(loadingIndicator)) {
      modal.removeChild(loadingIndicator);
    }
  });

  // 视频播放中
  video.addEventListener('playing', () => {
    console.log('视频正在播放');
    if (modal.contains(loadingIndicator)) {
      modal.removeChild(loadingIndicator);
    }
  });

  // 创建关闭按钮
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: transparent;
    border: none;
    color: white;
    font-size: 36px;
    cursor: pointer;
    outline: none;
    z-index: 10001;
  `;

  // 添加事件监听器
  closeBtn.onclick = () => {
    document.body.removeChild(modal);
    video.pause();
    // 注意：这里不释放URL，因为我们可能还会用到它
  };

  modal.onclick = (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
      video.pause();
      // 注意：这里不释放URL，因为我们可能还会用到它
    }
  };

  // 视频加载元数据事件
  video.addEventListener('loadedmetadata', () => {
    console.log('视频元数据加载完成');
  });

  // 视频加载完成事件
  video.addEventListener('loadeddata', () => {
    console.log('视频数据加载完成');
  });

  // 视频播放事件
  video.addEventListener('play', () => {
    console.log('视频开始播放');
    if (modal.contains(loadingIndicator)) {
      modal.removeChild(loadingIndicator);
    }
  });

  // 组装模态框
  modal.appendChild(video);
  modal.appendChild(closeBtn);
  document.body.appendChild(modal);

  // 确保视频加载
  video.load();
  console.log('视频加载已启动');
};

// 生命周期
onMounted(() => {
  fetchAssets()
})
</script>

<style scoped lang="scss">
.media-page {
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .main-card {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .header-left {
        display: flex;
        align-items: center;
      }

      .header-right {
        display: flex;
        align-items: center;
      }
    }

    .media-content {
      min-height: 400px;

      .asset-item-col {
        margin-bottom: 20px;
      }

      .asset-card {
        cursor: pointer;
        transition: all 0.3s ease;
        height: 100%;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        &.selected {
          border-color: #409eff;
          box-shadow: 0 0 0 2px #409eff;
        }

        .asset-preview {
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-bottom: 1px solid #eee;
          position: relative;

          .asset-image {
            width: 100%;
            height: 100%;
            cursor: pointer;
          }

          .image-slot {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            background-color: #f5f7fa;
            color: #909399;
            flex-direction: column;
          }

          .no-preview {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 117%;
            background-color: #ccc;
            color: #909399;
            flex-direction: column;
          }

          .video-preview {
            width: 100%;
            height: 100%;
            position: relative;
            cursor: pointer;
            background-color: #f5f7fa;

            .video-wrapper {
              width: 100%;
              height: 100%;
              position: relative;


            }

            .video-overlay {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.3);
              display: flex;
              align-items: center;
              justify-content: center;

              .play-icon {
                font-size: 40px;
                color: rgba(255, 255, 255, 0.8);
              }
            }
          }
        }

        .asset-info {
          padding: 10px;

          .asset-name {
            font-size: 14px;
            font-weight: 500;
            color: #303133;
            margin-bottom: 5px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .asset-meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #909399;
            margin-bottom: 5px;

            .dimensions {
              text-align: right;
            }
          }

          .asset-date {
            font-size: 12px;
            color: #909399;
          }
        }
      }

      .no-assets {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 400px;
      }

      .pagination-container {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
        padding: 20px 0;
      }
    }
  }

  .batch-actions {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #ffffff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    padding: 10px 20px;
    display: flex;
    gap: 10px;
    z-index: 1000;
  }

  .upload-demo {
    :deep(.el-upload) {
      display: block;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
    }
  }

  .detail-image {
    width: 100%;
    max-height: 300px;
    object-fit: contain;
  }
}
</style>
