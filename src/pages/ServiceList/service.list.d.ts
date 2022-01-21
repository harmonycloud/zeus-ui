export interface serviceProps {
	aliasName: string | null;
	annotation: string | null;
	autoSwitch: any | null;
	backupFileName: string | null;
	capabilities: any | null;
	charSet: string | null;
	chartName: string | null;
	chartVersion: string | null;
	clusterId: string | null;
	createTime: string;
	dynamicValues: any | null;
	filelogEnabled: any | null;
	ingresses: any | null;
	labels: any | null;
	managePlatform: boolean | null;
	managePlatformAddress: string | null;
	mode: string;
	mysqlDTO?: any;
	name: string;
	namespace: string;
	nodeAffinity: any | null;
	password: string;
	podNum: number;
	pods: any | null;
	port: number;
	quota: any;
	reason: string | null;
	relationMiddleware: any | null;
	rocketMQParam: any | null;
	status: string | null;
	stdoutEnabled: any | null;
	type: string;
	version: string;
	imagePath?: string | null;
}
export interface serviceListItemProps {
	image: string | null;
	imagePath: string | null;
	name: string;
	serviceList: serviceProps[];
	serviceNum: number;
	chartName: string;
	chartVersion: string;
	version?: string | null;
	official: boolean;
	aliasName: string;
}

export interface CurrentService {
	name: string;
	type: string;
}

export interface middlewareProps {
	chartName: string;
	chartVersion: string;
	createTime: string | null;
	description: string;
	grafanaId: null;
	id: number;
	image: string | null;
	imagePath: string | null;
	middlewares: null;
	name: string;
	official: true;
	replicas: null;
	replicasStatus: null;
	status: number;
	type: string | null;
	version: string;
	versionStatus: null;
}
export interface middlewareItemProps extends middlewareProps {
	clusterId: string;
	onRefresh: () => void;
}
export interface middlewareListProps {
	[propsName: string]: middlewareProps[];
}
