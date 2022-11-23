import {
	monitorProps,
	middlewareDetailProps,
	storageProps
} from '@/types/comment';
import { globalVarProps, paramReduxProps } from '@/types';
import { SendDataParamsProps } from '../OperationPanel';
export interface aclEditProps {
	visible: boolean;
	onCancel: (value: boolean) => void;
	data: any;
	clusterId: string;
	namespace: string;
	middlewareName: string;
	chartName: string;
	chartVersion: string;
}
export interface UserInfoProps {
	data: any;
}
export interface DetailParams {
	name: string;
	aliasName: string;
	currentTab: string;
	middlewareName: string;
	type: string;
	chartVersion: string;
	namespace: string;
}
export interface ServiceIngressAddParams {
	name: string;
	aliasName: string;
	currentTab: string;
	middlewareName: string;
	clusterId: string;
	chartVersion: string;
	namespace: string;
	mode: string;
	brokerNum: string;
	enableExternal: string;
}
export interface ParamterSettingProps {
	middlewareName: string;
	clusterId: string;
	namespace: string;
	type: string;
	customMid: boolean;
	capabilities: string[];
}
export interface ParamterListProps {
	clusterId: string;
	namespace: string;
	middlewareName: string;
	type: string;
	onFreshChange: () => void;
}
export interface ConfigItem {
	defaultValue: string;
	description: string;
	name: string;
	paramType: string;
	pattern: null | string;
	ranges: string;
	restart: boolean;
	topping: null | boolean;
	value: string;
	modifiedValue: string;
	updateTime: string;
	[propName: string]: string;
}
export interface ConfigSendData {
	url: {
		clusterId: string;
		middlewareName: string;
		namespace: string;
	};
	data: {
		clusterId: string;
		middlewareName: string;
		namespace: string;
		type: string;
		customConfigList: ConfigItem[];
	};
}
export interface ParamterHistoryProps {
	clusterId: string;
	namespace: string;
	middlewareName: string;
	type: string;
}
export interface ParamterHistoryItem {
	after: string;
	date: string;
	id: number;
	item: string;
	last: string;
	name: string;
	restart: boolean;
	status: boolean;
}
export interface ParamterHistorySendData {
	clusterId: string;
	namespace: string;
	middlewareName: string;
	type: string;
	item: string;
	startTime?: string;
	endTime?: string;
}
export interface ParamterTemplateItem {
	createTime: string;
	customConfigList: null | ConfigItem[];
	description: string;
	name: string;
	num: null;
	restart: null;
	type: string;
	uid: string;
}
export interface MonitorProps {
	clusterId?: string;
	namespace?: string;
	middlewareName?: string;
	type?: string;
	grafanaOpen?: boolean;
	customMid: boolean;
	capabilities: string[];
	chartVersion?: string;
}
export interface EventsListProps {
	type: string;
	middlewareName: string;
	eventType: string;
	kind: string;
	namespace: string;
	globalVar?: globalVarProps;
	namespace: string;
}
export interface EventItem {
	chartName: null;
	chartVersion: null;
	count: number;
	eventExplain: null;
	eventTime: null;
	firstTimestamp: string;
	involvedObject: {
		apiVersion: string;
		fieldPath: string;
		kind: string;
		name: string;
		namespace: string;
		resourceVersion: string;
		uid: string;
	};
	lastTimestamp: string;
	message: string;
	middleware: boolean;
	reason: string;
	span: null;
	spanMetric: null;
	type: string;
	show?: boolean;
}
export interface EventsSendData {
	clusterId: string;
	namespace: string;
	middlewareName: string;
	type: string;
	kind?: string;
}

