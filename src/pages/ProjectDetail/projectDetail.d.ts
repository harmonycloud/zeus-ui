import { ProjectItem } from '../ProjectManage/project';

export interface DetailParams {
	id: string;
}
export interface AddNamespaceProps {
	visible: boolean;
	onCancel: () => void;
	onRefresh: () => void;
}
export interface AddNamespaceFieldValues {
	clusterId: string;
	source: string;
	namespace: string;
	projectId: string;
	aliasName: string;
	name: string;
}
export interface NamespaceItem {
	aliasName: string;
	clusterAliasName: string;
	clusterId: string;
	createTime: null;
	middlewareReplicas: null;
	name: null;
	phase: null;
	projectId: string;
	quotas: null;
	registered: boolean;
}
export interface AddMemberProps {
	visible: boolean;
	onCancel: () => void;
	onRefresh: () => void;
}
export interface UserRoleItem {
	projectId: null | string;
	roleId: null | number;
	roleName: string;
	userName: string;
}
export interface UserItem {
	aliasName: string;
	createTime: null | string;
	email: null | string;
	id: number;
	password: null | string;
	passwordTime: null;
	phone: null | string;
	roleId: null | number;
	roleName: null | string;
	userName: string;
	userRoleList: UserRoleItem[];
}
export interface EditMemberProps {
	visible: boolean;
	onCancel: () => void;
	onRefresh: () => void;
	data: UserItem;
}
export interface EditMemberFieldValues {
	userName: string;
	aliasName: string;
	roleId: number;
}
export interface ProjectDetailProps {
	project: ProjectItem;
}
