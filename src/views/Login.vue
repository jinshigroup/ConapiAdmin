<!-- src/views/Login.vue -->
<template>
  <div class="login-container">
    <!-- 将语言切换按钮移到页面右上角 -->
    <div class="language-switch">
      <el-dropdown @command="switchLanguage">
        <el-button class="language-button">
          {{ locale === 'zh-CN' ? '中文' : 'English' }}
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
            <el-dropdown-item command="en-US">English</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div class="login-background">
      <div class="login-particles"></div>
    </div>

    <div class="login-form-container">
      <el-card class="login-card">
        <div class="login-header">
          <img alt="Conapi" class="login-logo" src="@/assets/logo.png"/>
          <h1 class="login-title">{{ t('login.title') }}</h1>
          <p class="login-subtitle">{{ t('login.subtitle') }}</p>
        </div>

        <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            @keyup.enter="handleLogin"
        >
          <el-form-item prop="email">
            <el-input
                v-model="loginForm.email"
                :placeholder="t('login.username')"
                prefix-icon="User"
                size="large"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
                v-model="loginForm.password"
                :placeholder="t('login.password')"
                prefix-icon="Lock"
                show-password
                size="large"
                type="password"
            />
          </el-form-item>

          <el-form-item>
            <el-button
                :loading="loading"
                class="login-button"
                size="large"
                type="primary"
                @click="handleLogin"
            >
              {{ t('login.login') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { switchLanguage } from '@/locales' // 导入语言切换函数

const { t, locale } = useI18n()
const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  email: '',
  password: ''
})

const loginRules: FormRules = {
  email: [
    { required: true, message: t('login.usernameRequired'), trigger: 'blur' },
    { type: 'email', message: t('login.invalidEmail'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('login.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('login.passwordMinLength'), trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    await userStore.login({
      email: loginForm.email,
      password: loginForm.password
    })
    
    // 登录成功后，始终跳转到仪表板
    router.push('/dashboard')
  } catch (error: any) {
    // 错误消息已经在 userStore.login 中处理过了，这里不需要再处理
    console.error('Login error:', error)
    console.error('Error message:', error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  // 页面右上角语言切换按钮样式
  .language-switch {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1000; // 确保在最上层

    .language-button {
      color: rgba(255, 255, 255, 0.8);
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 8px 12px;

      &:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }

  .login-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    .login-particles {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
    }
  }

  .login-form-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 400px;
    padding: 20px;

    .login-card {
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      border: none;

      .login-header {
        text-align: center;
        margin-bottom: 30px;

        .login-logo {
          width: 100px;
          height: 100px;
        }

        .login-title {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 8px 0;
        }

        .login-subtitle {
          font-size: 14px;
          color: #909399;
          margin: 0;
        }
      }

      .login-form {
        .login-button {
          width: 100%;
          height: 48px;
          font-size: 16px;
        }
      }
    }
  }
}
</style>