// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

import App from './App.vue'
import router from './router'
import i18n from './locales'

import './styles/index.scss'

const app = createApp(App)

/**
 * 注册Element Plus的所有图标组件
 * 遍历ElementPlusIconsVue对象中的所有图标组件，并将它们全局注册到Vue应用中
 * 这样可以在模板中直接使用这些图标组件而无需单独导入
 */
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

/**
 * 创建并初始化Pinia状态管理实例
 * Pinia是Vue的轻量级状态管理库，用于在组件间共享和管理应用状态
 * @returns {object} 返回创建的Pinia实例
 */
const pinia = createPinia()

// 获取初始语言设置
const getInitialLocale = (): string => {
    const savedLocale = localStorage.getItem('locale')
    if (savedLocale && (savedLocale === 'zh-CN' || savedLocale === 'en-US')) {
        return savedLocale
    }
    return 'zh-CN'
}

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(ElementPlus, {
    locale: getInitialLocale() === 'zh-CN' ? zhCn : en,
    size: 'default'
})

app.mount('#app')