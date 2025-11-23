<template>
  <div class="glass-card" @click="handleClick">
    <div class="card-highlight"></div>

    <div class="card-content">
      <div class="header-section">
        <div class="avatar-wrapper">
          <el-avatar :size="56" :src="user.avatarUrl" class="user-avatar" />
          <div class="online-dot"></div> </div>
        <div class="info-block">
          <div class="username-row">
            <span class="username">{{ user.username }}</span>
            <span class="id-badge">#{{ user.id }}</span>
          </div>
          <div class="account-row">{{ user.userAccount }}</div>
        </div>
      </div>

      <div class="tags-container">
        <span
          v-for="tag in user.tags"
          :key="tag"
          class="crystal-tag"
        >
          {{ tag }}
        </span>
      </div>

      <div class="card-footer">
        <button class="action-btn">
          联系 TA
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

interface UserType {
  id: number;
  username: string;
  userAccount: string;
  avatarUrl: string;
  tags: string[];
}

const props = defineProps({
  user: {
    type: Object as PropType<UserType>,
    required: true
  }
});

const emit = defineEmits(['cardClicked']);

const handleClick = () => {
  emit('cardClicked', props.user.id);
};
</script>

<style scoped>
/* === 核心容器：玻璃态卡片 === */
.glass-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

/* 悬停效果：上浮 + 霓虹边框 + 内部发光 */
.glass-card:hover {
  transform: translateY(-5px);
  border-color: var(--neon-cyan); /* 引用全局变量 */
  box-shadow: 0 0 20px rgba(0, 242, 234, 0.15), inset 0 0 20px rgba(0, 242, 234, 0.05);
  background: rgba(255, 255, 255, 0.06);
}

/* 顶部高光条装饰 */
.card-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
}

.header-section {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.avatar-wrapper {
  position: relative;
  margin-right: 12px;
}

.user-avatar {
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: border-color 0.3s;
}

.glass-card:hover .user-avatar {
  border-color: var(--neon-cyan);
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  background: #00ff88;
  border-radius: 50%;
  border: 2px solid #1a1a1a; /* 与深色背景融合 */
  box-shadow: 0 0 5px #00ff88;
}

.info-block {
  flex: 1;
  overflow: hidden;
}

.username-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.username {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.id-badge {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.3);
  padding: 1px 4px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.account-row {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* === 晶体标签 === */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
  height: 24px; /* 限制高度，防止标签过多撑开 */
  overflow: hidden;
}

.crystal-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(0, 242, 234, 0.1); /* 青色半透明 */
  color: var(--neon-cyan);
  border: 1px solid rgba(0, 242, 234, 0.2);
  backdrop-filter: blur(4px);
}

/* 底部按钮区 */
.card-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 10px;
  text-align: right;
}

.action-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.glass-card:hover .action-btn {
  background: var(--neon-blue);
  border-color: var(--neon-blue);
  box-shadow: 0 0 10px rgba(0, 128, 255, 0.4);
}
</style>
