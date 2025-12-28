// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({ //Vite 配置文件 配置开发服务器、构建选项、插件等
  plugins: [ //插件配置
    vue() // Vue 插件，用于处理 .vue 文件
  ],
  server: { //开发服务器配置
    proxy: { // 代理配置，解决开发环境跨域问题
      '/api': {
        target: 'http://localhost:8080'
      }
    }
  },
  build: { //构建配置
    outDir: 'docs' // 输出目录
  }
})