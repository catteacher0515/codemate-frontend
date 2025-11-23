<template>
  <div class="match-page-container">
    <div class="glass-panel search-panel">
      <el-input
        v-model="searchText"
        placeholder="搜索代号或技能 (如: Java, 潜水员)"
        class="search-input"
        prefix-icon="Search"
        @keyup.enter="handleSearch"
        clearable
      >
        <template #append>
          <el-button class="search-btn" @click="handleSearch">
            <el-icon style="font-size: 18px; margin-right: 4px;"><Search /></el-icon>
            <span>搜索</span>
          </el-button>
        </template>
      </el-input>

      <div class="custom-tabs">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'tech' }"
          @click="activeTab = 'tech'"
        >
          技术栈
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'grade' }"
          @click="activeTab = 'grade'"
        >
          等级
        </div>
      </div>

      <div class="tag-cloud">
        <template v-if="activeTab === 'tech'">
          <span
            v-for="tag in techTags"
            :key="tag"
            class="selectable-tag"
            :class="{ selected: isActiveTag(tag) }"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </span>
        </template>

        <template v-if="activeTab === 'grade'">
          <span
            v-for="tag in gradeTags"
            :key="tag"
            class="selectable-tag"
            :class="{ selected: isActiveTag(tag) }"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </span>
        </template>
      </div>
    </div>

    <div class="results-area" v-loading="isLoading" element-loading-background="rgba(0, 0, 0, 0.5)">
      <el-row :gutter="20" v-if="userList.length > 0">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="user in userList" :key="user.id" style="margin-bottom: 20px;">
          <UserCard :user="user" @cardClicked="goToUserProfile" />
        </el-col>
      </el-row>

      <div v-else-if="!isLoading" class="empty-state">
        <img src="https://cdn-icons-png.flaticon.com/512/7486/7486747.png" alt="Empty" class="empty-icon" />
        <p>声呐未探测到目标，请尝试调整频率...</p>
      </div>
    </div>

    <div class="fab-container" @click="goToCreateTeam">
      <div class="fab-button">
        <el-icon><Plus /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import qs from 'qs';
import { Search, Plus } from '@element-plus/icons-vue';
import UserCard from '@/components/UserCard.vue';

// --- 类型定义 ---
interface UserType {
  id: number;
  username: string;
  userAccount: string;
  avatarUrl: string;
  tags: string[];
  // ...其他字段
}

// --- 状态 ---
const router = useRouter();
const isLoading = ref(true);
const userList = ref<UserType[]>([]);
const activeTab = ref('tech');
const techTags = ['Java', 'Go', 'Python', 'Vue', 'React', 'C++', 'Spring', 'Redis'];
// 【新增】年级标签库
const gradeTags = ['大一', '大二', '大三', '大四', '研一', '研二', '已毕业'];
const activeTags = ref<string[]>([]);
const searchText = ref('');

const { proxy } = getCurrentInstance() as any;
const ElMessage = proxy.$message;

// --- 逻辑 ---
const addFakeTags = (users: any[]) => {
  users.forEach(user => {
    if(!user.tags || user.tags.length === 0) {
      user.tags = ['Java', '深海迷航', 'Lv.5'];
    }
  });
};

const fetchUsersByTags = async () => {
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
      ElMessage.error(`搜索失败: ${response.data.message}`);
    }
  } catch (err: any) {
    userList.value = [];
  } finally {
    isLoading.value = false;
  }
};

const fetchUsersByKeyword = async () => {
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
      ElMessage.error(response.data.message);
    }
  } catch (err) {
    userList.value = [];
  } finally {
    isLoading.value = false;
  }
};

const toggleTag = (tag: string) => {
  searchText.value = '';
  const index = activeTags.value.indexOf(tag);
  if (index > -1) activeTags.value.splice(index, 1);
  else activeTags.value.push(tag);
  fetchUsersByTags();
};

const handleSearch = () => {
  activeTags.value = [];
  fetchUsersByKeyword();
};

const isActiveTag = (tag: string) => activeTags.value.includes(tag);
const goToCreateTeam = () => router.push('/team/create');

const goToUserProfile = (userId: number) => {
  // 【关键修复】执行路由跳转，前往 /user/{id}
  router.push(`/user/${userId}`);
};

onMounted(() => fetchUsersByTags());
</script>

<style scoped>
.match-page-container {
  padding: 0 20px;
}

/* === 顶部面板 === */
.glass-panel {
  background: rgba(20, 30, 48, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

/* 搜索框深度定制 */
:deep(.el-input__wrapper) {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

:deep(.el-input-group__append) {
  background-color: transparent !important;
  border: none !important;
  padding: 0 !important;
  box-shadow: none !important;
}

/* 【关键修复】搜索按钮 */
.search-btn {
  border-radius: 0 8px 8px 0 !important;
  height: 100%;
  margin: 0 !important;
  padding: 0 25px !important;
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-blue)) !important;
  border: none !important;
  /* 文字颜色改为深色，与亮背景形成高反差 */
  color: #0f2027 !important;
  font-weight: 800 !important;
  font-size: 14px !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
}

.search-btn:hover {
  filter: brightness(1.1);
  box-shadow: -5px 0 15px rgba(0, 242, 234, 0.4);
}

/* === 标签切换栏 === */
.custom-tabs {
  display: flex;
  gap: 40px;
  margin: 25px 0 20px 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
}
.tab-item {
  font-size: 16px;
  /* 默认颜色：亮灰色，确保可见 */
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
  padding: 5px 10px;
  font-weight: 500;
}
.tab-item:hover {
  color: #fff;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
}
.tab-item.active {
  color: var(--neon-cyan);
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 242, 234, 0.4);
}
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -11px;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--neon-cyan);
  box-shadow: 0 -2px 8px var(--neon-cyan);
  border-radius: 3px 3px 0 0;
}

/* 标签云 */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 15px;
}
.selectable-tag {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  /* 【关键修复】未选中状态：深色背景 + 明显边框 */
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s;
}
.selectable-tag:hover {
  border-color: var(--neon-cyan);
  color: #fff;
  transform: translateY(-2px);
}
.selectable-tag.selected {
  background: linear-gradient(45deg, var(--neon-blue), var(--neon-cyan));
  border: none;
  color: #000;
  font-weight: bold;
  box-shadow: 0 0 15px rgba(0, 242, 234, 0.4);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.empty-icon {
  /* 强制缩小尺寸 */
  width: 80px !important;
  height: auto;
  opacity: 0.6;
  margin-bottom: 15px;
  filter: drop-shadow(0 0 10px rgba(0, 242, 234, 0.1)) hue-rotate(180deg) brightness(0.9);
}

.results-area {
  min-height: 200px;
}

.fab-container {
  position: fixed;
  bottom: 40px;
  right: 40px;
  z-index: 100;
}
.fab-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--neon-cyan), var(--neon-blue));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28px;
  box-shadow: 0 10px 30px rgba(0, 242, 234, 0.4);
  cursor: pointer;
  transition: transform 0.3s;
}
.fab-button:hover {
  transform: rotate(90deg) scale(1.1);
  box-shadow: 0 15px 40px rgba(0, 242, 234, 0.6);
}
</style>
