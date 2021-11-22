import Axios from './request.js';
import * as Alarm from './alarm.constants';
// import {
// 	operationAuditsProps,
// 	modulesProps,
// 	sendDataAuditProps
// } from '@/pages/OperationAudit/audit';

export const setMail = (params: any) => {
	return Axios.json(Alarm.setMail, params, {}, 'POST');
};

export const getMailInfo = (params: any) => {
	return Axios.get(Alarm.getMail, params);
};

export const sendMail = (params: any) => {
	return Axios.post(Alarm.sendMail, params);
};

export const getInsertUser = (params: any) => {
	return Axios.post(Alarm.insertUser, params);
};
export const setDing = (params: any) => {
	return Axios.json(Alarm.ding, params, {}, 'POST');
};

export const sendDing = (params: any) => {
	return Axios.post(Alarm.sendDing, params);
};
