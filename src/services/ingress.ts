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
export const getIngressDetail = async (params: {
	clusterId: string;
	ingressClassName: string;
}) => {
	const result = Axios.get(Ingress.getIngressDetail, params);
	return result;
};
export const getPorts = async (params: {
	clusterId: string;
	ingressClassName: string;
}) => {
	const result = Axios.get(Ingress.getPorts, params);
	return result;
};
export const getPods = async (params: {
	clusterId: string;
	ingressName: string;
}) => {
	const result = Axios.get(Ingress.getPods, params);
	return result;
};
export const restartPod = async (params: {
	clusterId: string;
	ingressClassName: string;
	podName: string;
}) => {
	const result = Axios.delete(Ingress.restartPod, params);
	return result;
};
export const getPodYaml = async (params: {
	clusterId: string;
	ingressName: string;
	podName: string;
}) => {
	const result = Axios.get(Ingress.getPodYaml, params);
	return result;
};
export const getIngressYaml = async (params: {
	clusterId: string;
	ingressClassName: string;
}) => {
	const result = Axios.get(Ingress.getIngressYaml, params);
	return result;
};

export const updateIngressYaml = async (params: {
	clusterId: string;
	ingressClassName: string;
	values: string;
}) => {
	const result = Axios.json(Ingress.getIngressYaml, params, {}, 'PUT');
	return result;
};
