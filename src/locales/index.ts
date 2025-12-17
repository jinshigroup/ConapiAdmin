// src/locales/index.ts
import {createI18n, type I18nOptions} from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

// 定义支持的语言类型
export const SUPPORTED_LOCALES = ['zh-CN', 'en-US'] as const
export type SupportedLocale = typeof SUPPORTED_LOCALES[number]

// 消息对象类型定义
const messages: Record<SupportedLocale, any> = {
    'zh-CN': zhCN, 'en-US': enUS
}

// 获取初始语言设置
const getInitialLocale = (): SupportedLocale => {
    // 从 localStorage 获取用户偏好设置
    const savedLocale = localStorage.getItem('locale')
    if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale as SupportedLocale)) {
        return savedLocale as SupportedLocale
    }

    // 从浏览器语言检测
    const browserLocale = navigator.language
    if (browserLocale.startsWith('zh')) {
        return 'zh-CN'
    }

    // 默认返回中文
    return 'zh-CN'
}

// i18n 配置选项
const i18nOptions: I18nOptions = {
    legacy: false, locale: getInitialLocale(), fallbackLocale: 'en-US', messages
}

const i18n = createI18n(i18nOptions)

// 语言切换函数
export const switchLanguage = (locale: SupportedLocale) => {
    if (SUPPORTED_LOCALES.includes(locale)) {
        (i18n.global.locale as unknown as { value: string }).value = locale
        localStorage.setItem('locale', locale)
    }
}

export default i18n