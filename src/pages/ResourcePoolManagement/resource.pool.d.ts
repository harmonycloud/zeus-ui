export interface NodeResourceProps {
	clusterId: string;
	cpuRate: number | null;
	cpuTotal: number | null;
	cpuUsed: number | null;
	createTime: string;
	ip: string;
	memoryRate: number;
	memoryTotal: number;
	memoryUsed: number;
	status: string;
}
export interface MiddlewareResourceProps {
	aliasName?: string;
	clusterId: string;
	cpuRate: number;
	cpuRequest?: number;
	memoryRate: number;
	memoryRequest?: number;
	name: string;
	namespace?: string;
	per5MinCpu: number;
	per5MinMemory: number;
	per5MinStorage: number;
	requestCpu?: number;
	requestMemory?: number;
	requestStorage?: number;
	storageRate: number;
	type?: string;
	pvcRate: number;
	pvcRequest: number;
	per5MinPvc: number;
}

export interface NamespaceResourceProps {
	aliasName: string;
	clusterId: string;
	createTime: string;
	middlewareReplicas: number;
	name: string;
	quotas: {
		[propName: string]: string[];
	};
	registered: boolean;
	phase: string;
}
export interface ClusterQuotaDTO {
	clusterNum: number;
	cpuUsedPercent: number | null;
	memoryUsedPercent: null;
	namespaceNum: number;
	totalCpu: number;
	totalMemory: number;
	usedCpu: number;
	usedMemory: number;
}
export interface ComponentProp {
	clusterId: string;
	component: string;
	status: number;
	type: null | string;
	protocol?: string | null;
	createTime: string | null;
	vgName: string | null;
	size: number | null;
	seconds: number;
	chartName?: string;
}

export interface IngressItemProps {
	address: string;
	clusterId: string;
	configMapName: string;
	defaultServerPort: null | number;
	healthzPort: null | number;
	httpPort: null | number;
	httpsPort: null | number;
	ingressClassName: string;
	namespace: string;
	status: number;
	id: number;
	createTime: string | null;
	seconds: number;
}

export interface MirrorParams {
	clusterId: string;
	keyword?: string;
	id?: number | number;
}
export interface AddMirrorWarehouseProps {
	visible: boolean;
	onCancel: () => void;
	clusterId: string;
	onRefresh: () => void;
	data: any;
}