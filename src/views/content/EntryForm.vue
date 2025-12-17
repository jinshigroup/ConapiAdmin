<template>
  <div class="entry-form">
    <div v-if="!isDialog" class="page-header">
      <h1 class="page-title">{{ isEdit ? '编辑内容' : '创建内容' }}</h1>
      <div class="page-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
        <el-button
          v-if="isEdit"
          type="success"
          :loading="publishing"
          @click="handlePublish"
        >
          发布
        </el-button>
      </div>
    </div>

    <el-card class="main-card" :class="{ 'dialog-mode': isDialog }">
      <template v-if="!isDialog" #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑内容' : '创建内容' }}</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="entry-form-content"
      >
        <el-form-item label="内容状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="published">发布</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="URL别名" prop="slug">
          <el-input
            v-model="formData.slug"
            placeholder="请输入URL别名（英文）"
          />
        </el-form-item>

        <el-form-item label="SEO标题" prop="seoTitle">
          <el-input
            v-model="formData.seoTitle"
            placeholder="请输入SEO标题"
          />
        </el-form-item>

        <el-form-item label="SEO描述" prop="seoDescription">
          <el-input
            v-model="formData.seoDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入SEO描述"
          />
        </el-form-item>

        <el-divider content-position="left">内容数据</el-divider>

        <div v-for="field in schema?.definition" :key="field.name" class="field-item">
          <el-form-item
            :label="field.displayName"
            :prop="`contentData.${field.name}`"
            :rules="getFieldRules(field)"
          >
            <template v-if="field.type === 'string'">
              <el-input
                v-model="formData.contentData[field.name]"
                :placeholder="`请输入${field.displayName}`"
              />
            </template>

            <template v-else-if="field.type === 'text'">
              <el-input
                v-model="formData.contentData[field.name]"
                type="textarea"
                :rows="6"
                :placeholder="`请输入${field.displayName}`"
              />
            </template>

            <template v-else-if="field.type === 'number'">
              <el-input-number
                v-model="formData.contentData[field.name]"
                :placeholder="`请输入${field.displayName}`"
                controls-position="right"
              />
            </template>

            <template v-else-if="field.type === 'boolean'">
              <el-switch
                v-model="formData.contentData[field.name]"
                :active-text="field.displayName"
              />
            </template>

            <template v-else-if="field.type === 'string-array'">
              <el-select
                v-model="formData.contentData[field.name]"
                multiple
                :placeholder="`请选择${field.displayName}`"
                style="width: 100%"
              >
                <el-option
                  v-for="option in getFieldOptions(field)"
                  :key="option"
                  :label="option"
                  :value="option"
                />
              </el-select>
            </template>

            <template v-else-if="field.type === 'date'">
              <el-date-picker
                v-model="formData.contentData[field.name]"
                type="datetime"
                :placeholder="`请选择${field.displayName}`"
                style="width: 100%"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </template>
          </el-form-item>
        </div>
      </el-form>
    </el-card>
    
    <div v-if="isDialog" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ isEdit ? '更新' : '创建' }}
      </el-button>
      <el-button
        v-if="isEdit"
        type="success"
        :loading="publishing"
        @click="handlePublish"
      >
        发布
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { contentApi } from '@/api/content'
import { schemaApi } from '@/api/schema'
import type { ContentSchema, CreateEntryRequest, FieldDefinition, Entry } from '@/types/api'

const props = defineProps<{
  schemaId: number,
  isDialog?: boolean,
  entryId?: number
}>()

const emit = defineEmits<{
  (e: 'submitted'): void
  (e: 'cancel'): void
}>()

const route = useRoute()
const router = useRouter()

const schemaId = computed(() => props.schemaId || parseInt(route.params.schemaId as string))
const entryId = computed(() => props.entryId || (route.params.id ? parseInt(route.params.id as string) : undefined))
const isEdit = computed(() => !!entryId.value)
const isDialog = computed(() => props.isDialog || false)

const formRef = ref<FormInstance>()
const loading = ref(false)
const publishing = ref(false)
const schema = ref<ContentSchema | null>(null)

const formData = reactive({
  status: 'draft',
  slug: '',
  seoTitle: '',
  seoDescription: '',
  contentData: {} as Record<string, any>
})

const formRules: FormRules = {
  slug: [
    { pattern: /^[a-z0-9-]*$/, message: 'URL别名只能包含小写字母、数字和连字符', trigger: 'blur' }
  ]
}

const getFieldRules = (field: FieldDefinition) => {
  const rules = []
  
  if (field.required) {
    rules.push({ required: true, message: `${field.displayName}是必填字段`, trigger: 'blur' })
  }
  
  if (field.validations) {
    if (field.validations.minLength) {
      rules.push({ min: field.validations.minLength, message: `最小长度${field.validations.minLength}个字符`, trigger: 'blur' })
    }
    if (field.validations.maxLength) {
      rules.push({ max: field.validations.maxLength, message: `最大长度${field.validations.maxLength}个字符`, trigger: 'blur' })
    }
  }
  
  return rules
}

