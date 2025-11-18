<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// 导入 API 和 类型
import { getTeamDetailsById, joinTeam, inviteUser } from '@/api/team';
import type { TeamVO, TeamJoinDTO, TeamInviteDTO } from '@/models/team';
import { ElMessage, ElMessageBox, ElButton } from 'element-plus';

const route = useRoute();
const router = useRouter();
const teamDetails = ref<TeamVO>();
const loading = ref(true);

/**
 * 1. 加载详情 (核心逻辑)
 */
const loadDetails = async () => {
  loading.value = true;
  try {
    // 从 URL 获取 teamId
    const teamId = route.params.id as string;
    if (!teamId) {
      ElMessage.error('队伍 ID 不存在');
      return;
    }
    // 调用“获取详情” API
    teamDetails.value = await getTeamDetailsById(teamId);
  } catch (error) {
    console.error("【案卷 #17】获取队伍详情失败:", error);
  } finally {
    loading.value = false;
  }
};

// 页面加载时执行
onMounted(loadDetails);

/**
 * 2. 加入队伍 (核心逻辑)
 */
const handleJoinTeam = async () => {
  const team = teamDetails.value;
  if (!team) return;

  if (team.status === 2) { // 加密
    try {
      const { value: password } = await ElMessageBox.prompt(
        '该队伍已加密，请输入密码:', '加入队伍',
        { confirmButtonText: '确认', cancelButtonText: '取消', inputType: 'password' }
      );
      await executeJoin({ teamId: team.id, password: password || '' });
    } catch (e) {
      // 取消
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
      await loadDetails(); // 刷新数据
    }
  } catch (error) {
    // 错误已由拦截器处理
  }
};

/**
 * 3. 邀请用户 (核心逻辑 - 案卷 #005)
 */
const handleInviteUser = async () => {
  if (!teamDetails.value) return;
  try {
    const { value: targetAccount } = await ElMessageBox.prompt(
      '请输入要邀请的用户账号:', '邀请用户',
      { confirmButtonText: '邀请', cancelButtonText: '取消' }
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
    // 取消或错误
  }
};
</script>

<template>
  <div v-loading="loading" class="team-detail-container">
    <div v-if="teamDetails">
      <h1 style="margin-bottom: 10px;">{{ teamDetails.name }}</h1>

      <el-descriptions bordered :column="1">
        <el-descriptions-item label="队长">{{ teamDetails.teamCaptain.username }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ teamDetails.description }}</el-descriptions-item>
        <el-descriptions-item label="人数">{{ teamDetails.members.length }} / {{ teamDetails.maxNum }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="teamDetails.status === 0" type="success">公开</el-tag>
          <el-tag v-else type="danger">加密</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <div style="margin-top: 20px;">
        <h3>成员列表</h3>
        <el-table :data="teamDetails.members" stripe style="width: 100%">
          <el-table-column prop="username" label="昵称" />
          <el-table-column prop="userAccount" label="账号" />
        </el-table>
      </div>

      <div style="margin-top: 30px; display: flex; gap: 15px;">
        <el-button type="primary" @click="handleJoinTeam">加入队伍</el-button>
        <el-button type="success" @click="handleInviteUser">邀请用户</el-button>
      </div>
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
  background: #fff; /* 加上背景色更容易区分 */
}
</style>
