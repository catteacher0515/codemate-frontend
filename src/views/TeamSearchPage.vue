<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElInput, ElButton, ElCard, ElTag } from 'element-plus'; // (基于 SOP v2.0)
import { searchTeams } from '@/api/team'; // (V3.x API)
// (V3.x 合约)
import type { TeamSearchDTO, TeamVO, TeamPageVO } from '@/models/team';

const searchText = ref(''); // 搜索框 v-model
const teamList = ref<TeamVO[]>([]); // 队伍列表
const loading = ref(false);

// 分页 & 搜索合约
const searchParams = ref<TeamSearchDTO>({
  searchText: '',
  // tagNames: ['Java'], // (V2 重构点: 添加标签搜索)
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
    // (将搜索框的值同步到“合约”)
    searchParams.value.searchText = searchText.value;

    // (呼叫“API 探员”)
    const response: TeamPageVO = await searchTeams(searchParams.value);

    teamList.value = response.records;
    totalRecords.value = response.total;

  } catch (error) {
    console.error("【案卷 #18】搜索队伍失败:", error);
    // (ElMessage 已在 request.ts 拦截器 中自动触发)
  } finally {
    loading.value = false;
  }
};

// (V2 重构点: 处理分页变更)
// const handlePageChange = (newPage: number) => {
//   searchParams.value.current = newPage;
//   doSearch();
// }

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
          </div>
        </template>
        <div>
          <p>描述: {{ team.description }}</p>
          <p>队长: {{ team.teamCaptain.username }}</p>
        </div>
      </el-card>

    </div>

    <el-empty v-if="!loading && teamList.length === 0" description="未找到相关队伍" />
  </div>
</template>
