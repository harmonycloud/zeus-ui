import { ConfigItem } from '@/pages/ServiceListDetail/detail';
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
	ingressList?: ingressProps[];
	logging?: any | null;
	monitor?: monitorProps;
	name: string;
	namespaceList?: any | null;
	nickname: string;
	port: number;
	protocol: string;
	registry: registryProps;
	storage?: storageProps;
	clusterQuotaDTO?: clusterQuotaDTOProps | null;
	removable?: boolean;
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
export interface menuReduxProps {
	flag: boolean;
}
export interface paramReduxProps {
	name: string;
	description: string;
	customConfigList: ConfigItem[];
}
export interface StoreState {
	user: any;
	globalVar: globalVarProps;
	log: any;
	menu: menuReduxProps;
	param: paramReduxProps;
}
