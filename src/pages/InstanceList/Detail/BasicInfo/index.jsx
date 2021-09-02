import React, { useState, useEffect } from 'react';
import {
	Select,
	Icon,
	Switch,
	Dialog,
	Grid,
	Message
} from '@alicloud/console-components';
import { useParams } from 'react-router-dom';
import DataFields from '@alicloud/console-components-data-fields';
// import BalloonForm from '@/components/BalloonForm';
// const FormItem = Form.Item;
import DefaultPicture from '@/components/DefaultPicture';
import { statusRender } from '@/utils/utils';
import transTime from '@/utils/transTime';
import EventsList from './eventsList';
import RocketAclUserInfo from './rocketAclUserInfo';
import RocketAclEditForm from './rocketAclEditForm';
import './basicinfo.scss';
import { updateMiddleware } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import { render } from '@testing-library/react';

const { Option } = Select;
const { Row, Col } = Grid;
const info = {
	title: '规格配置',
	name: '',
	aliasName: '',
	label: '',
	hostAffinity: '',
	description: ''
};

const InfoConfig = [
	{
		dataIndex: 'title',
		render: (val) => (
			<div className="title-content">
				<div className="blue-line"></div>
				<div className="detail-title">{val}</div>
			</div>
		),
		span: 24
	},
	{
		dataIndex: 'name',
		label: '实例名称'
	},
	{
		dataIndex: 'aliasName',
		label: '显示名称'
	},
	{
		dataIndex: 'label',
		label: '标签'
	},
	{
		dataIndex: 'hostAffinity',
		label: '主机亲和'
	},
	{
		dataIndex: 'description',
		label: '描述'
	}
];

const config = {
	title: '配置信息',
	version: '',
	characterSet: '',
	port: 0,
	password: ''
};

const runStatus = {
	title: '运行状态',
	status: '',
	createTime: '',
	model: '',
	namespace: '',
	storageType: ''
};

const events = {
	title: '实时事件',
	table: ''
};

