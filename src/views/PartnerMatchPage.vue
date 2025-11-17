<template>
  <div class="partner-match-page">
    <el-input
      v-model="searchText"
      placeholder="按“用户名”模糊搜索"
      class="input-with-select"
      @keyup.enter="handleSearch"
    >
      <template #append>
        <el-button type="primary" :icon="SearchIcon" @click="handleSearch">搜索</el-button>
      </template>
    </el-input>

    <div class="tags-section">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="技术栈" name="tech">
          <el-tag
            v-for="tag in techTags"
            :key="tag"
            class="tag-item"
            :effect="isActiveTag(tag) ? 'dark' : 'plain'"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </el-tag>
        </el-tab-pane>
        <el-tab-pane label="年级" name="grade">... (待实现)</el-tab-pane>
      </el-tabs>
    </div>
    <div v-if="isLoading" class="loading-state">
      正在从“后端”拉取“匹配”的用户列表...
    </div>
    <el-row :gutter="20" class="user-card-list" v-else>
      <el-col :span="8" v-for="user in userList" :key="user.id">
        <UserCard
          :user="user"
          @cardClicked="goToUserProfile"
        />
      </el-col>
    </el-row>
    <el-empty v-if="!isLoading && userList.length === 0" description="没有找到匹配的用户" />
    <el-float-button
      type="primary"
      :icon="PlusIcon"
      description="创建队伍"
      @click="goToCreateTeam"
      style="right: 40px"
    />

  </div>
</template>

<script setup lang="ts">
// --- 依赖 ---
import { ref, onMounted, getCurrentInstance } from 'vue'; // 【【 1. 导入 getCurrentInstance 】】
import { useRouter } from 'vue-router';
import axios from 'axios';
import qs from 'qs';
// (2) 【【【 核心修正 5：清理所有 Element Plus 的 import 】】】
// import { ElMessage } from 'element-plus';  // <--- 删除！
import { Search as SearchIcon, Plus as PlusIcon } from '@element-plus/icons-vue';
// (3) 引入“子组件”
import UserCard from '@/components/UserCard.vue';

// --- (A) API 契约定义 (v4.2 已有) ---
interface UserType {
  id: number;
  username: string;
  userAccount: string;
  avatarUrl: string;
  gender: number;
  phone: string;
  email: string;
  userStatus: number;
  userRole: number;
  planetCode: string;
  tags: string[]; // (v4.2 已有)
}

// --- (B) 页面状态 ---
const router = useRouter();
const isLoading = ref(true);
const userList = ref<UserType[]>([]);
// ... (其他状态 ref 保持不变)
const activeTab = ref('tech');
const techTags = ['Java', 'Go', 'Python', 'Vue', 'React', 'C++'];
const activeTags = ref<string[]>([]);
const searchText = ref('');

// 【【【 4. 获取“全局” $message 】】】
const { proxy } = getCurrentInstance() as any;
const ElMessage = proxy.$message;

// --- (C) 核心“火力点” ---
// (v4.2 的 'addFakeTags', 'fetchUsersByTags', 'fetchUsersByKeyword'
//  三个函数... 保持不变)
// (因为我们上面“获取”了 ElMessage，所以它们现在可以“正常工作”了)

const addFakeTags = (users: UserType[]) => {
  users.forEach(user => {
    user.tags = ['Java', '大一', '男'];
  });
};

const fetchUsersByTags = async () => {
  console.log("【v4.3 - 主线】正在按标签搜索:", activeTags.value);
  isLoading.value = true;
  try {
    const response = await axios.get('/api/user/search/tags', {
      params: { tagNames: activeTags.value },
      paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
    });
    if (response.data.code === 0) {
      userList.value = response.data.data;
      addFakeTags(userList.value);
    } else {
      ElMessage.error(`标签搜索失败: ${response.data.message}`);
    }
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || "未知错误";
    ElMessage.error(`标签搜索失败: ${errorMessage}`);
    userList.value = [];
  } finally {
    isLoading.value = false;
  }
};

const fetchUsersByKeyword = async () => {
  console.log("【v4.3 - 支线】正在按关键词搜索:", searchText.value);
  if (searchText.value === '') {
    fetchUsersByTags();
    return;
  }
  isLoading.value = true;
  try {
    const response = await axios.get('/api/user/search', {
      params: { searchText: searchText.value }
    });
    if (response.data.code === 0) {
      userList.value = response.data.data;
      addFakeTags(userList.value);
    } else {
      ElMessage.error(`搜索失败: ${response.data.message}`);
    }
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || err.message || "未知错误";
    ElMessage.error(`搜索失败: ${errorMessage}`);
    userList.value = [];
  } finally {
    isLoading.value = false;
  }
};

// --- (D) 页面“扳机” (v4.2 已有, 保持不变) ---
const toggleTag = (tag: string) => {
  searchText.value = '';
  const index = activeTags.value.indexOf(tag);
  if (index > -1) {
    activeTags.value.splice(index, 1);
  } else {
    activeTags.value.push(tag);
  }
  fetchUsersByTags();
};
const handleSearch = () => {
  activeTags.value = [];
  fetchUsersByKeyword();
};
const goToCreateTeam = () => {
  router.push('/team/create');
};
const isActiveTag = (tag: string) => {
  return activeTags.value.includes(tag);
};
onMounted(() => {
  fetchUsersByTags();
});
const goToUserProfile = (userId: number) => {
  console.log(`(模拟跳转) 准备跳转到用户 ${userId} 的详情页`);
};
</script>

<style scoped>
/* (样式保持不变) */
.input-with-select {
  margin-bottom: 20px;
}
.partner-match-page {
  padding: 20px;
}
.tags-section {
  margin-bottom: 20px;
}
.tag-item {
  margin-right: 8px;
  cursor: pointer;
}
.user-card-list {
  margin-top: 20px;
}
.loading-state {
  padding: 40px;
  text-align: center;
  color: #888;
  font-size: 1.2em;
}
.el-empty {
  margin-top: 40px;
}
</style>
