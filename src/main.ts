// src/main.ts (v2.0 - “最终手动”版)

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 【【【 1. 导入 Element Plus 库 (JS) 】】】
import ElementPlus from 'element-plus'
// 【【【 2. 导入 Element Plus 样式 (CSS) (这个你已有了) 】】】
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 【【【 3. “全局安装” Element Plus 】】】
// (这一行代码，会一次性把 ElButton, ElFloatButton, ElMessage 等
//  所有东西都注册为“全局组件”和“全局 API”)
app.use(ElementPlus)

app.mount('#app')
