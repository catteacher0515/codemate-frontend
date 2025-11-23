<template>
  <div class="profile-page-v2">
    <el-row :gutter="20">
      <el-col :xs="24" :md="8">
        <div class="glass-card profile-card">
          <div class="card-header">
            <span>{{ isReadOnly ? '伙伴档案' : '我的船票' }}</span>
          </div>

          <div class="avatar-section">
            <div class="avatar-wrapper">
              <el-avatar :size="100" :src="form.avatarUrl" class="main-avatar" />
              <div class="avatar-glow"></div>
            </div>

            <template v-if="!isReadOnly">
              <el-upload
                class="avatar-uploader"
                :show-file-list="false"
                :http-request="handleAvatarUpload"
                :before-upload="beforeAvatarUpload"
                accept="image/*"
              >
                <el-button
                  type="primary"
                  class="update-btn"
                  :loading="isAvatarLoading"
                >
                  <el-icon style="margin-right: 5px"><Upload /></el-icon>
                  更换全息影像
                </el-button>
              </el-upload>
              <div class="tip-text">支持 JPG/PNG，最大 2MB</div>
            </template>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :md="16">
        <div class="glass-card info-card">
          <div class="card-header">
            <span>{{ isReadOnly ? `档案: ${form.username}` : '编辑资料 (Edit Profile)' }}</span>
          </div>

          <div class="info-grid">
            <div class="grid-item label">代号</div>
            <div class="grid-item value">
              <el-input v-model="form.username" :disabled="isReadOnly" />
            </div>

            <div class="grid-item label">识别码</div>
            <div class="grid-item value">
              <el-input v-model="form.userAccount" disabled class="disabled-input" />
            </div>

            <div class="grid-item label">性别</div>
            <div class="grid-item value">
              <el-radio-group v-model="form.gender" class="custom-radio" :disabled="isReadOnly">
                <el-radio :value="1">男</el-radio>
                <el-radio :value="2">女</el-radio>
                <el-radio :value="0">保密</el-radio>
              </el-radio-group>
            </div>

            <div class="grid-item label">星际信箱</div>
            <div class="grid-item value">
              <el-input v-model="form.email" :disabled="isReadOnly" />
            </div>

            <div class="grid-item label">通讯频段</div>
            <div class="grid-item value">
              <el-input v-model="form.phone" :disabled="isReadOnly" />
            </div>

            <div class="grid-item label">航行日志</div>
            <div class="grid-item value">
              <el-input v-model="form.bio" type="textarea" :rows="3" :disabled="isReadOnly" />
            </div>

            <div class="grid-item label">技能芯片</div>
            <div class="grid-item value">
              <el-input
                v-model="tagsInput"
                placeholder="e.g., Java, Vue (逗号分隔)"
                :disabled="isReadOnly"
              />
            </div>
          </div>

          <div class="save-actions" v-if="!isReadOnly">
            <el-button
              type="primary"
              class="save-btn"
              @click="handleSaveInfo"
              :loading="isInfoLoading"
            >
              保存档案变更
            </el-button>
          </div>

          <div class="save-actions" v-else>
            <el-button @click="router.back()">返回列表</el-button>
            <el-button type="success" @click="handleContact">建立通讯 (Contact)</el-button>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-drawer
      v-model="showPrivateChat"
      :title="`与 ${form.username} 的加密通讯`"
      direction="rtl"
      size="400px"
      destroy-on-close
    >
      <PrivateChatRoom
        v-if="showPrivateChat"
        :target-user-id="form.id"
        :current-user-id="currentUserId"
      />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getUserById, getCurrentUser, updateUserInfo, updateUserAvatar } from '@/api/user';
import { uploadFile } from '@/api/file';
import { Upload } from '@element-plus/icons-vue';
import type { UploadRequestOptions } from 'element-plus';
import PrivateChatRoom from '@/components/PrivateChatRoom.vue';

const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance() as any;
const ElMessage = proxy.$message;

const isLoading = ref(true);
const isInfoLoading = ref(false);
const isAvatarLoading = ref(false);
const showPrivateChat = ref(false);
const currentUserId = ref(0);

const form = ref({
  id: 0, username: '', userAccount: '', avatarUrl: '', gender: 0,
  phone: '', email: '', bio: '', tags: [] as string[]
});
const tagsInput = ref("");

// 判断是否为只读模式 (有 ID 参数则是看别人)
const isReadOnly = computed(() => !!route.params.id);

// 获取当前登录用户 ID (用于聊天)
const loadMyId = async () => {
  try {
    // 这是一个轻量级的确认，确保我们知道"我是谁"
    // (如果本地 localStorage 可信，也可以直接从 localStorage 取，这里走 API 更稳妥)
    const res: any = await getCurrentUser();
    if(res) currentUserId.value = res.id;
  } catch(e) {
    // 静默失败
  }
}

