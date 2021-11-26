import { api } from '@/api.json';
// * 获取服务列表
export const getServiceLit = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares`;
// * 获取服务版本列表
export const getServiceVersion = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/version`;
