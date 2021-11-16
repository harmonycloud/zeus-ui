import Axios from './request';
import * as REPOSITORY from './repository.contants';

interface listParamsProps {
	clusterId: string;
	namespace?: string;
}
interface typeListParamsProps {
	clusterId: string;
	type: string;
}
interface installParamsProps {
	chartName: string;
	chartVersion: string;
	clusterId: string;
}
interface deleteParams {
	chartName: string;
	chartVersion: string;
}
export const getMiddlewareRepository = (params: listParamsProps) => {
	return Axios.get(REPOSITORY.getMiddlewareRepository, params);
};
export const getTypeVersion = (params: typeListParamsProps) => {
	return Axios.get(REPOSITORY.getMiddlewareVersions, params);
};
export const installMiddleware = (params: installParamsProps) => {
	return Axios.post(REPOSITORY.installMiddleware, params);
};
export const unInstallMiddleware = (params: installParamsProps) => {
	return Axios.delete(REPOSITORY.unInstallMiddleware, params);
};
export const updateMiddleware = (params: installParamsProps) => {
	return Axios.put(REPOSITORY.updateMiddleware, params);
};
export const shelvesTypeVersion = (params: deleteParams) => {
	return Axios.delete(REPOSITORY.shelvesMiddlewareVersion, params);
};