export interface BasicInfoProps {
	type: string;
	data: middlewareDetailProps;
	middlewareName: string;
	customMid: boolean;
	clusterId: string;
	namespace: string;
	operateFlag: boolean;
	onRefresh: () => void;
	toDetail: () => void;
}
export interface InfoParams {
	title: string;
	name: string;
	aliasName: string;
	label: string;
	chartVersion?: string;
	hostAffinity: string;
	hostAnti?: string;
	description: string;
	annotations: string;
	tolerations: string;
	disasterInstanceName?: string;
	mirror?: string;
}
export interface configParams {
	title: string;
	version: string;
	characterSet: string;
	port: string | number;
	password: string;
	autoCreateTopicEnable: boolean;
	kafkaDTO?: any;
}
export interface runParams {
	title: string;
	status: string;
	createTime: string;
	model: string;
	namespace: string;
	group: number;
	replicas: number;
	storageClassName: string;
	storageType: string;
	hostNetwork?: any;
}
export interface DynamicDataParams {
	title: string;
	[propsName: string]: any;
}
export interface eventsParams {
	title: string;
	table: string;
}
export interface BackupRecoveryProps {
	storage?: storageProps;
	middlewareName?: string;
	customMid: boolean;
	capabilities: string[];
	clusterId: string;
	namespace: string;
	type: string;
	data?: middlewareDetailProps;
	dataSecurity?: boolean;
}
export interface ListProps {
	clusterId: string;
	namespace: string;
	data?: middlewareDetailProps;
	storage?: storageProps;
}
export interface BackupRecordItem {
	aliasName: null | string;
	backupAddressList: string[];
	backupFileName: string;
	backupName: string;
	backupTime: string;
	backupType: string;
	phrase: string;
	podRole: string;
	sourceName: string;
}
export interface BackupRuleItem {
	aliasName: null;
	backupScheduleName: string;
	backupType: string;
	canPause: boolean;
	createTime: null | string;
	cron: string;
	lastBackupTime: null | string;
	limitRecord: number;
	nextBackupTime: null | string;
	pause: string;
	podRole: string;
	sourceName: string;
}
export interface ConfigProps {
	clusterId: string;
	namespace: string;
	data?: middlewareDetailProps;
}
export interface BackupDataParams {
	configed: boolean;
	limitRecord: number;
	cycle: string;
	time: string;
	nextBackupTime: string;
	pause: string;
	canPause: boolean;
}
export interface PodSendData {
	clusterId: string;
	namespace: string;
	middlewareName: string;
	type: string;
}
export interface BackupRuleSendData {
	clusterId: string;
	namespace: string;
	middlewareName?: string;
	backupScheduleName?: string;
	backupName?: string;
	backupFileName?: string;
	type: string;
	limitRecord?: number;
	cron?: string;
	pod?: string | string[];
}

export interface ExternalAccessProps {
	customMid: boolean;
	capabilities: string[];
	middlewareName: string;
	type: string;
	namespace: string;
}
export interface LogProps {
	type: string;
	data: middlewareDetailProps;
	customMid: boolean;
	logging: any;
	middlewareName: string;
	clusterId: string;
	namespace: string;
	capabilities: string[];
	onRefresh?: () => void;
}
export interface ContainerItem {
	exitCode: null;
	finishedAt: null;
	images: null;
	message: null;
	name: string;
	ready: boolean;
	reason: null;
	restartCount: null;
	signal: null;
	startedAt: null;
	state: null;
}
export interface ResourceParams {
	cpu: string;
	isLvmStorage: boolean;
	limitCpu: string;
	limitMemory: string;
	memory: string;
	num: null | number;
	storageClassName: string;
	storageClassQuota: string;
}
export interface PodItem {
	containers: ContainerItem[];
	createTime: string;
	hasConfigBackup: boolean;
	initContainers: ContainerItem[];
	lastRestartTime: string;
	nodeName: string;
	podIp: string;
	podName: string;
	pvcs: string[];
	resources: ResourceParams;
	restartCount: number;
	role: string;
	status: string;
	nodeZone: string;
}
export interface PodSendData {
	clusterId: string;
	namespace: string;
	middlewareName: string;
	type: string;
}
export interface CommonLogProps {
	logging?: any;
	data: {
		type: string;
		middlewareName: string;
		clusterId: string;
		namespace: string;
		stdoutEnabled?: boolean;
		filelogEnabled?: boolean;
		data?: any;
	};
	onRefresh?: () => void;
}
export interface RealTimeProps extends CommonLogProps {
	log: string;
	setRealLog: (value: string) => void;
	cleanRealLog: () => void;
}
export interface RuleProps {
	middlewareName?: string;
	clusterId: string;
	namespace?: string;
	type?: string;
	customMid?: boolean;
	capabilities?: string[];
	alertOpen: boolean;
	alarmType: string;
}
export interface LabelItem {
	severity?: string;
	middleware?: string;
	clusterId?: string;
}
export interface ServiceRuleItem {
	id?: string | number;
	alert?: string;
	alertId?: string;
	alertTime?: string;
	alertTimes?: string;
	annotations?: {
		alertLevel?: string;
		message?: string;
		metric?: string;
		product?: string;
		service?: string;
		summary?: string;
	};
	clusterId?: string;
	content?: string;
	createTime?: string;
	description?: string;
	ding?: string;
	enable?: number;
	expr?: string;
	ip?: string;
	labels?: LabelItem;
	lay?: string;
	mail?: string;
	middlewareName?: string;
	name?: string;
	namespace?: string;
	silence?: null | string;
	status?: null | string;
	symbol?: string;
	threshold?: string;
	time?: string;
	type?: string;
	unit?: string;
	level?: string;
	severity?: string;
}

