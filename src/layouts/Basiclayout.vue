<!-- file: src/layouts/Basiclayout.vue -->
<!-- (V4.0 案卷 #18-B 修复版) -->

<script setup lang="ts">
// 【【【 1. 导入“全局实例” 和 “新图标” 】】】
import { ref, watchEffect, onMounted, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// 【【 V4.0 修复：导入 'Grid' 图标用于“搜索队伍” 】】
import { House, Search, User, Plus, Grid } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const activePath = ref('/');
watchEffect(() => {
  activePath.value = route.path;
});
const userInfo = ref({ username: '用户' });

// 【【【 2. 获取“全局” $message (和 v4.3 页面一样) 】】】
const { proxy } = getCurrentInstance() as any;
const ElMessage = proxy.$message;


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
      handleLogout(); // (现在这个函数可以安全调用了)
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
  ElMessage.success('您已安全退出'); // (现在 ElMessage 是“已定义”的)
  router.push('/login');
};
</script>

<template>
  <el-container class="full-height-container">

    <!-- (Header 保持不变) -->
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
          <!--
            【【【 V4.0 修复 (Bug) 】】】
            (你粘贴的代码 [cite: user's provided code in message 59] 有 2 个 "index=/match" [cite: user's provided code in message 59])
            (我们保留 "伙伴匹配" [cite: user's provided code in message 59]，因为它对应 'PartnerMatchPage.vue' [cite: image_1ad1d1.png])
            (我们删除 "主页" [cite: user's provided code in message 59]，因为它 1. 冗余 2. 路由冲突)
          -->
          <!-- (已删除) <el-menu-item index="/match"><el-icon><House/></el-icon>...</el-menu-item> -->

          <el-menu-item index="/match">
            <el-icon><Search /></el-icon>
            <span>伙伴匹配</span>
          </el-menu-item>

          <!-- 【【【 案卷 #18-B：V4.0 修复 (新入口) 】】】 -->
          <el-menu-item index="/team/search">
            <el-icon><Grid /></el-icon>
            <span>搜索队伍</span>
          </el-menu-item>

          <el-menu-item index="/team/create">
            <el-icon><Plus /></el-icon>
            <span>创建队伍</span>
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
/* (所有样式保持不变) */

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
:deep(.layout-header .el-menu-item) {
  color: #ffffff !important;
}
:deep(.layout-header .el-sub-menu__title) {
  color: #ffffff !important;
  cursor: pointer;
}
:deep(.layout-header .el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}
</style>
