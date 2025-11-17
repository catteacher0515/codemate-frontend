<template>
  <div class="profile-page-v2">

    <el-row :gutter="20">

      <el-col :span="8">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>欢迎, {{ form.username || '用户' }}</span>
            </div>
          </template>
          <div class="user-avatar-section">
            <el-avatar :size="100" :src="form.avatarUrl" />
            <el-input
              v-model="form.avatarUrl"
              placeholder="请输入新的头像 URL"
              style="margin-top: 20px;"
            />
            <el-button
              type="primary"
              @click="handleUpdateAvatar"
              style="margin-top: 10px;"
              :loading="isAvatarLoading"
            >
              仅更新头像
            </el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>详细信息</span>
            </div>
          </template>

          <el-descriptions :column="1" border class="profile-descriptions">

            <el-descriptions-item label="用户名">
              <el-input v-model="form.username" />
            </el-descriptions-item>

            <el-descriptions-item label="用户账户">
              <el-input v-model="form.userAccount" :disabled="true" />
            </el-descriptions-item>

            <el-descriptions-item label="性别">
              <el-radio-group v-model="form.gender">
                <el-radio :value="1">男</el-radio>
                <el-radio :value="2">女</el-radio>
                <el-radio :value="0">未知</el-radio>
              </el-radio-group>
            </el-descriptions-item>

            <el-descriptions-item label="邮箱">
              <el-input v-model="form.email" />
            </el-descriptions-item>

            <el-descriptions-item label="电话">
              <el-input v-model="form.phone" />
            </el-descriptions-item>

            <el-descriptions-item label="个人简介">
              <el-input v-model="form.bio" type="textarea" />
            </el-descriptions-item>

            <el-descriptions-item label="标签">
              <el-input v-model="tagsInput" placeholder="e.g., Java,Vue (逗号分隔)" />
            </el-descriptions-item>

          </el-descriptions>

          <div class="save-button-container">
            <el-button
              type="primary"
              @click="handleSaveInfo"
              :loading="isInfoLoading"
            >
              保存所有更新
            </el-button>
          </div>

        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script setup lang="ts">
// --- 依赖 (v1.0 已有) ---
import { ref, onMounted, getCurrentInstance } from 'vue';
import axios from 'axios';

// --- (A) 状态定义 ---
const isLoading = ref(true); // (用于“开场”加载)
const isInfoLoading = ref(false); // (用于“保存信息”按钮)
const isAvatarLoading = ref(false); // (用于“保存头像”按钮)
const error = ref<string | null>(null);

// (获取“全局” $message API)
const { proxy } = getCurrentInstance() as any;
const ElMessage = proxy.$message;

// (v2.0 表单骨架 - 我们新增了 bio 和 tags)
const form = ref({
  id: 0,
  username: '',
  userAccount: '',
  avatarUrl: '',
  gender: 0,
  phone: '',
  email: '',
  bio: '', // (v2.0 新增)
  tags: [] as string[] // (v2.0 新增 - DTO 需要的数组)
});

// (v2.0 新增 - “标签”的中间输入)
const tagsInput = ref("");

// --- (B) 核心“火力点” 1 (开场) ---
// (GET /api/user/current)
const loadCurrentUserData = async () => {
  console.log("【v2.0】正在“开场”：GET /api/user/current");
  isLoading.value = true;
  error.value = null;
  try {
    const response = await axios.get('/api/user/current');
    if (response.data.code === 0) {
      const userData = response.data.data;
      // (将“后端 UserVO”映射到“前端 form”)
      form.value.id = userData.id;
      form.value.username = userData.username;
      form.value.userAccount = userData.userAccount;
      form.value.avatarUrl = userData.avatarUrl;
      form.value.gender = userData.gender;
      form.value.phone = userData.phone;
      form.value.email = userData.email;
      // (v2.0 新增：回填 bio 和 tags)
      form.value.bio = userData.bio || ''; // (假设后端有 bio)
      form.value.tags = userData.tags || []; // (假设后端有 tags)
      tagsInput.value = form.value.tags.join(','); // (将数组转回字符串)
    } else {
      throw new Error(`后端业务失败: ${response.data.message}`);
    }
  } catch (err: any) {
    error.value = `加载用户信息失败: ${err.message}`;
    ElMessage.error(error.value);
  } finally {
    isLoading.value = false;
  }
};

// --- (C) 核心“火力点” 2 (互动 - 保存信息) ---
// (PUT /api/user/updateinfo)
const handleSaveInfo = async () => {
  console.log("【v2.0】“保存信息”：PUT /api/user/updateinfo");
  isInfoLoading.value = true;

  // (v2.0 DTO - 我们现在发送 bio 和 tags)
  // (1. 处理标签)
  form.value.tags = tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  // (2. 组装 DTO)
  const userUpdateDTO = {
    username: form.value.username,
    bio: form.value.bio, // (v2.0 新增)
    email: form.value.email,
    gender: form.value.gender,
    avatarUrl: form.value.avatarUrl,
    // tags: form.value.tags, // (v2.0 新增)
    // (phone 也不在 DTO 里)
  };

  try {
    const response = await axios.put('/api/user/updateinfo', userUpdateDTO);
    if (response.data.code === 0 && response.data.data === true) {
      ElMessage.success('个人资料更新成功！');
      // (重新加载，以防万一)
      await loadCurrentUserData();
    } else {
      throw new Error(`后端业务失败: ${response.data.message}`);
    }
  } catch (err: any) {
    ElMessage.error(`保存失败: ${err.message}`);
  } finally {
    isInfoLoading.value = false;
  }
};

// --- (D) 核心“火力点” 3 (互动 - 保存头像) ---
// (PUT /api/user/update/avatar)
const handleUpdateAvatar = async () => {
  console.log("【v2.0】“保存头像”：PUT /api/user/update/avatar");
  isAvatarLoading.value = true;

  // (严格遵守“契约”)
  const avatarUpdateDTO = {
    userId: form.value.id,
    avatarUrl: form.value.avatarUrl
  };

  try {
    const response = await axios.put('/api/user/update/avatar', avatarUpdateDTO);
    if (response.data.code === 0 && response.data.data === true) {
      ElMessage.success('头像更新成功！');
    } else {
      throw new Error(`后端业务失败: ${response.data.message}`);
    }
  } catch (err: any) {
    ElMessage.error(`头像更新失败: ${err.message}`);
  } finally {
    isAvatarLoading.value = false;
  }
};

// --- (E) 页面“扳机” ---
onMounted(() => {
  loadCurrentUserData();
});
</script>

<style scoped>
/* (v2.0 样式) */
.profile-page-v2 .card-header {
  font-weight: bold;
  font-size: 1.1em;
}
.user-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.profile-descriptions {
  margin-bottom: 20px;
}
.save-button-container {
  display: flex;
  justify-content: flex-end;
}
.loading-state {
  padding: 40px;
  text-align: center;
  color: #888;
}
</style>
