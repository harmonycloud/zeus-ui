import { api } from '@/api.json';

export const clusters = `${api}/clusters`;
export const cluster = `${api}/clusters/{clusterId}`;
export const namespaces = `${api}/clusters/{clusterId}/namespaces`;
// 资源池组件部署
export const components = `${api}/clusters/{clusterId}/components/{componentName}`;
// * 资源池详情接口
export const getMiddlewareResource = `${api}/clusters/{clusterId}/middleware/resource`;
export const getNodeResource = `${api}/clusters/{clusterId}/node/resource`;
export const getNamespaceResource = `${api}/clusters/{clusterId}/namespace/resource`;
