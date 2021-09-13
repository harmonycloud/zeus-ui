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
	children?: filtersProps[];
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
}
