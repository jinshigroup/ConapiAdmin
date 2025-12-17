<!-- src/views/Media.vue -->
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
                @keyup.enter="(event) => handleSearch(event)"
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
                  <div class="video-wrapper" @click.stop="playVideo(asset.downloadUrl || '')">
                    <video 
                      :src="asset.previewUrl || ''" 
                      class="asset-video"
                      muted
                      preload="auto"
                    />
                    <div class="video-overlay">
                      <el-icon class="play-icon"><VideoPlay /></el-icon>
                    </div>
                  </div>
                </div>
                <el-image
                  v-else
                  :src="asset.previewUrl || ''"
                  :alt="asset.altText || asset.filename"
                  fit="cover"
                  class="asset-image"
                  :preview-src-list="[asset.previewUrl || '']"
                  :preview-teleported="true"
                  hide-on-click-modal
                  @click.stop="handlePreview(asset)"
                >
                  <template #error>
                    <div class="image-slot">
                      <el-icon v-if="isImage(asset)" :size="40"><Picture /></el-icon>
                      <el-icon v-else :size="40"><Document /></el-icon>
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

    <!-- 上传对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      :title="t('media.upload')"
      width="500px"
      @close="handleUploadDialogClose"
    >
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        drag
        :auto-upload="false"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        :file-list="uploadFileList"
        multiple
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          {{ t('media.dropUpload') }} <em>{{ t('media.clickUpload') }}</em>
        </div>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">{{ t('common.cancel') }}</el-button>
          <el-button
            type="primary"
            :loading="uploading"
            :disabled="uploadFileList.length === 0"
            @click="submitUpload"
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
        ref="detailFormRef"
        :model="detailForm"
        label-width="100px"
      >
        <el-form-item :label="t('media.preview')">
          <el-image
            :src="currentAsset.previewUrl || ''"
            :alt="currentAsset.altText || currentAsset.filename"
            fit="cover"
            class="detail-image"
            :preview-src-list="[currentAsset.previewUrl || '']"
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
import { ElMessage, ElMessageBox, UploadUserFile, FormInstance } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { assetApi } from '@/api/asset'
import type { AssetDTO } from '@/types/api'
import { formatDate } from '@/utils/date'
import { useUserStore } from '@/stores/user'
import { VideoPlay, Picture, Document } from '@element-plus/icons-vue'

const { t } = useI18n()

// 数据状态
const loading = ref(false)
const uploading = ref(false)
const assets = ref<AssetDTO[]>([])
const uploadDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const selectedAssets = ref<number[]>([])
const uploadFileList = ref<UploadUserFile[]>([])
const currentAsset = ref<AssetDTO | null>(null)

// 分页配置
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 搜索关键词
const searchKeyword = ref('')

// 表单引用
const uploadRef = ref()
const detailFormRef = ref<FormInstance>()

// 详情表单
const detailForm = reactive({
  altText: '',
  caption: ''
})

// 判断是否为图片
const isImage = (asset: AssetDTO) => {
  return asset.mimeType && asset.mimeType.startsWith('image/')
}

// 判断是否为视频
const isVideo = (asset: AssetDTO) => {
  return asset.mimeType && asset.mimeType.startsWith('video/')
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
  } catch (error) {
    console.error('获取资源列表失败:', error)
    ElMessage.error(t('media.fetchFailed'))
  } finally {
    loading.value = false
  }
}

// 处理上传
const handleUpload = () => {
  uploadDialogVisible.value = true
}

// 处理文件变化
const handleFileChange = (file: UploadUserFile) => {
  uploadFileList.value.push(file)
}

// 处理文件移除
const handleFileRemove = (file: UploadUserFile) => {
  const index = uploadFileList.value.findIndex(item => item.uid === file.uid)
  if (index > -1) {
    uploadFileList.value.splice(index, 1)
  }
}

