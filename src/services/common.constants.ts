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
export const updateNamespace = `${api}/clusters/{clusterId}/namespaces/{name}`;
export const getComponents = `${api}/clusters/{clusterId}/components`;
export const multipleComponents = `${api}/clusters/{clusterId}/components/multiple`;
export const updateComponents = `${api}/clusters/{clusterId}/components/{componentName}`;
export const getClusterJoinCommand = `${api}/clusters/clusterJoinCommand`;
