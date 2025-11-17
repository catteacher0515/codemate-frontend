// file: src/utils/request.ts

import axios from 'axios';
import { ElMessage } from 'element-plus'; // (基于 main.ts，你已全局安装)

// 【【【 1. 创建“探员” (Axios 实例) 】】】
const service = axios.create({
  // 【【【 2. 配置“总部地址” (baseURL) 】】】
  // (基于“项目架构”，我们知道 Vite 已代理 /api)
  baseURL: '/api',
  timeout: 10000, // 10 秒超时
});

// 【【【 3. 配置“探员拦截器” (Request) 】】】
service.interceptors.request.use(
  (config) => {
    // (这里可以添加 Token/Session 逻辑)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 【【【 4. 配置“战报拦截器” (Response) 】】】
// (这是“重构”的核心：解构 BaseResponse)
service.interceptors.response.use(
  (response) => {
    // (基于 codemate.md，我们知道你的标准响应体)
    const res = response.data;

    // (后端业务成功 code = 0)
    if (res.code === 0) {
      // 【【【 V3.8 裁决：拦截器只返回“核心战果” (data) 】】】
      return res.data;
    } else {
      // (后端业务失败，如 ErrorCode.PARAMS_ERROR)
      ElMessage.error(res.message || '服务异常');
      return Promise.reject(new Error(res.message || 'Error'));
    }
  },
  (error) => {
    // (HTTP 层面 4xx/5xx 错误)
    ElMessage.error(error.message || '网络请求失败');
    return Promise.reject(error);
  }
);

// 【【【 5. “派遣”探员 】】】
export default service;
