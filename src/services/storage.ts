import {
	AddParams,
	GetParams,
	listRes,
	typesRes
} from '@/pages/StorageManagement/storageManage';
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

export const addStorage = (params: AddParams) => {
	return Axios.json(Storage.handleStorage, params, '', 'POST');
};
