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

export const getMailInfo = (params?: any) => {
	return Axios.get(Alarm.getMail, params);
};

export const sendMail = (params: any) => {
	return Axios.post(Alarm.sendMail, params);
};

export const getInsertUser = (params: any) => {
	return Axios.post(Alarm.insertUser, params);
};

export const connectMail = (params: any) => {
	return Axios.get(Alarm.connectMail, params);
};

export const setDing = (params: any) => {
	return Axios.json(Alarm.ding, params, {}, 'POST');
};

export const getDing = (params?: any) => {
	return Axios.get(Alarm.ding, params);
};

export const sendDing = (params: any) => {
	return Axios.post(Alarm.sendDing, params);
};

export const connectDing = (params: any) => {
	return Axios.json(Alarm.connectDing, params, {}, 'POST');
};

export const getAlarmSetting = (params?: any) => {
	return Axios.get(Alarm.alertSetting, params);
};

export const postAlarmSetting = (params: any) => {
	return Axios.json(Alarm.alertSetting, params, {}, 'POST');
};

export const getSystemAlarmSetting = (params?: any) => {
	return Axios.get(Alarm.systemAlertSetting, params);
};

export const postSystemAlarmSetting = (params: any) => {
	// return Axios.post(Alarm.systemAlertSetting, params);
	return Axios.json(Alarm.systemAlertSetting, params, params, 'POST');
};