export interface AlarmItem {
	alert: string | null;
	description: string | null;
	annotations?: any;
	expr?: string;
	name?: string;
	status?: string;
	labels?: LabelItem;
	time?: string;
	type?: string;
	unit?: string;
}

export interface AlarmSendData {
	url: {
		clusterId: string | undefined;
		middlewareName?: string;
		namespace?: string;
	};
	ding: string;
	data: {
		middlewareAlertsDTOList?: string;
		users: any[];
		middlewareAlertsDTO?: any;
	};
	alertRuleId?: string;
}
export interface HighProps {
	type: string;
	data: middlewareDetailProps;
	clusterId: string;
	namespace: string;
	chartName: string;
	chartVersion: string;
	onRefresh: (value?: string) => void;
	customMid: boolean;
}
export interface valuesProps {
	container: string;
	scriptType: string;
}

export interface ConsoleDataProps {
	clusterId: string;
	namespace: string;
	podName: string;
	type: string;
	name: string;
	role?: string;
}
export interface consoleProps {
	visible: boolean;
	onCancel: () => void;
	containers: string[];
	data: ConsoleDataProps;
	currentContainer: string;
}
export interface LogFileItem {
	logPath: string;
	name: string;
}
export interface LogDetailItem {
	msg: string;
	offset: number;
	timestamp: string;
}
export interface DownLoadLogSendData {
	clusterId: string;
	namespace: string;
	middlewareName: string;
	logTimeEnd: string;
	logTimeStart: string;
	pageSize: number;
	podLog: boolean;
	pod?: string;
	container?: string;
	searchWord: string;
	searchType: string;
	middlewareType: string;
	scrollId?: string;
	logPath?: string;
}
export interface QuotaParams {
	cpu: string;
	memory: string;
	storageClassQuota?: string;
	[propsName: string]: any;
}
export interface NodeSpeProps {
	visible: boolean;
	onCreate: (value: any) => void;
	onCancel: () => void;
	quota: QuotaParams;
}
export interface EsSendDataProps {
	quota?: any;
}

export interface EsNodeProps {
	visible: boolean;
	onCreate: (value: EsSendDataProps) => void;
	onCancel: () => void;
	data: any;
}
export interface InstanceDetailsProps {
	globalVar: globalVarProps;
	setCluster: (value: any) => void;
	setNamespace: (value: any) => void;
	setRefreshCluster: (flag: boolean) => void;
}

export interface CreateServeAlarmProps {
	clusterId: string;
	namespace: string;
	middlewareName: string;
	type: string;
	alarmType: string;
	ruleId: string;
}

export interface EditParamTemplateProps {
	param: paramReduxProps;
	globalVar: globalVarProps;
	setParamTemplateBasic: (value: BasicProps) => void;
	setParamTemplateConfig: (value: ConfigItem[]) => void;
	setParamTemplateBasicClear: () => void;
	setParamTemplateConfigClear: () => void;
}
export interface ParamterItem {
	defaultValue: string;
	modifiedValue: string;
	description: string;
	name: string;
	paramType: null | any;
	pattern: null | any;
	ranges: string;
	restart: boolean;
	value: null | any;
}
export interface RedisSentinelNodeSpeProps {
	visible: boolean;
	onCreate: (value: any) => void;
	onCancel: () => void;
	data: any;
}
export interface ServiceDetailIngressProps {
	name: string;
	aliasName: string;
	middlewareName: string;
	chartVersion: string;
	namespace: string;
	customMid: boolean;
	capabilities: string[];
	clusterId: string;
	mode: string;
	readWriteProxy?: {
		enabled: boolean;
	};
	brokerNum: number;
	enableExternal: number | null;
	imagePath: string;
	status: string;
}

export interface ServiceNameItem {
	name: string;
	label: string;
	icon: string;
	port?: number;
}
export interface HttpPathItem {
	path: string;
	serviceName: string;
	servicePort: number | string;
	id: number;
}

export interface InternalServiceItem {
	clusterIP: null;
	internalAddress: string;
	portDetailDtoList: [];
	serviceName: string;
	servicePurpose: string;
}
