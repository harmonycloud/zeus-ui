import Axios from './request.js';
import * as Audit from './audit.constants';
import {
	operationAuditsProps,
	modulesProps,
	sendDataAuditProps
} from '@/pages/OperationAudit/audit';

export const getAudits: (
	params: sendDataAuditProps
) => Promise<operationAuditsProps> = (params: sendDataAuditProps) => {
	return Axios.json(Audit.getAudits, params, {}, 'POST');
};
export const getModules: () => Promise<modulesProps> = () => {
	return Axios.get(Audit.listAllCondition);
};
