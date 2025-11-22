<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getTeamDetailsById,
  joinTeam,
  inviteUser,
  quitTeam,
  updateTeam,
  kickTeamMember,
  deleteTeam, transferCaptain // 【案卷 #009】新增引入
} from '@/api/team';
import type { TeamVO, TeamJoinDTO } from '@/models/team';
import TeamChatRoom from '@/components/TeamChatRoom.vue';


const showChatDrawer = ref(false);
const route = useRoute();
const router = useRouter();

// --- 状态定义 ---
const teamDetails = ref<TeamVO>();
const currentUserId = ref<number>(0);
const loading = ref(true);

// 更新弹窗状态
const showUpdateDialog = ref(false);
const updateForm = ref({
  name: '',
  description: '',
  status: 0,
  password: ''
});

// --- 1. 初始化 ---
onMounted(async () => {
  // 获取当前用户ID (从本地缓存)
  const userStr = localStorage.getItem('user_login_state');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      currentUserId.value = user.id;
    } catch (e) {
      console.error('解析用户信息失败');
    }
  }
  await loadDetails();
});

// 计算属性：我是队长吗？
const isCaptain = computed(() => {
  return teamDetails.value && teamDetails.value.userId === currentUserId.value;
});

// --- 2. 加载数据 ---
const loadDetails = async () => {
  const teamId = route.params.id as string;
  if (!teamId) return;

  loading.value = true;
  try {
    const res = await getTeamDetailsById(teamId);
    if (res) {
      teamDetails.value = res;
    }
  } catch (error) {
    ElMessage.error('获取队伍详情失败');
  } finally {
    loading.value = false;
  }
};

// --- 3. 核心功能区 ---

// 【案卷 #008】踢出成员
const doKick = async (targetUserAccount: string) => {
  if (!targetUserAccount || !teamDetails.value) return;
  try {
    await ElMessageBox.confirm(
      `确定要将用户 ${targetUserAccount} 移出队伍吗？`,
      '踢出确认',
      {
        confirmButtonText: '确定踢出',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    );

    await kickTeamMember({
      teamId: teamDetails.value.id,
      targetUserAccount: targetUserAccount
    });

    ElMessage.success('踢出成功');
    await loadDetails(); // 刷新数据
  } catch (e) {
    if (e !== 'cancel') console.error(e);
  }
};

// 【案卷 #009】解散队伍
const handleDeleteTeam = async () => {
  if (!teamDetails.value) return;
  try {
    await ElMessageBox.confirm(
      '确定要解散该队伍吗？此操作不可逆！',
      '解散警告',
      {
        confirmButtonText: '确定解散',
        cancelButtonText: '我再想想',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    );

    await deleteTeam({ id: teamDetails.value.id });

    ElMessage.success('队伍已解散');
    router.replace('/team/search'); // 跳转回列表页
  } catch (e) {
    if (e !== 'cancel') console.error(e);
  }
};

// 退出队伍
const handleQuitTeam = async () => {
  if (!teamDetails.value) return;
  try {
    await ElMessageBox.confirm('确定要退出该队伍吗？', '提示', { type: 'info' });
    await quitTeam({ teamId: teamDetails.value.id });
    ElMessage.success('已退出队伍');
    router.replace('/team/search');
  } catch (e) { }
};

// 邀请用户
const handleInviteUser = async () => {
  if (!teamDetails.value) return;
  try {
    const { value: targetAccount } = await ElMessageBox.prompt('请输入用户账号', '邀请用户', {
      inputPlaceholder: '例如: admin'
    });
    if (targetAccount) {
      await inviteUser({ teamId: teamDetails.value.id, targetUserAccount: targetAccount });
      ElMessage.success('邀请成功');
    }
  } catch (e) { }
};

// 加入队伍
const handleJoinTeam = async () => {
  if (!teamDetails.value) return;
  const team = teamDetails.value;
  try {
    if (team.status === 2) { // 加密
      const { value: password } = await ElMessageBox.prompt('请输入队伍密码', '加入队伍', {
        inputType: 'password',
        inputPattern: /\S+/,
        inputErrorMessage: '密码不能为空'
      });
      await executeJoin({ teamId: team.id, password });
    } else {
      await executeJoin({ teamId: team.id });
    }
  } catch (e) { }
};

const executeJoin = async (params: TeamJoinDTO) => {
  const res = await joinTeam(params);
  if (res) {
    ElMessage.success('加入成功');
    await loadDetails();
  }
};

// 更新队伍信息 (弹窗)
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
    // 构造更新参数
    const params = {
      ...updateForm.value,
      id: teamDetails.value.id
    };
    await updateTeam(params);
    ElMessage.success('更新成功');
    showUpdateDialog.value = false;
    await loadDetails();
  } catch (e) {
    console.error(e);
  }
};

// 【案卷 #010】转让队长
const handleTransferCaptain = async (member: any) => {
  if (!teamDetails.value) return;

  try {
    await ElMessageBox.confirm(
      `确定要将队长转让给成员 "${member.username}" 吗？转让后您将失去队长权限。`,
      '转让确认',
      {
        confirmButtonText: '立即转让',
        cancelButtonText: '我再想想',
        type: 'warning'
      }
    );

    await transferCaptain({
      teamId: teamDetails.value.id,
      newCaptainId: member.id
    });

    ElMessage.success('转让成功！');
    // 刷新页面数据，因为“我的身份”变了
    await loadDetails();

  } catch (e) {
    if (e !== 'cancel') console.error(e);
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
              <template v-if="isCaptain && member.id !== currentUserId">
                <el-button
                  type="primary"
                  size="small"
                  plain
                  @click="handleTransferCaptain(member)"
                >
                  转让
                </el-button>

                <el-button
                  type="danger"
                  size="small"
                  plain
                  @click="doKick(member.userAccount)"
                >
                  踢出
                </el-button>
              </template>

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

        <template v-if="teamDetails.members?.some(u => u.id === currentUserId)">
          <el-button
            type="primary"
            plain
            @click="showChatDrawer = true"
          >
            💬 聊一聊
          </el-button>
        </template>

        <template v-if="isCaptain">
          <el-button type="success" @click="handleInviteUser">邀请用户</el-button>
          <el-button type="warning" @click="openUpdateDialog">更新信息</el-button>
          <el-button type="danger" @click="handleDeleteTeam">解散队伍</el-button>
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
            <el-input v-model="updateForm.password" type="password" show-password placeholder="不修改请留空" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showUpdateDialog = false">取消</el-button>
            <el-button type="primary" @click="handleUpdateTeam">确认更新</el-button>
          </span>
        </template>
      </el-dialog>

      <el-drawer
        v-model="showChatDrawer"
        title="队伍聊天室"
        direction="rtl"
        size="400px"
        destroy-on-close
      >
        <TeamChatRoom
          v-if="teamDetails"
          :team-id="teamDetails.id"
          :current-user="{ id: currentUserId }"
        />
      </el-drawer>

    </div>
    <el-empty v-else description="队伍不存在或无法访问" />
  </div>
</template>
