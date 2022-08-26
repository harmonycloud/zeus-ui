import Axios from './request.js';
import * as BACKUP from './backup.constants';

interface listParams {
	clusterId: string;
	namespace: string;
	middlewareName?: string;
	type: string;
	[propName: string]: any;
}
interface useBackupParams {
	clusterId: string;
	namespace: string;
	middlewareName: string;
	type: string;
	backupName: string;
	restoreName: string;
	aliasName: string;
}
interface addressParams {
	accessKeyId: string;
	capacity: string;
	clusterIds: string[];
	endpoint: string;
	id?: number;
	name: string;
	secretAccessKey: string;
	type: string;
	[propName: string]: any;
}
export const getBackups = (params: any) => {
	return Axios.get(BACKUP.backupList, params);
};
export const backupNow = (params: listParams) => {
	return Axios.post(BACKUP.useBackup, params);
};
export const getBackupConfig = (params: listParams) => {
	return Axios.get(BACKUP.backups, params);
};
export const addBackupConfig = (params: listParams) => {
	return Axios.json(BACKUP.backups, params, {}, 'POST');
};
export const updateBackupConfig = (params: listParams) => {
	return Axios.json(BACKUP.backups, params, {}, 'PUT');
};
export const deleteBackupConfig = (params: listParams) => {
	return Axios.delete(BACKUP.backups, params);
};
export const deleteBackups = (params: any) => {
	return Axios.delete(BACKUP.backupList, params);
};
export const applyBackup = (params: any) => {
	return Axios.post(BACKUP.useBackup, params);
};
export const getBackupAddress = (params: { keyword: string }) => {
	return Axios.get(BACKUP.backupAddress, params);
};
export const getBackupAddressDetail = (params: { id: number }) => {
	return Axios.get(BACKUP.backupAddressDetail, params);
};
export const addBackupAddress = (params: addressParams) => {
	return Axios.json(BACKUP.backupAddress, params, {}, 'POST');
};
export const backupAddressCheck = (params: addressParams) => {
	return Axios.json(BACKUP.backupAddressCheck, params, {}, 'POST');
};
export const editBackupAddress = (params: addressParams) => {
	return Axios.json(BACKUP.backupAddress, params, {}, 'PUT');
};
export const deleteBackupAddress = (params: {
	id: number;
	clusterId?: string;
}) => {
	return Axios.delete(BACKUP.backupAddress, params);
};
export const getMiddlewares = () => {
	return Axios.get(BACKUP.middlewares);
};
export const getServiceList = (params?: {
	keyword?: string;
	type?: string;
}) => {
	return Axios.get(BACKUP.serviceList, params);
};
export const getBackupTasks = (params: any) => {
	return Axios.get(BACKUP.backupTask, params);
};
export const editBackupTasks = (params: any) => {
	return Axios.put(BACKUP.backupTask, params);
};
export const deleteBackupTasks = (params: any) => {
	return Axios.delete(BACKUP.backupTask, params);
};
