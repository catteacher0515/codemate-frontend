<template>
  <div class="login-container">
    <el-row type="flex" justify="center" align="middle" style="height: 100%">

      <el-col :span="12" class="left-panel">
        <div class="brand-section">

          <img src="/logo-mayuan.png" alt="码缘 Logo" class="logo" />

          <h1>码缘 (CodeMate)</h1>
          <p>专为程序员打造的伙伴匹配平台</p>
        </div>
      </el-col>

      <el-col :span="12" class="right-panel">
        <div class="login-form-wrapper">

          <h2 class="login-title">欢迎回来 (Log In)</h2>
          <p class="login-subtitle">请输入您的凭证以继续</p>

          <el-form
            @submit.prevent="handleLogin"
            label-position="top"
          >

            <el-form-item label="账号 (User Account)">
              <el-input
                v-model="loginForm.userAccount"
                placeholder="请输入账号"
                size="large"
              />
            </el-form-item>

            <el-form-item label="密码 (Password)">
              <el-input
                v-model="loginForm.userPassword"
                type="password"
                placeholder="请输入密码"
                show-password
                size="large"
              />
            </el-form-item>

            <el-form-item class="form-actions">
              <el-button
                type="primary"
                native-type="submit"
                class="login-button"
                size="large"
                :loading="loading"
              >
                登 录
              </el-button>
            </el-form-item>

            <div class="register-link">
              还没有账号？
              <router-link to="/register">立即注册</router-link>
            </div>

          </el-form>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
// (这部分是完整的，包含了 localStorage 逻辑)
import { reactive, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const loginForm = reactive({
  userAccount: '',
  userPassword: ''
});
const loading = ref(false);

const router = useRouter();

const handleLogin = async () => {
  if (!loginForm.userAccount || !loginForm.userPassword) {
    ElMessage.warning('账号和密码不能为空');
    return;
  }
  loading.value = true;

  try {
    const response = await axios.post('/api/user/login', {
      userAccount: loginForm.userAccount,
      userPassword: loginForm.userPassword
    });

    if (response.data.code === 0 && response.data.data) {
      ElMessage.success('登录成功！正在跳转...');
      localStorage.setItem('user_login_state', JSON.stringify(response.data.data));
      await router.push('/match');
    } else {
      ElMessage.error(response.data.message || '登录失败');
    }

  } catch (error: any) {
    console.error('登录时发生错误:', error);
    ElMessage.error(error.response?.data?.message || '服务器内部错误');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  document.documentElement.classList.add('dark');
});
onUnmounted(() => {
  document.documentElement.classList.remove('dark');
});
</script>

<style scoped>
/* (这是“迭代 4”的样式，修正了间距和 logo) */

.login-container {
  height: 100vh;
  background-color: #141414;
  color: #E5EAF3;
}

/* --- 左侧面板：品牌 --- */
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
  margin-bottom: 15px; /* (我们上次“冻结”的样式) */
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

/* --- 右侧面板：表单 --- */
.right-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1D1D1D;
  height: 100%;
}

.login-form-wrapper {
  width: 360px;
  padding: 40px;
}

.login-title {
  font-size: 2rem;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 10px;
}

.login-subtitle {
  color: #A3A6AD;
  margin-bottom: 30px;
}

:deep(.el-form-item__label) {
  color: #C9CDD4;
  justify-content: flex-start;
  margin-bottom: 6px !important;
}

.login-button {
  width: 100%;
}

.form-actions {
  margin-top: 20px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #A3A6AD;
}

.register-link a {
  color: var(--el-color-primary);
  text-decoration: none;
  font-weight: 500;
}
.register-link a:hover {
  text-decoration: underline;
}
</style>
