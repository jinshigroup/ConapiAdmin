<template>
  <div class="entry-list">
    <el-card class="main-card" style="height: 100%; display: flex; flex-direction: column;">
      <template #header>
        <div class="card-header" style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #ebeef5;">
          <div class="header-left" style="display: flex; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 10px;">
              <el-select
                v-model="filterStatus"
                placeholder="状态筛选"
                style="width: 120px;"
                clearable
                @change="handleFilterChange"
              >
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-input
                v-model="searchKeyword"
                placeholder="搜索内容..."
                style="width: 200px;"
                clearable
                @clear="handleSearch"
                @keyup.enter="handleSearch"
              >
                <template #append>
                  <el-button icon="Search" @click="handleSearch" />
                </template>
              </el-input>
            </div>
          </div>
          <div class="header-right">
            <el-button 
              v-if="validSchemaId > 0" 
              type="primary" 
              icon="Plus" 
              @click="handleCreateEntry"
            >
              创建内容
            </el-button>
            <!-- 移除了刷新按钮 -->
          </div>
        </div>
      </template>

      <el-alert v-if="validSchemaId <= 0 && !hideSchemaAlert" title="缺少内容模型ID参数" type="warning" description="请从内容模型列表中选择一个模型查看其内容" show-icon />

      <div v-else style="flex: 1; display: flex; flex-direction: column;">
        <div style="flex: 1; overflow: hidden;">
          <el-table
            :data="entries"
            :loading="loading"
            empty-text="暂无内容"
            style="width: 100%; height: calc(100% - 60px);"
          >
            <el-table-column label="ID" width="80" align="center" header-align="center">
              <template #default="{ row }">
                {{ row.id }}
              </template>
            </el-table-column>

            <el-table-column label="标题" min-width="200" align="center" header-align="center">
              <template #default="{ row }">
                <div class="entry-title">
                  {{ row.contentData?.title || '无标题' }}
                  <el-tag v-if="row.contentData?.isFeatured" type="warning" size="small">
                    推荐
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="slug" label="URL别名" width="150" show-overflow-tooltip align="center" header-align="center" />

            <el-table-column prop="status" label="状态" width="100" align="center" header-align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="版本" width="60" align="center">
              <template #default="{ row }">
                v{{ row.version }}
              </template>
            </el-table-column>

            <el-table-column prop="createdAt" label="创建时间" width="155" align="center" header-align="center">
              <template #default="{ row }">
                {{ formatTime(row.createdAt) }}
              </template>
            </el-table-column>

            <el-table-column label="操作" width="200" fixed="right" align="center" header-align="center">
              <template #default="{ row }">
                <div class="table-actions">
                  <div class="action-row">
                    <el-button
                      type="primary"
                      link
                      icon="View"
                      @click="viewDetails(row)"
                      size="small"
                    >
                      查看
                    </el-button>
                    <el-button
                      type="primary"
                      link
                      icon="Edit"
                      @click="editEntry(row)"
                      size="small"
                    >
                      编辑
                    </el-button>
                  </div>
                  <div class="action-row">
                    <el-button
                      v-if="row.status === 'draft'" 
                      type="success"
                      link
                      icon="Promotion"
                      @click="publishEntry(row)"
                      size="small"
                    >
                      发布
                    </el-button>
                    <el-button
                      v-if="row.status === 'published'" 
                      type="warning"
                      link
                      icon="Hide"
                      @click="unpublishEntry(row)"
                      size="small"
                    >
                      取消发布
                    </el-button>
                    <el-button
                      type="danger"
                      link
                      icon="Delete"
                      @click="deleteEntry(row)"
                      size="small"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-container" style="height: 50px; flex-shrink: 0;">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            background
            layout="prev, pager, next"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="(detailEntry?.contentData?.title || '无标题') + ' 的详情'"
      width="800px"
      class="entry-dialog"
    >
      <div class="entry-detail">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="ID">{{ detailEntry?.id }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTagType(detailEntry?.status)">
              {{ getStatusText(detailEntry?.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="版本">v{{ detailEntry?.version }}</el-descriptions-item>
          <el-descriptions-item label="URL别名">{{ detailEntry?.slug }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatTime(detailEntry?.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatTime(detailEntry?.updatedAt) }}</el-descriptions-item>
          <el-descriptions-item v-if="detailEntry?.publishedAt" label="发布时间">{{ formatTime(detailEntry?.publishedAt) }}</el-descriptions-item>
        </el-descriptions>

        <h4 style="margin: 20px 0 10px;">内容数据</h4>
        <pre class="content-data">{{ JSON.stringify(detailEntry?.contentData, null, 2) }}</pre>
        
        <div v-if="detailEntry?.seoTitle || detailEntry?.seoDescription" class="entry-metadata">
          <h4 style="margin: 20px 0 10px;">SEO信息</h4>
          <el-descriptions :column="1" size="small">
            <el-descriptions-item v-if="detailEntry?.seoTitle" label="SEO标题">{{ detailEntry?.seoTitle }}</el-descriptions-item>
            <el-descriptions-item v-if="detailEntry?.seoDescription" label="SEO描述">{{ detailEntry?.seoDescription }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>

    <!-- 创建内容对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建内容"
      width="800px"
      class="entry-dialog"
      @closed="handleDialogClosed"
    >
      <EntryForm 
        v-if="showCreateDialog"
        :schema-id="validSchemaId" 
        :is-dialog="true"
        :copy-from="copyFromId"
        @submitted="handleEntrySubmitted"
        @cancel="showCreateDialog = false"
      />
    </el-dialog>

    <!-- 编辑内容对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑内容"
      width="800px"
      class="entry-dialog"
      @closed="handleDialogClosed"
    >
      <EntryForm 
        v-if="showEditDialog && editingEntry"
        :schema-id="validSchemaId" 
        :entry-id="editingEntry.id"
        :is-dialog="true"
        @submitted="handleEntrySubmitted"
        @cancel="showEditDialog = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { contentApi } from '@/api/content'
import { schemaApi } from '@/api/schema'
import EntryForm from '@/views/content/EntryForm.vue'
import type { Entry, ContentSchema } from '@/types/api'
import { formatTime } from '@/utils/date'

const props = defineProps<{
  schemaId?: number,
  hideSchemaAlert?: boolean,
  title?: string
}>()

const route = useRoute()
const router = useRouter()

// 从路由参数获取 schemaId
const validSchemaId = computed(() => {
  // 首先尝试从props获取schemaId（来自父组件）
  if (props.schemaId && props.schemaId > 0) {
    return props.schemaId;
  }
  
  // 然后尝试从路由参数获取 schemaId
  if (route.params && route.params.schemaId) {
    const id = parseInt(route.params.schemaId as string);
    if (!isNaN(id)) {
      return id;
    }
  }
  // 如果路由参数中没有，则从查询参数获取
  if (route.query && route.query.schemaId) {
    const id = parseInt(route.query.schemaId as string);
    if (!isNaN(id)) {
      return id;
    }
  }
  // 默认返回0或其他适当的默认值
  return 0;
})

let fetchTimer: NodeJS.Timeout | null = null

// 监听菜单导航事件
const handleMenuNavigation = async (event: CustomEvent) => {
  const { path } = event.detail
  if (!path.startsWith('/schema')) {
    // 等待下一个tick确保状态清理完成
    await nextTick()
    // 清理状态
    entries.value = []
    schema.value = null
    searchKeyword.value = ''
    filterStatus.value = ''
    pagination.value = {
      page: 1,
      size: 10,
      total: 0
    }
  }
}

// 添加事件监听器
onMounted(() => {
  window.addEventListener('menu-navigation', handleMenuNavigation as EventListener)
  // 立即获取数据
  fetchSchema()
  fetchEntries()
})

// 组件卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('menu-navigation', handleMenuNavigation as EventListener)
  if (fetchTimer) {
    clearTimeout(fetchTimer)
  }
})

// 监听 schemaId 变化，添加防抖
watch(validSchemaId, (newVal, oldVal) => {
  // 只有当schemaId发生变化且有效时才重新获取数据
  if (newVal !== oldVal && newVal > 0) {
    if (fetchTimer) {
      clearTimeout(fetchTimer)
    }
    
    fetchTimer = setTimeout(() => {
      fetchSchema()
      fetchEntries()
    }, 300)
  }
}, { immediate: true })

const loading = ref(false)
const entries = ref<Entry[]>([])
const schema = ref<ContentSchema | null>(null)
const searchKeyword = ref('')
const filterStatus = ref('')

// 弹窗相关
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const editingEntry = ref<Entry | null>(null)
const showDetailDialog = ref(false)
const detailEntry = ref<Entry | null>(null)

// 状态选项
const statusOptions = [
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已发布' },
  { value: 'archived', label: '已归档' },
  { value: 'scheduled', label: '计划发布' }
]

const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

const getStatusTagType = (status: string) => {
  const typeMap: Record<string, string> = {
    draft: 'info',
    published: 'success',
    archived: 'warning',
    scheduled: 'primary'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档',
    scheduled: '计划发布'
  }
  return textMap[status] || status
}

const fetchSchema = async () => {
  // 只有当schemaId有效时才获取schema数据
  if (validSchemaId.value <= 0) return;
  
  try {
    schema.value = await schemaApi.getDetail(validSchemaId.value)
  } catch (error) {
    ElMessage.error('获取内容模型失败')
  }
}

const fetchEntries = async () => {
  // 只有当schemaId有效时才获取条目数据
  if (validSchemaId.value <= 0) return;
  
  loading.value = true
  try {
    const params: any = {
      schemaId: validSchemaId.value,
      page: pagination.value.page - 1,
      size: pagination.value.size
    };
    
    // 只有当筛选条件有值时才添加到参数中
    if (filterStatus.value) {
      params.status = filterStatus.value;
    }
    
    if (searchKeyword.value) {
      params.search = searchKeyword.value;
    }
    
    const response = await contentApi.getList(params);
    
    // 根据实际的API响应结构调整处理逻辑
    if (response.content) {
      // 处理 PageResult 格式
      entries.value = response.content;
      pagination.value.total = response.totalElements || response.content.length;
    } else {
      // 处理数组格式
      entries.value = response;
      pagination.value.total = response.length;
    }
  } catch (error) {
    console.error('获取内容列表失败:', error);
    ElMessage.error('获取内容列表失败: ' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
}

const emit = defineEmits(['create'])

// 处理创建内容按钮点击事件
const handleCreateEntry = () => {
  showCreateDialog.value = true
}

// 处理条目提交完成
const handleEntrySubmitted = () => {
  showCreateDialog.value = false
  fetchEntries() // 重新获取列表数据
}

// 处理对话框关闭
const handleDialogClosed = () => {
  // 对话框关闭后重置表单状态
}

// 查看详情
const viewDetails = (entry: Entry) => {
  detailEntry.value = entry
  showDetailDialog.value = true
}

const editEntry = (entry: Entry) => {
  editingEntry.value = entry
  showEditDialog.value = true
}

const handleCommand = async (command: string, entry: Entry) => {
  switch (command) {
    case 'publish':
      await publishEntry(entry)
      break
    case 'unpublish':
      await unpublishEntry(entry)
      break
    case 'schedule':
      await scheduleEntry(entry)
      break
    case 'delete':
      await deleteEntry(entry)
      break
  }
}

const publishEntry = async (entry: Entry) => {
  try {
    await ElMessageBox.confirm(
      `确定要发布内容 "${entry.contentData?.title || '未命名'}" 吗？`,
      '确认发布',
      { type: 'warning' }
    )

    await contentApi.publish(entry.id)
    ElMessage.success('发布成功')
    fetchEntries()
  } catch (error) {
    // 用户取消或发布失败
    if (!(error instanceof Error && error.message === 'cancel')) {
      ElMessage.error('发布失败')
    }
  }
}

const unpublishEntry = async (entry: Entry) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消发布内容 "${entry.contentData?.title || '未命名'}" 吗？`,
      '取消发布',
      { type: 'warning' }
    )

    // 调用后端取消发布接口（需要在contentApi中添加相应方法）
    await contentApi.unpublish(entry.id)
    
    ElMessage.success('取消发布成功')
    fetchEntries()
  } catch (error) {
    // 用户取消或操作失败
    if (!(error instanceof Error && error.message === 'cancel')) {
      ElMessage.error('取消发布失败')
    }
  }
}

const scheduleEntry = async (entry: Entry) => {
  try {
    // 显示计划发布对话框
    const { value } = await ElMessageBox.prompt('请输入计划发布时间', '计划发布', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/,
      inputErrorMessage: '时间格式不正确，请使用 YYYY-MM-DD HH:mm:ss 格式'
    })
    
    // 调用后端计划发布接口（需要在contentApi中添加相应方法）
    await contentApi.update(entry.id, {
      schemaId: entry.schemaId,
      status: 'scheduled',
      contentData: entry.contentData,
      slug: entry.slug || undefined,
      seoTitle: entry.seoTitle || undefined,
      seoDescription: entry.seoDescription || undefined,
      scheduledAt: value
    })
    
    ElMessage.success('计划发布设置成功')
    fetchEntries()
  } catch (error) {
    // 用户取消或操作失败
    if (!(error instanceof Error && error.message === 'cancel')) {
      ElMessage.error('计划发布设置失败')
    }
  }
}

const deleteEntry = async (entry: Entry) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除内容 "${entry.contentData?.title || '未命名'}" 吗？此操作不可恢复。`,
      '确认删除',
      { type: 'warning' }
    )

    await contentApi.delete(entry.id)
    ElMessage.success('删除成功')
    fetchEntries()
  } catch (error) {
    // 用户取消或删除失败
    if (!(error instanceof Error && error.message === 'cancel')) {
      ElMessage.error('删除失败')
    }
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  fetchEntries()
}

const handleFilterChange = () => {
  pagination.value.page = 1
  fetchEntries()
}

const handleSizeChange = (size: number) => {
  pagination.value.size = size
  pagination.value.page = 1
  fetchEntries()
}

const handleCurrentChange = (page: number) => {
  pagination.value.page = page
  fetchEntries()
}
</script>

<style scoped lang="scss">
.entry-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .main-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    
    :deep(.el-card__header) {
      padding: 0;
    }
    
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #ebeef5;

      .header-left {
        display: flex;
        align-items: center;
        
        .search-controls {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-left: 20px;
          
          :deep(.el-select) {
            width: 120px;
          }
          
          :deep(.el-input) {
            width: 200px;
          }
        }
      }

      .header-right {
        display: flex;
        align-items: center;
      }
    }
  }

  .entry-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .table-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
    justify-content: center;
    
    .action-row {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
      
      :deep(.el-button) {
        padding: 0;
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding: 16px 0;
  }
  
  .entry-detail {
    .content-data {
      background: #f5f7fa;
      padding: 12px;
      border-radius: 4px;
      font-size: 12px;
      margin: 0 0 16px 0;
      max-height: 300px;
      overflow: auto;
    }

    .entry-metadata {
      h4 {
        margin-top: 16px;
      }
      
      :deep(.el-descriptions__body) {
        background-color: transparent;
      }
    }
  }
}
</style>