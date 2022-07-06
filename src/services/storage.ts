import {
	AddParams,
	detailMidRes,
	detailRes,
	GetDetailParams,
	GetParams,
	listRes,
	typesRes
} from '@/pages/StorageManagement/storageManage';
import { updateResProps } from '@/types/comment';
import Axios from './request.js';
import * as Storage from './storage.constants';

export const getLists: (params: GetParams) => Promise<listRes> = (
	params: GetParams
) => {
	return Axios.get(Storage.getStorages, params);
};
export const getTypes: (params: {
	clusterId: string;
}) => Promise<typesRes> = (params: { clusterId: string }) => {
	return Axios.get(Storage.getStorageTypes, params);
};

export const addStorage: (params: AddParams) => Promise<updateResProps> = (
	params: AddParams
) => {
	return Axios.json(Storage.getStorages, params, '', 'POST');
};

export const updateStorage: (params: AddParams) => Promise<updateResProps> = (
	params: AddParams
) => {
	return Axios.json(Storage.handleStorage, params, '', 'PUT');
};

export const getStorageDetail: (
	params: GetDetailParams
) => Promise<detailRes> = (params: GetDetailParams) => {
	return Axios.get(Storage.handleStorage, params);
};
export const getStorageMiddleware: (
	params: GetDetailParams
) => Promise<detailMidRes> = (params: GetDetailParams) => {
	return Axios.get(Storage.getMiddlewareStorage, params);
};
export const deleteStorage: (
	params: GetDetailParams
) => Promise<updateResProps> = (params: GetDetailParams) => {
	return Axios.delete(Storage.handleStorage, params);
};
