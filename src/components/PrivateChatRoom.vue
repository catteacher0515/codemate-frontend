<template>
  <div class="chat-room">
    <div class="message-list" ref="messageListRef">
      <div v-if="messages.length === 0" class="empty-tip">
        加密频道已建立，开始通讯...
      </div>

      <div v-for="msg in messages" :key="msg.id" class="message-item" :class="{ 'is-mine': isMyMessage(msg.userId) }">
        <el-avatar :size="36" :src="msg.userAvatar" class="avatar" />
        <div class="content-wrapper">
          <div class="meta-info">
            <span class="username">{{ msg.username }}</span>
            <span class="time">{{ formatTime(msg.createTime) }}</span>
          </div>
          <div class="bubble">{{ msg.content }}</div>
        </div>
      </div>
    </div>

    <div class="input-area">
      <el-input v-model="inputText" placeholder="发送私密消息..." @keyup.enter="handleSend" :disabled="!isConnected">
        <template #append>
          <el-button type="primary" @click="handleSend" :loading="isSending" :disabled="!isConnected">发送</el-button>
        </template>
      </el-input>
      <div class="connection-status">
        <span class="status-dot" :class="{ online: isConnected }"></span>
        {{ isConnected ? '加密连接正常' : '正在建立私有链路...' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import service from '@/utils/request'; // 直接用 request 获取历史
import type { ChatVO } from '@/models/chat';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  targetUserId: number;
  currentUserId: number;
}>();

const messages = ref<ChatVO[]>([]);
const inputText = ref('');
const isConnected = ref(false);
const isSending = ref(false);
const messageListRef = ref<HTMLElement | null>(null);
let stompClient: any = null;

// 1. 加载历史消息
const loadHistory = async () => {
  try {
    const res: any = await service.get('/chat/private/history', {
      params: { targetUserId: props.targetUserId }
    });
    if (res) {
      messages.value = res;
      scrollToBottom();
    }
  } catch (error) {
    console.error("历史消息加载失败", error);
  }
};

// 2. WebSocket 连接
const initWebSocket = () => {
  const socket = new SockJS('/api/ws/codemate');
  stompClient = Stomp.over(socket);
  stompClient.debug = null;

  stompClient.connect({}, () => {
      isConnected.value = true;

      // 【核心逻辑】订阅双人专属频道
      // 频道 ID = min(id1, id2) + "_" + max(id1, id2)
      const minId = Math.min(props.currentUserId, props.targetUserId);
      const maxId = Math.max(props.currentUserId, props.targetUserId);
      const channel = `/topic/private/${minId}_${maxId}`;

      stompClient.subscribe(channel, (response: any) => {
        const newMessage = JSON.parse(response.body) as ChatVO;
        messages.value.push(newMessage);
        scrollToBottom();
      });
    }, (error: any) => {
      isConnected.value = false;
    }
  );
};

const handleSend = () => {
  const content = inputText.value.trim();
  if (!content || !isConnected.value) return;

  const req = {
    targetUserId: props.targetUserId,
    content: content
  };

  try {
    stompClient.send(`/app/chat/private`, {}, JSON.stringify(req));
    inputText.value = '';
  } catch (e) {
    ElMessage.error('发送失败');
  }
};

const isMyMessage = (senderId: number) => props.currentUserId === senderId;
const formatTime = (timeStr: string) => timeStr ? (timeStr.split(' ')[1] || timeStr) : '';
const scrollToBottom = () => nextTick(() => { if (messageListRef.value) messageListRef.value.scrollTop = messageListRef.value.scrollHeight; });
const disconnectWebSocket = () => { if (stompClient) stompClient.disconnect(); };

onMounted(async () => {
  await loadHistory();
  initWebSocket();
});
onUnmounted(disconnectWebSocket);
</script>

<style scoped>
/* 复用深海聊天样式 */
.chat-room { display: flex; flex-direction: column; height: 100%; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; }
.message-list { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
.empty-tip { text-align: center; color: #909399; margin-top: 50px; font-size: 14px; }
.message-item { display: flex; align-items: flex-start; gap: 10px; max-width: 80%; }
.content-wrapper { display: flex; flex-direction: column; gap: 4px; }
.meta-info { font-size: 12px; color: #909399; }
.username { margin-right: 8px; }
.bubble { padding: 10px 14px; background-color: rgba(255,255,255,0.1); color: #fff; border-radius: 8px; border-top-left-radius: 2px; backdrop-filter: blur(5px); }
.message-item.is-mine { align-self: flex-end; flex-direction: row-reverse; }
.message-item.is-mine .content-wrapper { align-items: flex-end; }
.message-item.is-mine .bubble { background-color: rgba(0, 242, 234, 0.2); border: 1px solid rgba(0, 242, 234, 0.3); border-top-left-radius: 8px; border-top-right-radius: 2px; }
.input-area { padding: 15px; background-color: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.1); }
.connection-status { font-size: 12px; color: #909399; margin-top: 5px; display: flex; align-items: center; gap: 5px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background-color: #f56c6c; }
.status-dot.online { background-color: #67c23a; }
:deep(.el-input__wrapper) { background: rgba(255,255,255,0.05) !important; }
</style>
