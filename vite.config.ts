import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [],
      dts: 'auto-imports.d.ts',
    }),
    Components({
      resolvers: [],
      dts: 'components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      // 【关键修改】给 /api 代理开启 ws: true
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true // <--- 加上这一行！让 API 代理也能转发 WebSocket
      },
      // (原来的 /ws 代理可以删掉了，反正也不用它了)
    }
  },
  // 3. 【关键修复】手动定义 global 变量
  // 解决 stompjs 在 Vite 环境下报错 "global is not defined" 的问题
  define: {
    global: 'window',
  },
})
