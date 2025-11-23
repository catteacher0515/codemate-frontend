import service from '@/utils/request';
import type { UserType, UserUpdateDTO } from '@/models/user';

/**
 * 获取当前登录用户 (照镜子)
 */
export const getCurrentUser = (): Promise<UserType> => {
  return service.get('/user/current');
}

/**
 * 根据 ID 获取特定用户 (查档案)
 */
export const getUserById = (id: number): Promise<UserType> => {
  return service.get(`/user/${id}`);
}

/**
 * 更新个人信息
 * @param data UserUpdateDTO
 */
export const updateUserInfo = (data: UserUpdateDTO): Promise<boolean> => {
  return service.put('/user/updateinfo', data);
}

/**
 * 单独更新头像 (保留此功能，作为快捷操作)
 */
export const updateUserAvatar = (data: { userId: number; avatarUrl: string }): Promise<boolean> => {
  return service.put('/user/update/avatar', data);
}
