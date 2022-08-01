export enum status {
	Syncing = '同步中',
	StopSyncing = '停止同步',
	Error = '错误'
}
export enum stateProps {
	'error' = 'error',
	'loading' = 'loading',
	'success' = 'success',
	'warning' = 'warning'
}
export enum versionStatus {
	now = '当前版本',
	future = '可安装升级版本',
	history = '历史版本',
	updating = '升级中'
}
export enum serviceVersionStatus {
	now = '当前版本',
	future = '可升级版本',
	history = '历史版本',
	updating = '升级中'
}
export enum name {
	alertmanager = '监控告警',
	prometheus = '数据监控',
	logging = '日志采集',
	minio = '备份存储',
	grafana = '监控面板',
	ingress = '负载均衡',
	'local-path' = '资源存储',
	'middleware-controller' = '中间件管理',
	lvm = 'LVM存储'
}
export enum color {
	alertmanager = '#12C1C6',
	prometheus = '#F7786C',
	logging = '#6069FF',
	minio = '#846CF7',
	grafana = '#60C1FF',
	ingress = '#FFAA3A',
	'local-path' = '#E871AF',
	'middleware-controller' = '#C5D869',
	lvm = '#EAC110'
}
export enum icon {
	alertmanager = 'icon-gaojingshijian1',
	prometheus = 'icon-shujujiankong1',
	logging = 'icon-rizhicaiji',
	minio = 'icon-beifen',
	grafana = 'icon-shujujiankong',
	ingress = 'icon-fuzaijunheng',
	'local-path' = 'icon-ziyuan-cunchu',
	'middleware-controller' = 'icon-zhongjianjianguanli',
	'lvm' = 'icon-cunchu1'
}
export enum labelSimple {
	alertmanager = 'cpu：0.2核；内存：0.5G；存储：0G',
	prometheus = 'cpu：1核；内存：2G；存储：10G',
	logging = 'cpu：2.5核；内存：7G；存储：5G',
	minio = 'cpu：0.5核；内存：1G；存储：20G',
	grafana = 'cpu：1核；内存：1G；存储：0G',
	'middleware-controller' = 'cpu：0.5核；内存：0.5G；存储：0G'
}
export enum labelHigh {
	alertmanager = 'cpu：0.6核；内存：1.5G；存储：0G',
	prometheus = 'cpu：3核；内存：6G；存储：30G',
	logging = 'cpu：4.5核；内存：15G；存储：15G',
	minio = 'cpu：1.5核；内存：3G；存储：30G',
	grafana = 'cpu：3核；内存：3G；存储：0G',
	'middleware-controller' = 'cpu：1.5核；内存：1.5G；存储：0G'
}
