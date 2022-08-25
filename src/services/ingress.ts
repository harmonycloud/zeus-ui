import Axios from './request.js';
import * as Ingress from './ingress.constants';

export const getIngresses = async (params: any) => {
	const result = Axios.get(Ingress.getIngresses, params);
	return result;
};
export const addIngress = async (params: any) => {
	const result = Axios.json(Ingress.createIngress, params);
	return result;
};
export const deleteIngress = async (params: any) => {
	const result = Axios.json(Ingress.deleteIngress, params, {}, 'DELETE');
	return result;
};
export const getInstances = async (params: any) => {
	const result = Axios.get(Ingress.getInstances, params);
	return result;
};
export const getServices = async (params: any) => {
	const result = Axios.get(Ingress.getService, params);
	return result;
};
export const getIngressMid = async (params: any) => {
	const result = Axios.get(Ingress.getIngressByMiddleware, params);
	return result;
};
export const getVIPs = async (params: { clusterId: string }) => {
	const result = Axios.get(Ingress.getVIPs, params);
	return result;
};
export const getInternalServices = async (params: {
	clusterId: string;
	namespace: string;
	middlewareType: string;
	middlewareName: string;
}) => {
	const result = Axios.get(Ingress.getInternalServices, params);
	return result;
};
export const checkTraefikPort = async (params: {
	clusterId: string;
	startPort?: number;
}) => {
	const result = Axios.get(Ingress.checkTraefikPort, params);
	return result;
};
