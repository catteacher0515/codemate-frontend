<template>
  <div v-loading="loading" class="detail-container" element-loading-background="rgba(0,0,0,0.8)">
    <div v-if="teamDetails" class="command-center">

      <div class="info-column">
        <div class="glass-panel header-panel">
          <div class="title-row">
            <h1 class="neon-title">{{ teamDetails.name }}</h1>
            <div class="status-tag" :class="getStatusClass(teamDetails.status)">
              {{ getStatusText(teamDetails.status) }}
            </div>
          </div>
          <p class="desc-text">{{ teamDetails.description || '这艘船很神秘，没有留下任何日志...' }}</p>

          <div class="meta-grid">
            <div class="meta-item">
              <span class="label">舰长</span>
              <div class="value captain-val">
                <el-avatar :size="24" :src="teamDetails.teamCaptain?.avatarUrl" />
                {{ teamDetails.teamCaptain?.username }}
              </div>
            </div>
            <div class="meta-item">
              <span class="label">编号</span>
              <span class="value code-font">#{{ teamDetails.id }}</span>
            </div>
            <div class="meta-item">
              <span class="label">启航时间</span>
              <span class="value">{{ new Date(teamDetails.createTime).toLocaleDateString() }}</span>
            </div>
            <div class="meta-item">
              <span class="label">载员</span>
              <span class="value highlight">{{ teamDetails.members?.length }}/{{ teamDetails.maxNum }}</span>
            </div>
          </div>

          <div class="control-panel">
            <el-button
              v-if="!isMember"
              type="primary"
              class="action-btn main-btn"
              @click="handleJoinTeam"
            >
              申请登船 (JOIN)
            </el-button>

            <el-button
              v-if="isMember"
              type="success"
              class="action-btn main-btn"
              @click="showChatDrawer = true"
            >
              打开通讯频道 (CHAT)
            </el-button>

            <div v-if="isCaptain" class="admin-actions">
              <el-button type="warning" class="sub-btn" @click="openUpdateDialog">更新日志</el-button>
              <el-button type="primary" class="sub-btn" @click="handleInviteUser">招募船员</el-button>
              <el-button type="danger" class="sub-btn" @click="handleDeleteTeam">自毁序列</el-button>
            </div>

            <el-button
              v-if="isMember && !isCaptain"
              type="danger"
              link
              class="quit-btn"
              @click="handleQuitTeam"
            >
              弃船逃生 (QUIT)
            </el-button>
          </div>
        </div>
      </div>

      <div class="members-column">
        <h3 class="section-title">在任船员 (CREW)</h3>
        <div class="crew-grid">
          <div
            v-for="member in teamDetails.members"
            :key="member.id"
            class="crew-card"
          >
            <el-avatar :size="48" :src="member.avatarUrl" class="crew-avatar" />
            <div class="crew-info">
              <div class="crew-name">
                {{ member.username }}
                <el-icon v-if="member.id === teamDetails.userId" class="captain-icon" color="#ffd700"><User /></el-icon>
              </div>
              <div class="crew-role">{{ member.userAccount }}</div>
            </div>

            <div v-if="isCaptain && member.id !== currentUserId" class="crew-actions">
              <el-tooltip content="转让舰长" placement="top">
                <el-button circle size="small" type="primary" class="icon-btn" @click="handleTransferCaptain(member)">
                  <el-icon><Switch /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="踢出舱门" placement="top">
                <el-button circle size="small" type="danger" class="icon-btn" @click="doKick(member.userAccount)">
                  <el-icon><Close /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>
        </div>
      </div>

    </div>
    <el-empty v-else description="信号丢失：未找到该船队信息" />

    <el-dialog v-model="showUpdateDialog" title="更新航行日志" width="500px">
      <el-form :model="updateForm" label-width="80px">
        <el-form-item label="代号"><el-input v-model="updateForm.name" /></el-form-item>
        <el-form-item label="日志"><el-input v-model="updateForm.description" type="textarea" /></el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="updateForm.status">
            <el-radio :value="0">公开</el-radio>
            <el-radio :value="1">私有</el-radio>
            <el-radio :value="2">加密</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="updateForm.status === 2" label="密码">
          <el-input v-model="updateForm.password" type="password" show-password placeholder="不修改留空"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUpdateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateTeam">确认修正</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="showChatDrawer" title="加密通讯频道" direction="rtl" size="400px">
      <TeamChatRoom
        v-if="teamDetails"
        :team-id="teamDetails.id"
        :current-user="{ id: currentUserId }"
      />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// 【关键修复】导入所有用到的图标
