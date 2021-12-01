import Axios from './request.js';
import * as SERVICE from './serviceList.constants';

interface listParamsProps {
	clusterId: string;
	namespace: string;
	keyword: string;
	type?: string;
}

export const getList = (params: listParamsProps) => {
	return Axios.get(SERVICE.getServiceLit, params);
};

export const getVersions = (params: any) => {
	return Axios.get(SERVICE.getServiceVersion, params);
};

export const upgradeChart = (params: any) => {
	return Axios.get(SERVICE.upgradeChart, params);
};
