<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// 引入 API (确保 kickTeamMember 已在 src/api/team.ts 中定义)
import {
  getTeamDetailsById,
  joinTeam,
  inviteUser,
  quitTeam,
  updateTeam,
  kickTeamMember
} from '@/api/team';
import type { TeamVO, TeamJoinDTO } from '@/models/team';
import { ElMessage, ElMessageBox } from 'element-plus';

const route = useRoute();
const router = useRouter();

// --- 状态定义 ---
const teamDetails = ref<TeamVO>();
const currentUserId = ref<number>(0);
const loading = ref(true);

// 弹窗控制
const showUpdateDialog = ref(false);
const updateForm = ref({
  name: '',
  description: '',
  status: 0,
  password: ''
});

// --- 1. 初始化与权限 ---
onMounted(async () => {
  // 获取当前登录用户 ID (从 localStorage)
  const userStr = localStorage.getItem('user_login_state');
  if (userStr) {
    const user = JSON.parse(userStr);
    currentUserId.value = user.id;
  }
  await loadDetails();
});

// 计算属性：是否为队长
const isCaptain = computed(() => {
  return teamDetails.value && teamDetails.value.userId === currentUserId.value;
});

// --- 2. 数据加载 ---
const loadDetails = async () => {
  const teamId = route.params.id as string;
  if (!teamId) {
    ElMessage.error('队伍 ID 不存在');
    return;
  }
  loading.value = true;
  try {
    const res = await getTeamDetailsById(teamId);
    if (res) {
      teamDetails.value = res;
    }
  } catch (error) {
    console.error('获取队伍详情失败', error);
  } finally {
    loading.value = false;
  }
};

// --- 3. 核心功能：踢出成员 (案卷 #008) ---
const doKick = async (targetUserAccount: string) => {
  if (!targetUserAccount || !teamDetails.value) return;

  try {
    // 弹窗确认
    await ElMessageBox.confirm(
      `确定要将成员 ${targetUserAccount} 移出队伍吗？`,
      '踢出确认',
      {
        confirmButtonText: '确定踢出',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger' // 警示色
      }
    );

    // 执行请求
    await kickTeamMember({
      teamId: teamDetails.value.id,
      targetUserAccount: targetUserAccount
    });

    ElMessage.success('踢出成功');
    // 刷新数据
    await loadDetails();

  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('操作失败');
      console.error(e);
    }
  }
};

// --- 4. 其他功能 (加入/邀请/退出/更新) ---

// 加入队伍
const handleJoinTeam = async () => {
  if (!teamDetails.value) return;
  const team = teamDetails.value;

  try {
    if (team.status === 2) { // 加密队伍
      const { value: password } = await ElMessageBox.prompt('请输入队伍密码', '加入队伍', {
        inputType: 'password',
        inputPattern: /\S+/,
        inputErrorMessage: '密码不能为空'
      });
      await executeJoin({ teamId: team.id, password });
    } else {
      await executeJoin({ teamId: team.id });
    }
  } catch (e) {
    // 取消操作
  }
};

const executeJoin = async (params: TeamJoinDTO) => {
  const res = await joinTeam(params);
  if (res) {
    ElMessage.success('加入成功');
    loadDetails();
  }
};

// 邀请用户
const handleInviteUser = async () => {
  if (!teamDetails.value) return;
  try {
    const { value: targetAccount } = await ElMessageBox.prompt('请输入用户账号', '邀请用户');
    if (targetAccount) {
      await inviteUser({ teamId: teamDetails.value.id, targetUserAccount: targetAccount });
      ElMessage.success('邀请成功');
    }
  } catch (e) {
    // 取消
  }
};

// 退出队伍
const handleQuitTeam = async () => {
  if (!teamDetails.value) return;
  try {
    await ElMessageBox.confirm('确定要退出该队伍吗？', '提示', { type: 'warning' });
    await quitTeam({ teamId: teamDetails.value.id });
    ElMessage.success('已退出队伍');
    router.push('/team/search');
  } catch (e) {
    // 取消
  }
};

// 更新信息 (弹窗逻辑)
const openUpdateDialog = () => {
  if (!teamDetails.value) return;
  updateForm.value = {
    name: teamDetails.value.name,
    description: teamDetails.value.description,
    status: teamDetails.value.status,
    password: ''
  };
  showUpdateDialog.value = true;
};

