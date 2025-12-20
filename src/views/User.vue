<!-- src/views/Users.vue -->
<template>
  <div class="users-page">
    <div class="page-header">
      <h1 class="page-title">{{ t('user.title') }}</h1>
      <div class="page-actions">
        <el-button type="primary" icon="Plus" @click="handleCreate">
          {{ t('user.createUser') }}
        </el-button>
      </div>
    </div>

    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-input
              v-model="searchForm.keyword"
              :placeholder="t('user.searchPlaceholder')"
              clearable
              style="width: 200px; margin-right: 10px"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button icon="Search" @click="handleSearch" />
              </template>
            </el-input>
          </div>
          <div class="header-right">
            <el-button text icon="Refresh" @click="fetchUsers">
              {{ t('common.refresh') }}
            </el-button>
          </div>
        </div>
      </template>

      <div class="users-content">
        <el-table
          v-loading="loading"
          :data="users"
          style="width: 100%"
          row-key="id"
        >
          <el-table-column
            prop="name"
            :label="t('user.userName')"
            min-width="120"
          />
          <el-table-column
            prop="email"
            :label="t('user.userEmail')"
            min-width="180"
          />
          <el-table-column
            :label="t('user.lastLoginAt')"
            min-width="160"
            prop="lastLoginAt"
          >
            <template #default="{ row }">
              {{ formatDate(row.lastLoginAt) }}
            </template>
          </el-table-column>
          <el-table-column
            :label="t('user.loginCount')"
            min-width="100"
            prop="loginCount"
          />
          <el-table-column
            :label="t('common.action')"
            fixed="right"
            width="200"
          >
            <template #default="{ row }">
              <div style="display: flex; gap: 8px; flex-wrap: nowrap;">
                <el-button link type="primary" @click="handleEdit(row)">
                  {{ t('common.edit') }}
                </el-button>
                <el-button link type="primary" @click="handleResetPassword(row)">
                  {{ t('user.resetPassword') }}
                </el-button>
                <el-popconfirm
                  :title="t('user.deleteConfirmMsg', { username: row.username })"
                  @confirm="handleDelete(row)"
                >
                  <template #reference>
                    <el-button link type="danger">
                      {{ t('common.delete') }}
                    </el-button>
                  </template>
                </el-popconfirm>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
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

    <!-- User Form Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitleComputed"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="userFormRef"
        :model="currentUser"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item :label="t('user.userName')" prop="name">
          <el-input
            v-model="currentUser.name"
          />
        </el-form-item>
        <el-form-item :label="t('user.userEmail')" prop="email">
          <el-input v-model="currentUser.email" />
        </el-form-item>
        <el-form-item v-if="!currentUser.id" :label="t('user.userPassword')" prop="password">
          <el-input
            v-model="currentUser.password"
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">
            {{ t('common.cancel') }}
          </el-button>
          <el-button type="primary" @click="submitUser">
            {{ t('common.confirm') }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { userApi, type CreateUserRequest, type UpdateUserRequest } from '@/api/user'
import { ElMessageBox } from 'element-plus'

interface User {
  id: number
  email: string
  name: string
  role: string
  password?: string
  lastLoginAt?: string
  loginCount: number
  createdAt: string
  updatedAt: string
}

const { t } = useI18n()

// 数据状态
const loading = ref(false)
const users = ref<User[]>([])
const dialogVisible = ref(false)
const userFormRef = ref<FormInstance>()

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 搜索表单
const searchForm = reactive({
  keyword: ''
})

// 当前编辑的用户
const currentUser = reactive<User>({
  id: 0,
  email: '',
  name: '',
  password: '',
  role: 'user',
  lastLoginAt: '',
  loginCount: 0,
  createdAt: '',
  updatedAt: ''
})

// 表单验证规则
const formRules = computed(() => ({
  name: [
    { required: true, message: t('user.usernameRequired'), trigger: 'blur' },
    { min: 2, max: 50, message: t('user.nameLengthValidation'), trigger: 'blur' }
  ],
  email: [
    { required: true, message: t('user.emailRequired'), trigger: 'blur' },
    { type: 'email', message: t('user.emailInvalid'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('user.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('user.passwordMinLength'), trigger: 'blur' }
  ]
}))

// 计算属性 - 对话框标题
const isEditMode = computed(() => !!currentUser.id)
const dialogTitleComputed = computed(() =>
  isEditMode.value ? t('user.editUser') : t('user.createUser')
)

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return ''
    }
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  } catch (error) {
    console.error('日期格式化错误:', error)
    return ''
  }
}

// 处理创建用户
const handleCreate = () => {
  // 重置当前用户数据
  Object.assign(currentUser, {
    id: 0,
    email: '',
    name: '',
    password: '',
    role: 'user',
    lastLoginAt: '',
    loginCount: 0,
    createdAt: '',
    updatedAt: ''
  })
  
  // 重置表单验证状态
  userFormRef.value?.resetFields()
  
  dialogVisible.value = true
}

// 处理编辑用户
const handleEdit = (user: User) => {
  Object.assign(currentUser, { ...user, password: '' })
  dialogVisible.value = true
}

// 提交用户表单
const submitUser = async () => {
  if (!userFormRef.value) return

  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true

        // 调用真实API
        if (isEditMode.value) {
          // 编辑操作
          await updateUser(currentUser)
        } else {
          // 创建操作
          await createUser({
            email: currentUser.email,
            name: currentUser.name,
            password: currentUser.password
          } as CreateUserRequest)
        }

        ElMessage.success(
          isEditMode.value
            ? t('user.updateSuccess')
            : t('user.createSuccess')
        )

        dialogVisible.value = false
        fetchUsers()
      } catch (error) {
        console.error(error)
        ElMessage.error(t('common.operationFailed'))
      } finally {
        loading.value = false
      }
    }
  })
}

