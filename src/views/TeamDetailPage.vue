<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // (V4.x 新增)
// 【【【 V4.x 修复：导入“新工具” 和 “新 API 探员” 】】】
import { getTeamDetailsById, joinTeam } from '@/api/team';
import type { TeamVO, TeamJoinDTO } from '@/models/team';
import { ElMessage, ElMessageBox, ElButton } from 'element-plus'; // (V4.x 新增)

const route = useRoute();
const router = useRouter(); // (V4.x 新增)
const teamDetails = ref<TeamVO>();
const loading = ref(true);

/**
 * 【【【 案卷 #17：SOP (获取详情) 】】】
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

// (页面加载时，执行)
onMounted(loadDetails);


/**
 * 【【【 案卷 #004：SOP (V4.x 加入队伍) 】】】
 * (SOP 1 核心逻辑: 处理“公开”  与“加密” )
 */
const handleJoinTeam = async () => {
  const team = teamDetails.value;
  if (!team) return; // (安全校验)

  // 1. (SOP 1 逻辑) 检查“加密”
  if (team.status === 2) { // 2-加密
    try {
      // 2. (SOP 1 逻辑) 索要“密码”
      const { value: password } = await ElMessageBox.prompt(
        '该队伍已加密，请输入密码:',
        '加入队伍',
        {
          confirmButtonText: '确认加入',
          cancelButtonText: '取消',
          inputType: 'password',
        }
      );

      // 3. (SOP 1 契约) 执行“加密加入”
      await executeJoin({ teamId: team.id, password: password || '' });

    } catch (e) {
      // (用户点击了“取消”)
      ElMessage.info('已取消加入');
    }
  } else {
    // 3. (SOP 1 逻辑) 执行“公开加入”
    await executeJoin({ teamId: team.id });
  }
};

/**
 * 【【【 案卷 #004：V4.x 辅助函数 (执行 API) 】】】
 */
const executeJoin = async (params: TeamJoinDTO) => {
  try {
    const result = await joinTeam(params);
    if (result) {
      ElMessage.success('加入成功！');
      // (V4.x 优化：加入成功后，我们必须“重新加载”详情页，)
      // (因为“成员列表” 已经变了)
      await loadDetails();
    }
  } catch (error) {
    console.error("【案卷 #004】加入队伍失败:", error);
  }
};

</script>

<template>
  <div v-loading="loading" class="team-detail-container">
    <div v-if="teamDetails">
      <h1>{{ teamDetails.name }}</h1>
      <p>队长: {{ teamDetails.teamCaptain.username }}</p>
      <p>描述: {{ teamDetails.description }}</p>

      <h3>成员 ({{ teamDetails.members.length }} / {{ teamDetails.maxNum }})</h3>
      <ul>
        <li v-for="member in teamDetails.members" :key="member.id">
          {{ member.username }}
        </li>
      </ul>

      <div style="margin-top: 20px;">
        <el-button
          type="primary"
          @click="handleJoinTeam"
          size="large"
        >
          加入队伍
        </el-button>
      </div>

    </div>
    <div v-else-if="!loading">
      <p>未找到队伍信息。</p>
    </div>
  </div>
</template>
