import { monitorProps, storageProps } from './comment';
export interface clusterType {
	id: string;
	name: string;
	nickname: string;
	monitor: monitorProps;
	storage: storageProps;
	[propsName: string]: any;
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
