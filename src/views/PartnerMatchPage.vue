<template>
  <div class="partner-match-page">
    <el-input
      v-model="searchText"
      placeholder="按“用户名”模糊搜索"
      class="input-with-select"
    >
      <template #append>
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
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
        <el-tab-pane label="年级" name="grade">...</el-tab-pane>
        <el-tab-pane label="状态" name="status">...</el-tab-pane>
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

    <ElFloatButton
      type="primary"
      :icon="Plus"
      description="创建队伍"
      @click="router.push('/team/create')"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Search, Plus } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import qs from 'qs';
import UserCard from '@/components/UserCard.vue';

// (状态定义)
const searchText = ref('');
const activeTab = ref('tech');
const techTags = ['Java', 'Go', 'Python', 'Vue', 'React', 'C++'];
interface UserType {
  id: number;
  username: string;
  userAccount: string;
  avatarUrl: string;
  tags: string[];
}
const userList = ref<UserType[]>([]);
const isLoading = ref(true);
const activeTags = ref<string[]>([]);
const router = useRouter();

/**
 * 【火力点 A：按“标签”搜索】
 */
const fetchUsersByTags = async () => {
  console.log("【开火 A】正在按标签搜索:", activeTags.value);
  isLoading.value = true;
  try {
    const response = await axios.get('/api/user/search/tags', {
      params: {
        tagNames: activeTags.value
      },
      paramsSerializer: params => {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      }
    });
    if (response.data.code === 0) {
      userList.value = response.data.data;
      // (临时“假” tags)
      userList.value.forEach(user => { user.tags = ['Java', '大一', '男']; });
    } else {
      // (ElMessage 由 AutoImport 自动导入)
      ElMessage.error(`标签搜索失败: ${response.data.message}`);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "未知错误";
    ElMessage.error(`标签搜索失败: ${errorMessage}`);
  } finally {
    isLoading.value = false;
  }
};

/**
 * 【火力点 B：按“关键词”搜索】
 */
const fetchUsersByKeyword = async () => {
  console.log("【开火 B】正在按关键词搜索:", searchText.value);
  if (searchText.value === '') {
    fetchUsersByTags(); // (修正：如果为空，应重新按标签搜索)
    return;
  }
  isLoading.value = true;
  try {
    const response = await axios.get('/api/user/search', {
      params: {
        searchText: searchText.value
      }
    });
    if (response.data.code === 0) {
      userList.value = response.data.data;
      // (临时“假” tags)
      userList.value.forEach(user => { user.tags = ['Java', '大一', '男']; });
    } else {
      ElMessage.error(`搜索失败: ${response.data.message}`);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "未知错误";
    ElMessage.error(`搜索失败: ${errorMessage}`);
  } finally {
    isLoading.value = false;
  }
};

/**
 * “点击”标签的“扳机”
 */
const toggleTag = (tag: string) => {
  searchText.value = ''; // (互斥)
  const index = activeTags.value.indexOf(tag);
  if (index > -1) {
    activeTags.value.splice(index, 1);
  } else {
    activeTags.value.push(tag);
  }
  fetchUsersByTags(); // (主动调用)
};

/**
 * “搜索”按钮的“扳机”
 */
const handleSearch = () => {
  activeTags.value = []; // (互斥)
  fetchUsersByKeyword(); // (主动调用)
};

// (辅助函数：检查标签是否激活)
const isActiveTag = (tag: string) => {
  return activeTags.value.includes(tag);
};

// 页面“挂载”时：
onMounted(() => {
  fetchUsersByTags();
});

// (路由逻辑：跳转到用户详情页)
const goToUserProfile = (userId: number) => {
  router.push(`/user/${userId}`);
};
</script>

<style scoped>
/* (样式保持不变) */
.partner-match-page {
  padding: 20px;
}
.tags-section {
  margin-top: 20px;
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
