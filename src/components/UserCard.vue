<template>
  <el-card
    class="user-card"
    shadow="hover"
    @click="handleClick"
  >
    <div class="card-header">
      <el-avatar :size="60" :src="props.user.avatarUrl" />
      <div class="user-info">
        <span class="username">{{ props.user.username }} (id: {{ props.user.id }})</span>
        <span class="user-account">{{ props.user.userAccount }}</span>
      </div>
    </div>
    <div class="card-body">
      <el-tag v-for="tag in props.user.tags" :key="tag" size="small" style="margin-right: 5px;">
        {{ tag }}
      </el-tag>
    </div>
    <template #footer>
      <el-button type="primary" plain>联系我</el-button>
    </template>
  </el-card>
</template>

<script setup lang="ts">
// 【“案子 B” - 修复】
// 我们（作为“子组件”）定义我们“需要”什么。
// 我们“需要”一个“user”对象，它必须符合这个“类型”。
interface UserType {
  id: number;
  username: string;
  userAccount: string;
  avatarUrl: string;
  tags: string[];
}

// 1. 定义“父组件”必须“喂”给我们的 prop
const props = defineProps<{
  user: UserType
}>();

// 【“案子 A” - 修复 2/4】
// 2. 定义我们要“发出”的“信号”
const emit = defineEmits<{
  (e: 'cardClicked', id: number): void
}>();

// 【“案子 A” - 修复 3/4】
// 3. 当卡片被点击时，
const handleClick = () => {
  // “发出信号”，并把“我们”的 ID (props.user.id) 作为“信号内容”
  emit('cardClicked', props.user.id);
};
</script>

<style scoped>
/* (样式与我上一条回复中的“V2.1 修复·蓝图”一致) */
.user-card {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0px 12px 32px 4px rgba(0, 0, 0, 0.06), 0px 8px 20px rgba(0, 0, 0, 0.04);
}
.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}
.user-info {
  display: flex;
  flex-direction: column;
  margin-left: 15px;
}
.username {
  font-weight: bold;
  font-size: 1.1em;
}
.user-account {
  font-size: 0.9em;
  color: #888;
}
</style>
