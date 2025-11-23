<template>
  <div class="ocean-layout">
    <aside class="glass-sidebar">
      <div class="logo-area">
        <h2>CodeMate</h2>
      </div>

      <nav class="nav-menu">
        <div
          v-for="item in menuItems"
          :key="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path }"
          @click="router.push(item.path)"
        >
          <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
          <span class="nav-text">{{ item.label }}</span>
          <div class="active-glow" v-if="route.path === item.path"></div>
        </div>
      </nav>

      <div class="logout-area">
        <div class="nav-item logout-btn" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <span>紧急潜出 (Logout)</span>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <header class="glass-header">
        <div class="depth-indicator">
          <span class="label">当前深度:</span>
          <span class="value">-{{ Math.floor(Math.random() * 500 + 100) }}m</span>
        </div>
        <div class="user-profile" @click="router.push('/profile')">
          <span class="username">{{ userInfo.username || '探险家' }}</span>
          <el-avatar :size="40" :src="userInfo.avatarUrl || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" class="header-avatar"/>
        </div>
      </header>

      <div class="content-viewport">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Search, User, Plus, Grid, SwitchButton } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const userInfo = ref<any>({});

// 菜单配置
const menuItems = [
  { label: '发现伙伴 (Match)', path: '/match', icon: Search },
  { label: '寻找队伍 (Team)', path: '/team/search', icon: Grid },
  { label: '组建船队 (Create)', path: '/team/create', icon: Plus },
  { label: '我的船票 (Profile)', path: '/profile', icon: User },
];

onMounted(() => {
  const userStr = localStorage.getItem('user_login_state');
  if (userStr) {
    try {
      userInfo.value = JSON.parse(userStr);
    } catch(e) {
      console.error("用户信息解析失败");
    }
  }
});

const handleLogout = () => {
  localStorage.removeItem('user_login_state');
  router.push('/login');
};
</script>

<style scoped>
.ocean-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  padding: 20px;
  box-sizing: border-box;
  gap: 20px;
  overflow: hidden; /* 关键：锁死外层滚动 */
}

/* === 左侧悬浮栏 === */
.glass-sidebar {
  width: 260px;
  height: 100%;
  /* 加深背景色，使其在深海背景上更明显 */
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  padding: 30px 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
  z-index: 10;
}

.logo-area {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  padding-left: 10px;
}

.logo-img {
  width: 32px;
  height: 32px;
  margin-right: 10px;
  border-radius: 8px;
}

.logo-area h2 {
  color: #fff;
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(0, 242, 234, 0.5);
}

.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto; /* 菜单过长可滚动 */
}

/* 导航项 */
.nav-item {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  border-radius: 14px;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(255,255,255,0.08);
  color: #fff;
  transform: translateX(3px);
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(0, 242, 234, 0.2), rgba(0, 128, 255, 0.1));
  color: #00f2ea;
  border: 1px solid rgba(0, 242, 234, 0.3);
  box-shadow: 0 0 15px rgba(0, 242, 234, 0.1);
}

.nav-icon {
  font-size: 20px;
  margin-right: 12px;
}

/* === 退出按钮区域 === */
.logout-area {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.logout-btn {
  color: #ff6b81 !important; /* 强制红色 */
  border: 1px solid rgba(255, 107, 129, 0.2);
  transition: all 0.3s;
}

.logout-btn:hover {
  background: rgba(255, 107, 129, 0.15) !important;
  box-shadow: 0 0 15px rgba(255, 107, 129, 0.3);
  transform: translateY(-2px);
}

/* === 右侧主内容区 === */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  overflow: hidden;
}

/* 顶部状态栏 */
.glass-header {
  height: 64px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 25px;
  flex-shrink: 0;
}

.depth-indicator .label {
  color: rgba(255,255,255,0.5);
  margin-right: 8px;
  font-size: 14px;
}

.depth-indicator .value {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  color: var(--neon-cyan);
  font-size: 16px;
  text-shadow: 0 0 5px var(--neon-cyan);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 30px;
  transition: background 0.3s;
}

.user-profile:hover {
  background: rgba(255,255,255,0.1);
}

.header-avatar {
  border: 2px solid rgba(255,255,255,0.2);
}

.username {
  color: #fff;
  font-weight: 500;
}

/* 内容视口 */
.content-viewport {
  flex: 1;
  overflow-y: auto; /* 只有这里滚动 */
  overflow-x: hidden;
  padding-right: 5px;

  /* 滚动条美化 */
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.content-viewport::-webkit-scrollbar {
  width: 6px;
}
.content-viewport::-webkit-scrollbar-track {
  background: transparent;
}
.content-viewport::-webkit-scrollbar-thumb {
  background-color: rgba(255,255,255,0.1);
  border-radius: 20px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
