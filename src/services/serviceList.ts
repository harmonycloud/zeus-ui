import Axios from './request.js';
import * as SERVICE from './serviceList.constants';

interface listParamsProps {
	clusterId: string;
	namespace: string;
	keyword: string;
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

export const deleteMiddlewareStorage = (params: ParamsProps) => {
	return Axios.delete(SERVICE.deleteMiddlewareStorage, params);
};

export const recoveryMiddleware = (params: ParamsProps) => {
	return Axios.json(SERVICE.recoveryMiddleware, params, {}, 'POST');
};
