<template>
  <div class="login-container">
    <div class="bubbles-container">
      <div class="bubble b1"></div>
      <div class="bubble b2"></div>
      <div class="bubble b3"></div>
      <div class="bubble b4"></div>
      <div class="bubble b5"></div>
      <div class="bubble b6"></div>
      <div class="bubble b7"></div>
    </div>

    <div class="coral-reef">
      <div class="reef-rock r1"></div>
      <div class="reef-rock r2"></div>
      <div class="reef-rock r3"></div>
    </div>

    <div class="light-beam"></div>

    <div class="login-card">
      <div class="brand-header">
        <h1 class="main-title">海底小纵队</h1>
        <div class="sub-title">CodeMate</div>
        <p class="slogan">潜入代码深海，寻找你的领航员</p>
      </div>

      <el-form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <el-input
            v-model="loginForm.userAccount"
            placeholder="探险家账号 / ID"
            prefix-icon="User"
            size="large"
            class="custom-input"
          />
        </div>

        <div class="form-group">
          <el-input
            v-model="loginForm.userPassword"
            type="password"
            placeholder="通行密钥"
            prefix-icon="Lock"
            show-password
            size="large"
            class="custom-input"
          />
        </div>

        <div class="actions">
          <el-button
            type="primary"
            native-type="submit"
            class="dive-button"
            :loading="loading"
            round
          >
            立即深潜 (LOGIN)
          </el-button>
        </div>

        <div class="footer-links">
          <span class="text-muted">还没有船票？</span>
          <router-link to="/register" class="link-text">申请新船票 (注册)</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';

const loginForm = reactive({ userAccount: '', userPassword: '' });
const loading = ref(false);
const router = useRouter();

const handleLogin = async () => {
  if (!loginForm.userAccount || !loginForm.userPassword) {
    ElMessage.warning('请输入完整的探险家凭证');
    return;
  }
  loading.value = true;
  try {
    const response = await axios.post('/api/user/login', loginForm);
    if (response.data.code === 0 && response.data.data) {
      ElMessage.success('验证通过！舱门开启...');
      localStorage.setItem('user_login_state', JSON.stringify(response.data.data));
      setTimeout(() => router.push('/match'), 1000);
    } else {
      ElMessage.error(response.data.message || '凭证无效');
    }
  } catch (error: any) {
    ElMessage.error('连接深海信号塔失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* === 核心升级：深渊背景 === */
.login-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  /* 升级为更深邃的垂直渐变，模拟光线穿透 */
  background: linear-gradient(to bottom, #004e92 0%, #000428 100%);
}

/* === CSS 动态气泡 === */
.bubbles-container {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.bubble {
  position: absolute;
  bottom: -50px;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
  border-radius: 50%;
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.1);
  animation: rise 15s infinite ease-in;
}

/* 不同大小和速度的气泡 */
.b1 { width: 40px; height: 40px; left: 10%; animation-duration: 12s; animation-delay: 0s; }
.b2 { width: 20px; height: 20px; left: 25%; animation-duration: 18s; animation-delay: 2s; }
.b3 { width: 50px; height: 50px; left: 40%; animation-duration: 20s; animation-delay: 5s; }
.b4 { width: 30px; height: 30px; left: 60%; animation-duration: 15s; animation-delay: 1s; }
.b5 { width: 15px; height: 15px; left: 75%; animation-duration: 22s; animation-delay: 3s; }
.b6 { width: 45px; height: 45px; left: 85%; animation-duration: 17s; animation-delay: 7s; }
.b7 { width: 25px; height: 25px; left: 50%; animation-duration: 19s; animation-delay: 4s; }

@keyframes rise {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  20% { opacity: 0.8; }
  100% { transform: translateY(-120vh) translateX(20px); opacity: 0; }
}

/* === CSS 海底地形剪影 === */
.coral-reef {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 200px;
  z-index: 0;
  opacity: 0.4;
}

.reef-rock {
  position: absolute;
  bottom: 0;
  background: #000428; /* 深黑色剪影 */
  border-radius: 100% 100% 0 0;
}

.r1 { width: 40%; height: 120px; left: -10%; }
.r2 { width: 50%; height: 180px; left: 30%; z-index: 1; }
.r3 { width: 40%; height: 100px; right: -10%; }

/* 顶部光束特效 (保留) */
.light-beam {
  position: absolute;
  top: -150px;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 600px;
  background: radial-gradient(circle, rgba(0, 242, 234, 0.1) 0%, transparent 60%);
  filter: blur(80px);
  z-index: 0;
  pointer-events: none;
}

/* 核心卡片：玻璃态 (微调以适应更深的背景) */
.login-card {
  width: 420px;
  padding: 50px 40px;
  background: rgba(0, 4, 40, 0.4); /* 更深的底色 */
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
  z-index: 10; /* 确保在所有元素之上 */
  text-align: center;
}

/* 品牌文字 */
.main-title {
  font-size: 42px;
  font-weight: 800;
  color: #fff;
  margin: 0;
  text-shadow: 0 0 20px rgba(0, 242, 234, 0.6);
  font-style: italic;
}

.sub-title {
  font-size: 24px;
  color: rgba(255,255,255,0.9);
  letter-spacing: 2px;
  margin-bottom: 10px;
}

.slogan {
  font-size: 14px;
  color: rgba(255,255,255,0.7);
  margin-bottom: 40px;
}

/* 表单间距 */
.form-group {
  margin-bottom: 24px;
}

/* 输入框深度定制 */
:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.05) !important;
  box-shadow: none !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 25px !important;
  padding: 0 20px !important;
}

:deep(.el-input__inner) {
  color: #fff !important;
  height: 45px;
}

/* 按钮特效 */
.dive-button {
  width: 100%;
  height: 50px;
  font-size: 18px;
  margin-top: 10px;
  border-radius: 25px;
  background: linear-gradient(90deg, #00c6ff, #0072ff);
  box-shadow: 0 0 20px rgba(0, 198, 255, 0.4);
  border: none;
  font-weight: bold;
}

.dive-button:hover {
  box-shadow: 0 0 30px rgba(0, 198, 255, 0.6);
  transform: scale(1.02);
}

/* 链接修复 */
.footer-links {
  margin-top: 30px;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.text-muted {
  color: rgba(255,255,255,0.6);
}

.link-text {
  color: #00f2ea;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s;
}

.link-text:hover {
  color: #fff;
  text-shadow: 0 0 10px #00f2ea;
}
</style>
