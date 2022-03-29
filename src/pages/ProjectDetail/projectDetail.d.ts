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
