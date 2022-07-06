import { api } from '@/api.json';
// * 查询存储列表 / 添加存储
export const getStorages = `${api}/clusters/{clusterId}/storage`;
// * 获取存储详情 / 更新存储信息 / 删除存储
export const handleStorage = `${api}/clusters/{clusterId}/storage/{storageName}`;
// * 获取中间件存储使用情况
export const getMiddlewareStorage = `${api}/clusters/{clusterId}/storage/{storageName}/middlewares`;
// * 获取中间件存储使用详情
export const getMiddlewareStorageDetail = `${api}/clusters/{clusterId}/storage/{storageName}/middlewares/{middlewareName}`;
// * 查询存储类型
export const getStorageTypes = `${api}/clusters/{clusterId}/storage/type`;
