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
// * ingress 获取 vip
export const getVIPs = `${api}/clusters/{clusterId}/ingress/vip`;
// * 获取集群内访问
export const getInternalServices = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/internalServices`;
// * 获取主机网络对外访问
export const getHostNetworkAddress = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/hostNetworkAddress`;
// * traefik端口校验
export const checkTraefikPort = `${api}/clusters/{clusterId}/ingress/check`;
// * 查询Ingress详情
export const getIngressDetail = `${api}/clusters/{clusterId}/ingress/{ingressClassName}/detail`;
// * 查询端口列表
export const getPorts = `${api}/clusters/{clusterId}/ingress/{ingressClassName}/ports`;
// * 查询pod列表
export const getPods = `${api}/clusters/{clusterId}/ingress/{ingressName}/pods`;
// * 重启pod
export const restartPod = `${api}/clusters/{clusterId}/ingress/{ingressClassName}/pods/{podName}`;
// * 查询pod yaml
export const getPodYaml = `${api}/clusters/{clusterId}/ingress/{ingressName}/pods/{podName}/yaml`;
// * 查询ingress yaml/修改ingress yaml
export const getIngressYaml = `${api}/clusters/{clusterId}/ingress/{ingressClassName}/values`;
