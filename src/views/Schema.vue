<template>
  <div class="schema-container">
    <div class="schema-layout">
      <!-- 左侧内容模型列表 -->
      <div class="schema-panel">
        <el-card class="main-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <div class="toolbar-wrapper">
                  <el-input
                    v-model="searchKeyword"
                    :placeholder="t('content.searchPlaceholder') || '搜索内容模型...'"
                    clearable
                    @clear="handleSearch"
                    @keyup.enter="handleSearch"
                  >
                    <template #append>
                      <el-button icon="Search" @click="handleSearch" />
                    </template>
                  </el-input>
                  <el-button 
                    type="primary" 
                    icon="Plus" 
                    @click="handleCreateModel"
                  >
                    {{ t('content.createSchema') || '创建模型' }}
                  </el-button>
                </div>
              </div>
            </div>
          </template>

          <div class="schema-content">
            <div class="schema-list">
              <el-scrollbar>
                <div 
                  v-for="schema in schemas" 
                  :key="schema.id"
                  class="schema-item"
                  :class="{ active: selectedSchema?.id === schema.id }"
                  @click="viewEntries(schema)">
                  <div class="schema-info">
                    <el-icon class="schema-icon"><Collection /></el-icon>
                    <div class="schema-names">
                      <div class="display-name">{{ schema.displayName }}</div>
                      <div class="schema-name">{{ schema.name }}</div>
                    </div>
                    <div class="schema-meta">
                      <span class="entry-count">{{ getEntryCount(schema.id) }} {{ t('content.entries') || '项内容' }}</span>
                    </div>
                  </div>
                  
                  <div class="schema-actions">
                    <el-button
                      v-if="getEntryCount(schema.id) === 0"
                      type="primary"
                      link
                      size="small"
                      @click="handleEditSchema(schema)"
                    >
                      <el-icon><Edit /></el-icon>
                      <span>{{ t('common.edit') || '编辑' }}</span>
                    </el-button>

                    <el-popconfirm
                      v-if="!schema.isSystem && getEntryCount(schema.id) === 0"
                      :title="getDeleteConfirmTitle(schema)"
                      @confirm="deleteSchema(schema)"
                    >
                      <template #reference>
                        <el-button
                          type="danger"
                          link
                          size="small"
                          @click.stop
                        >
                          <el-icon><Delete /></el-icon>
                          <span>{{ t('common.delete') || '删除' }}</span>
                        </el-button>
                      </template>
                    </el-popconfirm>
                  </div>
                </div>
                
                <div v-if="schemas.length === 0 && !loading" class="empty-schema">
                  <el-empty :description="t('content.noSchemas') || '暂无内容模型'" :image-size="80" />
                </div>
              </el-scrollbar>
            </div>

            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="currentPage"
                :total="total"
                :page-size="pageSize"
                background
                layout="prev, pager, next"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧内容列表 -->
      <div v-if="showContentPanel" class="content-panel">
        <Entry
          v-if="selectedSchema"
          :schema-id="selectedSchema.id" 
          :key="`${selectedSchema.id}-${entryListKey}`"
          :title="selectedSchema?.displayName || (t('content.list') || '内容列表')"
        />
      </div>
    </div>

    <!-- 创建内容模型对话框 -->
    <SchemaFormDialog
      v-model="showCreateDialog"
      @success="handleCreateSuccess"
    />

    <!-- 编辑内容模型对话框 -->
    <SchemaFormDialog
      v-model="showEditDialog"
      :schema="editingSchema"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import { useI18n } from 'vue-i18n'
import SchemaFormDialog from '../components/SchemaFormDialog.vue'
import Entry from '../views/Entry.vue'
import { schemaApi } from '../api/schema.ts'
import { contentApi } from '../api/content.ts'
import type { ContentSchema } from '../types/api.ts'

const { t } = useI18n()
const route = useRoute()
const loading = ref(false)
const schemas = ref<ContentSchema[]>([])
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const editingSchema = ref<ContentSchema | null>(null)
const searchKeyword = ref('')
const selectedSchema = ref<ContentSchema | null>(null)
const entryListKey = ref(0) // 添加一个用于强制刷新EntryList的key
const showContentPanel = ref(false) // 控制右侧内容面板的显示

