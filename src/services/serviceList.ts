import Axios from './request.js';
import * as SERVICE from './serviceList.constants';

interface listParamsProps {
	clusterId: string;
	namespace: string;
	keyword: string;
}
interface deleteParamsProps {
	clusterId: string;
	namespace: string;
	middlewareName: string;
	type: string;
}

export const getList = (params: listParamsProps) => {
	return Axios.get(SERVICE.getServiceLit, params);
};

export const deleteMiddlewareStorage = (params: deleteParamsProps) => {
	return Axios.delete(SERVICE.deleteMiddlewareStorage, params);
};
