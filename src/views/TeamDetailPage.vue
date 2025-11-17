<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getTeamDetailsById } from '@/api/team';

// 【【 V3.7 修复：使用 'import type' 】】
import type { TeamVO } from '@/models/team';
import { ElMessage } from 'element-plus';

const route = useRoute();
const teamDetails = ref<TeamVO>();
const loading = ref(true);

onMounted(async () => {
  const teamId = route.params.id as string;
  if (!teamId) {
    ElMessage.error('队伍 ID 不存在');
    return;
  }

  try {
    // 【【 V3.7 修复：移除冗余的 'response' 变量 】】
    teamDetails.value = await getTeamDetailsById(teamId);
  } catch (error) {
    console.error("【案卷 #17】获取队伍详情失败:", error);
    // (ElMessage 已在 request.ts 拦截器中自动触发，这里可以省略)
  } finally {
    loading.value = false;
  }
});
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
    </div>
    <div v-else-if="!loading">
      <p>未找到队伍信息。</p>
    </div>
  </div>
</template>
