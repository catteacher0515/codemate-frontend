<script setup lang="ts">
import { ref, onMounted } from 'vue';
// 【【【 V4.x 修复：导入“新工具” 】】】
import { ElMessage, ElInput, ElButton, ElCard, ElTag, ElMessageBox } from 'element-plus';
// 【【【 V4.x 修复：导入“新 API 探员” 】】】
import { searchTeams, joinTeam } from '@/api/team';
// 【【【 V4.x 修复：导入“新 DTO” 】】】
import type { TeamSearchDTO, TeamVO, TeamPageVO, TeamJoinDTO } from '@/models/team';
import {useRouter} from "vue-router";

const searchText = ref(''); // 搜索框 v-model
const teamList = ref<TeamVO[]>([]); // 队伍列表
const loading = ref(false);
const router = useRouter(); // (V4.x 新增：用于加入后跳转)

// (分页 & 搜索合约)
const searchParams = ref<TeamSearchDTO>({
  searchText: '',
  current: 1,
  pageSize: 10,
});
const totalRecords = ref(0);

/**
 * 【【【 案卷 #18：SOP (执行搜索) 】】】
 */
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

/**
 * 【【【 案卷 #004：SOP (V4.x 加入队伍) 】】】
 * (SOP 1 核心逻辑: 处理“公开”  与“加密” )
 */
const handleJoinTeam = async (team: TeamVO) => {
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
      // (V4.x 优化：加入成功后，跳转到该队伍的“详情页”)
      router.push(`/team/${params.teamId}`);
    }
    // (失败情况已在 request.ts 拦截器中处理)
  } catch (error) {
    console.error("【案卷 #004】加入队伍失败:", error);
    // (ElMessage 已在 request.ts 拦截器中自动触发)
  }
};

// (页面加载时，执行一次“默认搜索”)
onMounted(doSearch);

</script>

<template>
  <div class="team-search-container">
    <div style="display: flex; margin-bottom: 20px;">
      <el-input
        v-model="searchText"
        placeholder="按队伍名称或描述搜索..."
        @keyup.enter="doSearch"
      />
      <el-button type="primary" @click="doSearch" style="margin-left: 10px;">
        搜索
      </el-button>
    </div>

    <div v-loading="loading">
      <el-card
        v-for="team in teamList"
        :key="team.id"
        shadow="hover"
        style="margin-bottom: 10px;"
      >
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>{{ team.name }}</strong>
            <el-tag v-if="team.status === 0" type="success">公开</el-tag>
            <el-tag v-if="team.status === 2" type="danger">加密</el-tag>
          </div>
        </template>
        <div>
          <p>描述: {{ team.description }}</p>
          <p>队长: {{ team.teamCaptain.username }}</p>
        </div>
        <template #footer>
          <div style="text-align: right;">
            <el-button
              type="primary"
              @click="handleJoinTeam(team)"
            >
              加入队伍
            </el-button>
          </div>
        </template>
      </el-card>

    </div>

    <el-empty v-if="!loading && teamList.length === 0" description="未找到相关队伍" />
  </div>
</template>
