// vite.config.ts (v6.0 - “最终手动”版)

import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 【【【 核心修正 1：我们不再需要 ElementPlusResolver 】】】
// import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      // 【【【 核心修正 2：从 resolvers 数组中移除它 】】】
      resolvers: [
        // ElementPlusResolver({ importStyle: false }) // <--- 彻底删除这一行
      ],
      dts: 'auto-imports.d.ts',
    }),
    Components({
      // 【【【 核心修正 3：从 resolvers 数组中移除它 】】】
      resolvers: [
        // ElementPlusResolver({ importStyle: false }) // <--- 彻底删除这一行
      ],
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
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
