import { ProjectItem } from '@/pages/ProjectManage/project';
import { globalVarProps, User } from '@/types/index';

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
	// getClusterId: (namespace?: any) => void;
	setMenuRefresh: (flag: boolean) => void;
	currentProject: ProjectItem | undefined;
	projects: ProjectItem[];
	currentCluster: clusterType | undefined;
	clusters: clusterType[];
	currentNamespace: NamespaceItem;
	namespaces: NamespaceItem[];
	user: User | undefined;
	nickName: string;
	namespaceHandle: (value: string) => void;
	clusterHandle: (value: string) => void;
	projectHandle: (value: string) => void;
}
