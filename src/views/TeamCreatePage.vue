<template>
  <div class="minimal-page">
    <h1>“重塑”创建队伍页 (最小可行版)</h1>
    <p>
      目标：使用 `POST /api/team/create` 契约，提交表单。
    </p>

    <div class="form-group">
      <label for="name">队伍名称:</label>
      <input id="name" v-model.trim="form.name" placeholder="输入队伍名称" />
    </div>
    <div class="form-group">
      <label for="description">队伍描述:</label>
      <textarea id="description" v-model="form.description" placeholder="输入队伍描述"></textarea>
    </div>
    <div class="form-group">
      <label for="maxNum">最大人数:</label>
      <input id="maxNum" v-model.number="form.maxNum" type="number" min="2" max="10" />
    </div>
    <div class="form-group">
      <label for="expireTime">过期时间:</label>
      <input id="expireTime" v-model="form.expireTime" type="datetime-local" />
    </div>
    <div class="form-group">
      <label for="status">队伍状态:</label>
      <select id="status" v-model.number="form.status">
        <option value="0">公开</option>
        <option value="1">私有</option>
        <option value="2">加密</option>
      </select>
    </div>
    <div v-if="form.status === 2" class="form-group password-field">
      <label for="password">队伍密码 (加密时必填):</label>
      <input id="password" v-model="form.password" type="password" />
    </div>
    <div class="form-group">
      <label for="tags">标签 (逗号分隔):</label>
      <input id="tags" v-model="tagsInput" placeholder="e.g., Java,Vue,Spring" />
    </div>

    <button @click="handleCreate" class="fetch-button">
      【点击这里】创建队伍
    </button>

    <hr>

    <div v-if="isLoading">
      <h3>状态：正在创建...</h3>
    </div>
    <div v-if="error">
      <h3>状态：创建失败！</h3>
      <pre class="error-box">{{ error }}</pre>
    </div>
    <div v-if="responseData">
      <h3>状态：创建成功！</h3>
      <p>后端返回的新队伍 ID 如下：</p>
      <pre class="data-box">{{ responseData }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
// --- 依赖 ---
// 【【【 v1.2 核心修复：移除未使用的 'computed' 】】】
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

// --- 状态定义 ---
// (1) 表单数据
const form = ref({
  name: "我的第三支队伍", // (又改个名)
  description: "这是一个很棒的队伍",
  maxNum: 5,
  expireTime: "",
  status: 0,
  password: "",
  tags: [] as string[]
});

// (2) 中间状态
const tagsInput = ref("Java,Vue");

// (3) 响应状态
const isLoading = ref(false);
const error = ref<string | null>(null);
const responseData = ref<any | null>(null);
const router = useRouter();

// --- 核心“火力点” (v1.1 胜利跳转版) ---
const handleCreate = async () => {
  // (重置状态)
  isLoading.value = true;
  error.value = null;
  responseData.value = null;

  // (数据处理)
  form.value.tags = tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
  if (form.value.status === 2 && !form.value.password) {
    error.value = "“加密”队伍必须设置密码！";
    isLoading.value = false;
    return;
  }
  if (form.value.status !== 2) {
    form.value.password = "";
  }

  try {
    console.log("【v1.2】正在启动 API 请求...");
    console.log("【v1.2】发送的数据 (Body):", form.value);

    // (API 调用)
    const response = await axios.post('/api/team/create', form.value);

    // (业务失败)
    if (response.data.code !== 0) {
      console.error("【v1.2】API 业务失败:", response.data);
      throw new Error(`后端业务失败: ${response.data.message} (Code: ${response.data.code})`);
    }

    // --- 成功！---
    console.log("【v1.2】API 成功:", response.data);
    isLoading.value = false;
    responseData.value = response.data.data;

    // (胜利跳转)
    const newTeamId = response.data.data;
    setTimeout(() => {
      router.push(`/team/${newTeamId}`);
    }, 2000);

  } catch (err: any) {
    // (失败)
    console.error("【v1.2】API 捕获到错误:", err);
    isLoading.value = false;

    if (err.response && err.response.data) {
      error.value = `后端返回错误: ${JSON.stringify(err.response.data)}`;
    } else {
      error.value = err.message || '一个未知的网络错误发生了';
    }
  }
};
</script>

<style scoped>
/* (v1.0 样式 - 保持不变) */
.minimal-page {
  padding: 20px;
  font-family: Arial, sans-serif;
  line-height: 1.6;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.form-group input,
.form-group textarea,
.form-group select {
  width: 400px;
  padding: 8px;
  font-size: 14px;
  box-sizing: border-box;
}
.form-group textarea {
  height: 80px;
  resize: vertical;
}
.password-field input {
  border: 1px solid #d8000c;
}
.fetch-button {
  padding: 10px 15px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.fetch-button:hover {
  background-color: #0056b3;
}
.error-box {
  background-color: #ffebeb;
  color: #d8000c;
  border: 1px solid #d8000c;
  padding: 10px;
  white-space: pre-wrap;
}
.data-box {
  background-color: #e6f7ff;
  color: #0056b3;
  border: 1px solid #007bff;
  padding: 10px;
  white-space: pre-wrap;
}
hr {
  margin: 20px 0;
}
</style>
