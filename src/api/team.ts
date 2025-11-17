// file: src/api/team.ts

import service from '@/utils/request'; // (我假设你的 axios 实例叫 'service')
import type { TeamVO } from '@/models/team'; // (导入我们刚定义的“合约”)

/**
 * 【【 案卷 #17：调用后端 API 】】
 * 按 ID 获取队伍详情
 * @param teamId 队伍 ID
 */
export const getTeamDetailsById = (teamId: number | string): Promise<TeamVO> => {
  // GET /api/team/get/{id}
  // 注意：我们的 BaseResponse<T> 合约，数据在 'data' 字段
  // (我假设你的 axios 拦截器已处理了 BaseResponse，只返回 data)
  return service({
    url: `/team/get/${teamId}`,
    method: 'GET',
  });

  // (如果你的拦截器 *没有* 处理 BaseResponse, 你需要返回 response.data)
  // return service(...).then(res => res.data);
};
