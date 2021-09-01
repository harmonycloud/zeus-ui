import Axios from './request.js';
import * as Home from './home.constants';

export const getEvents = async (params) => {
	// 获取告警事件接口
	const result = Axios.get(Home.getOverviewEvents, params);
	return result;
};

export const getInstanceStatus = async (params) => {
	const result = Axios.get(Home.getInstances, params);
	return result;
};

export const getResources = async (params) => {
	const result = Axios.get(Home.getResource, params);
	return result;
};
export const getResourceQuota = async (params) => {
	const result = Axios.get(Home.getQuota, params);
	return result;
};
