// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

/**
 * Vite 配置文件 配置开发服务器、构建选项、插件等
 */
export default defineConfig({
  plugins: [ //插件配置
    vue() // Vue 插件，用于处理 .vue 文件
  ],
  resolve: { //路径别名配置 用于简化模块导入路径
    alias: {
      '@': resolve(__dirname, 'src') // '@' 别名指向 src 目录
    }
  },
  server: { //开发服务器配置
    port: 3000, // 端口号
    host: true, // 允许外部访问
    open: true, // 启动后自动打开浏览器
    // 代理配置，解决开发环境跨域问题
    proxy: {
      '/api': {
        target: 'http://localhost:8080/', // API 代理目标地址
        changeOrigin: true, // 改变请求源
        timeout: 10000 // 设置超时时间
      },
      '/uploads': {
        target: 'http://localhost:8080/', // 上传文件代理目标地址
        changeOrigin: true, // 改变请求源
        timeout: 30000 // 上传可能需要更长时间
      }
    }
  },
  build: { //构建配置
    outDir: 'docs', // 输出目录
    sourcemap: false, // 是否生成 source map
    rollupOptions: { // Rollup 打包选项
      output: {
        manualChunks: { // 分包优化，提高缓存效率
          vendor: ['vue', 'vue-router', 'pinia'], // Vue 相关库
          elementPlus: ['element-plus']  // UI 组件库
        }
      }
    },
    terserOptions: { // 生产环境优化选项
      compress: {
        drop_console: true, // 生产环境移除 console
        drop_debugger: true // 生产环境移除 debugger
      }
    }
  },
  optimizeDeps: { //依赖优化配置 预构建常用依赖以提高开发服务器启动速度
    include: ['vue', 'vue-router', 'pinia', 'element-plus']
  },
  css: {
    devSourcemap: false
  }
})