import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/auth.ts'
import type { User, LoginRequest } from '../types/api.ts'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

export const useUserStore = defineStore('user', () => {
  const { t } = useI18n()

  const token = ref<string>('')
  const currentUser = ref<User | null>(null)
  const permissions = ref<string[]>([])

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => currentUser.value?.role === 'admin' || currentUser.value?.role === 'super_admin')
  const userRole = computed(() => currentUser.value?.role || '')

  // 登录
  const login = async (loginData: LoginRequest) => {
    try {
      const response = await authApi.login(loginData)
      token.value = response.token
      currentUser.value = response.user
      // 保存到localStorage
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      return response
    } catch (error: any) {
      // 始终使用本地化的错误提示，不使用后端返回的可能为英文的信息
      ElMessage.error(t('login.loginFailed'))
      throw error
    }
  }

  // 退出登录
  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      // 忽略退出错误
    } finally {
      token.value = ''
      currentUser.value = null
      permissions.value = []
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // 注意：这里不显示退出成功的消息，因为路由跳转会提供更好的用户反馈
    }
  }

  // 初始化用户状态
  const initUser = () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      token.value = savedToken
      currentUser.value = JSON.parse(savedUser)
    }
  }

  // 修改密码
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authApi.changePassword(currentPassword, newPassword)
      ElMessage.success(t('user.passwordChangeSuccess'))
    } catch (error) {
      ElMessage.error(t('user.passwordChangeFailed'))
      throw error
    }
  }

  // 检查权限
  const hasPermission = (permission: string) => {
    return permissions.value.includes(permission) || isAdmin.value
  }

  const fetchCurrentUser = async () => {
    try {
      const user = await authApi.getCurrentUser()
      currentUser.value = user
      return user
    } catch (error) {
      logout()
      throw error
    }
  }

  return {
    token,
    currentUser,
    permissions,
    isLoggedIn,
    isAdmin,
    userRole,
    login,
    logout,
    fetchCurrentUser,
    initUser,
    changePassword,
    hasPermission
  }
})