<template>
  <div class="register-container">
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

    <div class="register-card">
      <div class="brand-header">
        <h1 class="main-title">加入舰队</h1>
        <p class="slogan">获取你的专属身份识别码</p>
      </div>

      <el-form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <el-input
            v-model="registerForm.userAccount"
            placeholder="设置账号 (至少4位)"
            prefix-icon="User"
            size="large"
            class="custom-input"
          />
        </div>

        <div class="form-group">
          <el-input
            v-model="registerForm.userPassword"
            type="password"
            placeholder="设置密钥 (至少8位)"
            prefix-icon="Lock"
            show-password
            size="large"
            class="custom-input"
          />
        </div>

        <div class="form-group">
          <el-input
            v-model="registerForm.checkPassword"
            type="password"
            placeholder="确认密钥"
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
            提交申请 (REGISTER)
          </el-button>
        </div>

        <div class="footer-links">
          <span class="text-muted">已有通行证？</span>
          <router-link to="/login" class="link-text">直接深潜</router-link>
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

const registerForm = reactive({ userAccount: '', userPassword: '', checkPassword: '' });
const loading = ref(false);
const router = useRouter();

const handleRegister = async () => {
  if (!registerForm.userAccount || !registerForm.userPassword || !registerForm.checkPassword) {
    ElMessage.warning('请填写完整的申请表');
    return;
  }
  if (registerForm.userPassword !== registerForm.checkPassword) {
    ElMessage.warning('两次输入的密钥不匹配');
    return;
  }

  loading.value = true;
  try {
    const response = await axios.post('/api/user/register', {
      userAccount: registerForm.userAccount,
      userPassword: registerForm.userPassword,
      checkPassword: registerForm.checkPassword
    });

    if (response.data.code === 0) {
      ElMessage.success('注册成功！请使用新身份登录');
      router.push('/login');
    } else {
      ElMessage.error(response.data.message || '注册申请被驳回');
    }
  } catch (error: any) {
    ElMessage.error('无法连接至注册中心');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* === 这里的样式与 Login.vue 完全一致，实现了 100% 复刻 === */

.register-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(to bottom, #004e92 0%, #000428 100%);
}

/* === 气泡动画 === */
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

/* === 海底地形 === */
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
  background: #000428;
  border-radius: 100% 100% 0 0;
}

.r1 { width: 40%; height: 120px; left: -10%; }
.r2 { width: 50%; height: 180px; left: 30%; z-index: 1; }
.r3 { width: 40%; height: 100px; right: -10%; }

/* === 光束 === */
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

/* === 注册卡片 === */
.register-card {
  width: 420px;
  padding: 50px 40px;
  /* 与 Login 保持一致的深色玻璃 */
  background: rgba(0, 4, 40, 0.4);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
  z-index: 10;
  text-align: center;
}

.main-title {
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 10px 0;
  text-shadow: 0 0 20px rgba(0, 242, 234, 0.6);
  font-style: italic;
}

.slogan {
  font-size: 14px;
  color: rgba(255,255,255,0.7);
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 18px;
}

/* 输入框定制 */
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
  height: 45px;
  font-size: 16px;
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
