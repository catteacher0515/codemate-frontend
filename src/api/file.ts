import service from '@/utils/request';

/**
 * 通用文件上传
 * @param file 原生 File 对象
 * @returns 文件的公网 URL
 */
export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  // 注意：service 拦截器会自动解包 res.data
  // 后端返回 BaseResponse<String>，解包后直接就是 URL 字符串
  return service.post('/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
