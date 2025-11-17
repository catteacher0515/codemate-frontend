// file: src/models/team.d.ts

// 导入 User 类型的定义 (我假设你已在 user.d.ts 中定义了)
import { UserType } from './user';

/**
 * 队伍聚合视图 (TeamVO)
 * 【【 案卷 #17 (前端合约) 】】
 */
export type TeamVO = {
  id: number;
  name: string;
  description: string;
  maxNum: number;
  // 注意：JS/TS 中，LocalDateTime 和 Date 都会被序列化为 "string"
  expireTime: string;
  createTime: string;

  userId: number; // 队长 ID
  status: number; // 0-公开, 1-私有, 2-加密

  // --- V3.1 聚合字段 ---
  tags: string[];           // 标签列表
  teamCaptain: UserType;    // 队长信息
  members: UserType[];      // 成员列表
};
