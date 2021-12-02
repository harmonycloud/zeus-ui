import Axios from './request.js';
import * as MIDDLEWARE from './middleware.constants';

export const getMiddlewares = (params) => {
	return Axios.get(MIDDLEWARE.middlewares, params);
};

export const getNodePort = (params) => {
	return Axios.get(MIDDLEWARE.nodePorts, params);
};

export const getNodeTaint = (params) => {
	return Axios.get(MIDDLEWARE.nodeTaints, params);
};

export const getStorageClass = (params) => {
	return Axios.get(MIDDLEWARE.storageClasses, params);
};

export const postMiddleware = (params) => {
	return Axios.json(MIDDLEWARE.middleware, params);
};

export const getMiddlewareList = (params) => {
	return Axios.get(MIDDLEWARE.middleware, params);
};

export const getMiddlewareDetail = (params) => {
	return Axios.get(MIDDLEWARE.getMiddlewareDetail, params);
};

export const updateMiddleware = (params) => {
	return Axios.json(MIDDLEWARE.updateMiddleware, params, {}, 'PUT');
};

export const getPods = (params) => {
	return Axios.get(MIDDLEWARE.getPods, params);
};

export const restartPods = (params) => {
	return Axios.post(MIDDLEWARE.restartPod, params);
};

export const deleteMiddleware = (params) => {
	return Axios.delete(MIDDLEWARE.middlewareName, params);
};

export const getBackups = (params) => {
	return Axios.get(MIDDLEWARE.backups, params);
};

export const addBackup = (params) => {
	return Axios.post(MIDDLEWARE.backups, params);
};

export const deleteBackup = (params) => {
	return Axios.delete(MIDDLEWARE.deleteBackup, params);
};

export const getBackupConfig = (params) => {
	return Axios.get(MIDDLEWARE.getBackupConfig, params);
};

export const addBackupConfig = (params) => {
	return Axios.post(MIDDLEWARE.createTimingBackup, params);
};

export const switchMiddlewareMasterSlave = (params) => {
	return Axios.put(MIDDLEWARE.switchMiddleware, params);
};

export const getMiddlewareMonitorUrl = (params) => {
	return Axios.get(MIDDLEWARE.middlewareMonitor, params);
};

export const getMiddlewareEvents = (params) => {
	return Axios.get(MIDDLEWARE.middlewareEvents, params);
};
export const getUsedAlarms = (params) => {
	return Axios.get(MIDDLEWARE.getUsedAlarmRules, params);
};
export const getUsedAlarm = (params) => {
	return Axios.get(MIDDLEWARE.getUsedAlarmRule, params);
};
export const getCanUseAlarms = (params) => {
	return Axios.get(MIDDLEWARE.getCanUseAlarmRules, params);
};
export const createAlarms = (params) => {
	const { restUrl } = Axios.restfulAPI(MIDDLEWARE.addAlarmRules, params.url);
	return Axios.json(restUrl, params.data);
};
export const createAlarm = (params) => {
	const { restUrl } = Axios.restfulAPI(MIDDLEWARE.addAlarmRule, params.url);
	return Axios.json(restUrl, params.data);
};
export const updateAlarms = (params) => {
	const { restUrl } = Axios.restfulAPI(
		MIDDLEWARE.updateAlarmRules,
		params.url
	);
	return Axios.json(restUrl, params.data[0]);
};
export const updateAlarm = (params) => {
	console.log(params);
	const { restUrl } = Axios.restfulAPI(MIDDLEWARE.addAlarmRule, params.url);
	return Axios.json(restUrl, params.data[0], {}, 'PUT');
};
export const deleteAlarms = (params) => {
	return Axios.delete(MIDDLEWARE.deleteAlarmRules, params);
};
export const deleteAlarm = (params) => {
	return Axios.delete(MIDDLEWARE.deleteAlarmRule, params);
};
export const getConfigs = (params) => {
	return Axios.get(MIDDLEWARE.getCustomConfig, params);
};
export const updateConfig = (params) => {
	const { restUrl } = Axios.restfulAPI(
		MIDDLEWARE.updateCustomConfig,
		params.url
	);
	return Axios.json(restUrl, params.data, {}, 'PUT');
};
export const getConfigHistory = (params) => {
	return Axios.get(MIDDLEWARE.getConfigHistory, params);
};
export const getParamTemp = (params) => {
	return Axios.get(MIDDLEWARE.getParamTemplate, params);
};
export const getParamDetail = (params) => {
	return Axios.get(MIDDLEWARE.getParamTemplateDetail, params);
};
export const getSlowLogs = (params) => {
	return Axios.get(MIDDLEWARE.getSlowLog, params);
};
export const getDynamicFormData = (params) => {
	return Axios.get(MIDDLEWARE.getDynamicForm, params);
};
export const getPvcs = (params) => {
	return Axios.get(MIDDLEWARE.getPVC, params);
};
export const getSecrets = (params) => {
	return Axios.get(MIDDLEWARE.getSecret, params);
};
export const getStandardLogFiles = (params) => {
	return Axios.get(MIDDLEWARE.getContainerFiles, params);
};
export const getLogDetail = (params) => {
	return Axios.post(MIDDLEWARE.getLogDetails, params);
};
export const download = (params) => {
	const { restUrl } = Axios.restfulAPI(MIDDLEWARE.downloadLog, params);
	return restUrl;
};
export const getLogFileIndex = (params) => {
	return Axios.get(MIDDLEWARE.getLogIndex, params);
};
export const addDisasterIns = (params) => {
	return Axios.json(MIDDLEWARE.addDisasterInstance, params, {}, 'PUT');
};
export const switchDisasterIns = (params) => {
	return Axios.post(MIDDLEWARE.switchDisasterInstance, params);
};
export const getMysqlExternal = (params) => {
	return Axios.get(MIDDLEWARE.getMysqlExternal, params);
};
