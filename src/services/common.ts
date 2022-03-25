import Axios from './request';
import * as COMMON from './common.constants';
import { MirrorParams } from '@/pages/ResourcePoolManagement/resource.pool';

// * 获取集群列表
export const getClusters = (params?: any) => {
	return Axios.get(COMMON.clusters, params);
};

export const postCluster = (sendData: any) => {
	return Axios.json(COMMON.clusters, sendData);
};

export const getCluster = (params: any) => {
	return Axios.get(COMMON.cluster, params);
};

export const putCluster = (sendData: any) => {
	return Axios.json(COMMON.cluster, sendData, {}, 'put');
};

export const deleteCluster = (params: any) => {
	return Axios.delete(COMMON.cluster, params);
};

export const getNamespaces = (params: any) => {
	return Axios.get(COMMON.namespaces, params);
};
// * 部署组件
export const deployComponent = (params: any) => {
	const { restUrl } = Axios.restfulAPI(COMMON.components, params.url);
	return Axios.json(restUrl, params.data, {}, 'POST');
};
// * 对接组件
export const dockComponent = (params: any) => {
	const { restUrl } = Axios.restfulAPI(COMMON.components, params.url);
	return Axios.json(restUrl, params.data, {}, 'PUT');
};
export const putNamespaces = (params: any, data: string) => {
	return Axios.json(
		COMMON.namespaces,
		params,
		{ data: JSON.stringify(data) },
		'put'
	);
};
// * 集群详情等接口
// * 概览
export const getMiddlewareResource = (params: any) => {
	return Axios.get(COMMON.getMiddlewareResource, params);
};
export const getNodeResource = (params: any) => {
	return Axios.get(COMMON.getNodeResource, params);
};
export const getNamespaceResource = (params: any) => {
	return Axios.get(COMMON.getNamespaceResource, params);
};
// * 命名空间
export const createNamespace = (params: any) => {
	return Axios.post(COMMON.namespaces, params);
};
export const deleteNamespace = (params: any) => {
	return Axios.delete(COMMON.updateNamespace, params);
};
export const regNamespace = (params: any) => {
	return Axios.put(COMMON.updateNamespace, params);
};
// * 镜像仓库
export const getMirror = (params: MirrorParams) => {
	return Axios.get(COMMON.mirror, params);
};
export const updateMirror = (params: MirrorParams) => {
	return Axios.json(COMMON.mirror, params, {}, 'PUT');
};
export const addMirror = (params: any) => {
	return Axios.json(COMMON.mirror, params, {}, 'POST');
};
export const deleteMirror = (params: MirrorParams) => {
	return Axios.delete(COMMON.mirror, params);
};
// * 平台组件
export const getComponents = (params: any) => {
	return Axios.get(COMMON.getComponents, params);
};
// * 部署（安装）组件
export const postComponent = (params: any) => {
	return Axios.json(COMMON.updateComponents, params, {}, 'POST');
};
// * 编辑组件
export const putComponent = (params: any) => {
	return Axios.json(COMMON.updateComponents, params, {}, 'PUT');
};
// * 接入组件
export const cutInComponent = (params: any) => {
	return Axios.json(COMMON.cutInComponents, params, {}, 'PUT');
};
// * 卸载（取消接入）组件
export const deleteComponent = (params: any) => {
	return Axios.delete(COMMON.updateComponents, params);
};
// * 批量安装组件
export const mulInstallComponent = (params: any) => {
	return Axios.json(COMMON.multipleComponents, params, {}, 'POST');
};
// * 获取集群纳管命令指令
export const getJoinCommand = (params: any) => {
	return Axios.get(COMMON.getClusterJoinCommand, params);
};
// * 多Ingress接入-获取
export const getIngresses = (params: any) => {
	return Axios.get(COMMON.getIngresses, params);
};
export const deleteIngress = (params: any) => {
	return Axios.delete(COMMON.deleteIngress, params);
};
export const installIngress = (params: any) => {
	return Axios.json(COMMON.getIngresses, params, {}, 'POST');
};
export const accessIngress = (params: any) => {
	return Axios.json(COMMON.getIngresses, params, {}, 'PUT');
};
export const updateIngress = (params: any) => {
	return Axios.json(COMMON.deleteIngress, params, {}, 'PUT');
};
// * 获取外接动态表单
export const getAspectFrom = () => {
	return Axios.get(COMMON.getAspectFrom);
};
