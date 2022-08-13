import { api } from '@/api.json';

// * 获取可用区列表/划分可用区
export const getZones = `${api}/clusters/{clusterId}/area`;
// * 获取可用区资源情况/更新可用区/删除节点
export const getZoneDetail = `${api}/clusters/{clusterId}/area/{areaName}`;
// * 获取可用区节点列表
export const getZoneNodes = `${api}/clusters/{clusterId}/area/{areaName}/node`;
// * 获取可分配可用区的节点
export const getUsableNodes = `${api}/clusters/{clusterId}/nodes/allocatable`;
// * 可用区查询集群列表
export const getActiveClusters = `${api}/area/clusters`;
// * 开启可用区
export const startActive = `${api}/area/clusters/{clusterId}`;
