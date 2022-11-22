import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
	Select,
	Switch,
	Modal,
	Col,
	Row,
	notification,
	Form,
	Input,
	Popconfirm
} from 'antd';
import { EditOutlined, InfoCircleOutlined } from '@ant-design/icons';
import DataFields from '@/components/DataFields';
import DefaultPicture from '@/components/DefaultPicture';

import RocketAclUserInfo from './rocketAclUserInfo';
import RocketAclEditForm from './rocketAclEditForm';
import EventsList from './eventsList';
import { rocketMQAccount } from '@/components/RocketACLForm/acl';

import { updateMiddleware, getMiddlewareEvents } from '@/services/middleware';

import { statusRender } from '@/utils/utils';
import transTime from '@/utils/transTime';
import {
	BasicInfoProps,
	configParams,
	DetailParams,
	DynamicDataParams,
	eventsParams,
	InfoParams,
	runParams
} from '../detail';

import './basicinfo.scss';

const FormItem = Form.Item;
const { Option } = Select;
const { confirm } = Modal;
const info: InfoParams = {
	title: '规格配置',
	name: '',
	aliasName: '',
	label: '',
	hostAffinity: '',
	hostAnti: '',
	chartVersion: '',
	description: '',
	annotations: '',
	tolerations: '',
	mirror: ''
};

const InfoConfig = [
	{
		dataIndex: 'title',
		render: (val: string) => (
			<div className="title-content">
				<div className="blue-line"></div>
				<div className="detail-title">{val}</div>
			</div>
		),
		span: 24
	},
	{
		dataIndex: 'name',
		label: '服务名称'
	},
	{
		dataIndex: 'aliasName',
		label: '显示名称',
		render: (val: string) => (
			<div className="text-overflow-one" title={val}>
				{val}
			</div>
		)
	},
	{
		dataIndex: 'label',
		label: '标签',
		render: (val: string) => (
			<div className="text-overflow-one" title={val}>
				{val}
			</div>
		)
	},
	{
		dataIndex: 'annotations',
		label: '注解',
		render: (val: string) => (
			<div className="text-overflow-one" title={val}>
				{val}
			</div>
		)
	},
	{
		dataIndex: 'hostAffinity',
		label: '主机亲和',
		render: (val: string) => (
			<div className="text-overflow-one" title={val}>
				{val}
			</div>
		)
	},
	{
		dataIndex: 'hostAnti',
		label: '主机反亲和',
		render: (val: string) => (
			<div className="text-overflow-one" title={val}>
				{val}
			</div>
		)
	},
	{
		dataIndex: 'tolerations',
		label: '主机容忍',
		render: (val: string) => (
			<div className="text-overflow-one" title={val}>
				{val}
			</div>
		)
	}
];

const config: configParams = {
	title: '配置信息',
	version: '',
	characterSet: '',
	port: 0,
	autoCreateTopicEnable: false,
	password: ''
};

const runStatus: runParams = {
	title: '运行状态',
	status: '',
	createTime: '',
	model: '',
	namespace: '',
	storageClassName: '',
	storageType: '',
	hostNetwork: '',
	group: 0,
	replicas: 0
};

const events: eventsParams = {
	title: '实时事件',
	table: ''
};

