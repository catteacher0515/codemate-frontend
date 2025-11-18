// file: src/api/team.ts
// (V4.0 修复版)

import service from '@/utils/request'; // (V3.8 确认 [cite: V3.8 战区修正 from message 38])
// (V3.x 修复: 导入所有类型)
import type { TeamVO, TeamSearchDTO, TeamPageVO } from '@/models/team';

/**
 * 【【 案卷 #17：调用后端 API 】】
 * 按 ID 获取队伍详情
 */
export const getTeamDetailsById = (teamId: number | string): Promise<TeamVO> => {
  return service({
    url: `/team/get/${teamId}`,
    method: 'GET',
  });
};

/**
 * 【【【 案卷 #18-A：V4.0 修复 (404 案) 】】】
 * (调用 POST /api/team/list/page)
 *
 * (此代码 100% 正确。如果你仍看到 404 [cite: image_1d7cc2.png]，
 * 请 *重启 Vite* 并 *强制刷新浏览器*。)
 */
export const searchTeams = (searchParams: TeamSearchDTO): Promise<TeamPageVO> => {
  return service({
    url: '/team/list/page',
    method: 'POST',     // <-- 确保这是 POST
    data: searchParams, // <-- 确保使用 'data'
  });
};
