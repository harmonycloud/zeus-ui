export interface clusterType {
	id: string;
	name: string;
	nickname: string;
	[propsName: string]: any;
}
export interface namespaceType {
	name: string;
	clusterId: string;
	[propsName: string]: any;
}
export interface StoreState {
	user: any;
	globalVar: {
		cluster: clusterType;
		clusterList: clusterType[];
		flag: boolean;
		namespace: namespaceType;
		namespaceList: namespaceType[];
	};
	log: any;
}
