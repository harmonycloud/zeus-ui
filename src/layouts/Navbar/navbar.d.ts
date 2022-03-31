import { globalVarProps } from '@/types/index';

export interface NavbarProps {
	globalVar: globalVarProps;
	user?: any;
	style?: any;
	setCluster: (cluster: any) => void;
	setNamespace: (namespace: any) => void;
	setProject: (project: any) => void;
	setRefreshCluster: (flag: boolean) => void;
	setGlobalClusterList: (clusterList: any) => void;
	setGlobalNamespaceList: (namespaceList: any) => void;
	getClusterId: (namespace: any) => void;
}
