import { ProjectItem } from '@/pages/ProjectManage/project';
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
export interface NavbarNamespaceItem {
	aliasName: string;
	clusterAliasName?: string;
	clusterId?: string;
	createTime?: null;
	middlewareReplicas?: null;
	name: string;
	phase?: null;
	projectId?: string;
	quotas?: null;
	registered?: boolean;
}

export interface globalVarProps {
	cluster: clusterType;
	clusterList: clusterType[];
	project: ProjectItem;
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
	globalVar: globalVarProps;
	log: any;
	menu: menuReduxProps;
	param: paramReduxProps;
}

export interface RoleItem {
	power: {
		[propsName: string]: string;
	};
	projectId: string;
	roleId: number;
	roleName: string;
	userName: string;
}
export interface User {
	aliasName: string;
	createTime: string;
	email: null | string;
	id: number | string;
	isAdmin: boolean;
	password: string;
	passwordTime: string;
	phone: string;
	power: null;
	roleId: null | number;
	roleName: null | string;
	userName: string;
	userRoleList: RoleItem[];
}
