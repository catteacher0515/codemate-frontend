<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
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
const totalRecords = ref(0);

const doSearch = async () => {
  loading.value = true;
  try {
    searchParams.value.searchText = searchText.value;
    const response: TeamPageVO = await searchTeams(searchParams.value);
    teamList.value = response.records;
    totalRecords.value = response.total;
  } catch (error) {
    console.error("【案卷 #18】搜索队伍失败:", error);
  } finally {
    loading.value = false;
  }
};

const handleJoinTeam = async (team: TeamVO) => {
  if (team.status === 2) { // 加密
    try {
      const { value: password } = await ElMessageBox.prompt(
        '该队伍已加密，请输入密码:', '加入队伍',
        { confirmButtonText: '确认加入', cancelButtonText: '取消', inputType: 'password' }
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
      // 加入成功后，跳转到详情页
      router.push(`/team/${params.teamId}`);
    }
  } catch (error) {
    console.error("【案卷 #004】加入队伍失败:", error);
  }
};

onMounted(doSearch);
</script>

<template>
  <div class="team-search-container">
    <div style="display: flex; margin-bottom: 20px;">
      <el-input v-model="searchText" placeholder="按队伍名称或描述搜索..." @keyup.enter="doSearch" />
      <el-button type="primary" @click="doSearch" style="margin-left: 10px;">搜索</el-button>
    </div>

    <div v-loading="loading">
      <el-card v-for="team in teamList" :key="team.id" shadow="hover" style="margin-bottom: 10px;">
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>{{ team.name }}</strong>
            <div>
              <el-tag v-if="team.status === 0" type="success">公开</el-tag>
              <el-tag v-if="team.status === 2" type="danger">加密</el-tag>
            </div>
          </div>
        </template>
        <div>
          <p>描述: {{ team.description }}</p>
          <p>队长: {{ team.teamCaptain.username }}</p>
        </div>
        <template #footer>
          <div style="text-align: right; display: flex; justify-content: flex-end; gap: 10px;">
            <el-button type="info" plain @click="router.push(`/team/${team.id}`)">
              查看详情
            </el-button>
            <el-button type="primary" @click="handleJoinTeam(team)">
              加入队伍
            </el-button>
          </div>
        </template>
      </el-card>
    </div>
    <el-empty v-if="!loading && teamList.length === 0" description="未找到相关队伍" />
  </div>
</template>
