import Axios from './request';
import * as COMMON from './common.constants';

// * 获取集群列表
export const getClusters = (params) => {
	return Axios.get(COMMON.clusters, params);
};

export const postCluster = (sendData) => {
	return Axios.json(COMMON.clusters, sendData);
};

export const getCluster = (params) => {
	return Axios.get(COMMON.cluster, params);
};

export const putCluster = (sendData) => {
	return Axios.json(COMMON.cluster, sendData, {}, 'put');
};

export const deleteCluster = (params) => {
	return Axios.delete(COMMON.cluster, params);
};

export const getNamespaces = (params) => {
	return Axios.get(COMMON.namespaces, params);
};
// * 部署组件
export const deployComponent = (params) => {
	const { restUrl } = Axios.restfulAPI(COMMON.components, params.url);
	return Axios.json(restUrl, params.data, {}, 'POST');
};
// * 对接组件
export const dockComponent = (params) => {
	const { restUrl } = Axios.restfulAPI(COMMON.components, params.url);
	return Axios.json(restUrl, params.data, {}, 'PUT');
};
export const putNamespaces = (params, data) => {
	return Axios.json(
		COMMON.namespaces,
		params,
		{ data: JSON.stringify(data) },
		'put'
	);
};
// * 资源池详情等接口
// * 概览
export const getMiddlewareResource = (params) => {
	return Axios.get(COMMON.getMiddlewareResource, params);
};
export const getNodeResource = (params) => {
	return Axios.get(COMMON.getNodeResource, params);
};
export const getNamespaceResource = (params) => {
	return Axios.get(COMMON.getNamespaceResource, params);
};
// * 资源分区
export const createNamespace = (params) => {
	return Axios.post(COMMON.namespaces, params);
};
export const deleteNamespace = (params) => {
	return Axios.delete(COMMON.updateNamespace, params);
};
export const regNamespace = (params) => {
	return Axios.put(COMMON.updateNamespace, params);
};
