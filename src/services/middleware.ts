import Axios from './request.js';
import * as MIDDLEWARE from './middleware.constants';

export const getMiddlewares = (params: any) => {
	return Axios.get(MIDDLEWARE.middlewares, params);
};

export const getNodePort = (params: any) => {
	return Axios.get(MIDDLEWARE.nodePorts, params);
};

export const getNodeTaint = (params: any) => {
	return Axios.get(MIDDLEWARE.nodeTaints, params);
};

export const getStorageClass = (params: any) => {
	return Axios.get(MIDDLEWARE.storageClasses, params);
};

export const postMiddleware = (params: any) => {
	return Axios.json(MIDDLEWARE.middleware, params);
};

export const getMiddlewareList = (params: any) => {
	return Axios.get(MIDDLEWARE.middleware, params);
};

export const getMiddlewareDetail = (params: any) => {
	return Axios.get(MIDDLEWARE.getMiddlewareDetail, params);
};

export const updateMiddleware = (params: any) => {
	return Axios.json(MIDDLEWARE.updateMiddleware, params, {}, 'PUT');
};

export const getPods = (params: any) => {
	return Axios.get(MIDDLEWARE.getPods, params);
};

export const restartPods = (params: any) => {
	return Axios.post(MIDDLEWARE.restartPod, params);
};

export const deleteMiddleware = (params: any) => {
	return Axios.delete(MIDDLEWARE.middlewareName, params);
};

export const getBackups = (params: any) => {
	return Axios.get(MIDDLEWARE.backups, params);
};

export const addBackup = (params: any) => {
	return Axios.post(MIDDLEWARE.backups, params);
};

export const deleteBackup = (params: any) => {
	return Axios.delete(MIDDLEWARE.deleteBackup, params);
};

export const getBackupConfig = (params: any) => {
	return Axios.get(MIDDLEWARE.getBackupConfig, params);
};

export const addBackupConfig = (params: any) => {
	return Axios.post(MIDDLEWARE.createTimingBackup, params);
};

export const switchMiddlewareMasterSlave = (params: any) => {
	return Axios.put(MIDDLEWARE.switchMiddleware, params);
};

export const getMiddlewareMonitorUrl = (params: any) => {
	return Axios.get(MIDDLEWARE.middlewareMonitor, params);
};

export const getMiddlewareEvents = (params: any) => {
	return Axios.get(MIDDLEWARE.middlewareEvents, params);
};
export const getUsedAlarms = (params: any) => {
	return Axios.get(MIDDLEWARE.getUsedAlarmRules, params);
};
export const getUsedAlarm = (params: any) => {
	return Axios.get(MIDDLEWARE.getUsedAlarmRule, params);
};
export const getCanUseAlarms = (params: any) => {
	return Axios.get(MIDDLEWARE.getCanUseAlarmRules, params);
};
export const getAlarmDetail = (params: any) => {
	return Axios.get(MIDDLEWARE.getAlarmDetail, params);
};
export const createAlarms = (params: any) => {
	const { restUrl } = Axios.restfulAPI(MIDDLEWARE.addAlarmRules, params.url);
	return Axios.json(restUrl + '?ding=' + params.ding, params.data);
};
export const createAlarm = (params: any) => {
	const { restUrl } = Axios.restfulAPI(MIDDLEWARE.addAlarmRule, params.url);
	return Axios.json(restUrl + '?ding=' + params.ding, params.data);
};
export const updateAlarms = (params: any) => {
	const { restUrl } = Axios.restfulAPI(
		MIDDLEWARE.updateAlarmRules,
		params.url
	);
	return Axios.json(
		restUrl + '?alertRuleId=' + params.alertRuleId + '&ding=' + params.ding,
		params.data
	);
};
export const updateAlarm = (params: any) => {
	const { restUrl } = Axios.restfulAPI(MIDDLEWARE.addAlarmRule, params.url);
	return Axios.json(
		restUrl + '?alertRuleId=' + params.alertRuleId + '&ding=' + params.ding,
		params.data,
		{},
		'PUT'
	);
};
export const deleteAlarms = (params: any) => {
	return Axios.delete(MIDDLEWARE.deleteAlarmRules, params);
};
export const deleteAlarm = (params: any) => {
	return Axios.delete(MIDDLEWARE.deleteAlarmRule, params);
};
export const getConfigs = (params: any) => {
	return Axios.get(MIDDLEWARE.getCustomConfig, params);
};
export const updateConfig = (params: any) => {
	const { restUrl } = Axios.restfulAPI(
		MIDDLEWARE.updateCustomConfig,
		params.url
	);
	return Axios.json(restUrl, params.data, {}, 'PUT');
};
export const getConfigHistory = (params: any) => {
	return Axios.get(MIDDLEWARE.getConfigHistory, params);
};
export const getParamTemp = (params: any) => {
	return Axios.get(MIDDLEWARE.getParamTemplate, params);
};
export const getParamDetail = (params: any) => {
	return Axios.get(MIDDLEWARE.getParamTemplateDetail, params);
};
export const getSlowLogs = (params: any) => {
	return Axios.get(MIDDLEWARE.getSlowLog, params);
};
export const getDynamicFormData = (params: any) => {
	return Axios.get(MIDDLEWARE.getDynamicForm, params);
};
export const getPvcs = (params: any) => {
	return Axios.get(MIDDLEWARE.getPVC, params);
};
export const getSecrets = (params: any) => {
	return Axios.get(MIDDLEWARE.getSecret, params);
};
export const getStandardLogFiles = (params: any) => {
	return Axios.get(MIDDLEWARE.getContainerFiles, params);
};
export const getLogDetail = (params: any) => {
	return Axios.post(MIDDLEWARE.getLogDetails, params);
};
export const download = (params: any) => {
	const { restUrl } = Axios.restfulAPI(MIDDLEWARE.downloadLog, params);
	return restUrl;
};
export const getLogFileIndex = (params: any) => {
	return Axios.get(MIDDLEWARE.getLogIndex, params);
};
export const addDisasterIns = (params: any) => {
	return Axios.json(MIDDLEWARE.addDisasterInstance, params, {}, 'PUT');
};
export const switchDisasterIns = (params: any) => {
	return Axios.post(MIDDLEWARE.switchDisasterInstance, params);
};
export const getMysqlExternal = (params: any) => {
	return Axios.get(MIDDLEWARE.getMysqlExternal, params);
};
// * 重启服务
export const rebootService = (params: any) => {
	return Axios.post(MIDDLEWARE.restartService, params);
};

// * 查看pod yaml
export const getPodNameYaml = (params: any) => {
	return Axios.get(MIDDLEWARE.getPodYaml, params);
};

// * 获取value.yaml
export const getValueYaml = (params: any) => {
	return Axios.get(MIDDLEWARE.valueYamlApi, params);
};

// * 更新value.yaml
export const updateValueYaml = (params: any) => {
	return Axios.json(MIDDLEWARE.valueYamlApi, params, {}, 'PUT');
};

// * 存储扩容
export const storageDilatation = (params: any) => {
	return Axios.json(MIDDLEWARE.dilatationStorage, params, {}, 'PUT');
};
// * 查询可发布的中间件信息
export const getCanReleaseMiddleware = (params: any) => {
	return Axios.get(MIDDLEWARE.getCanReleaseMiddleware, params);
};
