import { api } from '@/api.json';

// * 查询中间仓库列表
export const getMiddlewareRepository = `${api}/middlewares/info`;
// * 查询中间件版本管理列表
export const getMiddlewareVersions = `${api}/middlewares/info/version`;
