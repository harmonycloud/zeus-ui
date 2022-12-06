import { api } from '@/api.json';

export const middlewares = `${api}/middlewares/info`;
export const nodePorts = `${api}/clusters/{clusterId}/nodes/labels`;
export const nodeTaints = `${api}/clusters/{clusterid}/nodes/taints`;
export const storageClasses = `${api}/clusters/{clusterId}/storageclasses`;
export const middleware = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares`;
// * 获取中间件详情 / 修改日志开关状态
export const getMiddlewareDetail = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}`;
// * 修改中间件
export const updateMiddleware = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}`;
// * 查询pod列表
export const getPods = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/topology`;
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
// * 获取告警规则详情
export const getAlarmDetail = `${api}/rules/detail`;
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
// * 置顶/取消置顶参数
export const topConfigParam = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/config/{configName}/top`;
// * 创建数据库用户
export const createUser = `${api}/clusters/{clusterId}/middlewares/mysql/createUser`;
// * 查询数据库用户列表
export const listUser = `${api}/clusters/{clusterId}/middlewares/mysql/listUser`;
// * 创建数据库/更改用户备注
export const createDb = `${api}/clusters/{clusterId}/middlewares/mysql/createDb`;
// * 查询mysql字符集
export const listCharset = `${api}/clusters/{clusterId}/middlewares/mysql/listCharset`;
// * 查询数据库列表
export const listDb = `${api}/clusters/{clusterId}/middlewares/mysql/listDb`;
// * 删除数据库
export const deleteDb = `${api}/clusters/{clusterId}/middlewares/mysql/deleteDb`;
// * 更改数据库备注
export const updateDb = `${api}/clusters/{clusterId}/middlewares/mysql/updateDb`;
// * 修改用户
export const grantUser = `${api}/clusters/{clusterId}/middlewares/mysql/grantUser`;
// * 修改密码
export const updatePassword = `${api}/clusters/{clusterId}/middlewares/mysql/updatePassword`;
// * 删除用户
export const deleteUser = `${api}/clusters/{clusterId}/middlewares/mysql/deleteUser`;
// * sql审计
export const queryAuditSql = `${api}/clusters/{clusterId}/middlewares/mysql/queryAuditSql`;
// * 增删改查kv
export const redis = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/redis`;
// * 获取可用区key
export const getKey = `${api}/area/keys`;
// * 获取可用区tolerations
export const getTolerations = `${api}/area/tolerations`;
// * 获取当前从节点绑定主节点
export const getMasterName = `${api}/clusters/{clusterId}/namespaces/{namespace}/middlewares/{middlewareName}/redis/burstMaster`;
