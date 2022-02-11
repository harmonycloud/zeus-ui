import { api } from '@/api.json';

export const getConfigMapList = `${api}/clusters/{clusterId}/namespaces/{namespace}/configmap`;
export const configMapApi = `${api}/clusters/{clusterId}/namespaces/{namespace}/configmap/{configMapName}`;
export const verificationYaml = `${api}/yaml/verification`;
