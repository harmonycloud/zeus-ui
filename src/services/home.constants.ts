import { api } from '@/api.json';

// * 获取告警事件
export const getOverviewEvents = `${api}/platform/overview/alerts`;
// * 获取实例情况和资源分配情况
export const getInstances = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/overview/status`;
// * 获取资源实时用量
export const getResource = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/overview/monitors`;
// * 获取集群分区的配额数
export const getQuota = `${api}/clusters/{clusterId}/namespaces/{namespace}/quota`;