// 提交上传
const submitUpload = async () => {
  if (uploadFileList.value.length === 0) {
    ElMessage.warning(t('media.noFilesSelected'))
    return
  }

  try {
    uploading.value = true
    const uploadPromises = uploadFileList.value.map(file => {
      if (file.raw) {
        return assetApi.upload(file.raw)
      }
      return Promise.reject(new Error('文件无效'))
    })

    await Promise.all(uploadPromises)
    ElMessage.success(t('media.uploadSuccess'))
    uploadDialogVisible.value = false
    fetchAssets()
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error(t('media.uploadFailed'))
  } finally {
    uploading.value = false
  }
}

// 处理上传对话框关闭
const handleUploadDialogClose = () => {
  uploadFileList.value = []
  uploadRef.value?.clearFiles()
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

// 显示资源详情
const showAssetDetail = async (asset: AssetDTO) => {
  try {
    const detailedAsset = await assetApi.getDetail(asset.id)
    currentAsset.value = detailedAsset
    detailForm.altText = detailedAsset.altText || ''
    detailForm.caption = detailedAsset.caption || ''
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取资源详情失败:', error)
    ElMessage.error(t('media.fetchDetailFailed'))
  }
}

// 更新资源详情
const updateAssetDetail = async () => {
  if (!currentAsset.value) return

  try {
    const updatedAsset = await assetApi.update(currentAsset.value.id, {
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
const playVideo = (videoUrl: string) => {
  console.log('尝试播放视频，URL为:', videoUrl);
  
  // 检查URL是否有效
  if (!videoUrl || videoUrl.trim() === '') {
    console.error('视频URL为空或无效');
    ElMessage.error('视频URL无效，无法播放');
    return;
  }
  
  // 创建带认证参数的URL
  const userStore = useUserStore();
  const token = userStore.token;
  const videoUrlWithAuth = token 
    ? `${videoUrl}${videoUrl.includes('?') ? '&' : '?'}token=${token}`
    : videoUrl;
  
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
  video.src = videoUrlWithAuth;
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
  
  // 添加错误处理
  video.addEventListener('error', (e) => {
    console.error('视频播放出错:', e);
    ElMessage.error('视频播放出错，请检查控制台了解详细信息');
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
  };
  
  modal.onclick = (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
      video.pause();
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
  });
  
  // 视频准备就绪事件
  video.addEventListener('canplay', () => {
    console.log('视频可以播放');
    // 尝试播放视频
    ensureVideoPlayback(video);
  });
  
  // 组装模态框
  modal.appendChild(video);
  modal.appendChild(closeBtn);
  document.body.appendChild(modal);
  
  // 确保视频加载
  video.load();
  console.log('视频加载已启动');
  
  // 延迟尝试播放视频
  setTimeout(() => {
    ensureVideoPlayback(video);
  }, 100);
};

// 确保视频播放
const ensureVideoPlayback = (video: HTMLVideoElement) => {
  // 尝试播放视频
  const playPromise = video.play();
  
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        console.log('视频播放成功');
      })
      .catch(e => {
        console.log('自动播放被阻止:', e);
        // 自动播放被阻止时，添加用户交互提示
        const clickPrompt = document.createElement('div');
        clickPrompt.textContent = '点击视频播放';
        clickPrompt.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 18px;
          background: rgba(0, 0, 0, 0.7);
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          z-index: 10002;
        `;
        
        clickPrompt.onclick = () => {
          video.muted = false;
          video.play();
          if (clickPrompt.parentNode) {
            clickPrompt.parentNode.removeChild(clickPrompt);
          }
        };
        
        // 也添加到视频本身上
        video.onclick = () => {
          video.muted = false;
          video.play();
          if (clickPrompt.parentNode) {
            clickPrompt.parentNode.removeChild(clickPrompt);
          }
        };
        
        document.querySelector('.video-modal')?.appendChild(clickPrompt);
      });
  }
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
          }

          .video-preview {
            width: 100%;
            height: 100%;
            position: relative;
            cursor: pointer;
            background-color: #000;

            .video-wrapper {
              width: 100%;
              height: 100%;
              position: relative;
            }

            .asset-video {
              width: 100%;
              height: 100%;
              object-fit: cover;
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