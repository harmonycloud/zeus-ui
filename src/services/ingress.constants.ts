import { api } from '@/api.json';

// * 获取中间件对外访问列表
export const getIngresses = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/ingress`;
// * 创建中间件对外访问
export const createIngress = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/ingress`;
// * 删除中间件对外访问
export const deleteIngress = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/ingress/{name}`;
// * 获取中间件列表
export const getInstances = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares`;
// * 获取暴露服务
export const getService = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/services`;
// * 获取中间件对外访问
export const getIngressByMiddleware = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/ingress`;