const loadData = async () => {
  isLoading.value = true;
  try {
    let response;
    if (route.params.id) {
      response = await getUserById(Number(route.params.id));
    } else {
      response = await getCurrentUser();
    }

    const userData = response as any;

    if (userData) {
      form.value = { ...userData, tags: userData.tags || [] };
      tagsInput.value = form.value.tags.join(',');
    }
  } catch (err) {
    ElMessage.error('档案读取失败');
  } finally {
    isLoading.value = false;
  }
};

const handleSaveInfo = async () => {
  isInfoLoading.value = true;
  const tagList = tagsInput.value.split(/[,，]/).map(t => t.trim()).filter(t => t.length > 0);

  const dto = {
    username: form.value.username,
    bio: form.value.bio,
    email: form.value.email,
    phone: form.value.phone,
    gender: form.value.gender,
    avatarUrl: form.value.avatarUrl,
    tags: tagList
  };

  try {
    await updateUserInfo(dto);
    ElMessage.success('档案及芯片已更新');
    await loadData();
  } catch (err) {
    // error handled by interceptor
  } finally {
    isInfoLoading.value = false;
  }
};

// 上传前校验
const beforeAvatarUpload = (rawFile: File) => {
  const isImg = rawFile.type.startsWith('image/');
  const isLt2M = rawFile.size / 1024 / 1024 < 2;

  if (!isImg) {
    ElMessage.error('头像必须是图片格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 自定义上传逻辑
const handleAvatarUpload = async (options: UploadRequestOptions) => {
  isAvatarLoading.value = true;
  try {
    const fileUrl = await uploadFile(options.file);
    await updateUserAvatar({
      userId: form.value.id,
      avatarUrl: fileUrl
    });
    form.value.avatarUrl = fileUrl;
    ElMessage.success('全息影像更新成功');
  } catch (error) {
    ElMessage.error('上传失败，请重试');
  } finally {
    isAvatarLoading.value = false;
  }
};

const handleContact = () => {
  showPrivateChat.value = true;
};

onMounted(async () => {
  await loadMyId(); // 先确定自己是谁
  await loadData(); // 再加载页面数据
});
</script>

<style scoped>
.profile-page-v2 {
  padding: 0 20px;
}

/* === 玻璃卡片 === */
.glass-card {
  background: rgba(20, 30, 48, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 15px;
  margin-bottom: 25px;
  text-shadow: 0 0 10px rgba(0, 242, 234, 0.3);
}

/* === 左侧头像区 === */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.avatar-wrapper {
  position: relative;
  padding: 5px;
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 50%;
}

.main-avatar {
  border: 2px solid rgba(255,255,255,0.2);
  background: #000;
}

.avatar-uploader {
  width: 100%;
  text-align: center;
}

.update-btn {
  width: 100%;
  background: rgba(255,255,255,0.1) !important;
  border: 1px solid rgba(255,255,255,0.2) !important;
  margin-bottom: 8px;
}
.update-btn:hover {
  border-color: var(--neon-cyan) !important;
  color: var(--neon-cyan) !important;
  background: rgba(255,255,255,0.15) !important;
}

.tip-text {
  font-size: 12px;
  color: rgba(255,255,255,0.4);
}

/* === 右侧信息 Grid === */
.info-grid {
  display: grid;
  grid-template-columns: 100px 1fr;
  row-gap: 20px;
  column-gap: 20px;
  align-items: center;
}

.grid-item.label {
  color: rgba(255,255,255,0.6);
  font-size: 14px;
  text-align: right;
}

.grid-item.value {
  width: 100%;
}

/* 输入框样式 */
:deep(.el-input__wrapper), :deep(.el-textarea__inner) {
  background-color: rgba(0, 0, 0, 0.3) !important;
  box-shadow: none !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  color: #fff !important;
}

:deep(.el-input__wrapper:hover), :deep(.el-textarea__inner:hover) {
  border-color: rgba(255,255,255,0.3) !important;
}

:deep(.el-input__wrapper.is-focus), :deep(.el-textarea__inner:focus) {
  border-color: var(--neon-cyan) !important;
  box-shadow: 0 0 5px rgba(0, 242, 234, 0.2) !important;
}

/* 禁用态 */
:deep(.el-input.is-disabled .el-input__wrapper),
:deep(.el-textarea.is-disabled .el-textarea__inner) {
  background-color: rgba(255,255,255,0.02) !important;
  border-color: transparent !important;
  box-shadow: none !important;
}
:deep(.el-input.is-disabled .el-input__inner) {
  color: rgba(255,255,255,0.9) !important;
  -webkit-text-fill-color: rgba(255,255,255,0.9) !important;
  cursor: default !important;
}

/* 单选框 */
:deep(.el-radio__label) {
  color: #fff !important;
}
:deep(.el-radio__inner) {
  background: transparent;
  border-color: rgba(255,255,255,0.4);
}
:deep(.el-radio__input.is-checked .el-radio__inner) {
  background: var(--neon-cyan);
  border-color: var(--neon-cyan);
}
:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: var(--neon-cyan) !important;
}

.save-actions {
  margin-top: 30px;
  text-align: right;
  border-top: 1px solid rgba(255,255,255,0.05);
  padding-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.save-btn {
  width: 150px;
  height: 40px;
  font-size: 16px;
}
</style>
