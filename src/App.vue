<script setup lang="ts">
// 这里是全局的 <script> 区域，比如以后我们可以在这里检查登录状态
</script>

<template>
  <RouterView />
</template>

<style>
/* 我们删除了 <style scoped>，换成了全局的 <style>。
  这里是我们的全局 CSS 初始化的地方。
  我们把 Vite 自带的边距 (margin) 和填充 (padding) 都去掉，
  确保我们的 Element Plus 布局能占满全屏。
*/
#app {
  padding: 0;
  margin: 0;
  max-width: 100vw; /* 占满全屏 */
}
</style>
