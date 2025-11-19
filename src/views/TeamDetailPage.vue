<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// 【【【 V4.x 修复：一次性导入所有 API 探员 】】】
import { getTeamDetailsById, joinTeam, inviteUser, quitTeam } from '@/api/team';
// 【【【 V4.x 修复：一次性导入所有 DTO 类型 】】】
import type { TeamVO, TeamJoinDTO, TeamInviteDTO, TeamQuitDTO } from '@/models/team';
import { ElMessage, ElMessageBox, ElButton } from 'element-plus';

const route = useRoute();
const router = useRouter();
const teamDetails = ref<TeamVO>();
const loading = ref(true);

/**
 * 【【【 案卷 #17：获取详情 】】】
 */
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

// (页面加载时执行)
onMounted(loadDetails);


/**
 * 【【【 案卷 #004：加入队伍 (核心逻辑) 】】】
 */
const handleJoinTeam = async () => {
  const team = teamDetails.value;
  if (!team) return;

  if (team.status === 2) { // 2-加密
    try {
      const { value: password } = await ElMessageBox.prompt(
        '该队伍已加密，请输入密码:',
        '加入队伍',
        {
          confirmButtonText: '确认加入',
          cancelButtonText: '取消',
          inputType: 'password',
        }
      );
      await executeJoin({ teamId: team.id, password: password || '' });
    } catch (e) {
      ElMessage.info('已取消加入');
    }
  } else {
    // 0-公开
    await executeJoin({ teamId: team.id });
  }
};

const executeJoin = async (params: TeamJoinDTO) => {
  try {
    const result = await joinTeam(params);
    if (result) {
      ElMessage.success('加入成功！');
      await loadDetails(); // 重新加载以更新成员列表
    }
  } catch (error) {
    console.error("【案卷 #004】加入队伍失败:", error);
  }
};

/**
 * 【【【 案卷 #005：邀请用户 (核心逻辑) 】】】
 */
const handleInviteUser = async () => {
  if (!teamDetails.value) return;

  try {
    const { value: targetAccount } = await ElMessageBox.prompt(
      '请输入要邀请的用户账号:',
      '邀请加入',
      {
        confirmButtonText: '确认邀请',
        cancelButtonText: '取消',
        inputPlaceholder: '例如: yupi',
      }
    );

    if (!targetAccount) {
      ElMessage.warning('账号不能为空');
      return;
    }

    const params: TeamInviteDTO = {
      teamId: teamDetails.value.id,
      targetUserAccount: targetAccount
    };

    const result = await inviteUser(params);

    if (result) {
      ElMessage.success(`成功邀请用户 ${targetAccount} 加入队伍！`);
      await loadDetails();
    }

  } catch (e) {
    if (e !== 'cancel') {
      console.error("【案卷 #005】邀请失败:", e);
    }
  }
};

/**
 * 【【【 案卷 #006：退出队伍 (核心逻辑) 】】】
 */
const handleQuitTeam = async () => {
  if (!teamDetails.value) return;

  try {
    await ElMessageBox.confirm(
      '确定要退出该队伍吗？',
      '退出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const result = await quitTeam({ teamId: teamDetails.value.id });

    if (result) {
      ElMessage.success('已退出队伍');
      // (退出后，重新加载详情，展示最新状态)
      await loadDetails();
    }
  } catch (e) {
    if (e !== 'cancel') {
      console.error("【案卷 #006】退出失败:", e);
    }
  }
};
</script>

<template>
  <div v-loading="loading" class="team-detail-container">
    <div v-if="teamDetails">
      <div style="margin-bottom: 20px;">
        <h1>{{ teamDetails.name }}</h1>
        <div style="color: #666; margin-top: 8px;">
          队长: {{ teamDetails.teamCaptain.username }} |
          状态: <el-tag size="small" :type="teamDetails.status === 0 ? 'success' : 'danger'">
          {{ teamDetails.status === 0 ? '公开' : '加密' }}
        </el-tag>
        </div>
      </div>

      <el-card style="margin-bottom: 20px;">
        <template #header>队伍描述</template>
        <p>{{ teamDetails.description }}</p>
      </el-card>

      <el-card>
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>成员列表 ({{ teamDetails.members.length }} / {{ teamDetails.maxNum }})</span>
          </div>
        </template>

        <div v-if="teamDetails.members && teamDetails.members.length > 0">
          <div v-for="member in teamDetails.members" :key="member.id" style="padding: 10px; border-bottom: 1px solid #eee;">
            {{ member.username }} (账号: {{ member.userAccount }})
          </div>
        </div>
        <div v-else style="color: #999; padding: 10px;">
          暂无成员
        </div>
      </el-card>

      <div style="margin-top: 30px; display: flex; gap: 15px; justify-content: center;">
        <el-button
          type="primary"
          size="large"
          @click="handleJoinTeam"
        >
          加入队伍
        </el-button>

        <el-button
          type="success"
          size="large"
          @click="handleInviteUser"
        >
          邀请用户
        </el-button>

        <el-button
          type="danger"
          size="large"
          @click="handleQuitTeam"
        >
          退出队伍
        </el-button>
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
  background: #fff;
}
</style>
