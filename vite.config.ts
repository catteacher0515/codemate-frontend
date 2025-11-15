import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// (1) 导入我们新安装的、稳定的解析器
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [
        // (2) 启用 API 自动导入 (负责 ElMessage)
        ElementPlusResolver()
      ],
      // (确保 d.ts 文件被正确生成)
      dts: 'auto-imports.d.ts',
    }),
    Components({
      resolvers: [
        // (3) 启用组件自动导入 (负责 <ElFloatButton>)
        // (并让它自动导入 SASS 样式)
        ElementPlusResolver({ importStyle: "sass" })
      ],
      // (确保 d.ts 文件被正确生成)
      dts: 'components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  // (服务器“代理”SOP 保持不变)
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
