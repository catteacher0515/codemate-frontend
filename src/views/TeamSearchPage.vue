<template>
  <div class="team-search-container">
    <div class="glass-panel search-panel">
      <el-input
        v-model="searchText"
        placeholder="搜索船队代号或描述..."
        class="search-input"
        prefix-icon="Search"
        @keyup.enter="doSearch"
        clearable
      >
        <template #append>
          <el-button icon="Search" class="search-btn" @click="doSearch" />
        </template>
      </el-input>
    </div>

    <div class="radar-screen" v-loading="loading" element-loading-background="rgba(0,0,0,0.5)">
      <div class="team-grid" v-if="teamList.length > 0">
        <div
          v-for="team in teamList"
          :key="team.id"
          class="team-glass-card"
          @click="router.push(`/team/${team.id}`)"
        >
          <div class="status-light" :class="getStatusClass(team.status)"></div>

          <div class="card-header">
            <h3 class="team-name">{{ team.name }}</h3>
            <div class="status-badge" :class="getStatusClass(team.status)">
              {{ getStatusText(team.status) }}
            </div>
          </div>

          <p class="team-desc">{{ team.description || '暂无航行日志...' }}</p>

          <div class="card-footer">
            <div class="captain-info">
              <el-avatar :size="24" :src="team.teamCaptain?.avatarUrl" />
              <span class="captain-name">{{ team.teamCaptain?.username }}</span>
            </div>

            <div class="member-count">
              <el-icon><User /></el-icon>
              <span>{{ team.hasJoinNum || 0 }} / {{ team.maxNum }}</span>
            </div>
          </div>

          <button class="quick-join-btn" @click.stop="handleJoinTeam(team)">
            申请登船
          </button>
        </div>
      </div>

      <div v-else-if="!loading" class="empty-state">
        <img src="https://cdn-icons-png.flaticon.com/512/7486/7486747.png" alt="Empty" class="empty-icon" />
        <p>雷达扫描完毕，未发现活跃船队。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { Search, User } from '@element-plus/icons-vue';
import { searchTeams, joinTeam } from '@/api/team';
import type { TeamSearchDTO, TeamVO, TeamPageVO, TeamJoinDTO } from '@/models/team';
import { ElMessageBox } from 'element-plus';

const searchText = ref('');
const teamList = ref<TeamVO[]>([]);
const loading = ref(false);
const router = useRouter();
const searchParams = ref<TeamSearchDTO>({
  searchText: '',
  current: 1,
  pageSize: 10,
});

const { proxy } = getCurrentInstance() as any;
const ElMessage = proxy.$message;

const doSearch = async () => {
  loading.value = true;
  try {
    searchParams.value.searchText = searchText.value;
    const response = await searchTeams(searchParams.value);

    if (response && response.records) {
      teamList.value = response.records;
    } else {
      teamList.value = [];
    }
  } catch (error) {
    console.error("【案卷#18】搜索队伍失败:", error);
  } finally {
    loading.value = false;
  }
};

const handleJoinTeam = async (team: TeamVO) => {
  if (team.status === 2) { // 加密
    try {
      const { value: password } = await ElMessageBox.prompt(
        '该船队已开启隐身模式，请输入通行密钥:',
        '加密船队',
        {
          confirmButtonText: '验证并登船',
          cancelButtonText: '取消',
          inputType: 'password',
          customClass: 'glass-message-box' // 后续需在全局CSS适配
        }
      );
      await executeJoin({ teamId: team.id, password });
    } catch (e) {}
  } else {
    await executeJoin({ teamId: team.id });
  }
};

const executeJoin = async (params: TeamJoinDTO) => {
  try {
    await joinTeam(params);
    ElMessage.success('登船成功！正在前往驾驶舱...');
    setTimeout(() => router.push(`/team/${params.teamId}`), 1000);
  } catch (error: any) {
    // 错误已由拦截器处理，此处可留空或特殊处理
  }
};

// 辅助函数
const getStatusClass = (status: number) => {
  if (status === 0) return 'status-open';
  if (status === 2) return 'status-encrypted';
  return 'status-private';
};

const getStatusText = (status: number) => {
  if (status === 0) return '公开航线';
  if (status === 2) return '加密航线';
  return '私有';
};

onMounted(doSearch);
</script>

<style scoped>
.team-search-container {
  padding: 0 20px;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 30px;
}

/* 深度定制搜索框 */
:deep(.el-input-group__append) {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border: none !important;
  color: #fff;
}

/* 网格布局 */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* === 船队玻璃卡片 === */
.team-glass-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.team-glass-card:hover {
  transform: translateY(-5px);
  border-color: var(--neon-blue);
  box-shadow: 0 0 20px rgba(0, 128, 255, 0.2);
  background: rgba(255, 255, 255, 0.06);
}

/* 状态灯条 */
.status-light {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
}
.status-open { background: #00ff88; box-shadow: 0 0 10px #00ff88; color: #00ff88; }
.status-encrypted { background: #ff4757; box-shadow: 0 0 10px #ff4757; color: #ff4757; }
.status-private { background: #ffa502; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.team-name {
  margin: 0;
  font-size: 18px;
  color: #fff;
  font-weight: 600;
  max-width: 70%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid currentColor;
  background: rgba(0,0,0,0.2);
}

.team-desc {
  font-size: 13px;
  color: rgba(255,255,255,0.6);
  margin-bottom: 20px;
  height: 40px; /* 限制两行高度 */
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255,255,255,0.05);
  padding-top: 12px;
}

.captain-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.captain-name {
  font-size: 12px;
  color: rgba(255,255,255,0.8);
}

.member-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--neon-cyan);
}

/* 悬停显示的按钮 */
.quick-join-btn {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 12px;
  background: linear-gradient(90deg, var(--neon-blue), var(--neon-cyan));
  border: none;
  color: #fff;
  font-weight: bold;
  transform: translateY(100%);
  transition: transform 0.3s;
  cursor: pointer;
}

.team-glass-card:hover .quick-join-btn {
  transform: translateY(0);
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: rgba(255,255,255,0.5);
}
.empty-icon {
  width: 100px;
  opacity: 0.5;
  margin-bottom: 20px;
}
</style>