const modelMap = {
	MasterSlave: '一主一从',
	'1m-1s': '一主一从',
	'1m-3s': '一主三从',
	'1m-ns': '一主多从',
	'1m-0s': '单实例',
	simple: 'N主',
	complex: 'N主N数据N协调',
	'complex-cold': 'N主N数据N冷',
	'cold-complex': 'N主N数据N冷N协调',
	regular: 'N主N数据',
	sentinel: '哨兵',
	'2m-noslave': '双主',
	'2m-2s': '两主两从',
	'3m-3s': '三主三从',
	2: '单分片',
	4: '二分片',
	6: '三分片',
	8: '四分片',
	10: '五分片',
	16: '八分片',
	dledger: 'DLedger模式',
	cluster: '集群模式'
};
const titleConfig = {
	dataIndex: 'title',
	render: (val: string) => (
		<div className="title-content">
			<div className="blue-line"></div>
			<div className="detail-title">{val}</div>
		</div>
	),
	span: 24
};
const versionConfig = {
	dataIndex: 'version',
	label: '版本'
};
const healthConfig = {
	dataIndex: 'status',
	label: '健康状态',
	render: (val: string) => statusRender(val)
};
const createTimeConfig = {
	dataIndex: 'createTime',
	label: '创建时间',
	render: (val: string) => transTime.gmt2local(val)
};
const modelConfig = {
	dataIndex: 'model',
	label: '模式'
};
const replicasConfig = {
	dataIndex: 'replicas',
	label: '副本数',
	render: (val: number) => val || '--'
};
const groupConfig = {
	dataIndex: 'group',
	label: 'DLedger组数',
	render: (val: number) => val || '--'
};
const namespaceConfig = {
	dataIndex: 'namespaceAliasName',
	label: '所在分区',
	render: (val: string, dataSource: any) => {
		return (
			<div
				className="text-overflow-one"
				title={`${val || dataSource.namespace}(${
					dataSource.namespace
				})`}
			>
				{`${val || dataSource.namespace}(${dataSource.namespace})`}
			</div>
		);
	}
};
const storageClassNameConfig = {
	dataIndex: 'storageClassName',
	label: '存储名称',
	render: (val: string, dataSource: any) =>
		`${val}(${dataSource.storageType})`
};
// const storageTypeConfig = {
// 	dataIndex: 'storageType',
// 	label: '存储类型'
// };
const hostNetworkConfig = {
	dataIndex: 'hostNetwork',
	label: '主机网络',
	render: (val: boolean) => (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			{val ? '已开启' : '已关闭'}
			<Switch checked={val} size="small" style={{ marginLeft: '8px' }} />
		</div>
	)
};
const zookeeperConfig = {
	dataIndex: 'kafkaDTO',
	label: 'Zookeeper配置',
	render: (val: any) => (
		<div>{val ? val?.zkAddress + ':' + val?.zkPort + val?.path : '/'}</div>
	)
};
function BasicInfo(props: BasicInfoProps): JSX.Element {
	const {
		type,
		data,
		middlewareName,
		customMid,
		clusterId,
		namespace,
		onRefresh,
		toDetail,
		operateFlag
	} = props;
	const [form] = Form.useForm();
	const history = useHistory();
	const params: DetailParams = useParams();
	// * 密码显影
	const [passwordDisplay, setPasswordDisplay] = useState<boolean>(false);
	// * 事件
	const [eventType, setEventType] = useState<string>('All');
	const [kind, setKind] = useState<string>('All');
	// * 规格配置
	const [basicData, setBasicData] = useState(info);
	const [infoConfig, setInfoConfig] = useState(InfoConfig);
	// * 运行状态
	const [runData, setRunData] = useState<any>(runStatus);
	const [runConfig, setRunConfig] = useState(
		type !== 'rocketmq'
			? [
					titleConfig,
					healthConfig,
					createTimeConfig,
					modelConfig,
					namespaceConfig,
					storageClassNameConfig
			  ]
			: data.mode === 'dledger'
			? [
					titleConfig,
					healthConfig,
					createTimeConfig,
					modelConfig,
					groupConfig,
					replicasConfig,
					namespaceConfig,
					storageClassNameConfig,
					hostNetworkConfig
			  ]
			: [
					titleConfig,
					healthConfig,
					createTimeConfig,
					modelConfig,
					namespaceConfig,
					storageClassNameConfig,
					hostNetworkConfig
			  ]
	);
	// * 配置信息
	const [yamlConfig] = useState({
		dataIndex: 'yaml',
		label: '部署配置',
		render: (val: any) => (
			<span
				className="name-link"
				onClick={() => {
					history.push(
						`/serviceList/${params.name}/${params.aliasName}/highAvailability/yamlDetail/${params.middlewareName}/${params.type}/${params.chartVersion}/${clusterId}/${namespace}`
					);
				}}
			>
				编辑部署配置
			</span>
		)
	});
	const [configData, setConfigData] = useState(config);
	const [configConfig, setConfigConfig] = useState([
		titleConfig,
		versionConfig
	]);
	// * 动态表单相关
	const [dynamicData, setDynamicData] = useState<DynamicDataParams>({
		title: '其他'
	});
	const [dynamicConfig, setDynamicConfig] = useState<any[]>([titleConfig]);
	// * mq acl 认证相关
	const [aclCheck, setACLCheck] = useState(false);
	const [aclData, setAclData] = useState({
		title: '访问权限控制认证',
		globalIps: ''
	});
	const [visible, setVisible] = useState(false); // * 修改acl
	const [eventList, setEventList] = useState([]);
	const disasterInstanceConfig = {
		dataIndex: 'disasterInstanceName',
		label: '备份服务名称',
		render: (val: string) => {
			return (
				<span
					className="name-link"
					onClick={() => {
						if (clusterId !== data.mysqlDTO.relationClusterId) {
							confirm({
								title: '提醒',
								content:
									'该备用服务不在当前集群命名空间，返回源服务页面请点击右上角“返回源服务”按钮',
								onOk: () => {
									toDetail();
								}
							});
						} else {
							toDetail();
						}
					}}
				>
					{val}
				</span>
			);
		}
	};
	const originInstanceConfig = {
		dataIndex: 'disasterInstanceName',
		label: '源服务名称',
		render: (val: string) => {
			return (
				<span
					className="name-link"
					onClick={() => {
						toDetail();
					}}
				>
					{val}
				</span>
			);
		}
	};
	const aclSwitchChange = (checked: boolean) => {
		confirm({
			title: '提示',
			content: checked
				? '请确定是否开启访问权限控制认证'
				: '请确定是否关闭访问权限控制认证',
			onOk: async () => {
				if (!checked) {
					const sendData = {
						clusterId,
						namespace,
						type,
						chartName: type,
						chartVersion: data.chartVersion,
						middlewareName: middlewareName,
						rocketMQParam: {
							acl: {
								enable: false
							}
						}
					};
					const res = await updateMiddleware(sendData);
					if (res.success) {
						notification.success({
							message: '成功',
							description:
								'访问权限控制认证关闭成功,3秒后刷新页面'
						});
						setACLCheck(checked);
						setTimeout(() => {
							onRefresh();
						}, 3000);
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				} else {
					setACLCheck(checked);
				}
			}
		});
	};
	const editDescription = (value: any) => {
		console.log(value);
		const sendData = {
			clusterId: clusterId,
			namespace: namespace,
			middlewareName: middlewareName,
			chartName: type,
			chartVersion: params.chartVersion,
			type: type,
			description: value.description
		};
		updateMiddleware(sendData).then((res) => {
			if (res.success) {
				notification.success({
					message: '成功',
					description: '备注修改成功,5秒后刷新页面'
				});
				setTimeout(() => {
					onRefresh();
				}, 5000);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};

	const modeText = (data: any) => {
		if (data.type === 'redis' || data.type === 'mysql') {
			if (type === 'mysql') {
				if (data.mode === '1m-0s') {
					return '单实例模式';
				} else {
					return `${
						data.readWriteProxy?.enabled
							? '哨兵代理模式'
							: '高可用模式'
					}（${modelMap[data.mode]}）`;
				}
			} else {
				let text = '';
				if (data.mode === 'cluster') {
					if (data.readWriteProxy?.enabled) {
						text = '集群代理模式';
					} else {
						text = '集群模式';
					}
				} else {
					if (data.readWriteProxy?.enabled) {
						text = '哨兵代理模式';
					} else {
						text = '哨兵模式';
					}
				}
				return `${text}（${modelMap[data.quota.redis.num]}）`;
			}
		} else {
			return modelMap[data.mode];
		}
	};

	useEffect(() => {
		if (data !== undefined) {
			if (data.mysqlDTO || data?.mysqlDTO?.openDisasterRecoveryMode) {
				setBasicData({
					title: '规格配置',
					name: data.name,
					aliasName: data.aliasName || '无',
					label: data.labels || '',
					hostAffinity: `${
						(data.nodeAffinity &&
							data.nodeAffinity.length > 0 &&
							data.nodeAffinity
								.filter((item) => !item.anti)
								.map((item: any) => item.label)
								.join(';')) ||
						'无'
					}(${
						data.nodeAffinity &&
						data.nodeAffinity.length > 0 &&
						data.nodeAffinity.filter((item) => !item.anti)[0]
							?.required
							? '强制'
							: '非强制'
					})`,
					hostAnti: `${
						(data.nodeAffinity &&
							data.nodeAffinity.length > 0 &&
							data.nodeAffinity
								.filter((item) => item.anti)
								.map((item: any) => item.label)
								.join(';')) ||
						'无'
					}(${
						data.nodeAffinity &&
						data.nodeAffinity.length > 0 &&
						data.nodeAffinity.filter((item) => item.anti)[0]
							?.required
							? '强制'
							: '非强制'
					})`,
					chartVersion: data.chartVersion,
					disasterInstanceName: data.mysqlDTO.relationName || '/',
					annotations: data.annotations || '-',
					description: data.description || '无',
					tolerations: `${
						(data.tolerations && data.tolerations.join(',')) || '/'
					}`,
					mirror: data.mirrorImage || '/'
				});
			} else {
				setBasicData({
					title: '规格配置',
					name: data.name,
					aliasName: data.aliasName || '无',
					label: data.labels || '',
					hostAffinity: `${
						(data.nodeAffinity &&
							data.nodeAffinity.length > 0 &&
							data.nodeAffinity
								.filter((item) => !item.anti)
								.map((item: any) => item.label)
								.join(';')) ||
						'无'
					}(${
						data.nodeAffinity &&
						data.nodeAffinity.length > 0 &&
						data.nodeAffinity.filter((item) => !item.anti)[0]
							?.required
							? '强制'
							: '非强制'
					})`,
					hostAnti: `${
						(data.nodeAffinity &&
							data.nodeAffinity.length > 0 &&
							data.nodeAffinity
								.filter((item) => item.anti)
								.map((item: any) => item.label)
								.join(';')) ||
						'无'
					}(${
						data.nodeAffinity &&
						data.nodeAffinity.length > 0 &&
						data.nodeAffinity.filter((item) => item.anti)[0]
							?.required
							? '强制'
							: '非强制'
					})`,
					chartVersion: data.chartVersion,
					annotations: data.annotations || '-',
					tolerations: `${
						(data.tolerations && data.tolerations.join(',')) || '/'
					}`,
					description: data.description || '无',
					mirror: data.mirrorImage || '/'
				});
			}
			setConfigData({
				title: '配置信息',
				version: data.version || '无',
				characterSet: data.charSet || '',
				port: data.port || '',
				password: data.password || '',
				kafkaDTO: data.kafkaDTO,
				autoCreateTopicEnable: data.rocketMQParam.autoCreateTopicEnable
			});
			const storageClassName =
				data.type === 'elasticsearch'
					? data.quota?.master.storageClassAliasName || ''
					: data.quota?.[data.type].storageClassAliasName;
			const storageType =
				data.type === 'elasticsearch'
					? data.quota?.master.storageClassName || ''
					: data.quota?.[data.type].storageClassName;
			setRunData({
				title: '运行状态',
				status: data.status || 'Failed',
				createTime: data.createTime || '',
				model: modeText(data),
				namespace: data.namespace || '',
				namespaceAliasName: data.namespaceAliasName,
				storageClassName: storageClassName,
				storageType: storageType,
				hostNetwork: data.hostNetwork,
				group: data.rocketMQParam?.group,
				replicas: data.rocketMQParam?.replicas
			});
			setAclData({
				title: '访问权限控制认证',
				globalIps:
					data?.rocketMQParam?.acl?.globalWhiteRemoteAddresses || ''
			});
			setACLCheck(data?.rocketMQParam?.acl?.enable);
		}
	}, [data]);
	useEffect(() => {
		if (clusterId && namespace) {
			getEventsData();
		}
	}, [namespace]);

	useEffect(() => {
		// * 动态表单 设置其他
		if (data !== undefined && data.dynamicValues) {
			const listConfig = [...dynamicConfig];
			const listData = { ...dynamicData };
			for (const index in data.dynamicValues) {
				listConfig.push({
					dataIndex: index,
					label: index
				});
				listData[index] = data.dynamicValues[index];
			}
			setDynamicConfig(listConfig);
			setDynamicData(listData);
		}
	}, []);

	useEffect(() => {
		let listConfigTemp = [...configConfig];
		const dataIndexList = listConfigTemp.map((item) => item.dataIndex);
		if (type === 'mysql') {
			if (!dataIndexList.includes('characterSet')) {
				listConfigTemp.push({
					dataIndex: 'characterSet',
					label: '字符集'
				});
			}
			if (!dataIndexList.includes('port')) {
				listConfigTemp.push({
					dataIndex: 'port',
					label: '端口号'
				});
			}
		}
		if (customMid) {
			if (dataIndexList.includes('password')) {
				listConfigTemp = listConfigTemp.filter(
					(item) => item.dataIndex !== 'password'
				);
			}
		}
		if (type === 'rocketmq') {
			if (!dataIndexList.includes('autoCreateTopicEnable')) {
				listConfigTemp.push({
					dataIndex: 'autoCreateTopicEnable',
					label: '自动创建Topic',
					render: (value) => <span>{value ? '是' : '否'}</span>
				});
			}
		}
		setConfigConfig(listConfigTemp);
	}, [props]);
	useEffect(() => {
		let listRunConfigTemp = [...runConfig];
		const dataIndexList = listRunConfigTemp.map((item) => item.dataIndex);
		if (dataIndexList.includes('storageType')) {
			if (type === 'elasticsearch') {
				listRunConfigTemp = listRunConfigTemp.filter(
					(item) => item.dataIndex !== 'storageType'
				);
			}
		}
		if (customMid) {
			if (
				dataIndexList.includes('model') &&
				dataIndexList.includes('storageType')
			) {
				listRunConfigTemp = listRunConfigTemp.filter(
					(item) =>
						item.dataIndex !== 'model' &&
						item.dataIndex !== 'storageType'
				);
			}
		}
		setRunConfig(listRunConfigTemp);
	}, [props]);
	useEffect(() => {
		const infoConfigTemp = [...infoConfig];
		const dataIndexList = infoConfigTemp.map((item) => item.dataIndex);
		// if (type === 'zookeeper') {
		// 	if (dataIndexList.includes('tolerations')) {
		// 		infoConfigTemp = infoConfigTemp.filter(
		// 			(item) => item.dataIndex !== 'tolerations'
		// 		);
		// 	}
		// }
		if (
			data?.mysqlDTO?.openDisasterRecoveryMode &&
			data?.mysqlDTO?.isSource &&
			!dataIndexList.includes('disasterInstanceName')
		) {
			const list = infoConfigTemp.splice(5, 0, disasterInstanceConfig);
			setInfoConfig(list);
		} else if (
			data?.mysqlDTO?.openDisasterRecoveryMode &&
			!data?.mysqlDTO?.isSource &&
			!dataIndexList.includes('disasterInstanceName')
		) {
			const list = infoConfigTemp.splice(5, 0, originInstanceConfig);
			setInfoConfig(list);
		}
		if (!dataIndexList.includes('description') && !data.dynamicValues) {
			const mirror = {
				dataIndex: 'mirror',
				label: '镜像仓库',
				render: (val: string) => (
					<div className="text-overflow-one" title={val}>
						{val}
					</div>
				)
			};
			infoConfigTemp.push(mirror);
		}
		if (!dataIndexList.includes('description')) {
			const descriptionTemp = {
				dataIndex: 'description',
				label: '备注',
				render: (val: string) => {
					return (
						<div className="display-flex flex-align">
							<div className="text-overflow-one" title={val}>
								{val}
							</div>
							{operateFlag ? (
								<Popconfirm
									title={
										<Form form={form}>
											<FormItem name="description">
												<Input
													placeholder="请输入"
													defaultValue={val}
												/>
											</FormItem>
										</Form>
									}
									icon={null}
									onConfirm={() =>
										editDescription(form.getFieldsValue())
									}
								>
									<EditOutlined
										style={{
											marginLeft: 8,
											cursor: 'pointer',
											fontSize: 14,
											verticalAlign: 'middle'
										}}
									/>
								</Popconfirm>
							) : null}
						</div>
					);
				}
			};
			infoConfigTemp.push(descriptionTemp);
		}
		if (!dataIndexList.includes('description')) {
			const version = {
				dataIndex: 'chartVersion',
				label: '版本管理',
				render: (val: string) => (
					<div title={val}>
						{val}
						{operateFlag && (
							<span
								className="name-link"
								style={{ marginLeft: '8px' }}
								onClick={() =>
									history.push(
										`/serviceList/${params.name}/${params.aliasName}/serverVersion/${params.middlewareName}/${params.type}/${params.namespace}`
									)
								}
							>
								(版本管理)
							</span>
						)}
					</div>
				)
			};
			infoConfigTemp.splice(4, 0, version);
		}
		setInfoConfig(infoConfigTemp);
	}, [props]);

	const getEventsData = async () => {
		const sendData = {
			clusterId,
			namespace,
			middlewareName,
			type,
			kind: 'All'
		};
		if (kind) sendData.kind = kind === 'All' ? '' : kind;
		const res = await getMiddlewareEvents(sendData);
		if (res.success) {
			setEventList(res.data);
		}
	};

	const eventsConfig = [
		{
			dataIndex: 'title',
			render: (val: string) => (
				<div className="title-content">
					<div className="blue-line"></div>
					<div
						className="detail-title"
						style={{ marginRight: 'auto' }}
					>
						{val}
					</div>
					<div>
						<Select
							size="small"
							style={{ marginRight: 16 }}
							value={eventType}
							onChange={(val) => setEventType(val)}
							disabled={!eventList.length}
							dropdownMatchSelectWidth={false}
						>
							<Option value={'All'}>全部状态</Option>
							<Option value={'Normal'}>正常</Option>
							<Option value={'Abnormal'}>异常</Option>
						</Select>
						<Select
							size="small"
							value={kind}
							onChange={(val) => setKind(val)}
							disabled={!eventList.length}
							dropdownMatchSelectWidth={false}
						>
							<Option value={'All'}>全部类型</Option>
							<Option value={'Pod'}>Pod</Option>
							<Option value={'StatefulSet'}>StatefulSet</Option>
						</Select>
					</div>
				</div>
			),
			span: 24
		},
		{
			dataIndex: 'table',
			render: () => (
				<EventsList
					type={type}
					middlewareName={middlewareName}
					eventType={eventType}
					kind={kind}
					namespace={namespace}
				></EventsList>
			),
			span: 24
		}
	];
	const configConfigTemp =
		type === 'redis' ||
		type === 'elasticsearch' ||
		type === 'kafka' ||
		type === 'postgresql'
			? type === 'kafka'
				? [
						...configConfig,
						operateFlag ? yamlConfig : {},
						zookeeperConfig
				  ]
				: [
						...configConfig,
						{
							dataIndex: 'password',
							label: '密码',
							render: (val: string) => {
								return (
									<div className="password-content">
										<div className="password-display">
											{passwordDisplay ? val : '******'}
										</div>
										<div
											className="name-link password-reset"
											onClick={() => {
												setPasswordDisplay(
													!passwordDisplay
												);
											}}
										>
											{passwordDisplay ? '隐藏' : '查看'}
										</div>
									</div>
								);
							}
						},
						operateFlag ? yamlConfig : {}
				  ]
			: [...configConfig, operateFlag ? yamlConfig : {}];
	const onCancel = (value: boolean) => {
		setVisible(false);
		if (value) {
			setTimeout(() => {
				onRefresh();
			}, 3000);
		}
	};
	return (
		<div className="basic-info">
			{customMid &&
			!(data.capabilities || ['basic']).includes('basic') ? (
				<DefaultPicture />
			) : (
				<>
					<DataFields dataSource={basicData} items={infoConfig} />
					<div className="detail-divider" />
					<DataFields
						dataSource={configData}
						items={configConfigTemp}
					/>
					<div className="detail-divider" />
					<DataFields dataSource={runData} items={runConfig} />
					<div className="detail-divider" />
					{type === 'rocketmq' && (
						<>
							<div className="rocketmq-acl-field-content">
								<div className="rocketmq-acl-field-title">
									<div className="rocketmq-acl-left">
										<div className="rocketmq-acl-blue-line"></div>
										<span>
											访问权限控制认证(
											{data?.rocketMQParam?.acl?.enable
												? '已开启'
												: '已关闭'}
											)
										</span>
										{aclCheck && (
											<span
												className="name-link ml-12"
												onClick={() => setVisible(true)}
												style={{ lineHeight: '20px' }}
											>
												<EditOutlined
													style={{
														marginRight: 8,
														verticalAlign: 'middle'
													}}
												/>
												编辑
											</span>
										)}
									</div>
									<div className="rocketmq-acl-right">
										<span className="acl-title-flag">
											{aclCheck ? '已开启' : '已关闭'}
											<Switch
												style={{
													marginLeft: 16,
													verticalAlign: 'middle'
												}}
												size="small"
												checked={aclCheck}
												onChange={aclSwitchChange}
											/>
										</span>
									</div>
								</div>
								{aclCheck && (
									<div>
										<Row>
											<Col span={8}>全局IP白名单</Col>
											<Col
												title={aclData.globalIps}
												className="text-hidden"
											>
												{aclData.globalIps}
											</Col>
										</Row>
									</div>
								)}
							</div>
							{aclCheck &&
								data?.rocketMQParam?.acl?.rocketMQAccountList.map(
									(item: rocketMQAccount) => {
										return (
											<RocketAclUserInfo
												key={item.accessKey}
												data={item}
											/>
										);
									}
								)}
							{!aclCheck && (
								<div className="rocketmq-no-acl">
									<InfoCircleOutlined
										style={{ marginRight: 8 }}
									/>
									访问权限控制认证已关闭
								</div>
							)}
							<div className="detail-divider" />
						</>
					)}
					{customMid && (
						<>
							<DataFields
								dataSource={dynamicData}
								items={dynamicConfig}
							/>
							<div className="detail-divider" />
						</>
					)}
					<DataFields dataSource={events} items={eventsConfig} />
				</>
			)}
			{visible && (
				<RocketAclEditForm
					visible={visible}
					onCancel={onCancel}
					data={data?.rocketMQParam?.acl}
					clusterId={clusterId}
					namespace={namespace}
					middlewareName={middlewareName}
					chartVersion={params.chartVersion}
					chartName={type}
				/>
			)}
		</div>
	);
}
export default BasicInfo;
