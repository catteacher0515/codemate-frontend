import service from '@/utils/request';
import type { ChatVO } from '@/models/chat';

/**
 * 【案卷 #011】获取历史消息
 * GET /api/chat/history
 */
export const getHistoryMessage = (teamId: number): Promise<ChatVO[]> => {
  return service({
    url: '/chat/history',
    method: 'GET',
    params: { teamId },
  });
};
