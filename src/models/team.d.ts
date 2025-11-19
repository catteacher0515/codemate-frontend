// file: src/models/team.d.ts

// 导入 User 类型的定义
import type { UserType } from './user';

/**
 * 【【【 案卷 #007：更新队伍合约 (DTO) 】】】
 * (SOP 1 契约: POST /api/team/update)
 */
export type TeamUpdateDTO = {
  id: number | string; // (必需)
  name?: string;
  description?: string;
  status?: number; // 0/1/2
  password?: string; // (status=2时必需)
};

/**
 * 【【【 案卷 #006：退出队伍合约 (DTO) 】】】
 * (SOP 1 契约: POST /api/team/quit)
 */
export type TeamQuitDTO = {
  teamId: number | string;
};

/**
 * 【【【 案卷 #005：邀请用户合约 (DTO) 】】】
 * (SOP 1 契约: POST /api/team/invite)
 */
export type TeamInviteDTO = {
  teamId: number | string;
  targetUserAccount: string;
};

/**
 * 【【【 案卷 #004：加入队伍合约 (DTO) 】】】
 * (SOP 1 契约: POST /api/team/join)
 */
export type TeamJoinDTO = {
  teamId: number | string;
  password?: string; // 可选
};

/**
 * 【【【 案卷 #18：队伍搜索合约 (DTO) 】】】
 * (基于 TeamSearchDTO.java)
 */
export type TeamSearchDTO = {
  searchText?: string;  // 搜索关键词 (可选)
  tagNames?: string[];  // 标签列表 (可选)

  // MP 分页参数
  current: number;
  pageSize: number;
};

/**
 * 【【【 案卷 #17：队伍聚合视图 (VO) 】】】
 * (这个已存在，保持不变)
 */
export type TeamVO = {
  // ... (你现有的 TeamVO 字段)
  id: number;
  name: string;
  description: string;
  maxNum: number;
  expireTime: string;
  createTime: string;
  userId: number;
  status: number;
  tags: string[];
  teamCaptain: UserType;
  members: UserType[];
};

/**
 * 【【【 案卷 #18：MP 分页响应体 】】】
 * (用于承载 BaseResponse<Page<TeamVO>>)
 */
export type TeamPageVO = {
  records: TeamVO[]; // 记录列表
  total: number;     // 总记录数
  // (MP Page 还包含 size, current, pages 等，我们暂时简化)
};
