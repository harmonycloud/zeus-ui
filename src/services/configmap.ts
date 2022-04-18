import Axios from './request.js';
import * as CONFIGMAP from './configmap.constants';

interface getListParams {
	chartVersion: string;
	clusterId: string;
	middlewareName: string;
	namespace: string;
	type: string;
}
interface getItemParams {
	clusterId: string;
	configMapName: string;
	namespace: string;
}
interface updateItemParams {
	clusterId: string;
	config: string;
	configMapName: string;
	namespace: string;
}
export const getConfigMapList = (params: getListParams) => {
	return Axios.get(CONFIGMAP.getConfigMapList, params);
};
export const getConfigMap = (params: getItemParams) => {
	return Axios.get(CONFIGMAP.configMapApi, params);
};
export const updateConfig = (params: updateItemParams) => {
	return Axios.put(CONFIGMAP.configMapApi, params);
};
export const verificationYaml = (params: { yaml: string }) => {
	return Axios.post(CONFIGMAP.verificationYaml, params);
};
