/**
 * 用户信息类型 (VO)
 */
export type UserType = {
  id: number;
  username: string;
  userAccount: string;
  avatarUrl?: string;
  gender?: number; // 0-保密, 1-男, 2-女
  phone?: string;
  email?: string;
  userStatus?: number;
  userRole?: number;
  planetCode?: string;
  tags?: string[];
  bio?: string; // 个人简介
  createTime?: string;
};

/**
 * 更新用户信息请求体 (DTO)
 * 对应后端 UserUpdateDTO
 */
export type UserUpdateDTO = {
  username?: string;
  bio?: string;
  email?: string;
  gender?: number;
  avatarUrl?: string;
};
