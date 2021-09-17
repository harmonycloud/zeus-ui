import Axios from './request.js';
import * as BACKUP from './backup.constants';

interface listParams {
	clusterId: string;
	namespace: string;
	middlewareName: string;
	type: string;
}
export const getBackups = (params: listParams) => {
	return Axios.get(BACKUP.getBackupList, params);
};
export const backupNow = (params: listParams) => {
	return Axios.post(BACKUP.backups, params);
};
