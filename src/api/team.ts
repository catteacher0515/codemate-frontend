// file: src/api/team.ts
// (V4.0 修复版)

import service from '@/utils/request'; // (V3.8 确认 [cite: V3.8 战区修正 from message 38])
// (V3.x 修复: 导入所有类型)
import type {
  TeamVO,
  TeamSearchDTO,
  TeamPageVO,
  TeamJoinDTO,
  TeamInviteDTO,
  TeamQuitDTO, TeamUpdateDTO
} from '@/models/team';

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

/**
 * 【【【 案卷 #004：SOP (V4.x 修复 - 404 案) 】】】
 * (SOP 1 契约: POST /api/team/join)
 * (“案犯” 在于 url 拼写错误)
 */
export const joinTeam = (joinParams: TeamJoinDTO): Promise<boolean> => {
  // (SOP 1 契约: 返回 BaseResponse<Boolean>)
  // (V3.8 拦截器 会自动解包 data)
  return service({
    // 【【 V4.x 修复：URL 必须是静态的 "/team/join" 】】
    url: '/team/join',
    // 【【 V4.x 修复：方法必须是 POST 】】
    method: 'POST',
    // 【【 V4.x 修复：teamId 必须在 'data' (Body) 中 】】
    data: joinParams,
  });
};

/**
 * 【【【 案卷 #005：SOP (邀请用户) 】】】
 * (SOP 1 契约: POST /api/team/invite)
 */
export const inviteUser = (inviteParams: TeamInviteDTO): Promise<boolean> => {
  return service({
    url: '/team/invite',
    method: 'POST',
    data: inviteParams,
  });
};

// (在 src/api/team.ts 中添加)
// (更新 import，引入 TeamQuitDTO)

/**
 * 【【【 案卷 #006：SOP (退出队伍) 】】】
 * (SOP 1 契约: POST /api/team/quit)
 */
export const quitTeam = (quitParams: TeamQuitDTO): Promise<boolean> => {
  return service({
    url: '/team/quit',
    method: 'POST',
    data: quitParams,
  });
};

/**
 * 【【【 案卷 #007：SOP (更新队伍) 】】】
 * (SOP 1 契约: POST /api/team/update)
 */
export const updateTeam = (updateParams: TeamUpdateDTO): Promise<boolean> => {
  return service({
    url: '/team/update',
    method: 'POST',
    data: updateParams,
  });
};
