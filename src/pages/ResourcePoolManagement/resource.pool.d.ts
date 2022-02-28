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
	requestCpu?: number;
	requestMemory?: number;
	type?: string;
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
