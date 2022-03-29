import {
	SET_CLUSTER,
	SET_NAMESPACE,
	SET_REFRESH_CLUSTER,
	SET_GLOBAL_CLUSTER_LIST,
	SET_GLOBAL_NAMESPACE_LIST,
	SET_PROJECT
} from './var.js';
/**
 * 全局变量
 */

const defaultState = {
	cluster: {},
	namespace: {},
	flag: false, // 触发集群重新获取的标识
	clusterList: [],
	namespaceList: [],
	project: {}
};

export default function varReducer(state = defaultState, action) {
	const { type, data } = action;

	switch (type) {
		case SET_CLUSTER:
			return { ...state, cluster: data };
		case SET_NAMESPACE:
			return { ...state, namespace: data };
		case SET_REFRESH_CLUSTER:
			return { ...state, flag: data };
		case SET_GLOBAL_CLUSTER_LIST:
			return { ...state, clusterList: data };
		case SET_GLOBAL_NAMESPACE_LIST:
			return { ...state, namespaceList: data };
		case SET_PROJECT:
			return { ...state, project: data };
		default:
			return state;
	}
}
