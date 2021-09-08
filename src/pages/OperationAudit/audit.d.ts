import { resProps } from '@/utils/comment';

export interface auditProps {
	id: number;
	account: string;
	userName: string | null;
	roleName: string;
	phone: string | null;
	url: string;
	moduleChDesc: string;
	childModuleChDesc: string;
	actionChDesc: string;
	requestMethod: string;
	requestParams: string;
	response: string | null;
	remoteIp: string;
	status: string;
	executeTime: number;
	method: string;
	beginTime: string;
	actionTime: string;
	clusterId: string;
	token: string | null;
}

export interface operationAuditDataProps {
	records: auditProps[];
	total?: number;
	size?: number;
	current?: number;
	orders?: string[];
	optimizeCountSql?: boolean;
	hitCount?: boolean;
	countId?: number | null;
	maxLimit?: number | null;
	searchCount?: boolean;
	pages?: number;
}

export interface operationAuditsProps extends resProps {
	data: operationAuditDataProps;
}
export interface auditPaginationProps {
	current: number;
	size: number;
	total?: number;
	[propsName: string]: any;
}
export interface modulesProps extends resProps {
	data: {
		roles: string[];
		methods: string[];
		modules: any;
	};
}
export interface sendDataAuditProps {
	current: number;
	size: number;
	roles?: string[];
	requestMethods?: string[];
	searchKeyWord?: string;
	modules?: string[];
	childModules?: string[];
	beginTimeNormalOrder?: boolean;
	executeTimeNormalOrder?: boolean;
	statusOrder?: boolean;
}
