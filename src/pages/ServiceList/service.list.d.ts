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
	managePlatform: any | null;
	managePlatformAddress: any | null;
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
}
