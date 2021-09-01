import Axios from './request.js';
import * as PLATFORMOVERVIEW from './platformOverview.constanst';

export const getPlatformOverview = async (params) => {
	const result = Axios.get(PLATFORMOVERVIEW.getPlatformOverview, params);
	return result;
};
export const getEvent = async (params) => {
	const result = Axios.get(PLATFORMOVERVIEW.getEvent, params);
	return result;
};
