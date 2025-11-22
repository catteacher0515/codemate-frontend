/**
 * 聊天消息视图 (接收)
 */
export type ChatVO = {
  id: number;
  userId: number;
  username: string;
  userAvatar?: string;
  content: string;
  createTime: string;
  isMine: boolean;
};

/**
 * 【修复】发送消息请求体 (发送)
 * 必须导出此类型，TeamChatRoom.vue 才能引用
 */
export type ChatRequest = {
  teamId: number;
  content: string;
};
