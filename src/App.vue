<!-- src/App.vue -->
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from './stores/app'
import { useUserStore } from './stores/user'

const appStore = useAppStore()
const userStore = useUserStore()

onMounted(() => {
  // 初始化应用设置
  appStore.initSettings()
  // 初始化用户状态
  userStore.initUser()
})
</script>

<style lang="scss">
#app {
  height: 100vh;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

// 全局样式重置
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}
</style>