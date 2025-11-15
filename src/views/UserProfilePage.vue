<template>
  <div v-if="isLoading" class="loading-state">
    <el-skeleton :rows="5" animated />
  </div>

  <el-row v-else-if="user" :gutter="20">
    <el-col :span="8">
      <el-card class="user-card">
        <div class="user-avatar-section">
          <el-avatar :size="100" :src="user.avatarUrl || defaultAvatar" />
          <h2>{{ user.username }}</h2>
          <p class="bio">{{ user.bio || '这个人很懒，什么都没留下...' }}</p>

          <el-button v-if="isMySelf" type="primary" @click="handleChangeAvatar">
            更改头像
          </el-button>
          <p v-if="isMySelf" class="avatar-tip">
            点击上传.jpg/png文件, 且不超过2MB.
          </p>
        </div>
      </el-card>
    </el-col>

    <el-col :span="16">
      <el-card class="profile-card">
        <template #header>
          <div class="card-header">
            <span>详细信息</span>
            <el-button
              v-if="!isEditing && isMySelf"
              type="primary"
              link
              @click="enterEditMode"
            >
              编辑资料
            </el-button>
          </div>
        </template>

        <el-descriptions v-if="!isEditing" :column="1" border>
          <el-descriptions-item label-class-name="profile-label" label="用户名">
            {{ user.username }}
          </el-descriptions-item>
          <el-descriptions-item label-class-name="profile-label" label="性别">
            <el-tag :type="user.gender === 1 ? '' : 'danger'" size="small">
              {{ user.gender === 1 ? '男' : (user.gender === 0 ? '女' : '未设置') }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label-class-name="profile-label" label="电话">
            {{ user.phone || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label-class-name="profile-label" label="邮箱">
            {{ user.email || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label-class-name="profile-label" label="标签">
            <el-tag
              v-for="tag in user.tags"
              :key="tag"
              type="success"
              style="margin-right: 5px"
            >
              {{ tag }}
            </el-tag>
            <span v-if="!user.tags || user.tags.length === 0">暂无标签</span>
          </el-descriptions-item>
        </el-descriptions>

        <el-form v-else ref="formRef" :model="editForm" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editForm.username" />
          </el-form-item>
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="editForm.gender">
              <el-radio :value="1">男</el-radio>
              <el-radio :value="0">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="电话" prop="phone">
            <el-input v-model="editForm.phone" placeholder="请输入电话" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email" placeholder="请输入邮箱" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSave" :loading="isSaving">保存</el-button>
            <el-button @click="handleCancel">取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-col>
  </el-row>

  <el-empty v-else description="未找到该用户" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElSkeleton } from 'element-plus';
import axios from 'axios';

// --- 状态定义 (State) ---
const route = useRoute();
const user = ref<any>(null);
const editForm = ref<any>({});
const isEditing = ref(false);
const isLoading = ref(true);
const isSaving = ref(false);
const isMySelf = ref(false);
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// --- 数据流：核心逻辑 ---

/**
 * 智能的数据获取函数
 */
const fetchUserData = async () => {
  isLoading.value = true;
  isEditing.value = false;

  const isViewingSelf = route.name === 'Profile';
  isMySelf.value = isViewingSelf;

  let apiUrl = '';
  if (isViewingSelf) {
    apiUrl = '/api/user/current';
  } else {
    const userId = route.params.id;
    if (!userId) {
      ElMessage.error('用户 ID 无效');
      isLoading.value = false;
      return;
    }
    apiUrl = `/api/user/${userId}`;
  }

  try {
    const res = await axios.get(apiUrl);
    if (res.data.code === 0) {
      user.value = res.data.data;
    } else {
      ElMessage.error(res.data.message || '获取用户信息失败');
      user.value = null;
    }
  } catch (error: any) {
    const errMsg = error.response?.data?.message || '获取用户信息失败';
    ElMessage.error(errMsg);
    user.value = null;
  } finally {
    isLoading.value = false;
  }
};

/**
 * 侦听“路由路径”
 */
watch(
  () => route.path,
  () => {
    fetchUserData();
  },
  { immediate: true } // 关键：在组件一加载时就立刻执行一次
);

// --- (编辑逻辑：保持不变，仅供 isMySelf 时使用) ---

const enterEditMode = () => {
  editForm.value = { ...user.value };
  isEditing.value = true;
};

const handleCancel = () => {
  isEditing.value = false;
  editForm.value = {};
};

const handleSave = async () => {
  isSaving.value = true;
  try {
    const res = await axios.put('/api/user/updateinfo', editForm.value);
    if (res.data.code === 0) {
      ElMessage.success('资料更新成功');
      Object.assign(user.value, editForm.value);
      isEditing.value = false;
    } else {
      ElMessage.error(res.data.message);
    }
    // 【【【 案 件 修 复 】】】
    // 删除了  中多余的 "t)"
  } catch (error: any) {
    const errMsg = error.response?.data?.message || '请求失败';
    ElMessage.error(errMsg);
  } finally {
    isSaving.value = false;
  }
};

const handleChangeAvatar = () => {
  ElMessage.info('“更改头像”功能正在开发中...');
};
</script>

<style scoped>
.profile-card {
  margin-bottom: 20px;
}
.user-card .user-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}
.user-card h2 {
  margin: 15px 0 5px;
}
.user-card .bio {
  color: #888;
  font-size: 14px;
  margin-bottom: 20px;
}
.user-card .avatar-tip {
  font-size: 12px;
  color: #aaa;
  margin-top: 10px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
:deep(.el-descriptions__label.profile-label) {
  width: 100px;
}
.loading-state {
  padding: 20px;
}
</style>
