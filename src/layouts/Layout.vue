<template>
  <div class="modern-layout">
    <el-container class="main-container">
      <!-- 侧边栏 -->
      <el-aside 
        v-if="!isMobile || sidebarOpened" 
        :width="isMobile ? '240px' : (sidebarOpened ? '240px' : '64px')" 
        class="modern-sidebar"
      >
        <div class="sidebar-content">
          <div class="logo-section">
            <img src="@/assets/logo.png" alt="Conapi" class="logo-img" />
            <span v-show="sidebarOpened" class="logo-text">ConAPI CMS</span>
          </div>
          <SidebarMenu />
        </div>
      </el-aside>
      
      <!-- 主内容区 -->
      <el-container class="content-container">
        <!-- 顶部导航栏 -->
        <el-header class="modern-header">
          <div class="header-left">
            <el-button 
              class="menu-toggle" 
              @click="toggleSidebar" 
              circle 
              :icon="sidebarOpened ? 'Fold' : 'Expand'"
            />
            
          </div>
          
          <div class="header-right">
            <!-- 语言切换 -->
            <el-dropdown @command="switchLanguage" trigger="click">
              <el-button class="language-btn">
                {{ currentLanguageText }}
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
                  <el-dropdown-item command="en-US">English</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            
            <!-- 用户菜单 -->
            <el-dropdown @command="handleUserCommand" trigger="click">
              <div class="user-profile">
                <el-avatar :size="32" :src="userAvatar">
                  {{ userInitial }}
                </el-avatar>
                <span class="user-name" v-show="!isMobile">{{ userStore.currentUser?.name }}</span>
                <el-icon v-show="!isMobile"><ArrowDown /></el-icon>
              </div>
              
              <template #dropdown>
                <el-dropdown-menu>
                  <!-- 添加个人资料菜单项 -->
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    {{ t('user.profile') }}
                  </el-dropdown-item>
                  <el-dropdown-item command="changePassword">
                    <el-icon><Key /></el-icon>
                    {{ t('user.changePassword') }}
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    {{ t('login.logout') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <!-- 遮罩层 (移动端) -->
        <div 
          v-if="isMobile && sidebarOpened" 
          class="mobile-overlay" 
          @click="closeSidebar"
        ></div>
        
        <el-main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
    
    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      :title="t('user.changePassword')"
      width="500px"
      @close="resetPasswordForm"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="120px"
      >
        <el-form-item :label="t('user.oldPassword')" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item :label="t('user.newPassword')" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item :label="t('user.confirmPassword')" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="submitPasswordChange">{{ t('common.confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 个人资料对话框 -->
    <el-dialog
      v-model="profileDialogVisible"
      :title="t('user.profile')"
      width="600px"
      @close="resetProfileForm"
    >
      <el-form
        ref="profileFormRef"
        :model="userProfile"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="24" style="text-align: center; margin-bottom: 20px;">
            <el-avatar :size="80" :src="userAvatar" style="margin-bottom: 15px;">
              {{ userInitial }}
            </el-avatar>
            <h3>{{ userProfile.name }}</h3>
          </el-col>
        </el-row>
        
        <el-form-item :label="t('user.userName')">
          <el-input v-model="userProfile.name" readonly />
        </el-form-item>
        
        <el-form-item :label="t('user.userEmail')">
          <el-input v-model="userProfile.email" readonly />
        </el-form-item>
        
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import SidebarMenu from '@/components/SidebarMenu.vue'
import { useI18n } from 'vue-i18n'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'

// 国际化
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

// 响应式相关
const isMobile = ref(false)
const searchQuery = ref('')

// 侧边栏状态
const sidebarOpened = computed(() => appStore.sidebarOpened)

// 当前语言文本
const currentLanguageText = computed(() => {
  return locale.value === 'zh-CN' ? '中文' : 'English'
})

// 用户信息
const userAvatar = computed(() => {
  return userStore.currentUser?.avatar || ''
})

const userInitial = computed(() => {
  return userStore.currentUser?.name?.charAt(0) || '?'
})

// 修改密码相关
const passwordDialogVisible = ref(false)
const passwordFormRef = ref<FormInstance>()
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 个人资料相关
const profileDialogVisible = ref(false)
const profileFormRef = ref<FormInstance>()
const userProfile = reactive({
  name: userStore.currentUser?.name || '',
  email: userStore.currentUser?.email || '',
  role: userStore.currentUser?.role || ''
})

// 密码验证规则
const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error(t('user.confirmPasswordRequired')))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error(t('user.passwordsDoNotMatch')))
  } else {
    callback()
  }
}

const passwordRules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: t('user.oldPasswordRequired'), trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: t('user.newPasswordRequired'), trigger: 'blur' },
    { min: 6, message: t('user.passwordMinLength'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
})

