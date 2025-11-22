<template>
  <div class="chat-room">
    <div class="message-list" ref="messageListRef">
      <div v-if="messages.length === 0" class="empty-tip">
        暂无消息，快来做第一个发言的人吧~
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
        placeholder="说点什么..."
        @keyup.enter="handleSend"
        :disabled="!isConnected"
      >
        <template #append>
          <el-button type="primary" @click="handleSend" :loading="isSending" :disabled="!isConnected">
            发送
          </el-button>
        </template>
      </el-input>
      <div class="connection-status">
        <span class="status-dot" :class="{ online: isConnected }"></span>
        {{ isConnected ? '实时连接中' : '正在断线重连中...' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
// 【关键修复】回归标准引入，配合 vite.config.ts 的 global 补丁
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { getHistoryMessage } from '@/api/chat';
import type { ChatVO, ChatRequest } from '@/models/chat';
import { ElMessage } from 'element-plus';

// --- Props 定义 ---
const props = defineProps<{
  teamId: number;
  currentUser: any; // 用于判断 isMine
}>();

// --- 状态定义 ---
const messages = ref<ChatVO[]>([]);
const inputText = ref('');
const isConnected = ref(false);
const isSending = ref(false);
const messageListRef = ref<HTMLElement | null>(null);
let stompClient: any = null;

// --- 核心逻辑 ---
onMounted(async () => {
  await loadHistory();
  initWebSocket();
});

onUnmounted(() => {
  disconnectWebSocket();
});

const loadHistory = async () => {
  try {
    const res = await getHistoryMessage(props.teamId);
    if (res) {
      messages.value = res;
      scrollToBottom();
    }
  } catch (error) {
    console.error("加载历史消息失败", error);
  }
};

const initWebSocket = () => {
  // 1. 建立连接 (利用 Vite 代理 /ws -> 后端 8080)
  // 使用相对路径，让请求走 http://localhost:5173/ws/codemate
  // 从而触发 vite.config.ts 中的 proxy 转发
// 【关键修复】加上 /api 前缀，匹配后端的 context-path
  const socket = new SockJS('/api/ws/codemate');
  stompClient = Stomp.over(socket);

  stompClient.debug = null; // 关闭控制台刷屏日志

  stompClient.connect(
    {},
    () => {
      isConnected.value = true;
      // 2. 订阅队伍频道
      stompClient.subscribe(`/topic/team/${props.teamId}`, (response: any) => {
        const newMessage = JSON.parse(response.body) as ChatVO;
        messages.value.push(newMessage);
        scrollToBottom();
      });
    },
    (error: any) => {
      console.error('WebSocket 连接失败', error);
      isConnected.value = false;
    }
  );
};

const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.disconnect();
  }
  isConnected.value = false;
};

const handleSend = () => {
  const content = inputText.value.trim();
  if (!content) return;
  if (!isConnected.value) {
    ElMessage.warning('连接已断开，正在重连...');
    return;
  }

  const req: ChatRequest = {
    teamId: props.teamId,
    content: content
  };

  try {
    // 发送给 /app/chat/{teamId}
    // 后端 ChatController 会接收并在鉴权后广播回 /topic/team/{teamId}
    stompClient.send(`/app/chat/${props.teamId}`, {}, JSON.stringify(req));
    inputText.value = '';
  } catch (e) {
    ElMessage.error('发送失败');
  }
};

// --- 辅助逻辑 ---
const isMyMessage = (senderId: number) => {
  // 只有当 currentUser 存在且 ID 匹配时才算我的消息
  return props.currentUser && props.currentUser.id === senderId;
};

const formatTime = (timeStr: string) => {
  if(!timeStr) return '';
  // 简单截取 HH:mm:ss
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
.chat-room {
  display: flex;
  flex-direction: column;
  height: 500px;
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  background-color: #f5f7fa;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.empty-tip {
  text-align: center;
  color: #909399;
  margin-top: 50px;
  font-size: 14px;
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: 80%;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-info {
  font-size: 12px;
  color: #909399;
}

.username {
  margin-right: 8px;
}

/* 通用气泡样式 */
.bubble {
  padding: 10px 14px;
  background-color: #ffffff;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  /* 统一圆角 */
  border-radius: 8px;
  /* 左侧气泡特有：左上角尖 */
  border-top-left-radius: 2px;
}

/* === 我的消息 (右侧显示) === */
.message-item.is-mine {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-item.is-mine .content-wrapper {
  align-items: flex-end;
}

.message-item.is-mine .bubble {
  background-color: #95ec69; /* 微信绿 */
  /* 重置左上角 */
  border-top-left-radius: 8px;
  /* 右侧气泡特有：右上角尖 */
  border-top-right-radius: 2px;
}

.input-area {
  padding: 15px;
  background-color: #fff;
  border-top: 1px solid #EBEEF5;
}

.connection-status {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #f56c6c; /* 离线红 */
}

.status-dot.online {
  background-color: #67c23a; /* 在线绿 */
}
</style>