import { User, Switch, Close } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import { getTeamDetailsById, joinTeam, inviteUser, quitTeam, updateTeam, kickTeamMember, deleteTeam, transferCaptain } from '@/api/team';
import type { TeamVO, TeamJoinDTO } from '@/models/team';
import TeamChatRoom from '@/components/TeamChatRoom.vue';

const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance() as any;
const ElMessage = proxy.$message;

const teamDetails = ref<TeamVO>();
const currentUserId = ref<number>(0);
const loading = ref(true);
const showUpdateDialog = ref(false);
const showChatDrawer = ref(false);
const updateForm = ref({ name: '', description: '', status: 0, password: '' });

const isCaptain = computed(() => teamDetails.value?.userId === currentUserId.value);
const isMember = computed(() => teamDetails.value?.members?.some(u => u.id === currentUserId.value));

const loadDetails = async () => {
  const teamId = route.params.id as string;
  if (!teamId) return;
  loading.value = true;
  try {
    teamDetails.value = await getTeamDetailsById(teamId);
  } catch (error) {
    ElMessage.error('获取情报失败');
  } finally {
    loading.value = false;
  }
};

// === 核心操作区 ===
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
    await updateTeam({
      id: teamDetails.value.id,
      ...updateForm.value
    });
    ElMessage.success('日志已更新');
    showUpdateDialog.value = false;
    loadDetails();
  } catch(e) {
    // error handled
  }
};

const handleDeleteTeam = async () => {
  if (!teamDetails.value) return;
  try {
    await ElMessageBox.confirm('确定要启动自毁序列吗？此操作不可逆！', '高危警报', {
      confirmButtonText: '确认自毁',
      cancelButtonText: '终止',
      type: 'warning',
      // 【关键修复】防止弹窗样式崩坏
      customClass: 'glass-message-box'
    });
    await deleteTeam({ id: teamDetails.value.id });
    ElMessage.success('船队已解散');
    router.replace('/team/search');
  } catch(e) {}
};

const handleTransferCaptain = async (member: any) => {
  try {
    await ElMessageBox.confirm(`确定移交指挥权给 ${member.username} 吗？`, '权限变更', {
      confirmButtonText: '移交',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'glass-message-box'
    });
    await transferCaptain({
      teamId: teamDetails.value!.id,
      newCaptainId: member.id
    });
    ElMessage.success('指挥权已移交');
    loadDetails();
  } catch(e) {}
};

const doKick = async (account: string) => {
  try {
    await ElMessageBox.confirm(`确定将 ${account} 踢出舱门吗？`, '驱逐警告', {
      confirmButtonText: '踢出',
      cancelButtonText: '取消',
      type: 'error',
      customClass: 'glass-message-box'
    });
    await kickTeamMember({
      teamId: teamDetails.value!.id,
      targetUserAccount: account
    });
    ElMessage.success('船员已踢出');
    loadDetails();
  } catch(e) {}
};

// ... 其他 handleJoin, handleQuit 等保持原样，这里省略以节省篇幅 ...
// 务必保留 handleJoinTeam, handleQuitTeam, handleInviteUser 的实现
// ...

const handleJoinTeam = async () => { /*...*/ }; // 请保留原有逻辑
// 招募船员 (Invite)
const handleInviteUser = async () => {
  if (!teamDetails.value) return;
  try {
    const { value: targetAccount } = await ElMessageBox.prompt(
      '请输入目标船员的识别码 (User Account):',
      '发出招募信号',
      {
        confirmButtonText: '发送邀请',
        cancelButtonText: '取消',
        inputPlaceholder: '例如: admin',
        // 【关键修复】加上深海样式类
        customClass: 'glass-message-box',
        inputPattern: /\S+/,
        inputErrorMessage: '账号不能为空'
      }
    );

    if (targetAccount) {
      await inviteUser({
        teamId: teamDetails.value.id,
        targetUserAccount: targetAccount
      });
      ElMessage.success(`已成功向 ${targetAccount} 发送入队邀请`);
      // (可选: 刷新列表查看是否立即加入，如果后端逻辑是直接加入的话)
      await loadDetails();
    }
  } catch (e) {
    // 用户取消输入，无需处理
  }
};

