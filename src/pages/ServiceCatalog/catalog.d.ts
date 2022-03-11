import { globalVarProps } from '@/types/index';
import { rocketMQAccount } from '@/components/RocketACLForm/acl';
import { TolerationLabelItem } from '@/components/FormTolerations/formTolerations';
export interface CreateProps {
	globalVar: globalVarProps;
	[propsName: string]: any;
}
export interface CreateParams {
	chartName: string;
	chartVersion: string;
	middlewareName: string;
	backupFileName: string;
	aliasName: string;
}
export interface AffinityItem {
	label: string;
	namespace: string;
	required: boolean;
}
export interface AffinityProps {
	flag: boolean;
	label: string;
	checked: boolean;
}
export interface AffinityLabelsItem {
	label: string;
	id: number;
}
export interface TolerationsProps {
	flag: boolean;
	label: string;
}
export interface TolerationsLabelsItem {
	label: string;
	id: number;
}
export interface CommonSendDataParams {
	chartName: string;
	chartVersion: string;
	type: string;
	labels: string;
	annotations: string;
	description: string;
	version: string;
	mode: string;
	filelogEnabled: boolean;
	stdoutEnabled: boolean;
}
export interface CreateValuesParams {
	name: string;
	aliasName: string;
	labels: string;
	annotations: string;
	description: string;
	storageClass: string;
	storageQuota: string;
	cpu: number;
	memory: number;
}
export interface RelationMiddlewareParams extends CommonSendDataParams {
	nodeAffinity?: AffinityItem[];
	tolerations?: string[];
	dynamicValues?: any;
	backupFileName?: string;
	charSet: string;
	port: number;
	password: string;
	quota: {
		mysql: {
			storageClassName: string;
			storageClassQuota: string;
			cpu?: number;
			memory?: string;
		};
	};
}
export interface MysqlSendDataParams extends CommonSendDataParams {
	clusterId: string;
	namespace: string;
	name: string;
	aliasName: string;
	charSet: string;
	port: number;
	password: string;
	quota: {
		mysql: {
			storageClassName: string;
			storageClassQuota: string;
			cpu?: number;
			memory?: string;
		};
	};
	mysqlDTO: {
		replicaCount: number;
		openDisasterRecoveryMode: boolean;
		type?: string;
		relationName?: string;
		relationAliasName?: string;
		relationClusterId?: string;
		relationNamespace?: string;
		isSource?: boolean;
	};
	dynamicValues?: any;
	nodeAffinity?: AffinityItem[];
	tolerations?: string[];
	middlewareName?: string;
	backupFileName?: string;
	relationMiddleware?: RelationMiddlewareParams;
}
export interface MysqlSendDataTempParams extends MysqlSendDataParams {
	relationMiddleware: RelationMiddlewareParams;
}
export interface MysqlCreateValuesParams extends CreateValuesParams {
	mysqlPort: number;
	mysqlPwd: string;
	relationName: string;
	relationAliasName: string;
	dataSource: any;
}
export interface RedisSendDataParams extends CommonSendDataParams {
	clusterId: string;
	namespace: string;
	name: string;
	aliasName: string;
	dynamicValues?: any;
	nodeAffinity?: AffinityItem[];
	tolerations?: string[];
	password: string;
	quota: {
		redis: {
			num?: number;
			cpu?: number;
			memory?: string;
			storageClassName?: string;
			storageClassQuota?: string;
		};
	};
}
export interface RedisCreateValuesParams extends CreateValuesParams {
	pwd: string;
}
export interface KafkaDTO {
	custom?: boolean;
	path: string;
	zkAddress: string;
	zkPort: string | number;
}
export interface KafkaCreateValuesParams extends CreateValuesParams {
	kafkaDTO: KafkaDTO;
}
export interface KafkaSendDataParams extends CommonSendDataParams {
	clusterId: string;
	namespace: string;
	name: string;
	aliasName: string;
	dynamicValues?: any;
	nodeAffinity?: AffinityItem[];
	tolerations?: string[];
	kafkaDTO: KafkaDTO;
	quota: {
		kafka: {
			cpu?: number;
			memory?: string;
			storageClassName?: string;
			storageClassQuota?: string;
		};
	};
}
export interface NodeModifyParams {
	nodeName: string;
	flag: boolean;
}
export interface NodeObjParams {
	redis: {
		disabled: boolean;
		title: string;
		num: number;
		specId: string;
		cpu: number;
		memory: number;
		storageClass: string;
		storageQuota: number;
	};
	sentinel: {
		disabled: boolean;
		title: string;
		num: number;
		specId: string;
		cpu: number;
		memory: number;
	};
}
export interface RMQSendDataParams extends CommonSendDataParams {
	clusterId: string;
	namespace: string;
	name: string;
	aliasName: string;
	hostNetwork: boolean;
	dynamicValues?: any;
	nodeAffinity?: AffinityItem[];
	tolerations?: string[];
	quota: {
		rocketmq: {
			storageClassName: string;
			storageClassQuota: string;
			cpu?: number;
			memory?: string;
		};
	};
	rocketMQParam: {
		acl: {
			enable: boolean;
			globalWhiteRemoteAddresses?: string;
			rocketMQAccountList?: rocketMQAccount[];
		};
	};
}
export interface RMQCreateValuesParams extends CreateValuesParams {
	globalWhiteRemoteAddresses?: string;
	rocketMQAccountList?: rocketMQAccount[];
}
export interface EsSendDataParams extends CommonSendDataParams {
	clusterId: string;
	namespace: string;
	name: string;
	aliasName: string;
	password: string;
	dynamicValues?: any;
	nodeAffinity?: AffinityItem[];
	tolerations?: string[];
	quota?: any;
}
export interface EsCreateValuesParams extends CreateValuesParams {
	pwd: string;
}
export interface DynamicSendDataParams {
	chartName: string;
	chartVersion: string;
	type: string;
	labels: string;
	description: string;
	version: string;
	clusterId: string;
	namespace: string;
	name: string;
	aliasName: string;
	capabilities: string[];
	nodeAffinity?: AffinityItem[];
	tolerations?: string[];
	dynamicValues?: any;
}
export interface DynamicCreateValueParams {
	name: string;
	aliasName: string;
	labels: string;
	description: string;
	tolerations: boolean;
	tolerationsLabels: TolerationLabelItem[];
	nodeAffinity: boolean;
	nodeAffinityLabel: any[];
	nodeAffinityForce: boolean;
	version: string;
}
