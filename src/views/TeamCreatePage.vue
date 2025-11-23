<template>
  <div class="create-container">
    <div class="glass-form-card">
      <div class="header">
        <h2>创建新船队 (Blueprint)</h2>
        <p>规划你的航线，召集你的船员</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        label-position="top"
        class="ocean-form"
      >
        <el-form-item label="船队代号 (Name)">
          <el-input v-model="form.name" placeholder="给你的队伍起个响亮的名字" size="large" />
        </el-form-item>

        <el-form-item label="航行日志 (Description)">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="介绍一下你的目标..."
          />
        </el-form-item>

        <div class="row-2">
          <el-form-item label="最大载员">
            <el-input-number v-model="form.maxNum" :min="2" :max="10" style="width: 100%" />
          </el-form-item>

          <el-form-item label="加密模式">
            <el-select v-model="form.status" placeholder="选择模式" style="width: 100%">
              <el-option label="公开航线 (Public)" :value="0" />
              <el-option label="加密航线 (Protected)" :value="2" />
              <el-option label="隐形航线 (Private)" :value="1" />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item v-if="form.status === 2" label="通行密钥">
          <el-input v-model="form.password" type="password" show-password placeholder="设置入队密码" />
        </el-form-item>

        <el-form-item label="过期时间 (选填)">
          <el-date-picker
            v-model="form.expireTime"
            type="datetime"
            placeholder="选择解散时间"
            style="width: 100%"
          />
        </el-form-item>

        <div class="actions">
          <el-button type="primary" size="large" class="submit-btn" @click="handleCreate" :loading="isLoading">
            立即下水 (LAUNCH)
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, getCurrentInstance } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const { proxy } = getCurrentInstance() as any;
const ElMessage = proxy.$message;

const isLoading = ref(false);
const form = reactive({
  name: '',
  description: '',
  maxNum: 5,
  expireTime: null,
  status: 0,
  password: '',
  tags: []
});

const handleCreate = async () => {
  if (!form.name) {
    ElMessage.warning('船队必须有代号');
    return;
  }
  if (form.status === 2 && !form.password) {
    ElMessage.warning('加密船队必须设置密钥');
    return;
  }

  isLoading.value = true;
  try {
    const res = await axios.post('/api/team/create', form);
    if (res.data.code === 0) {
      ElMessage.success('船队创建成功！正在入列...');
      const newId = res.data.data;
      setTimeout(() => router.push(`/team/${newId}`), 1000);
    } else {
      ElMessage.error(res.data.message);
    }
  } catch (e) {
    ElMessage.error('创建失败，通讯中断');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.create-container {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
  /* 确保底部有足够的空间滚动 */
  padding-bottom: 100px;
}

.glass-form-card {
  width: 100%;
  max-width: 600px;
  background: rgba(20, 30, 48, 0.6); /* 加深背景 */
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.header h2 {
  color: #fff;
  margin: 0 0 10px 0;
  font-size: 24px;
  text-shadow: 0 0 10px rgba(0, 242, 234, 0.3);
}

.header p {
  color: rgba(255,255,255,0.6);
  margin-bottom: 30px;
}

.row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* 强制覆盖 Label 颜色 */
:deep(.el-form-item__label) {
  color: rgba(255,255,255,0.9) !important;
  font-weight: 500;
}

.actions {
  margin-top: 40px;
  text-align: center;
}

.submit-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-blue)) !important;
  border: none !important;
  font-weight: bold;
  font-size: 18px;
  color: #000 !important; /* 黑字配亮背景 */
  letter-spacing: 2px;
  border-radius: 25px;
  box-shadow: 0 0 20px rgba(0, 242, 234, 0.4);
  transition: transform 0.2s;
}

.submit-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 0 30px rgba(0, 242, 234, 0.6);
}
</style>