// 弃船逃生 (Quit)
const handleQuitTeam = async () => {
  if (!teamDetails.value) return;
  try {
    await ElMessageBox.confirm(
      '确定要离开这艘船吗？你将失去所有船员权限。',
      '离队确认',
      {
        confirmButtonText: '确认离开',
        cancelButtonText: '我再想想',
        type: 'warning',
        // 【关键修复】加上深海样式类
        customClass: 'glass-message-box'
      }
    );

    await quitTeam({ teamId: teamDetails.value.id });
    ElMessage.success('已成功离队');
    router.replace('/team/search'); // 离队后跳回搜索页
  } catch (e) {
    // 用户取消操作
  }
};

// 样式辅助
const getStatusClass = (status: number) => status === 0 ? 'open' : (status === 2 ? 'enc' : 'pri');
const getStatusText = (status: number) => status === 0 ? '公开' : (status === 2 ? '加密' : '私密');

onMounted(async () => {
  const userStr = localStorage.getItem('user_login_state');
  if (userStr) currentUserId.value = JSON.parse(userStr).id;
  await loadDetails();
});
</script>

<style scoped>
.detail-container { padding: 20px; height: 100%; overflow-y: auto; }
.command-center { display: grid; grid-template-columns: 400px 1fr; gap: 30px; max-width: 1200px; margin: 0 auto; }
.glass-panel { background: rgba(20, 30, 48, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 30px; position: sticky; top: 20px; }
.neon-title { margin: 0; font-size: 28px; color: #fff; text-shadow: 0 0 10px rgba(0, 242, 234, 0.3); }
.title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.status-tag { font-size: 12px; padding: 4px 12px; border-radius: 20px; font-weight: bold; }
.status-tag.open { background: rgba(0, 255, 136, 0.2); color: #00ff88; border: 1px solid #00ff88; }
.status-tag.enc { background: rgba(255, 71, 87, 0.2); color: #ff4757; border: 1px solid #ff4757; }
.desc-text { color: rgba(255, 255, 255, 0.6); font-size: 14px; line-height: 1.6; margin-bottom: 30px; min-height: 60px; }
.meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; padding: 20px; background: rgba(0,0,0,0.2); border-radius: 16px; }
.meta-item { display: flex; flex-direction: column; gap: 5px; }
.meta-item .label { font-size: 12px; color: rgba(255,255,255,0.4); }
.meta-item .value { font-size: 14px; color: #fff; font-weight: 500; }
.captain-val { display: flex; align-items: center; gap: 8px; }
.control-panel { display: flex; flex-direction: column; gap: 15px; }
.main-btn { width: 100%; height: 45px; font-size: 16px; letter-spacing: 1px; }
.admin-actions { display: flex; justify-content: space-between; gap: 10px; }
.sub-btn { flex: 1; } /* 按钮平分宽度 */
.quit-btn { align-self: center; color: rgba(255, 71, 87, 0.8); }
.section-title { color: rgba(255,255,255,0.5); margin: 0 0 20px 10px; font-size: 14px; letter-spacing: 2px; }
.crew-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
.crew-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 15px; display: flex; align-items: center; gap: 15px; transition: all 0.2s; }
.crew-card:hover { background: rgba(255, 255, 255, 0.1); transform: translateX(5px); }
.crew-info { flex: 1; overflow: hidden; }
.crew-name { font-weight: bold; font-size: 15px; margin-bottom: 4px; display: flex; align-items: center; gap: 5px; color: #fff; }
.crew-role { font-size: 12px; color: rgba(255,255,255,0.5); }
.crew-actions { display: flex; gap: 8px; }
/* 【关键修复】给图标按钮强制上色 */
.icon-btn { color: #fff !important; border: none !important; }
.icon-btn.el-button--primary { background: var(--neon-blue) !important; }
.icon-btn.el-button--danger { background: #ff4757 !important; }
@media (max-width: 768px) { .command-center { grid-template-columns: 1fr; } }
</style>
