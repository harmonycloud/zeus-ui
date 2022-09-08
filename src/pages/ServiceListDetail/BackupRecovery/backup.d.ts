export interface ListProps {
	clusterId: string;
	namespace: string;
	data?: middlewareDetailProps;
	storage?: storageProps;
}
export interface BackupRecordItem {
	aliasName: null | string;
	backupAddressList: string[];
	backupFileName: string;
	backupName: string;
	backupTime: string;
	backupMode: string;
	backupType: string;
	phrase: string;
	podRole: string;
	sourceName: string;
	index: number;
	namespace: string;
	sourceType: sourceType;
	cron: string;
	backupId: string;
	addressName: string;
	schedule: boolean;
	creationTime: string;
}
