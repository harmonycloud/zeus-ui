import Axios from './request.js';
import * as SERVICE from './serviceList.constants';

interface listParamsProps {
	clusterId: string;
	namespace: string;
}

export const getList = (params: listParamsProps) => {
	return Axios.get(SERVICE.getServiceLit, params);
};
