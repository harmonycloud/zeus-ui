import { api } from '@/api.json';

export const clusters = `${api}/clusters`;
export const cluster = `${api}/clusters/{clusterId}`;
export const namespaces = `${api}/clusters/{clusterId}/namespaces`;
// 集群组件部署
export const components = `${api}/clusters/{clusterId}/components/{componentName}`;
// * 集群详情接口
export const getMiddlewareResource = `${api}/clusters/{clusterId}/middleware/resource`;
export const getNodeResource = `${api}/clusters/{clusterId}/node/resource`;
export const getNamespaceResource = `${api}/clusters/{clusterId}/namespace/resource`;
export const updateNamespace = `${api}/clusters/{clusterId}/namespaces/{name}`;
export const getComponents = `${api}/clusters/{clusterId}/components`;
export const multipleComponents = `${api}/clusters/{clusterId}/components/multiple`;
export const updateComponents = `${api}/clusters/{clusterId}/components/{componentName}`;
export const getClusterJoinCommand = `${api}/clusters/clusterJoinCommand`;
// * 多ingress支持
export const getIngresses = `${api}/clusters/{clusterId}/ingress`;
export const deleteIngress = `${api}/clusters/{clusterId}/ingress/{ingressName}`;
// * 获取外接动态表单
export const getAspectFrom = `${api}/aspect/form`;
// * 接入组件
export const cutInComponents = `${api}/clusters/{clusterId}/components/{componentName}/integrate`;
// * 镜像仓库
export const mirror = `${api}/clusters/{clusterId}/mirror`;
// * 查询是否接入观云台
export const isAccessGYT = `${api}/user/useOpenUserCenter`;
