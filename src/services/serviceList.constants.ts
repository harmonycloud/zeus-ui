import { api } from '@/api.json';
// * 获取服务列表
export const getServiceLit = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares`;

// * 删除中间件相关存储
export const deleteMiddlewareStorage = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/storage`;
