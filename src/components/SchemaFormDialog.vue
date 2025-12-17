<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑内容模型' : '创建内容模型'"
    width="1000px"
    destroy-on-close
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
      class="schema-form"
    >
      <el-row :gutter="15">
        <el-col :span="12">
          <el-form-item label="显示名称" prop="displayName">
            <el-input
              v-model="formData.displayName"
              placeholder="模型显示名称"
              size="small"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="内部名称" prop="name">
            <el-input
              v-model="formData.name"
              placeholder="模型标识"
              :disabled="isEdit"
              size="small"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="2"
          placeholder="模型描述信息"
          size="small"
        />
      </el-form-item>

      <div class="field-definition-section">
        <div class="field-definition-header">
          <span class="section-title">字段定义</span>
          <el-button type="primary" icon="Plus" @click="addField" size="small">
            添加字段
          </el-button>
        </div>

        <div class="field-list">
          <el-table 
            :data="formData.definition" 
            style="width: 100%" 
            border
            size="small"
            empty-text="暂无字段定义，请点击'添加字段'按钮添加字段"
          >
            <el-table-column prop="displayName" label="显示名" min-width="150" align="center">
              <template #default="{ row, $index }">
                <div class="table-cell-input-wrapper">

                    <el-input 
                      v-model="row.displayName" 
                      placeholder="如: 标题" 
                      size="small"
                    />
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="name" label="字段名" min-width="150" align="center" header-align="center">
              <template #default="{ row, $index }">
                <div class="table-cell-input-wrapper">
                    <el-input 
                      v-model="row.name" 
                      placeholder="如: title" 
                      size="small"
                    />
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="type" label="类型" width="150" align="center">
              <template #default="{ row }">
                <div class="table-cell-input-wrapper" style="text-align: center;">
                  <el-select 
                    v-model="row.type" 
                    placeholder="字段类型" 
                    size="small"
                  >
                    <el-option label="文本" value="string" />
                    <el-option label="长文本" value="text" />
                    <el-option label="数字" value="number" />
                    <el-option label="布尔值" value="boolean" />
                    <el-option label="日期" value="date" />
                  </el-select>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="required" label="必填" width="150" align="center">
              <template #default="{ row }">
                <div class="table-cell-input-wrapper" style="text-align: center;">
                  <el-switch v-model="row.required" size="small" />
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="150" align="center">
              <template #default="{ $index }">
                <div class="table-cell-input-wrapper" style="text-align: center;">
                  <el-button
                    type="danger"
                    link
                    :icon="Delete"
                    @click="removeField($index)"
                    size="small"
                  />
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false" size="small">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit" size="small">
        {{ isEdit ? '更新' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { schemaApi } from '@/api/schema'
import type { ContentSchema, FieldDefinition } from '@/types/api'

interface Props {
  modelValue: boolean
  schema?: ContentSchema | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.schema)

const formData = reactive({
  name: '',
  displayName: '',
  description: '',
  definition: [] as FieldDefinition[]
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入内部名称', trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9_]*$/, message: '只能包含小写字母、数字和下划线，且以字母开头', trigger: 'blur' }
  ],
  displayName: [
    { required: true, message: '请输入显示名称', trigger: 'blur' }
  ]
}

const fieldRules = {
  name: [
    { required: true, message: '请输入字段名', trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9_]*$/, message: '只能包含小写字母、数字和下划线，且以字母开头', trigger: 'blur' }
  ],
  displayName: [
    { required: true, message: '请输入显示名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择字段类型', trigger: 'change' }
  ]
}

const addField = () => {
  formData.definition.push({
    name: '',
    displayName: '',
    type: 'string',
    required: false,
    description: '',
    defaultValue: '',
    validations: {}
  })
}

const removeField = (index: number) => {
  formData.definition.splice(index, 1)
}

const handleClose = () => {
  formRef.value?.resetFields()
  formData.definition = []
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    // 验证所有字段
    let valid = true
    if (isEdit.value) {
      // 在编辑模式下，我们需要特殊处理，因为'name'字段被禁用了
      valid = await new Promise((resolve) => {
        formRef.value!.validate((isValid, invalidFields) => {
          // 即使'name'字段无效，我们也认为表单是有效的，因为该字段被禁用了
          if (isValid) {
            resolve(true)
          } else {
            // 检查除了'name'之外的字段是否都有效
            const hasOtherInvalidFields = Object.keys(invalidFields || {}).some(key => key !== 'name')
            resolve(!hasOtherInvalidFields)
          }
        })
      })
    } else {
      valid = await formRef.value.validate()
    }

    if (!valid) return

    // 验证字段名称是否重复
    const fieldNames = formData.definition.map(field => field.name)
    const duplicateNames = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index)
    if (duplicateNames.length > 0) {
      ElMessage.error(`字段名称重复: ${duplicateNames.join(', ')}`)
      return
    }


    loading.value = true

    if (isEdit.value && props.schema) {
      // 创建一个不包含禁用字段的新对象，但我们仍需要displayName
      const { name, ...updateData } = { ...formData }
      // 重新添加displayName，因为它不是禁用字段，是可以更新的
      updateData.displayName = formData.displayName;
      await schemaApi.update(props.schema.id, updateData)
      ElMessage.success('更新成功')
    } else {
      await schemaApi.create(formData)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    emit('success')
  } catch (error) {
    console.error('Submit failed:', error)
    ElMessage.error('操作失败，请检查表单数据')
  } finally {
    loading.value = false
  }
}

// 编辑时填充数据
watch(() => props.schema, (schema) => {
  if (schema) {
    formData.name = schema.name
    formData.displayName = schema.displayName
    formData.description = schema.description || ''
    formData.definition = schema.definition ? [...schema.definition] : []
    
    // 确保每个字段都有 validations 对象
    formData.definition.forEach(field => {
      if (!field.validations) {
        field.validations = {}
      }
    })
  } else {
    // 重置表单
    formData.name = ''
    formData.displayName = ''
    formData.description = ''
    formData.definition = []
  }
}, { immediate: true })

// 监听对话框关闭
watch(dialogVisible, (visible) => {
  if (!visible) {
    handleClose()
  }
})
</script>

<style scoped lang="scss">
.schema-form {
  .field-definition-section {
    .field-definition-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .section-title {
        font-weight: 500;
        color: #606266;
      }
    }

    .field-list {
      :deep(.el-form-item) {
        margin-bottom: 0;
      }
      
      :deep(.el-table) {
        .cell {
          padding: 0;
        }
        
        .el-select {
          width: 100%;
        }
      }
    }
  }
  
  .table-cell-input-wrapper {
    padding: 4px 8px;
    
    :deep(.el-input) {
      width: 100%;
    }
  }
}

:deep(.el-divider) {
  margin: 16px 0;
  background-color: #ebeef5;
}
</style>