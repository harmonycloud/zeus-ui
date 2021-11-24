import { api } from '@/api.json';

export const clusters = `${api}/clusters`;
export const cluster = `${api}/clusters/{clusterId}`;
export const namespaces = `${api}/clusters/{clusterId}/namespaces`;
// 资源池组件部署
export const components = `${api}/clusters/{clusterId}/components/{componentName}`;
// * 多ingress接入
export const getIngresses = `${api}/clusters/{clusterId}/ingress`;
export const deleteIngress = `${api}/clusters/{clusterId}/ingress/{ingressName}`;
// * 获取外接动态表单
export const getAspectFrom = `${api}/aspect/form`;
