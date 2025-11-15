<script setup lang="ts">
// (这部分与上一版“完全相同”，无需改动)
import { ref, watchEffect, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { House, Search, User } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const activePath = ref('/');
watchEffect(() => {
  activePath.value = route.path;
});
const userInfo = ref({ username: '用户' });

onMounted(() => {
  const storedUser = localStorage.getItem('user_login_state');
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      if (userData && userData.username) {
        userInfo.value = userData;
      }
    } catch (e) {
      console.error("解析用户信息失败", e);
      handleLogout();
    }
  }
});

const handleTopNavSelect = (index: string) => {
  if (index === 'logout') {
    handleLogout();
    return;
  }
  if (index === 'user-menu') {
    router.push('/profile');
    return;
  }
  if (index.startsWith('/')) {
    router.push(index);
  }
};

const handleLogout = () => {
  localStorage.removeItem('user_login_state');
  ElMessage.success('您已安全退出');
  router.push('/login');
};
</script>

<template>
  <el-container class="full-height-container">

    <el-header class="layout-header">
      <div class="logo-text">CodeMate (码缘)</div>
      <div style="flex-grow: 1;"></div>

      <el-menu
        mode="horizontal"
        background-color="transparent"
        :ellipsis="false"
        :default-active="activePath"
        @select="handleTopNavSelect"
      >
        <el-menu-item index="/match">首页</el-menu-item>

        <el-sub-menu index="user-menu">
          <template #title>{{ userInfo.username }}</template>
          <el-menu-item index="/profile">个人中心</el-menu-item>
          <el-menu-item index="logout">退出登录</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-header>

    <el-container>
      <el-aside width="200px">
        <el-menu
          :default-active="activePath"
          class="el-menu-vertical-demo"
          router
        >
          <el-menu-item index="/match">
            <el-icon><House /></el-icon>
            <span>主页</span>
          </el-menu-item>
          <el-menu-item index="/match">
            <el-icon><Search /></el-icon>
            <span>伙伴匹配</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
/* 【【【“27号案”核心修复 2/2：使用“CSS SOP”替代“属性 SOP”】】】 */

.full-height-container {
  height: 100vh;
}
.layout-header {
  background-color: #337ecc;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 18px;
  font-weight: bold;
}
.logo-text {
  margin-right: 20px;
}
.layout-header .el-menu {
  border-bottom: none;
}
.layout-header .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* 【“SOP 修复”：让“顶部”菜单项的文字变白】 */
:deep(.layout-header .el-menu-item) {
  color: #ffffff !important;
}
/* 【“SOP 修复”：让“顶部”子菜单的“标题”变白】 */
:deep(.layout-header .el-sub-menu__title) {
  color: #ffffff !important;
  cursor: pointer;
}
:deep(.layout-header .el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}
</style>
