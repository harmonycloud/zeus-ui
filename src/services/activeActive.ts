import Axios from './request.js';
import * as ActiveActive from './activeActive.constants';

type OnlyClusterId = {
	clusterId: string;
};
export const getZones = (params: OnlyClusterId) => {
	return Axios.get(ActiveActive.getZones, params);
};
type GetParams = {
	clusterId: string;
	areaName: string;
};
export const getZonesResource = (params: GetParams) => {
	return Axios.get(ActiveActive.getZoneDetail, params);
};
type UpdateParams = {
	clusterId: string;
	areaName: string;
	aliasName: string;
};
export const updateZones = (params: UpdateParams) => {
	return Axios.put(ActiveActive.getZoneDetail, params);
};
export const getZoneNodes = (params: GetParams) => {
	return Axios.get(ActiveActive.getZoneNodes, params);
};
export const getUsableNodes = (params: OnlyClusterId) => {
	return Axios.get(ActiveActive.getUsableNodes, params);
};
type Name = {
	name: string;
};
type DivideParams = {
	clusterId: string;
	name: string;
	nodeList: Name[];
};
export const divideArea = (params: DivideParams) => {
	return Axios.json(ActiveActive.getZones, params, '', 'POST');
};
export const deleteNode = (params: {
	clusterId: string;
	nodeName: string;
	areaName: string;
}) => {
	return Axios.delete(ActiveActive.getZoneDetail, params);
};
