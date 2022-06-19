import { filtersProps, FiltersProps } from '@/types/comment';

export const states: FiltersProps[] = [
	{ value: 'Creating', text: '启动中', color: '#0091FF' },
	{ value: 'Running', text: '运行正常', color: '#1E8E3E' },
	{ value: 'Other', text: '运行异常', color: '#DA372E' },
	{ value: 'Preparing', text: '创建中', color: '#0091FF' },
	{ value: 'failed', text: '创建失败', color: '#DA372E' }
];
export const podStatus: filtersProps[] = [
	{
		value: 'Completed',
		color: '#1E8E3E',
		label: '即将完成'
	},
	{
		value: 'NotReady',
		color: '#D93026',
		label: '运行异常'
	},
	{
		value: 'Running',
		color: '#1E8E3E',
		label: '运行正常'
	},
	{
		value: 'Terminating',
		color: '#FFC440',
		label: '停止异常'
	}
];
export const exposedWay: filtersProps[] = [
	{ value: 'Ingress', label: 'Ingress' },
	{ value: 'NodePort', label: 'NodePort' }
];
export const instanceType: filtersProps[] = [
	{ value: 'mysql', label: 'MySQL' },
	{ value: 'redis', label: 'Redis' },
	{ value: 'elasticsearch', label: 'Elasticsearch' },
	{ value: 'rocketmq', label: 'RocketMQ' }
];
export const instanceSpecList = [
	{
		label: '通用规格',
		value: 'General'
	},
	{
		label: '自定义',
		value: 'Customize'
	}
];
// 集群、分区不可改变路由名单
export const disabledRoute = [
	'/mysqlCreate',
	'/redisCreat',
	'/elasticsearchCreate',
	'/rocketmqCreate',
	'/postgresqlCreate',
	'/ZookeeperCreate',
	'/dynamicForm',
	'/serviceList/versionManagement',
	'/instanceList/detail',
	'/serviceList/basicInfo',
	'/serviceList/paramterSetting',
	'/basicInfo/',
	'/highAvailability/',
	'/paramterSetting/',
	'/backupRecovery/',
	'/externalAccess/',
	'/monitor/',
	'/log/',
	'/alarm/',
	'/disaster/',
	'/database',
	'/redisDatabase'
];