// 检查是否需要直接打开创建内容对话框
const checkForCreateAction = () => {
  const schemaId = route.query.schemaId
  const create = route.query.create
  
  // 如果有schemaId且需要创建新内容，则直接打开创建对话框
  if (schemaId && create) {
    const schema = schemas.value.find(s => s.id === schemaId)
    if (schema) {
      selectedSchema.value = schema
      showContentPanel.value = true
      
      // 如果有copyFrom参数，需要传递给EntryForm组件
      nextTick(() => {
        entryListKey.value++ // 强制刷新EntryList组件
      })
    }
  }
}

// 分页相关数据
const currentPage = ref(1)
const pageSize = ref(5) // 改为每页5条
const total = ref(0)

// 存储每个模型的实际内容数量
const entryCounts = ref<Record<string, number>>({})

// 监听路由变化，如果离开当前页面，需要清理状态
onBeforeRouteLeave(() => {
  // 重置状态
  selectedSchema.value = null
  showContentPanel.value = false
  entryListKey.value = 0
})

// 监听路由更新
onBeforeRouteUpdate(() => {
  // 重置状态
  selectedSchema.value = null
  showContentPanel.value = false
  entryListKey.value = 0
})

// 监听菜单导航事件
const handleMenuNavigation = async (event: CustomEvent) => {
  const { path } = event.detail
  if (!path.startsWith('/schema')) {
    // 等待下一个tick确保状态清理完成
    await nextTick()
    // 完全重置组件状态
    selectedSchema.value = null
    showContentPanel.value = false
    entryListKey.value = 0
    showCreateDialog.value = false
    showEditDialog.value = false
    editingSchema.value = null
  }
}

// 添加事件监听器
onMounted(() => {
  window.addEventListener('menu-navigation', handleMenuNavigation as unknown as EventListener)
  // 确保获取最新的用户信息
  userStore.fetchCurrentUser().finally(() => {
    fetchSchemas().then(() => {
      // 获取模型列表后再检查是否需要执行创建操作
      checkForCreateAction()
    })
  })
})

// 组件卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('menu-navigation', handleMenuNavigation as unknown  as EventListener)
})

// 监听路由变化
watch(
  () => route.path,
  (newPath, oldPath) => {
    // 当路由发生变化时，重置状态
    if (newPath !== oldPath && !newPath.startsWith('/schema')) {
      selectedSchema.value = null
      showContentPanel.value = false
      entryListKey.value = 0
    }
  }
)

// 监听路由查询参数变化
watch(
  () => route.query,
  (newQuery, oldQuery) => {
    // 检查查询参数变化，特别是create参数
    if (newQuery.create && !oldQuery.create) {
      checkForCreateAction()
    }
  },
  { deep: true }
)

const fetchSchemas = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value - 1,
      size: pageSize.value
    }
    
    // 只有当搜索关键字有值时才添加到参数中
    if (searchKeyword.value) {
      params.search = searchKeyword.value
    }
    
    const response = await schemaApi.getList(params)
    
    if (response.content) {
      schemas.value = response.content
      total.value = response.totalElements || 0
    } else {
      schemas.value = response
      total.value = response.length
    }
    
    // 如果还没有选中的模型且有模型数据，则默认选择第一个
    if (!selectedSchema.value && schemas.value.length > 0) {
      selectedSchema.value = schemas.value[0]
      showContentPanel.value = true
    }
    
    // 获取每个模型的实际内容数量
    await Promise.all(schemas.value.map(schema => fetchEntryCount(schema.id)))
  } catch (error) {
    ElMessage.error(t('content.fetchSchemaFailed') || '获取内容模型失败')
  } finally {
    loading.value = false
  }
}

