<!-- src/components/layout/SidebarMenu.vue -->
<template>
  <div class="sidebar-menu-wrapper">
    <el-menu
      :default-active="activeMenu"
      :collapse="!sidebarOpened"
      :unique-opened="false"
      mode="vertical"
      background-color="#001529"
      text-color="#fff"
      active-text-color="#409EFF"
      @select="handleMenuSelect"
    >
      <!-- 空的菜单，不显示任何项目 -->
    </el-menu>
  
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '../stores/app.ts'
import { useI18n } from 'vue-i18n'

// 国际化函数
const { t } = useI18n()
// 路由相关信息
const route = useRoute()
const router = useRouter()
// 应用状态管理
const appStore = useAppStore()

// 侧边栏状态计算属性
const sidebarOpened = computed(() => appStore.sidebarOpened)

// 当前激活菜单计算属性
const activeMenu = ref(route.path)

// 监听路由变化，更新激活菜单
watch(
  () => route.path,
  (newPath) => {
    activeMenu.value = newPath
  },
  { immediate: true }
)



/**
 * 处理菜单选择事件
 * @param index 菜单项索引
 */
const handleMenuSelect = async (index: string) => {
  // 使用 router.push 导航到选中的路由
  if (index !== route.path) {
    // 在跳转前发送一个自定义事件，确保任何监听此事件的组件能正确处理
    window.dispatchEvent(new CustomEvent('menu-navigation', { detail: { path: index } }))
    await router.push(index)
  }
}

// 监听语言变化，强制重新计算菜单标题
watch(() => t('dashboard.title'), () => {
  // 当语言改变时，触发重新渲染
})
</script>

<style scoped lang="scss">
.sidebar-menu-wrapper {
  overflow: hidden;
}

:deep(.el-menu) {
  border-right: none;
  min-height: calc(100vh - 60px);
  width: 100%;
  
  .el-menu-item {
    &:hover {
      background-color: #001529 !important;
    }
  }

  .el-menu-item.is-active {
    background-color: #001f3f !important;
  }
}

// 折叠状态下的菜单样式优化
:deep(.el-menu--collapse) {
  .el-menu-item {
    span {
      display: none;
    }
    
    .el-icon {
      margin-right: 0;
    }
  }
}
</style>