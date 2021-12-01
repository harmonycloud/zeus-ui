import Axios from './request.js';
import * as BACKUP from './backup.constants';

interface listParams {
	clusterId: string;
	namespace: string;
	middlewareName: string;
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
export const getBackups = (params: listParams) => {
	return Axios.get(BACKUP.backupList, params);
};
export const backupNow = (params: listParams) => {
	return Axios.post(BACKUP.backups, params);
};
export const getBackupConfig = (params: listParams) => {
	return Axios.get(BACKUP.backups, params);
};
export const addBackupConfig = (params: listParams) => {
	return Axios.post(BACKUP.backups, params);
};
export const updateBackupConfig = (params: listParams) => {
	return Axios.put(BACKUP.backups, params);
};
export const deleteBackupConfig = (params: listParams) => {
	return Axios.delete(BACKUP.backups, params);
};
export const deleteBackups = (params: listParams) => {
	return Axios.delete(BACKUP.backupList, params);
};
export const applyBackup = (params: useBackupParams) => {
	return Axios.post(BACKUP.useBackup, params);
};
