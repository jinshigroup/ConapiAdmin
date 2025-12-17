import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarOpened = ref(true)
  const language = ref('zh-CN')
  const theme = ref('light')
  const size = ref('default')
  const pageLoading = ref(false)

  // 切换侧边栏
  const toggleSidebar = () => {
    sidebarOpened.value = !sidebarOpened.value
  }

  // 设置语言
  const setLanguage = (lang: string) => {
    language.value = lang
    localStorage.setItem('language', lang)
  }

  // 设置主题
  const setTheme = (newTheme: string) => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
  }

  // 设置组件尺寸
  const setSize = (newSize: string) => {
    size.value = newSize
    localStorage.setItem('size', newSize)
  }

  // 设置页面加载状态
  const setPageLoading = (loading: boolean) => {
    pageLoading.value = loading
  }

  // 初始化设置
  const initSettings = () => {
    const savedLanguage = localStorage.getItem('language')
    const savedTheme = localStorage.getItem('theme')
    const savedSize = localStorage.getItem('size')
    
    if (savedLanguage) language.value = savedLanguage
    if (savedTheme) theme.value = savedTheme
    if (savedSize) size.value = savedSize
  }

  return {
    sidebarOpened,
    language,
    theme,
    size,
    pageLoading,
    toggleSidebar,
    setLanguage,
    setTheme,
    setSize,
    setPageLoading,
    initSettings
  }
})