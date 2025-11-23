<template>
  <div class="chat-room">
    <div class="message-list" ref="messageListRef">
      <div v-if="messages.length === 0" class="empty-tip">
        频道静默中，发送第一条信号吧~
      </div>

      <div
        v-for="msg in messages"
        :key="msg.id"
        class="message-item"
        :class="{ 'is-mine': isMyMessage(msg.userId) }"
      >
        <el-avatar :size="36" :src="msg.userAvatar" class="avatar" />

        <div class="content-wrapper">
          <div class="meta-info">
            <span class="username">{{ msg.username }}</span>
            <span class="time">{{ formatTime(msg.createTime) }}</span>
          </div>
          <div class="bubble">
            {{ msg.content }}
          </div>
        </div>
      </div>
    </div>

    <div class="input-area">
      <el-input
        v-model="inputText"
        placeholder="发送加密讯息..."
        @keyup.enter="handleSend"
        :disabled="!isConnected"
        class="chat-input"
      >
        <template #append>
          <el-button type="primary" @click="handleSend" :loading="isSending" :disabled="!isConnected">
            发送
          </el-button>
        </template>
      </el-input>

      <div class="connection-status">
        <span class="status-dot" :class="{ online: isConnected }"></span>
        {{ isConnected ? '加密链路已建立' : '正在尝试重连卫星...' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { getHistoryMessage } from '@/api/chat';
import type { ChatVO, ChatRequest } from '@/models/chat';
import { ElMessage } from 'element-plus';

// --- Props ---
const props = defineProps<{
  teamId: number;
  currentUser: any;
}>();

// --- State ---
const messages = ref<ChatVO[]>([]);
const inputText = ref('');
const isConnected = ref(false);
const isSending = ref(false);
const messageListRef = ref<HTMLElement | null>(null);
let stompClient: any = null;

// --- Lifecycle ---
onMounted(async () => {
  await loadHistory();
  initWebSocket();
});

onUnmounted(() => {
  disconnectWebSocket();
});

// --- Logic ---
const loadHistory = async () => {
  try {
    const res = await getHistoryMessage(props.teamId);
    if (res) {
      messages.value = res;
      scrollToBottom();
    }
  } catch (error) {
    console.error("历史日志读取失败", error);
  }
};

const initWebSocket = () => {
  // 加上 /api 前缀，匹配 vite.config.ts 代理
  const socket = new SockJS('/api/ws/codemate');
  stompClient = Stomp.over(socket);
  stompClient.debug = null; // 静默模式

  stompClient.connect(
    {},
    () => {
      isConnected.value = true;
      stompClient.subscribe(`/topic/team/${props.teamId}`, (response: any) => {
        const newMessage = JSON.parse(response.body) as ChatVO;
        messages.value.push(newMessage);
        scrollToBottom();
      });
    },
    (error: any) => {
      console.error('链路连接中断', error);
      isConnected.value = false;
    }
  );
};

const disconnectWebSocket = () => {
  if (stompClient) stompClient.disconnect();
  isConnected.value = false;
};

const handleSend = () => {
  const content = inputText.value.trim();
  if (!content) return;
  if (!isConnected.value) {
    ElMessage.warning('链路中断，正在重连...');
    return;
  }

  const req: ChatRequest = {
    teamId: props.teamId,
    content: content
  };

  try {
    stompClient.send(`/app/chat/${props.teamId}`, {}, JSON.stringify(req));
    inputText.value = '';
  } catch (e) {
    ElMessage.error('信号发送失败');
  }
};

const isMyMessage = (senderId: number) => {
  return props.currentUser && props.currentUser.id === senderId;
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  return timeStr.split(' ')[1] || timeStr;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
  });
};
</script>

<style scoped>
/* === 深海聊天室容器 === */
.chat-room {
  display: flex;
  flex-direction: column;
  height: 500px; /* 固定高度，或根据父容器调整 */
  background: rgba(0, 0, 0, 0.2); /* 深色半透明背景 */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(5px);
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 滚动条样式微调 */
.message-list::-webkit-scrollbar {
  width: 6px;
}
.message-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.empty-tip {
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 50px;
  font-size: 14px;
}

/* === 消息项 === */
.message-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 85%;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-info {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.username {
  margin-right: 8px;
  font-weight: bold;
}

/* === 气泡风格：深海玻璃 === */
/* 他人发送的消息 */
.bubble {
  padding: 12px 16px;
  background-color: rgba(255, 255, 255, 0.1); /* 磨砂白 */
  color: #fff;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-all;
  border-radius: 12px;
  border-top-left-radius: 2px; /* 尖角指向左 */
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* === 我的消息 (右侧) === */
.message-item.is-mine {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-item.is-mine .content-wrapper {
  align-items: flex-end;
}

.message-item.is-mine .bubble {
  background-color: rgba(0, 242, 234, 0.15); /* 霓虹青半透明 */
  border: 1px solid rgba(0, 242, 234, 0.3); /* 亮青色边框 */
  color: #e0fbff;
  border-top-left-radius: 12px;
  border-top-right-radius: 2px; /* 尖角指向右 */
  box-shadow: 0 0 15px rgba(0, 242, 234, 0.1); /* 微弱发光 */
}

/* === 底部输入区 === */
.input-area {
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.connection-status {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #f56c6c;
  box-shadow: 0 0 5px #f56c6c;
}

.status-dot.online {
  background-color: #00ff88; /* 荧光绿 */
  box-shadow: 0 0 5px #00ff88;
}

/* 深度定制 Element Input */
:deep(.el-input-group__append) {
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
}
:deep(.el-button:hover) {
  color: var(--neon-cyan);
}
</style>