// const formItemLayout = {
// 	labelCol: { fixedSpan: 0 },
// 	wrapperCol: { span: 24 }
// };
const modelMap = {
	MasterSlave: '主从模式',
	'1m-1s': '主从模式',
	simple: 'N主',
	complex: 'N主N数据N协调',
	regular: 'N主N数据',
	sentinel: '哨兵',
	'2m-noslave': '两主',
	'2m-2s': '两主两从',
	'3m-3s': '三主三从',
	null: ''
};
const titleConfig = {
	dataIndex: 'title',
	render: (val) => (
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
	render: (val) => statusRender(val)
};
const createTimeConfig = {
	dataIndex: 'createTime',
	label: '创建时间',
	render: (val) => transTime.gmt2local(val)
};
const modelConfig = {
	dataIndex: 'model',
	label: '模式'
};
const namespaceConfig = {
	dataIndex: 'namespace',
	label: '所在分区'
};
const storageTypeConfig = {
	dataIndex: 'storageType',
	label: '存储类型'
};
function BasicInfo(props) {
	const {
		type,
		data,
		middlewareName,
		customMid,
		clusterId,
		namespace,
		onRefresh,
		toDetail
	} = props;
	// * 密码显影
	const [passwordDisplay, setPasswordDisplay] = useState(false);
	// * 事件
	const [eventType, setEventType] = useState('All');
	const [kind, setKind] = useState('All');
	// * 规格配置
	const [basicData, setBasicData] = useState(info);
	const [infoConfig, setInfoConfig] = useState(InfoConfig);
	// * 运行状态
	const [runData, setRunData] = useState(runStatus);
	const [runConfig, setRunConfig] = useState([
		titleConfig,
		healthConfig,
		createTimeConfig,
		modelConfig,
		namespaceConfig,
		storageTypeConfig
	]);
	// * 配置信息
	const [configData, setConfigData] = useState(config);
	const [configConfig, setConfigConfig] = useState([
		titleConfig,
		versionConfig
	]);
	// * 动态表单相关
	const [dynamicData, setDynamicData] = useState({
		title: '其他'
	});
	const [dynamicConfig, setDynamicConfig] = useState([titleConfig]);
	// * mq acl 认证相关
	const [aclCheck, setACLCheck] = useState(false);
	// const editTitleConfig = {
	// 	dataIndex: 'title',
	// 	render: (val) => (
	// 		<div className="title-content">
	// 			<div className="blue-line"></div>
	// 			<div className="detail-title">{val}</div>
	// 			<span
	// 				className="name-link ml-12"
	// 				onClick={() => setVisible(true)}
	// 			>
	// 				<Icon
	// 					type="edit"
	// 					style={{ marginRight: 8, verticalAlign: 'middle' }}
	// 				/>
	// 				编辑
	// 			</span>
	// 			{/* <div>
	// 				<span className="acl-title-flag">
	// 					{aclCheck ? '已开启' : '已关闭'}
	// 					<Switch
	// 						style={{
	// 							marginLeft: 16,
	// 							verticalAlign: 'middle'
	// 						}}
	// 						size="small"
	// 						checked={aclCheck}
	// 						onChange={aclSwitchChange}
	// 					/>
	// 				</span>
	// 			</div> */}
	// 		</div>
	// 	),
	// 	span: 24
	// };
	// const [aclConfig] = useState([editTitleConfig, globalIpsConfig]);
	const [aclData, setAclData] = useState({
		title: '访问权限控制认证',
		globalIps: ''
	});
	const [visible, setVisible] = useState(false); // * 修改acl
	const { chartVersion } = useParams();
	const disasterInstanceConfig = {
		dataIndex: 'disasterInstanceName',
		label: '备份实例名称',
		render: (val) => {
			return (
				<span
					className="name-link"
					onClick={() => {
						if (clusterId !== data.mysqlDTO.relationClusterId) {
							Dialog.show({
								title: '提醒',
								content:
									'该备用实例不在当前集群命名空间，返回源实例页面请点击右上角“返回源实例”按钮',
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
		label: '源实例名称',
		render: (val) => {
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
	const aclSwitchChange = (checked) => {
		Dialog.show({
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
					let res = await updateMiddleware(sendData);
					if (res.success) {
						Message.show(
							messageConfig(
								'success',
								'成功',
								'访问权限控制认证关闭成功,3秒后刷新页面'
							)
						);
						setACLCheck(checked);
						setTimeout(() => {
							onRefresh();
						}, 3000);
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				} else {
					setACLCheck(checked);
				}
			}
		});
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
						(data.nodeAffinity && data.nodeAffinity[0].label) ||
						'无'
					}(${
						data.nodeAffinity && data.nodeAffinity[0].required
							? '强制'
							: '非强制'
					})`,
					disasterInstanceName: data.mysqlDTO.relationName || '',
					description: data.annotation || '无'
				});
			} else {
				setBasicData({
					title: '规格配置',
					name: data.name,
					aliasName: data.aliasName || '无',
					label: data.labels || '',
					hostAffinity: `${
						(data.nodeAffinity && data.nodeAffinity[0].label) ||
						'无'
					}(${
						data.nodeAffinity && data.nodeAffinity[0].required
							? '强制'
							: '非强制'
					})`,
					description: data.annotation || '无'
				});
			}
			setConfigData({
				title: '配置信息',
				version: data.version || '无',
				characterSet: data.charSet || '',
				port: data.port || '',
				password: data.password || ''
			});
			setRunData({
				title: '运行状态',
				status: data.status || 'Failed',
				createTime: data.createTime || '',
				model:
					type !== 'redis'
						? modelMap[data.mode]
						: data.mode === 'sentinel'
						? '哨兵'
						: data.quota.redis.num === 6
						? '三主三从'
						: '五主五从' || '',
				namespace: data.namespace || '',
				storageType:
					data.quota && data.quota[data.type]
						? data.quota[data.type].storageClassName || ''
						: ''
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
		// * 动态表单 设置其他
		if (data !== undefined && data.dynamicValues) {
			const listConfig = [...dynamicConfig];
			const listData = { ...dynamicData };
			for (let index in data.dynamicValues) {
				listConfig.push({
					dataIndex: index,
					label: index
				});
				listData[index] = data.dynamicValues[index];
			}
			setDynamicConfig(listConfig);
			setDynamicData(listData);
		}
	}, [data]);

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
		let infoConfigTemp = [...infoConfig];
		const dataIndexList = infoConfigTemp.map((item) => item.dataIndex);
		if (customMid) {
			if (dataIndexList.includes('hostAffinity')) {
				infoConfigTemp = infoConfigTemp.filter(
					(item) => item.dataIndex !== 'hostAffinity'
				);
			}
		}
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
		setInfoConfig(infoConfigTemp);
	}, [props]);
	// * 修改密码
	// const editPassword = (value) => {
	// 	const sendData = {
	// 		clusterId: clusterId,
	// 		namespace: namespace,
	// 		middlewareName: data.name,
	// 		chartName: data.chartName,
	// 		chartVersion: data.chartVersion,
	// 		type: data.type,
	// 		password: value
	// 	};
	// 	updateMiddleware(sendData).then((res) => {
	// 		if (res.success) {
	// 			Message.show(messageConfig('success', '成功', res));
	// 		} else {
	// 			Message.shoe(messageConfig('success', '失败', res));
	// 		}
	// 	});
	// };

	const eventsConfig = [
		{
			dataIndex: 'title',
			render: (val) => (
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
							style={{ marginRight: 16 }}
							value={eventType}
							onChange={(val) => setEventType(val)}
						>
							<Option value={'All'}>全部状态</Option>
							<Option value={'Normal'}>正常</Option>
							<Option value={'Abnormal'}>异常</Option>
						</Select>
						<Select value={kind} onChange={(val) => setKind(val)}>
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
				></EventsList>
			),
			span: 24
		}
	];
	const configConfigTemp =
		type === 'mysql' || type === 'redis' || type === 'elasticsearch'
			? [
					...configConfig,
					{
						dataIndex: 'password',
						label: '密码',
						render: (val) => {
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
					}
			  ]
			: configConfig;
	const onCancel = (value) => {
		setVisible(false);
		if (value) {
			setTimeout(() => {
				onRefresh();
			}, 3000);
		}
	};
	return (
		<div>
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
												<Icon
													type="edit"
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
											<Col fixedSpan={8}>
												全局IP白名单
											</Col>
											<Col>{aclData.globalIps}</Col>
										</Row>
									</div>
								)}
							</div>
							{aclCheck &&
								data?.rocketMQParam?.acl?.rocketMQAccountList.map(
									(item) => {
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
									<Icon
										type="exclamation-circle"
										size="small"
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
					chartVersion={chartVersion}
					chartName={type}
				/>
			)}
		</div>
	);
}
export default BasicInfo;
