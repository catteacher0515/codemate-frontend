<script setup lang="ts">
// 全局脚本区域
</script>

<template>
  <RouterView />
</template>

<style>
/* === 全局重置补丁 === */
/* 这里的样式是全局生效的，不加 scoped */

html, body {
  margin: 0 !important;
  padding: 0 !important;
  width: 100%;
  height: 100%;
  overflow: hidden; /* 禁止出现莫名其妙的滚动条 */
  background-color: #0f2027; /* 兜底深色背景，防止白边闪烁 */
}

#app {
  padding: 0 !important;
  margin: 0 !important;
  width: 100%;
  height: 100%;
  max-width: 100vw;
  overflow: hidden;
}
</style>