const handleUpdateTeam = async () => {
  if (!teamDetails.value) return;
  try {
    const params = { ...updateForm.value, id: teamDetails.value.id };
    await updateTeam(params);
    ElMessage.success('更新成功');
    showUpdateDialog.value = false;
    loadDetails();
  } catch (e) {
    console.error(e);
  }
};
</script>

<template>
  <div v-loading="loading" class="team-detail-container">
    <div v-if="teamDetails">
      <div class="header-section">
        <h1 class="team-title">{{ teamDetails.name }}</h1>
        <div class="team-meta">
          <span class="captain-info">队长: {{ teamDetails.teamCaptain?.username }}</span>
          <el-tag :type="teamDetails.status === 0 ? 'success' : (teamDetails.status === 2 ? 'danger' : 'warning')">
            {{ teamDetails.status === 0 ? '公开' : (teamDetails.status === 1 ? '私有' : '加密') }}
          </el-tag>
        </div>
      </div>

      <el-descriptions bordered :column="1" class="team-descriptions">
        <el-descriptions-item label="队伍描述">{{ teamDetails.description }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ new Date(teamDetails.createTime).toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="队伍人数">{{ teamDetails.members?.length || 0 }} / {{ teamDetails.maxNum }}</el-descriptions-item>
      </el-descriptions>

      <div class="member-list-section">
        <h3>成员列表</h3>
        <el-card
          v-for="member in teamDetails.members"
          :key="member.id"
          shadow="hover"
          class="member-card"
        >
          <div class="member-content">
            <div class="member-info">
              <el-avatar :src="member.avatarUrl" :size="40" class="avatar" />
              <div>
                <div class="username">{{ member.username }}</div>
                <div class="account">账号: {{ member.userAccount }}</div>
              </div>
            </div>

            <div class="member-actions">
              <el-button
                v-if="isCaptain && member.id !== currentUserId"
                type="danger"
                size="small"
                plain
                @click="doKick(member.userAccount)"
              >
                踢出
              </el-button>

              <el-tag v-if="member.id === teamDetails.userId" type="success" size="small">队长</el-tag>
            </div>
          </div>
        </el-card>
      </div>

      <div class="footer-actions">
        <el-button
          v-if="!teamDetails.members?.some(u => u.id === currentUserId)"
          type="primary"
          @click="handleJoinTeam"
        >
          加入队伍
        </el-button>

        <template v-if="isCaptain">
          <el-button type="success" @click="handleInviteUser">邀请用户</el-button>
          <el-button type="warning" @click="openUpdateDialog">更新信息</el-button>
          <el-button type="danger" disabled>解散队伍</el-button>
        </template>

        <el-button
          v-if="teamDetails.members?.some(u => u.id === currentUserId) && !isCaptain"
          type="danger"
          @click="handleQuitTeam"
        >
          退出队伍
        </el-button>
      </div>

      <el-dialog v-model="showUpdateDialog" title="更新队伍信息" width="500px">
        <el-form :model="updateForm" label-width="80px">
          <el-form-item label="队伍名称">
            <el-input v-model="updateForm.name" />
          </el-form-item>
          <el-form-item label="队伍描述">
            <el-input v-model="updateForm.description" type="textarea" />
          </el-form-item>
          <el-form-item label="队伍状态">
            <el-radio-group v-model="updateForm.status">
              <el-radio :label="0">公开</el-radio>
              <el-radio :label="1">私有</el-radio>
              <el-radio :label="2">加密</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="队伍密码" v-if="updateForm.status === 2">
            <el-input v-model="updateForm.password" type="password" show-password />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showUpdateDialog = false">取消</el-button>
            <el-button type="primary" @click="handleUpdateTeam">确认更新</el-button>
          </span>
        </template>
      </el-dialog>

    </div>
    <el-empty v-else description="队伍不存在或无法访问" />
  </div>
</template>

<style scoped>
.team-detail-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.header-section {
  margin-bottom: 20px;
}

.team-title {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #303133;
}

.team-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #909399;
}

.team-descriptions {
  margin: 20px 0;
}

.member-list-section {
  margin-top: 30px;
}

.member-card {
  margin-bottom: 10px;
}

.member-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  background: #f0f2f5;
}

.username {
  font-weight: 500;
  color: #303133;
}

.account {
  font-size: 12px;
  color: #909399;
}

.member-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-actions {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}
</style>
