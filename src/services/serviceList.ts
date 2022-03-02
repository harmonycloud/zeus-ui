import Axios from './request.js';
import * as SERVICE from './serviceList.constants';

interface listParamsProps {
	clusterId: string;
	namespace: string;
	keyword: string;
	type?: string;
}

export interface ParamsProps {
	clusterId: string;
	namespace: string;
	middlewareName: string;
	type: string;
	chartName?: string;
	chartVersion?: string | null;
}

export const getList = (params: listParamsProps) => {
	return Axios.get(SERVICE.getServiceLit, params);
};

export const getVersions = (params: any) => {
	return Axios.get(SERVICE.getServiceVersion, params);
};

export const upgradeChart = (params: any) => {
	return Axios.post(SERVICE.upgradeChart, params);
};

export const upgradeCheck = (params: any) => {
	return Axios.post(SERVICE.upgradeCheck, params);
};

export const deleteMiddlewareStorage = (params: ParamsProps) => {
	return Axios.delete(SERVICE.deleteMiddlewareStorage, params);
};

export const recoveryMiddleware = (params: ParamsProps) => {
	return Axios.json(SERVICE.recoveryMiddleware, params, {}, 'POST');
};
