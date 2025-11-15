<template>
  <div class="register-container">
    <el-row type="flex" justify="center" align="middle" style="height: 100%">

      <el-col :span="12" class="left-panel">
        <div class="brand-section">
          <img src="/logo-mayuan.png" alt="码缘 Logo" class="logo" />
          <h1>码缘 (CodeMate)</h1>
          <p>专为程序员打造的伙伴匹配平台</p>
        </div>
      </el-col>

      <el-col :span="12" class="right-panel">
        <div class="form-wrapper">

          <h2 class="title">创建您的账号</h2>
          <p class="subtitle">加入我们，寻找编码伙伴</p>

          <el-form
            @submit.prevent="handleRegister"
            label-position="top"
          >

            <el-form-item label="账号 (User Account)">
              <el-input
                v-model="registerForm.userAccount"
                placeholder="请输入账号 (至少4位)"
                size="large"
              />
            </el-form-item>

            <el-form-item label="密码 (Password)">
              <el-input
                v-model="registerForm.userPassword"
                type="password"
                placeholder="请输入密码 (至少8位)"
                show-password
                size="large"
              />
            </el-form-item>

            <el-form-item label="确认密码 (Confirm Password)">
              <el-input
                v-model="registerForm.checkPassword"
                type="password"
                placeholder="请再次输入密码"
                show-password
                size="large"
              />
            </el-form-item>

            <el-form-item class="form-actions">
              <el-button
                type="primary"
                native-type="submit"
                class="submit-button"
                size="large"
                :loading="loading"
              >
                注 册
              </el-button>
            </el-form-item>

            <div class="login-link">
              已有账号？
              <router-link to="/login">立即登录</router-link>
            </div>

          </el-form>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';

// --- 状态层 (State) ---
// (使用 3 个字段)
const registerForm = reactive({
  userAccount: '',
  userPassword: '',
  checkPassword: ''
});
const loading = ref(false);

// --- 动作层 (Action) ---
const router = useRouter();

// (创建 handleRegister 方法)
const handleRegister = async () => {
  // 1. [前端校验]
  if (!registerForm.userAccount || !registerForm.userPassword || !registerForm.checkPassword) {
    ElMessage.warning('所有字段均为必填项');
    return;
  }
  if (registerForm.userPassword.length < 8) {
    ElMessage.warning('密码长度不能小于 8 位');
    return;
  }
  if (registerForm.userPassword !== registerForm.checkPassword) {
    ElMessage.warning('两次输入的密码不一致');
    return;
  }

  loading.value = true;

  try {
    // 2. [通信层 (API Call)] - 调用我们“已告破”的“22号案” API
    const response = await axios.post('/api/user/register', {
      userAccount: registerForm.userAccount,
      userPassword: registerForm.userPassword,
      checkPassword: registerForm.checkPassword
    });

    // 3. [成功处理]
    if (response.data.code === 0) {
      ElMessage.success('注册成功！正在跳转至登录页...');

      // 【【【核心跳转】】】
      await router.push('/login'); // 注册成功后，跳转到登录页

    } else {
      // (处理后端业务异常, e.g., “账号已存在”)
      ElMessage.error(response.data.message || '注册失败');
    }

  } catch (error: any) {
    console.error('注册时发生错误:', error);
    ElMessage.error(error.response?.data?.message || '服务器内部错误');
  } finally {
    loading.value = false;
  }
};

// --- 风格层 (Styling) ---
// (SOP：启用黑暗模式)
onMounted(() => {
  document.documentElement.classList.add('dark');
});
onUnmounted(() => {
  document.documentElement.classList.remove('dark');
});

</script>

<style scoped>
/* 【【【SOP：复刻 Login.vue 的所有样式】】】 */
/* (我们只修改了 .login-xxx 为 .register-xxx) */

.register-container {
  height: 100vh;
  background-color: #141414;
  color: #E5EAF3;
}

/* --- 左侧面板：品牌 (与 Login 一致) --- */
.left-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  background-size: cover;
  padding: 40px;
}
.brand-section {
  text-align: center;
}
.brand-section .logo {
  width: 180px;
  object-fit: contain;
  border-radius: 20px;
  margin-bottom: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
.brand-section h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: #FFFFFF;
}
.brand-section p {
  font-size: 1.1rem;
  color: #A3A6AD;
}

/* --- 右侧面板：表单 (与 Login 一致) --- */
.right-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1D1D1D;
  height: 100%;
}
.form-wrapper { /* (改名) */
  width: 360px;
  padding: 40px;
}
.title { /* (改名) */
  font-size: 2rem;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 10px;
}
.subtitle { /* (改名) */
  color: #A3A6AD;
  margin-bottom: 30px;
}
:deep(.el-form-item__label) {
  color: #C9CDD4;
  justify-content: flex-start;
  margin-bottom: 6px !important;
}
.submit-button { /* (改名) */
  width: 100%;
}
.form-actions {
  margin-top: 20px;
}
.login-link { /* (改名) */
  text-align: center;
  margin-top: 20px;
  color: #A3A6AD;
}
.login-link a {
  color: var(--el-color-primary);
  text-decoration: none;
  font-weight: 500;
}
.login-link a:hover {
  text-decoration: underline;
}
</style>