// 集群、分区不显示路由名单
export const hideRoute = [
	'/basicResource',
	'/authManage',
	'/platformOverview',
	'/operationAudit',
	'/userManagement',
	'/resourcePoolManagement',
	'/roleManagement',
	'/dataOverview',
	'/systemManagement',
	'/terminal',
	'/myProject',
	'/projectDetail',
	'/middlewareRepository',
	'/storageManagement'
];
// * 项目不显示路由名单
export const projectHideRoute = [
	'/basicResource',
	'/authManage',
	'/platformOverview',
	'/operationAudit',
	'/userManagement',
	'/resourcePoolManagement',
	'/roleManagement',
	'/dataOverview',
	'/systemManagement',
	'/terminal',
	'/middlewareRepository',
	'/myProject',
	'/storageManagement'
];
export const list = [
	{ value: 1, label: '星期一' },
	{ value: 2, label: '星期二' },
	{ value: 3, label: '星期三' },
	{ value: 4, label: '星期四' },
	{ value: 5, label: '星期五' },
	{ value: 6, label: '星期六' },
	{ value: 0, label: '星期日' }
];
export const weekMap = {
	1: '一',
	2: '二',
	3: '三',
	4: '四',
	5: '五',
	6: '六',
	0: '日'
};
export const esMap = {
	master: '主节点',
	data: '数据节点',
	kibana: 'kibana',
	client: '协调节点',
	cold: '冷数据节点'
};
export const modelMap = {
	MasterSlave: '一主一从',
	'1m-1s': '一主一从',
	simple: 'N主',
	complex: 'N主N数据N协调',
	'complex-cold': 'N主N数据N冷',
	'cold-complex': 'N主N数据N冷N协调',
	regular: 'N主N数据',
	sentinel: '哨兵',
	'2m-noslave': '两主',
	'2m-2s': '两主两从',
	'3m-3s': '三主三从',
	6: '三主三从',
	10: '五主五从'
};
export const radioList = [
	{
		value: '',
		label: '全部'
	},
	{
		value: 'info',
		label: '一般'
	},
	{
		value: 'warning',
		label: '重要'
	},
	{
		value: 'critical',
		label: '严重'
	}
];
export const searchTypes: filtersProps[] = [
	{ label: '分词搜索', value: 'match' },
	{ label: '精确搜索', value: 'matchPhrase' },
	{ label: '模糊搜索', value: 'wildcard' },
	{ label: '正则表达式搜索', value: 'regexp' }
];
export const symbols = [
	{ value: '>=', label: '>=' },
	{ value: '>', label: '>' },
	{ value: '==', label: '=' },
	{ value: '<', label: '<' },
	{ value: '<=', label: '<=' },
	{ value: '!=', label: '!=' }
];
export const alarmWarn: any[] = [
	{
		value: 'info',
		text: '一般'
	},
	{
		value: 'warning',
		text: '重要'
	},
	{
		value: 'critical',
		text: '严重'
	}
];
export const silences = [
	{ value: '5m', text: '5分钟' },
	{ value: '10m', text: '10分钟' },
	{ value: '15m', text: '15分钟' },
	{ value: '30m', text: '30分钟' },
	{ value: '1h', text: '1小时' },
	{ value: '2h', text: '2小时' },
	{ value: '3h', text: '3小时' },
	{ value: '6h', text: '6小时' },
	{ value: '12h', text: '12小时' },
	{ value: '24h', text: '24小时' }
];
export const initMenu = [
	{
		id: 1,
		own: false
	},
	{
		id: 2,
		own: false
	},
	{
		id: 3,
		own: false
	},
	{
		id: 4,
		own: false
	},
	{
		id: 5,
		own: false
	},
	{
		id: 6,
		own: false
	},
	{
		id: 7,
		own: false
	},
	{
		id: 8,
		own: false
	},
	{
		id: 9,
		own: false
	},
	{
		id: 10,
		own: false
	},
	{
		id: 11,
		own: false
	},
	{
		id: 12,
		own: false
	},
	{
		id: 13,
		own: false
	},
	{
		id: 14,
		own: false
	},
	{
		id: 15,
		own: false
	},
	{
		id: 16,
		own: false
	},
	{
		id: 17,
		own: false
	}
];
export const formItemLayout614 = {
	labelCol: {
		span: 6
	},
	wrapperCol: {
		span: 14
	}
};
export const formItemLayout618 = {
	labelCol: {
		span: 6
	},
	wrapperCol: {
		span: 18
	}
};
export const formItemLayout619 = {
	labelCol: {
		fixedSpan: 6
	},
	wrapperCol: {
		span: 19
	}
};
export const timeSelectDataSource = [
	{
		value: '1',
		label: '1',
		children: [
			{ value: '1-minutes', label: '分钟' },
			{ value: '1-hours', label: '小时' },
			{ value: '1-days', label: '天' }
		]
	},

	{
		value: '3',
		label: '3',
		children: [
			{ value: '3-minutes', label: '分钟' },
			{ value: '3-hours', label: '小时' },
			{ value: '3-days', label: '天' }
		]
	},
	{
		value: '5',
		label: '5',
		children: [
			{ value: '5-minutes', label: '分钟' },
			{ value: '5-hours', label: '小时' },
			{ value: '5-days', label: '天' }
		]
	},
	{
		value: '7',
		label: '7',
		children: [
			{ value: '7-minutes', label: '分钟' },
			{ value: '7-hours', label: '小时' },
			{ value: '7-days', label: '天' }
		]
	},
	{
		value: '15',
		label: '15',
		children: [
			{ value: '15-minutes', label: '分钟' },
			{ value: '15-hours', label: '小时' },
			{ value: '15-days', label: '天' }
		]
	},
	{
		value: '30',
		label: '30',
		children: [
			{ value: '30-minutes', label: '分钟' },
			{ value: '30-hours', label: '小时' },
			{ value: '30-days', label: '天' }
		]
	}
];
export const protocolFilter = [
	{ label: 'HTTP', value: 'HTTP' },
	{ label: 'TCP', value: 'TCP' }
];
export const address = [
	{
		key: 'https',
		value: 'https'
	},
	{
		key: 'http',
		value: 'http'
	}
];
export const authorityList = [
	{
		authority: 1,
		value: '只读'
	},
	{
		authority: 2,
		value: '读写(DDL+DML)'
	},
	{
		authority: 3,
		value: '仅DDL'
	},
	{
		authority: 4,
		value: '仅DML'
	}
];
export const backupTaskStatus = [
	{ value: 'Running', text: '进行中', color: '#faad14' },
	{ value: 'Success', text: '成功', color: '#52c41a' },
	{ value: 'Failed', text: '失败', color: '#ff4d4f' },
	{ value: 'Unknown', text: '未知', color: '#d7d7d7' }
];