const profileRules: FormRules = {
  name: [
    { required: true, message: t('common.pleaseEnter') + t('user.userName'), trigger: 'blur' }
  ],
  email: [
    { required: true, message: t('common.pleaseEnter') + t('user.userEmail'), trigger: 'blur' },
    { type: 'email', message: t('common.pleaseEnter') + t('user.userEmail'), trigger: 'blur' }
  ]
}

// 添加日期格式化函数
const formatDate = (dateString?: string) => {
  if (!dateString) return '从未登录'
  try {
    const date = new Date(dateString)
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '无效日期'
    }
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  } catch (error) {
    console.error('日期格式化错误:', error)
    return '日期解析错误'
  }
}

// 检测屏幕尺寸
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    appStore.closeSidebar()
  }
}

onMounted(() => {
  // 监听窗口大小变化
  window.addEventListener('resize', checkScreenSize)
  
  // 初始检查屏幕尺寸
  checkScreenSize()
  
  // 初始化权限路由
  permissionStore.initRoutes()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// 切换侧边栏
const toggleSidebar = () => {
  appStore.toggleSidebar()
}

// 关闭侧边栏（移动端）
const closeSidebar = () => {
  appStore.closeSidebar()
}

// 切换语言
const switchLanguage = (lang: string) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
  
  // 更新Element Plus的语言环境
  location.reload()
}

// 处理用户命令
const handleUserCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      // 更新个人资料表单数据
      if (userStore.currentUser) {
        userProfile.name = userStore.currentUser.name || ''
        userProfile.email = userStore.currentUser.email || ''
        userProfile.role = userStore.currentUser.role || ''
      }
      profileDialogVisible.value = true
      break
    case 'changePassword':
      passwordDialogVisible.value = true
      break
    case 'logout':
      await userStore.logout()
      router.push('/login')
      break
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}

// 重置个人资料表单
const resetProfileForm = () => {
  if (userStore.currentUser) {
    userProfile.name = userStore.currentUser.name || ''
    userProfile.email = userStore.currentUser.email || ''
    userProfile.role = userStore.currentUser.role || ''
  }
}

// 提交密码修改
const submitPasswordChange = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    await userStore.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
    passwordDialogVisible.value = false
    resetPasswordForm()
  } catch (error) {
    // 表单验证失败或密码修改失败已在ElMessage中处理
  }
}
</script>

<style scoped lang="scss">
.modern-layout {
  height: 100vh;
  overflow: hidden;
}

.main-container {
  height: 100%;
}

.modern-sidebar {
  background-color: #001529;
  transition: width 0.28s;
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.1);
  z-index: 1001;
  
  .sidebar-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    
    .logo-section {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #002140;
      
      .logo-img {
        width: 32px;
        height: 32px;
        margin-right: 12px;
      }
      
      .logo-text {
        color: #ffffff;
        font-size: 16px;
        font-weight: 600;
        white-space: nowrap;
      }
    }
  }
}

.content-container {
  flex-direction: column;
  height: 100%;
}

.modern-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 999;
  
  .header-left {
    display: flex;
    align-items: center;
    
    .menu-toggle {
      margin-right: 20px;
      z-index: 1002; // 确保菜单按钮在最上层
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .language-btn {
      color: #606266;
      background: transparent;
      border: none;
      
      &:hover {
        color: #409EFF;
        background: #f5f7fa;
      }
    }
    
    .user-profile {
      display: flex;
      align-items: center;
      cursor: pointer;
      
      .user-name {
        margin: 0 8px;
        color: #606266;
      }
    }
  }
}

.mobile-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
}

.main-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background-color: #f0f2f5;
  position: relative;
  z-index: 1;
}

// 面包屑导航 - 去重并过滤

.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>