import { api } from '@/api.json';

// * 查询备份规则 / 删除备份规则 / 创建备份（立即备份） / 更新备份规则
export const backups = `${api}/clusters/{clusterId}/namespaces/{namespace}/backup`;
// * 查询备份列表 / 删除备份列表
export const backupList = `${api}/clusters/{clusterId}/namespaces/{namespace}/backup/record`;
// 创建恢复
export const useBackup = `${api}/clusters/{clusterId}/namespaces/{namespace}/backup/restore`;

// // * 使用备份
// export const useBackup = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/backups/restore`;
export const backupAddress = `${api}/backup/address`;
export const backupAddressDetail = `${api}/backup/address`;
export const backupAddressCheck = `${api}/backup/address/check`;