const getFieldOptions = (field: FieldDefinition) => {
  if (field.validations?.allowedValues) {
    return field.validations.allowedValues
  }
  return []
}

const fetchSchema = async () => {
  try {
    schema.value = await schemaApi.getDetail(schemaId.value)
    // 初始化 contentData 结构
    if (schema.value?.definition) {
      const initialData: Record<string, any> = {}
      schema.value.definition.forEach(field => {
        // 设置默认值
        if (field.defaultValue !== undefined) {
          initialData[field.name] = field.defaultValue
        } else {
          // 根据字段类型设置默认值
          switch (field.type) {
            case 'string':
              initialData[field.name] = ''
              break
            case 'text':
              initialData[field.name] = ''
              break
            case 'number':
              initialData[field.name] = null
              break
            case 'boolean':
              initialData[field.name] = false
              break
            case 'string-array':
              initialData[field.name] = []
              break
            case 'date':
              initialData[field.name] = null
              break
            default:
              initialData[field.name] = null
          }
        }
      })
      formData.contentData = initialData
    }
  } catch (error) {
    console.error('获取内容模型失败:', error)
    ElMessage.error('获取内容模型失败')
  }
}

const fetchEntry = async () => {
  if (!entryId.value) return
  
  try {
    const entry = await contentApi.getDetail(entryId.value)
    formData.status = entry.status
    formData.slug = entry.slug || ''
    formData.seoTitle = entry.seoTitle || ''
    formData.seoDescription = entry.seoDescription || ''
    formData.contentData = entry.contentData || {}
  } catch (error) {
    console.error('获取内容失败:', error)
    ElMessage.error('获取内容失败')
  }
}

onMounted(async () => {
  await fetchSchema()
  if (isEdit.value || props.entryId) {
    await fetchEntry()
  }
})

// 获取复制源内容数据
const fetchCopySourceEntry = async () => {
  if (!copyFrom.value) return
  
  try {
    const entry = await contentApi.getDetail(copyFrom.value)
    // 使用复制的内容填充表单，但不包括ID等系统字段
    formData.status = entry.status
    formData.slug = entry.slug || ''
    formData.seoTitle = entry.seoTitle || ''
    formData.seoDescription = entry.seoDescription || ''
    formData.contentData = { ...entry.contentData } // 浅拷贝内容数据
    
    // 清除一些不应该复制的字段
    if (formData.contentData) {
      delete formData.contentData.id
      delete formData.contentData.createdAt
      delete formData.contentData.updatedAt
      delete formData.contentData.createdBy
      delete formData.contentData.updatedBy
    }
  } catch (error) {
    console.error('获取复制源内容失败:', error)
    ElMessage.error('获取复制源内容失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true

    const submitData: CreateEntryRequest = {
      schemaId: schemaId.value,
      status: formData.status,
      contentData: formData.contentData,
      slug: formData.slug || undefined,
      seoTitle: formData.seoTitle || undefined,
      seoDescription: formData.seoDescription || undefined
    }

    if (isEdit.value && entryId.value) {
      await contentApi.update(entryId.value, submitData)
      ElMessage.success('更新成功')
    } else {
      await contentApi.create(submitData)
      ElMessage.success('创建成功')
    }

    if (isDialog.value) {
      emit('submitted')
    } else {
      router.push(`/schema`)
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请检查表单数据')
  } finally {
    loading.value = false
  }
}

const handlePublish = async () => {
  if (!entryId.value) return

  try {
    publishing.value = true
    await contentApi.publish(entryId.value)
    ElMessage.success('发布成功')
    router.push(`/schema`)
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error('发布失败')
  } finally {
    publishing.value = false
  }
}

const handleCancel = () => {
  if (isDialog.value) {
    emit('cancel')
  } else {
    router.push(`/schema`)
  }
}

// 监听 entryId 变化，如果通过 props 传入则重新获取数据
watch(() => props.entryId, (newEntryId) => {
  if (newEntryId) {
    fetchEntry()
  }
})
</script>

<style scoped lang="scss">
.entry-form {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .page-title {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }
    
    .page-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  .main-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    &.dialog-mode {
      border: none;
      box-shadow: none;
      
      :deep(.el-card__body) {
        padding: 0;
      }
    }
    
    :deep(.el-card__header) {
      padding: 16px 20px;
      border-bottom: 1px solid #ebeef5;
    }
    
    .entry-form-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      
      :deep(.el-form-item) {
        margin-bottom: 22px;
      }
      
      :deep(.el-divider) {
        margin: 24px 0;
      }
      
      :deep(.el-textarea) {
        textarea {
          resize: vertical;
          min-height: 80px;
        }
      }
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
    padding: 0 20px 20px;
  }
}
</style>
