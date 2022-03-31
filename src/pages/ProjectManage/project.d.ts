export interface EditProjectFormProps {
	visible: boolean;
	onCancel: () => void;
	projectId?: string;
	onRefresh: () => void;
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
