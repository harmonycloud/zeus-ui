import { api } from '@/api.json';

export const middlewares = `${api}/middlewares/info`;
export const nodePorts = `${api}/clusters/{clusterId}/nodes/labels`;
export const nodeTaints = `${api}/clusters/{clusterid}/nodes/taints`;
export const storageClasses = `${api}/clusters/{clusterId}/storageclasses`;
export const middleware = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares`;
// * 获取中间件详情
export const getMiddlewareDetail = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}`;
// * 修改中间件
export const updateMiddleware = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}`;
// * 查询pod列表
export const getPods = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/pods`;
// * 重启pod
export const restartPod = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/pods/{podName}/restart`;
export const middlewareName = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}`;
// * 查询备份数据 & 立即备份
export const backups = `${api}/clusters/{clusterId}/middlewares/mysql/{mysqlName}/backups`;
// * 删除备份
export const deleteBackup = `${api}/clusters/{clusterId}/middlewares/mysql/{mysqlName}/backups/{backupName}`;
// * 查询定时备份配置
export const getBackupConfig = `${api}/clusters/{clusterId}/middlewares/mysql/{mysqlName}/backups/schedule`;
// * 创建定制备份
export const createTimingBackup = `${api}/clusters/{clusterId}/middlewares/mysql/{mysqlName}/backups/schedule`;
// * 中间件切换
export const switchMiddleware = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/switch`;
// * 性能监控
export const middlewareMonitor = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/monitor`;
// * 服务事件
export const middlewareEvents = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/events`;
// * 查询已设置的告警规则-服务
export const getUsedAlarmRules = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/rules/used`;
// * 查询已设置的告警规则-系统
export const getUsedAlarmRule = `${api}/clusters/{clusterId}/rules/used`;
// * 查询可以设置的告警规则
export const getCanUseAlarmRules = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/rules`;
// * 创建告警规则-服务
export const addAlarmRules = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/rules`;
// * 创建、修改告警规则-系统
export const addAlarmRule = `${api}/clusters/{clusterId}/rules/system`;
// * 删除告警规则-服务
export const deleteAlarmRules = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/rules`;
// * 删除告警规则-系统
export const deleteAlarmRule = `${api}/clusters/{clusterId}/rules/system`;
// * 更新告警规则-服务
export const updateAlarmRules = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/rules/update`;
// * 获取自定义配置
export const getCustomConfig = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/config`;
// * 更新自定义配置
export const updateCustomConfig = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/config`;
// * 获取自定义配置修改记录
export const getConfigHistory = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/config/history`;
// * 获取参数模板列表
export const getParamTemplate = `${api}/middlewares/template`;
// * 获取参数模板列表详情
export const getParamTemplateDetail = `${api}/middlewares/template/{templateName}`;
// * 获取慢日志
export const getSlowLog = `${api}/clusters/{clusterId}/middlewares/mysql/{middlewareName}/slowsql`;
// * 动态表单接口获取
export const getDynamicForm = `${api}/clusters/{clusterId}/dynamic`;
// * 获取pvc数据
export const getPVC = `${api}/clusters/{clusterId}/namespaces/{namespace}/pvc`;
// * 获取secret数据
export const getSecret = `${api}/clusters/{clusterId}/namespaces/{namespace}/secret`;
// * 获取标准日志文件
export const getContainerFiles = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/applogs/filenames`;
// * 获取单个日志的文件详情
export const getLogDetails = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/applogs`;
// * 导出日志
export const downloadLog = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/applogs/export`;
// * 获取日志目录
export const getLogIndex = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/applogs/queryLogfiles`;
// * 添加灾备服务
export const addDisasterInstance = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}`;
// * 灾备切换
export const switchDisasterInstance = `${api}/clusters/{clusterId}/middlewares/mysql/{mysqlName}/disasterRecovery`;
// * 获取mysql对外访问信息
export const getMysqlExternal = `${api}/clusters/{clusterId}/middlewares/mysql/{mysqlName}/queryAccessInfo`;
// * 重启服务
export const restartService = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/reboot`;
// * 查看pod yaml
export const getPodYaml = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/pods/{podName}/yaml`;
// * value.yaml
export const valueYamlApi = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/values`;
// * 存储扩容
export const dilatationStorage = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/storage`;
// * 查询可发布的中间件信息
export const getCanReleaseMiddleware = `${api}/middlewares/info/{type}`;
