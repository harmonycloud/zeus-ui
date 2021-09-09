import Axios from './request';
import * as REPOSITORY from './repository.contants';

interface listParamsProps {
	clusterId: string;
	namespace: string;
}
export const getMiddlewareRepository = (params: listParamsProps) => {
	return Axios.get(REPOSITORY.getMiddlewareRepository, params);
};
