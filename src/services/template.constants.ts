import { api } from '@/api.json';

// * 获取/创建 自定义配置模板
export const getTemplates = `${api}/middlewares/{type}/template`;
// * 更新 自定义配置模板
export const updateTemplates = `${api}/middlewares/{type}/template/{uid}`;
// * 初始化自定义配置模板
export const initTemplate = `${api}/middlewares/{type}/template/init`;