// 删除用户
const handleDelete = async (user: User) => {
  try {
    loading.value = true
    await deleteUser(user.id)
    ElMessage.success(t('user.deleteSuccess'))
    fetchUsers()
  } catch (error) {
    console.error(error)
    ElMessage.error(t('user.deleteFailed'))
  } finally {
    loading.value = false
  }
}

// 重置密码
const handleResetPassword = async (user: User) => {
  try {
    await ElMessageBox.prompt(t('user.enterNewPassword'), t('user.resetPassword'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      inputPlaceholder: t('user.newPassword'),
      inputType: 'password',
      inputValidator: (value) => {
        if (!value) {
          return t('user.passwordRequired')
        }
        if (value.length < 6) {
          return t('user.passwordMinLength')
        }
        return true
      }
    }).then(async ({ value }) => {
      loading.value = true
      await userApi.resetPassword(user.id, value)
      ElMessage.success(t('user.resetPasswordSuccess'))
      fetchUsers()
    }).catch(() => {
      // 用户取消操作
    })
  } catch (error) {
    console.error(error)
    ElMessage.error(t('user.resetPasswordFailed'))
  } finally {
    loading.value = false
  }
}

// 处理对话框关闭
const handleDialogClose = () => {
  userFormRef.value?.resetFields()
}

// 处理页面大小变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchUsers()
}

// 处理当前页变化
const handleCurrentChange = (val: number) => {
  pagination.page = val
  fetchUsers()
}

// 获取用户列表
const fetchUsers = async () => {
  try {
    loading.value = true

    // 调用真实API
    let response;
    if (searchForm.keyword.trim()) {
      // 如果有搜索关键词，使用搜索API
      response = await userApi.search(searchForm.keyword.trim(), pagination.page - 1, pagination.pageSize)
    } else {
      // 如果没有搜索关键词，则获取所有用户
      response = await userApi.getPage(pagination.page - 1, pagination.pageSize)
    }

    // 检查响应结构
    if (response && response.content) {
      users.value = response.content.map(user => ({
        ...user,
        username: user.name // 兼容前端现有字段
      }))
      
      // 从响应中直接获取分页信息
      pagination.total = response.totalElements || 0
    } else {
      // 如果响应结构不符合预期，给出更具体的错误信息
      console.error('Unexpected response structure:', response)
      ElMessage.error(t('user.fetchFailed') + ': 数据格式错误')
    }
  } catch (error) {
    console.error(error)
    // 提供更具体的错误信息
    if (error instanceof Error) {
      ElMessage.error(t('user.fetchFailed') + ': ' + error.message)
    } else {
      ElMessage.error(t('user.fetchFailed'))
    }
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = async () => {
  // 重置页码到第一页
  pagination.page = 1
  await fetchUsers()
}

// 创建用户
const createUser = (user: CreateUserRequest) => {
  return userApi.create(user)
}

// 更新用户
const updateUser = async (user: User): Promise<User> => {
  const updateData: UpdateUserRequest = {
    email: user.email,
    name: user.name
  }
  return userApi.update(user.id, updateData)
}

// 删除用户
const deleteUser = async (id: number): Promise<void> => {
  return userApi.delete(id)
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped lang="scss">
.users-page {
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

    .users-content {
      .pagination-container {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
      }
    }
  }
}
</style>