<template>
  <div class="api-manager">
    <el-card class="main-card">
      <el-tabs v-model="activeTab" class="api-tabs">
        <el-tab-pane label="API 文档" name="docs">
          <div class="tab-content">
            <el-collapse v-for="(endpoints, moduleName) in apiModules" :key="moduleName" class="module-collapse">
              <el-collapse-item :name="moduleName">
                <template #title>
                  <strong>{{ moduleName }}</strong>
                </template>
                
                <el-table :data="Object.entries(endpoints)" style="width: 100%">
                  <el-table-column prop="method" label="方法" width="120">
                    <template #default="scope">
                      <el-tag :type="getMethodTagType(scope.row[0].split(' ')[0])">
                        {{ scope.row[0].split(' ')[0] }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="path" label="路径">
                    <template #default="scope">
                      {{ scope.row[0].split(' ').slice(1).join(' ') }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="description" label="描述">
                    <template #default="scope">
                      {{ scope.row[1] }}
                    </template>
                  </el-table-column>
                </el-table>
              </el-collapse-item>
            </el-collapse>
            
            <el-empty v-if="!loading && (!apiModules || Object.keys(apiModules).length === 0)" description="暂无API文档数据" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { documentApi } from '../api/document.ts'

// 响应式数据
const activeTab = ref('docs')
const loading = ref(false)

// API模块数据
const apiModules = ref<Record<string, Record<string, string>>>({})

// 方法标签类型
const getMethodTagType = (method: string) => {
  const typeMap: Record<string, string> = {
    GET: '',
    POST: 'success',
    PUT: 'warning',
    DELETE: 'danger',
    PATCH: 'info'
  }
  return typeMap[method] || ''
}

// 获取API文档
const fetchApiDocumentation = async () => {
  try {
    loading.value = true
    const response: any = await documentApi.getDocumentation()
    
    // 从响应中提取模块数据
    if (response && response.modules) {
      apiModules.value = response.modules
    }
  } catch (error) {
    console.error('获取API文档失败:', error)
    ElMessage.error('获取API文档失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchApiDocumentation()
})
</script>

<style scoped lang="scss">
.api-manager {
  padding: 20px;
  height: calc(100vh - 100px);
  
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
      
      .header-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }
    
    .api-tabs {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      :deep(.el-tabs__content) {
        flex: 1;
        overflow: hidden;
      }
      
      :deep(.el-tab-pane) {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      
      .tab-content {
        flex: 1;
        overflow: auto;
        padding: 20px;
        
        .module-collapse {
          margin-bottom: 20px;
          
          :deep(.el-collapse-item__header) {
            font-size: 16px;
            padding-left: 20px;
          }
          
          :deep(.el-collapse-item__content) {
            padding: 20px;
          }
        }
      }
    }
  }
}
</style>