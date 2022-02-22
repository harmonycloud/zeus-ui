import Axios from './request.js';
import * as PLATFORMOVERVIEW from './platformOverview.constanst';

export const getPlatformOverview = async (params: any) => {
	const result = Axios.get(PLATFORMOVERVIEW.getPlatformOverview, params);
	return result;
};
export const getEvent = async (params: any) => {
	const result = Axios.get(PLATFORMOVERVIEW.getEvent, params);
	return result;
};
export const getServers = async (params: any) => {
	const result = Axios.get(PLATFORMOVERVIEW.getServers, params);
	return result;
};
