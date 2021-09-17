import { api } from '@/api.json';

// * 查询备份列表
export const getBackupList = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/backups/list`;
// * 立即备份 / 删除中间件备份 / 更新中间件备份
export const backups = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/backups`;
// * 查询中间件配置
export const getBackupConfig = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/backups`;
