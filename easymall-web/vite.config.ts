import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5174,  // 用户端前端端口
    proxy: {
      '/api': {
        target: 'http://localhost:6050',  // 指向用户端后端
        changeOrigin: true
        // 删除 rewrite 这行，保留 /api 前缀
      }
    }
  }
})