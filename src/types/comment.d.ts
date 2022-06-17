export interface StackTraceElement {
	declaringClass: string;
	methodName: string;
	fileName: string;
	lineNumber: number;
}
export interface resProps {
	readonly code?: number;
	errorMsg?: string | null;
	errorDetail?: string | null;
	success?: boolean;
	count?: number | null;
	errorStack?: StackTraceElement[] | null;
}
export interface updateResProps extends resProps {
	data: null;
}
export interface filtersProps {
	label: string;
	value: number | string;
	isLeaf?: boolean;
	disabled?: boolean;
	children?: filtersProps[];
	[propsName: string]: any;
}

export interface NodeAffinityItem {
	label: string;
	namespace: null | number;
	required: boolean;
}
export interface middlewareDetailProps {
	aliasName: string;
	annotations: string | null;
	description: string | null;
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
	nodeAffinity: NodeAffinityItem[] | null;
	tolerations: string[] | null;
	hostNetwork?: any;
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
	isAllLvmStorage: boolean;
	stdoutEnabled: boolean;
	filelogEnabled: boolean;
	mirrorImage?: data.mirrorImage;
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
	address?: string;
	ingressClassName?: string | null;
	globalVar?: globalVarProps;
	entry?: string;
	type?: string;
	middlewareName?: string;
	name?: string;
	middlewareNickName?: string;
	namespace: string;
	tcp?: {
		enabled: boolean;
		configMapName: string;
		namespace: string;
	};
}

export interface ingressCreateProps {
	selectedInstance: {
		name: string;
	};
	selectedService: {
		serviceName: string;
		portDetailDtoList: any[];
	};
	errors: any[];
	values: any;
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

// * 自定义组件
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
	[propsName: string]: any;
}
// * 存储类型
export interface StorageClassProps {
	allowVolumeExpansion: boolean;
	createTime: null | string;
	labels: null | string;
	name: string;
	parameters: {
		fsType: string;
		lvmType: string;
		vgName: string;
		volumeType: string;
	};
	provisioner: string;
	reclaimPolicy: string;
	status: null | any;
	storageLimit: null | any;
	storageQuota: null | any;
	storageUsed: null | any;
	type: null | any;
	volumeBindingMode: string;
}
// * 集群列表
export interface poolListItem {
	name?: string;
	id: string;
}

// * 告警记录
export interface evevtDataProps {
	alert: string;
	alertId: string;
	capitalType: string;
	chartVersion: string;
	clusterId: string;
	content: string;
	expr: string;
	lay: string;
	level: string;
	message: string;
	name: string;
	namespace: string;
	summary: string;
	time: string;
	type: string;
}
export interface ResMenuItem {
	aliasName: string;
	available: null;
	iconName: string;
	id: number;
	module: null | string;
	name: string;
	own: boolean;
	parentId: number;
	subMenu: null | ResMenuItem[];
	url: string;
	weight: number;
}
export interface MenuInfo {
	key: string;
	keyPath: string[];
	item: React.ReactInstance;
	domEvent: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>;
}
export interface SelectInfo extends MenuInfo {
	selectedKeys: string[];
}
export interface FiltersProps {
	text: string;
	value: string;
	children?: FiltersProps[];
	[propsName: string]: any;
}
export interface AutoCompleteOptionItem {
	value: string;
	label: string;
}
export interface MirrorItem {
	address: string;
	clusterId: string;
	createTime: string;
	description: null | string;
	hostAddress: string;
	id: number;
	isDefault: number;
	password: string;
	port: number;
	project: string;
	protocol: string;
	updateTime: null | string;
	username: string;
}
