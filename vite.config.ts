// vite.config.ts (V4.0 - 代理已配置，但未重写)
// (基于你的 API 文档，这是 100% 正确的状态)

import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// (ElementPlus 相关的 imports)
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [
        // (保持你 V6.0 手动版的状态，这里为空)
      ],
      dts: 'auto-imports.d.ts',
    }),
    Components({
      resolvers: [
        // (保持你 V6.0 手动版的状态，这里为空)
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
        // (V4.1 的 rewrite: ... 已被移除)
      }
    }
  }
})