// 获取指定模型的内容数量
const fetchEntryCount = async (schemaId: string) => {
  try {
    const response = await contentApi.getList({
      schemaId: schemaId,
      page: 0,
      size: 1
    });
    
    if (response.totalElements !== undefined) {
      entryCounts.value[schemaId] = response.totalElements;
    } else if (response.pagination && response.pagination.total) {
      entryCounts.value[schemaId] = response.pagination.total;
    } else {
      entryCounts.value[schemaId] = response.length || 0;
    }
  } catch (error) {
    console.error(`获取模型 ${schemaId} 的内容数量失败:`, error);
    entryCounts.value[schemaId] = 0;
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchSchemas()
}

const getEntryCount = (schemaId: string) => {
  return entryCounts.value[schemaId] || 0
}

const viewEntries = (schema: ContentSchema) => {
  if (!schema || !schema.id) {
    ElMessage.warning(t('content.pleaseSelectValidSchema') || '请选择一个有效的模型')
    return
  }
  selectedSchema.value = schema
  showContentPanel.value = true
  entryListKey.value += 1 // 当切换模型时，增加key值以强制EntryList重新创建
}

// 确保在组件挂载时初始化选中的模型
onMounted(() => {
  if (schemas.value.length > 0 && !selectedSchema.value) {
    selectedSchema.value = schemas.value[0]
    showContentPanel.value = true
  }
})

const handleEditSchema = (schema: ContentSchema) => {
  if (getEntryCount(schema.id) > 0) {
    ElMessage.warning(t('content.schemaHasEntriesCannotEdit') || '该模型有内容，无法编辑')
    return
  }
  editingSchema.value = schema
  showEditDialog.value = true
}


const deleteSchema = async (schema: ContentSchema) => {
  try {
    await schemaApi.delete(schema.id)
    ElMessage.success(t('common.deleteSuccess') || '删除成功')
    // 如果删除的是当前选中的模型，清空选中
    if (selectedSchema.value?.id === schema.id) {
      selectedSchema.value = null
      showContentPanel.value = false
      // 如果还有其他模型，选择第一个
      if (schemas.value.length > 0) {
        selectedSchema.value = schemas.value[0]
        showContentPanel.value = true
      }
    }
    await fetchSchemas()
  } catch (error) {
    ElMessage.error(t('common.deleteFailed') || '删除失败')
  }
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchSchemas()
}

const handleCreateSuccess = () => {
  showCreateDialog.value = false
  fetchSchemas()
}

const handleEditSuccess = () => {
  showEditDialog.value = false
  editingSchema.value = null
  fetchSchemas()
}

// 处理创建模型按钮点击事件
const userStore = useUserStore()
const handleCreateModel = () => {
  showCreateDialog.value = true
}

const getDeleteConfirmTitle = (schema: ContentSchema) => {
  const translated = t('common.deleteConfirmMsg', { name: schema.displayName })
  if (translated !== 'common.deleteConfirmMsg') { // 如果翻译成功，返回翻译结果
    return translated
  }
  return `确定要删除内容模型 ${schema.displayName} 吗？`
}

</script>

<style scoped lang="scss">
.schema-container {
  padding: 20px;
  height: calc(100vh - 100px);
  overflow: hidden;
  position: relative;
  z-index: 1;
  
  .schema-layout {
    display: flex;
    gap: 20px;
    height: 100%;
    
    .schema-panel {
      flex: 1;
      min-width: 320px;
      position: relative;
      z-index: 10; /* 确保左侧区域在上层 */
      
      .main-card {
        height: 100%;
        display: flex;
        flex-direction: column;
        
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
            flex: 1;
            
            .toolbar-wrapper {
              display: flex;
              align-items: center;
              gap: 8px;
            }
          }
        }
        
        .schema-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0 20px 20px;
          overflow: hidden;
          
          .schema-list {
            flex: 1;
            overflow: hidden;
            
            :deep(.el-scrollbar) {
              height: 100%;
            }
            
            :deep(.el-scrollbar__wrap) {
              overflow-x: hidden;
            }
            
            .schema-item {
              border-bottom: 1px solid #f5f7fa;
              transition: all 0.2s;
              padding: 16px 0;
              
              &:last-child {
                border-bottom: none;
              }
              
              &:hover {
                background-color: #f9f9fc;
              }
              
              &.active {
                background-color: #ecf2ff;
              }
              
              .schema-info {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 0 20px;
                cursor: pointer;
                
                .schema-icon {
                  font-size: 18px;
                  color: #409eff;
                }
                
                .schema-names {
                  flex: 1;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  
                  .display-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: #303133;
                    max-width: 150px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  }
                  
                  .schema-name {
                    font-size: 12px;
                    color: #909399;
                  }
                }
                
                .schema-meta {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  
                  .entry-count {
                    font-size: 12px;
                    color: #909399;
                  }
                }
              }
              
              .schema-actions {
                display: flex;
                padding: 8px 20px 0 56px;
                gap: 16px;
                
                :deep(.el-button) {
                  padding: 0;
                }
              }
            }
            
            .empty-schema {
              padding: 60px 20px;
              text-align: center;
            }
          }
          
          .pagination-wrapper {
            padding: 16px 0 0;
            
            :deep(.el-pagination) {
              justify-content: flex-end;
            }
          }
        }
      }
    }
    
    .content-panel {
      flex: 2;
      min-width: 400px;
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 20;
      
      .panel-header {
        padding: 16px 20px;
        border-bottom: 1px solid #ebeef5;
        background: white;
        
        .panel-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #303133;
        }
      }
    }
  }
}
</style>