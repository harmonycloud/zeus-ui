import { api } from '@/api.json';
// * 获取服务列表
export const getServiceLit = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares`;
// * 获取服务版本列表
export const getServiceVersion = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/version`;
// * 服务版本升级
export const upgradeChart = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/upgradeChart`;
// * 查询服务按钮是否可以升级
export const upgradeCheck = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/upgradeCheck`;
// * 删除中间件相关存储
export const deleteMiddlewareStorage = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/storage`;
// * 恢复中间件
export const recoveryMiddleware = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/recovery`;
// * 查询管理控制台的地址
export const getPlatform = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/platform`;
