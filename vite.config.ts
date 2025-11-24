import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite' // 1. 引入 loadEnv
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
// 2. 将配置改为函数形式: ({ mode }) => { ... }
export default defineConfig(({ mode }) => {
  // 3. 加载当前环境的变量
  // process.cwd(): 获取当前工作目录
  // '': 加载所有环境变量(不管是否有 VITE_ 前缀)
  const env = loadEnv(mode, process.cwd(), '')

  return {
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
        // 4. 使用环境变量替换硬编码
        '/api': {
          target: env.VITE_API_BASE_URL, // <--- 这里变成了变量!
          changeOrigin: true,
          ws: true
        },
      }
    },
    define: {
      global: 'window',
    },
  }
})
