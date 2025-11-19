<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTeamDetailsById, joinTeam, inviteUser, quitTeam, updateTeam } from '@/api/team';
import type { TeamVO, TeamJoinDTO, TeamInviteDTO, TeamQuitDTO, TeamUpdateDTO } from '@/models/team';
import { ElMessage, ElMessageBox, ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElRadioGroup, ElRadio } from 'element-plus';

const route = useRoute();
const router = useRouter();
const teamDetails = ref<TeamVO>();
const loading = ref(true);

// --- 0. 权限判断 (模拟) ---
const currentUserId = ref<number>(0);

onMounted(() => {
  const userStr = localStorage.getItem('user_login_state');
  if (userStr) {
    const user = JSON.parse(userStr);
    currentUserId.value = user.id;
  }
  loadDetails();
});

// 是否为队长
const isCaptain = computed(() => {
  return teamDetails.value && teamDetails.value.userId === currentUserId.value;
});


// --- 1. 获取详情 ---
const loadDetails = async () => {
  loading.value = true;
  try {
    const teamId = route.params.id as string;
    if (!teamId) {
      ElMessage.error('队伍 ID 不存在');
      return;
    }
    teamDetails.value = await getTeamDetailsById(teamId);
  } catch (error) {
    console.error("【案卷 #17】获取队伍详情失败:", error);
  } finally {
    loading.value = false;
  }
};


// --- 2. 加入队伍逻辑 (案卷 #004) ---
const handleJoinTeam = async () => {
  const team = teamDetails.value;
  if (!team) return;

  if (team.status === 2) { // 2-加密
    try {
      const { value: password } = await ElMessageBox.prompt(
        '该队伍已加密，请输入密码:', '加入队伍',
        { confirmButtonText: '确认', cancelButtonText: '取消', inputType: 'password' }
      );
      await executeJoin({ teamId: team.id, password: password || '' });
    } catch (e) {
      ElMessage.info('已取消加入');
    }
  } else {
    await executeJoin({ teamId: team.id });
  }
};

const executeJoin = async (params: TeamJoinDTO) => {
  try {
    const result = await joinTeam(params);
    if (result) {
      ElMessage.success('加入成功！');
      await loadDetails();
    }
  } catch (error) {
    console.error("【案卷 #004】加入队伍失败:", error);
  }
};

// --- 3. 邀请用户逻辑 (案卷 #005) ---
const handleInviteUser = async () => {
  if (!teamDetails.value) return;
  try {
    const { value: targetAccount } = await ElMessageBox.prompt(
      '请输入要邀请的用户账号:', '邀请用户',
      { confirmButtonText: '邀请', cancelButtonText: '取消', inputPlaceholder: '例如: yupi' }
    );
    if (!targetAccount) return;

    const result = await inviteUser({
      teamId: teamDetails.value.id,
      targetUserAccount: targetAccount
    });

    if (result) {
      ElMessage.success(`成功邀请 ${targetAccount}！`);
      await loadDetails();
    }
  } catch (e) {
    if (e !== 'cancel') console.error("【案卷 #005】邀请失败:", e);
  }
};

// --- 4. 退出队伍逻辑 (案卷 #006) ---
const handleQuitTeam = async () => {
  if (!teamDetails.value) return;
  try {
    await ElMessageBox.confirm(
      '确定要退出该队伍吗？(队长退出即解散)',
      '退出确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    );

    const result = await quitTeam({ teamId: teamDetails.value.id });
    if (result) {
      ElMessage.success('已退出队伍');
      // 退出后，返回首页或刷新
      router.push('/team/search');
    }
  } catch (e) {
    if (e !== 'cancel') console.error("【案卷 #006】退出失败:", e);
  }
};


// --- 5. 更新队伍逻辑 (案卷 #007) ---
const showUpdateDialog = ref(false);
const updateForm = ref<TeamUpdateDTO>({
  id: 0,
  name: '',
  description: '',
  status: 0,
  password: ''
});

const openUpdateDialog = () => {
  if (!teamDetails.value) return;
  updateForm.value = {
    id: teamDetails.value.id,
    name: teamDetails.value.name,
    description: teamDetails.value.description,
    status: teamDetails.value.status,
    password: ''
  };
  showUpdateDialog.value = true;
};

const handleUpdateTeam = async () => {
  try {
    const result = await updateTeam(updateForm.value);
    if (result) {
      ElMessage.success('队伍信息更新成功！');
      showUpdateDialog.value = false;
      await loadDetails();
    }
  } catch (e) {
    console.error("【案卷 #007】更新失败:", e);
  }
};

</script>

<template>
  <div v-loading="loading" class="team-detail-container">
    <div v-if="teamDetails">
      <h1 style="margin-bottom: 10px;">{{ teamDetails.name }}</h1>
      <div style="color: #666; margin-top: 8px;">
        队长: {{ teamDetails.teamCaptain.username }} |
        状态: <el-tag size="small" :type="teamDetails.status === 0 ? 'success' : 'danger'">
        {{ teamDetails.status === 0 ? '公开' : '加密' }}
      </el-tag>
      </div>

      <el-descriptions bordered :column="1" style="margin-top: 20px;">
        <el-descriptions-item label="描述">{{ teamDetails.description }}</el-descriptions-item>
        <el-descriptions-item label="人数">{{ teamDetails.members.length }} / {{ teamDetails.maxNum }}</el-descriptions-item>
      </el-descriptions>

      <div style="margin-top: 20px;">
        <h3>成员列表</h3>
        <div v-for="member in teamDetails.members" :key="member.id" style="padding: 10px; border-bottom: 1px solid #eee;">
          {{ member.username }} (账号: {{ member.userAccount }})
        </div>
      </div>


      <div style="margin-top: 30px; display: flex; gap: 15px; justify-content: center;">

        <el-button type="primary" @click="handleJoinTeam">加入队伍</el-button>

        <el-button type="success" @click="handleInviteUser">邀请用户</el-button>

        <el-button
          v-if="isCaptain"
          type="warning"
          @click="openUpdateDialog"
        >
          更新信息
        </el-button>

        <el-button type="danger" @click="handleQuitTeam">退出队伍</el-button>
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
              <el-radio :label="2">加密</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="队伍密码" v-if="updateForm.status === 2">
            <el-input v-model="updateForm.password" type="password" placeholder="请输入新密码" />
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

    <div v-else-if="!loading">
      <el-empty description="未找到队伍信息" />
    </div>
  </div>
</template>

<style scoped>
.team-detail-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
}
</style>
