import { resProps } from '@/types/comment';
export interface EditStorageParams {
	name: string;
	clusterId: string;
	clusterAliasName: string;
}
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
	requestQuota: number;
	storageName?: string;
}

export interface GetDetailParams {
	clusterId: string;
	storageName: string;
}
export interface listRes extends resProps {
	data: StorageItem[];
}
export interface typesRes extends resProps {
	data: string[];
}
export interface detailRes extends resProps {
	data: StorageItem;
}
export interface detailMidRes extends resProps {
	data: StorageMiddlewareParams[];
}
export interface StorageItem {
	aliasName: string;
	clusterId: string;
	clusterAliasName: string;
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
	requestQuota: number;
}
export interface DetailParams {
	name: string;
	aliasName: string;
	clusterId: string;
	type: string;
}

type numberOrNull = number | null;
export interface StorageMiddlewareParams {
	middlewareAliasName: string;
	middlewareName: string;
	status: string;
	podNum: number;
	monitorResourceQuota: {
		cpu: {
			total: numberOrNull;
			used: numberOrNull;
			usable: numberOrNull;
			usage: numberOrNull;
			request: numberOrNull;
		};
		memory: {
			total: numberOrNull;
			used: numberOrNull;
			usable: numberOrNull;
			usage: numberOrNull;
			request: numberOrNull;
		};
		storage: {
			total: numberOrNull;
			used: numberOrNull;
			usable: numberOrNull;
			usage: numberOrNull;
			request: numberOrNull;
		};
	};
	createTime: string;
	imagePath: string;
	namespace: string;
	projectAliasName: string;
	projectId: string;
	[propsName: string]: any;
}
