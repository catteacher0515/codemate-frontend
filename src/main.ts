import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// (1) 【【【 核 心 修 复 】】】
// 我们不再信任 SASS，
// 我们手动导入最稳定的、已编译的全局 CSS 文件
import 'element-plus/dist/index.css'

// (2) 导入 Element Plus 的简体中文语言包
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App)

// (3) 【【【 核 心 配 置 】】】
// 注册插件时传入语言配置
app.use(ElementPlus, {
  locale: zhCn,
})

app.use(createPinia())
app.use(router)

app.mount('#app')
