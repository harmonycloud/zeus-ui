export interface StackTraceElement {
	declaringClass: string;
	methodName: string;
	fileName: string;
	lineNumber: number;
}
export interface resProps {
	code?: number;
	errorMsg?: string | null;
	errorDetail?: string | null;
	success?: boolean;
	count?: number | null;
	errorStack?: StackTraceElement[] | null;
}
export interface filtersProps {
	label: string;
	value: number | string;
	isLeaf?: boolean;
	disabled?: boolean;
	children?: filtersProps[];
	[propsName: string]: any;
}
export interface middlewareDetailProps {
	aliasName: string;
	annotation: string | null;
	autoSwitch: any | null;
	backupFileName: string | null;
	capabilities: any | null;
	charSet: string;
	chartName: string | null;
	chartVersion: string;
	clusterId: string | null;
	createTime: string;
	dynamicValues: any | null;
	filelogEnabled: any | null;
	ingresses: any | null;
	labels: any | null;
	managePlatform: any | null;
	managePlatformAddress: any | null;
	mode: string;
	mysqlDTO: any;
	name: string;
	namespace: string;
	nodeAffinity: any | null;
	password: string;
	podNum: any | null;
	pods: any | null;
	port: number;
	quota: any;
	reason: any | null;
	relationMiddleware: any | null;
	rocketMQParam: any | null;
	status: string;
	stdoutEnabled: any | null;
	type: string;
	version: string;
	official: boolean;
}

export interface basicDataProps {
	name: string;
	type: string;
	clusterId: string;
	namespace: string;
	monitor?: monitorProps;
	storage?: storageProps;
	logging?: any | null;
}
export interface monitorItemProps {
	address?: string;
	host?: string;
	port?: string;
	protocol: string;
	token?: string | null;
}
export interface monitorProps {
	alertManager?: monitorItemProps | null;
	grafana?: monitorItemProps | null;
	prometheus?: monitorItemProps | null;
}
export interface storageProps {
	backup: backupProps | null;
	support?: supportProps | null;
	// resource?: resourceProps | null;
}
export interface backupProps {
	type?: string;
	storage: {
		accessKeyId: string;
		bucketName: string;
		endpoint: string;
		name: string;
		secretAccessKey: string;
	};
}
export interface supportProps {
	'CSI-LVM': string;
	LocalPath: string;
	NFS: string;
}
export interface resourceProps {
	cpuTotal: string;
	cpuUsing: string;
	memoryTotal: string;
	memoryUsing: string;
}

export interface ingressProps {
	address: string;
	ingressClassName: string | null;
	tcp: {
		enabled: boolean;
		configMapName: string;
		namespace: string;
	};
}

export interface registryProps {
	address: string;
	chartRepo: string;
	imageRepo?: string;
	password: string | null;
	port: number;
	protocol: string;
	registryAddress?: string;
	registryUrl?: string;
	type: string;
	user: string;
	version?: string;
}
export interface clusterQuotaDTOProps {
	clusterNum: number;
	cpuUsedPercent: number | null;
	memoryUsedPercent: number | null;
	namespaceNum: number;
	totalCpu: number;
	totalMemory: number;
	usedCpu: number;
	usedMemory: number;
}

export interface CustomFormItemProps {
	defaultValue: string;
	description: string;
	group: string;
	label: string;
	type: string;
	variable: string;
	required?: boolean;
	subQuestions?: any[];
	showSubQuestionIf?: string;
	options?: any[];
}
