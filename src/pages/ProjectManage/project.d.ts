export interface EditProjectFormProps {
	visible: boolean;
	onCancel: () => void;
	projectId?: string;
	onRefresh: () => void;
	setRefreshCluster: (flag: true) => void;
}

type namespace = { name: string };

export interface ProjectItem {
	aliasName: string;
	clusterList: null | any;
	createTime: string;
	description: string;
	memberCount: number | null;
	middlewareCount: null | number;
	name: string;
	namespaceCount: null | number;
	projectId: string;
	user: string;
	userDtoList: null | any;
	roleName: string | null;
	roleId: number | null;
	[propsName: string]: any;
}
export interface clusterListProps {
	id: string;
	namespaceList: namespace[];
}
export interface FieldValues {
	name: string;
	aliasName: string;
	description: string;
	user: string;
	clusterList?: clusterListProps[];
}
export interface ProjectManageProps {
	// setProject: (project: any) => void;
	setRefreshCluster: (flag: boolean) => void;
}
