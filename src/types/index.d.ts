import {
	monitorProps,
	storageProps,
	ingressProps,
	registryProps,
	clusterQuotaDTOProps
} from './comment';

export interface clusterAddType {
	accessToken?: string | null;
	address?: string;
	cert: any | null;
	dcId?: string;
	host: string;
	ingress?: ingressProps;
	logging?: any | null;
	monitor?: monitorProps;
	name: string;
	nickname: string;
	port: number;
	protocol: string;
	registry: registryProps;
	storage?: storageProps;
	clusterQuotaDTO?: clusterQuotaDTOProps | null;
	[propsName: string]: any;
}
export interface clusterType extends clusterAddType {
	id: string;
}
export interface namespaceType {
	name: string;
	clusterId: string;
	[propsName: string]: any;
}

export interface globalVarProps {
	cluster: clusterType;
	clusterList: clusterType[];
	flag: boolean;
	namespace: namespaceType;
	namespaceList: namespaceType[];
}
export interface StoreState {
	user: any;
	globalVar: globalVarProps;
	log: any;
}
