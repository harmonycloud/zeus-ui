export interface EditStorageParams {
	id: string;
}
import { resProps } from '@/types/comment';
export interface GetParams {
	all: boolean;
	clusterId: string;
	key?: string;
	type?: string;
}
export interface AddParams {
	name: string;
	aliasName: string;
	clusterId: string;
	vgName: string;
	volumeType: string;
}
export interface listRes extends resProps {
	data: StorageItem[];
}
export interface typesRes extends resProps {
	data: string[];
}
export interface StorageItem {
	aliasName: string;
	clusterId: string;
	createTime: string;
	fsType: string;
	monitorResourceQuota: {
		cpu: {
			request: number;
			total: number;
			usable: number;
			usage: number;
			used: number;
		};
		memory: {
			request: number;
			total: number;
			usable: number;
			usage: number;
			used: number;
		};
		storage: {
			request: number;
			total: number;
			usable: number;
			usage: number;
			used: number;
		};
	};
	name: string;
	provisioner: string;
	status: string;
	vgName: string;
	volumeType: string;
}
