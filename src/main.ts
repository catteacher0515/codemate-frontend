// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 1. 导入 Element Plus 及其样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 【关键修复】2. 导入我们自定义的“深海全局样式”
// (这一行非常重要，它包含了清除白边和全局变量的定义)
import './assets/main.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
