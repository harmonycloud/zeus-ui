import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import Page from '@alicloud/console-components-page';
import FormBlock from '../components/FormBlock/index';
import SelectBlock from '../components/SelectBlock/index';
import TableRadio from '../components/TableRadio/index';
import CalInput from '../components/CalInput/index';
import {
	Form,
	Field,
	Input,
	Switch,
	Checkbox,
	Balloon,
	Icon,
	Select,
	Button,
	Message
	// Tag
} from '@alicloud/console-components';
import pattern from '@/utils/pattern';
import styles from './redis.module.scss';
import {
	getNodePort,
	getStorageClass,
	postMiddleware,
	getMiddlewareDetail
} from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import { getCustomFormKeys } from '../Mysql/create';
import { renderFormItem } from '@/components/renderFormItem';
import { getAspectFrom } from '@/services/common';

// const { Group: TagGroup, Closable: ClosableTag } = Tag;

const { Item: FormItem } = Form;
const formItemLayout = {
	labelCol: {
		fixedSpan: 6
	},
	wrapperCol: {
		span: 14
	}
};

const RedisCreate = (props) => {
	const { cluster: globalCluster, namespace: globalNamespace } =
		props.globalVar;
	const { chartName, chartVersion, middlewareName, backupFileName } =
		useParams();
	const field = Field.useField();
	const history = useHistory();

	// 主机亲和
	const [affinity, setAffinity] = useState({
		flag: false,
		label: '',
		checked: false
	});
	const [labelList, setLabelList] = useState([]);
	const changeAffinity = (value, key) => {
		setAffinity({
			...affinity,
			[key]: value
		});
	};

	// 日志
	const [fileLog, setFileLog] = useState(false);
	// const [directory, setDirectory] = useState('');
	// const [directoryList, setDirectoryList] = useState([]);
	const [standardLog, setStandardLog] = useState(false);
	// const addDirectory = (e) => {
	// 	e && e.preventDefault();
	// 	let temp = [].concat(directoryList);
	// 	temp.push(directory);
	// 	setDirectoryList(temp);
	// 	setDirectory('');
	// };
	// const delDirectory = (index) => {
	// 	let temp = [].concat(directoryList);
	// 	temp.splice(index, 1);
	// 	setDirectoryList(temp);
	// };

	// MySQL配置
	const [version, setVersion] = useState('5.0.8');
	const versionList = [
		{
			label: '5.0.8',
			value: '5.0.8'
		}
	];
	const [mode, setMode] = useState('cluster');
	const modeList = [
		{
			label: '资源池模式',
			value: 'cluster'
		},
		{
			label: '哨兵模式',
			value: 'sentinel'
		}
	];
	const [clusterMode, setClusterMode] = useState('3s-3m');
	const clusterModeList = [
		{
			label: '三主三从',
			value: '3s-3m'
		},
		{
			label: '五主五从',
			value: '5s-5m'
		}
	];
	const [nodeObj, setNodeObj] = useState({
		redis: {
			disabled: false,
			title: 'Redis 节点',
			num: 3,
			specId: '1',
			cpu: 1,
			memory: 2,
			storageClass: '',
			storageQuota: 0
		},
		sentinel: {
			disabled: false,
			title: '哨兵节点',
			num: 3,
			specId: '1',
			cpu: 1,
			memory: 2
		}
	});
	const [nodeModify, setNodeModify] = useState({
		nodeName: '',
		flag: false
	});
	const [nodeNum, setNodeNum] = useState(2);
	const [instanceSpec, setInstanceSpec] = useState('General');
	const instanceSpecList = [
		{
			label: '通用规格',
			value: 'General'
		},
		{
			label: '自定义',
			value: 'Customize'
		}
	];
	const [specId, setSpecId] = useState('1');
	const [storageClassList, setStorageClassList] = useState([]);
	const [maxCpu, setMaxCpu] = useState({}); // 自定义cpu的最大值
	const [maxMemory, setMaxMemory] = useState({}); // 自定义memory的最大值
	// * 外接的动态表单
	const [customForm, setCustomForm] = useState();

	useEffect(() => {
		if (globalNamespace.quotas) {
			const cpuMax =
				Number(globalNamespace.quotas.cpu[1]) -
				Number(globalNamespace.quotas.cpu[2]);
			setMaxCpu({
				max: cpuMax
			});
			const memoryMax =
				Number(globalNamespace.quotas.memory[1]) -
				Number(globalNamespace.quotas.memory[2]);
			setMaxMemory({
				max: memoryMax
			});
		}
	}, [props]);

	const formHandle = (obj, item) => {
		if (
			['cpu', 'memory', 'storageClass', 'storageQuota'].indexOf(
				item.name
			) > -1 &&
			mode === 'sentinel'
		) {
			let temp = nodeObj[nodeModify.nodeName];
			temp[item.name] = item.value;
			setNodeObj({
				...nodeObj,
				[nodeModify.nodeName]: temp
			});
		}
	};

	const putAway = (key) => {
		if (instanceSpec === 'Customize') {
			setSpecId('');
			let temp = nodeObj[key];
			temp.specId = '';
			setNodeObj({
				...nodeObj,
				[key]: temp
			});
		}
		setNodeModify({
			nodeName: '',
			flag: false
		});
	};

	const modifyQuota = (key) => {
		setNodeModify({
			nodeName: key,
			flag: true
		});
		setNodeNum(nodeObj[key].num);
		setSpecId(nodeObj[key].specId);
		if (nodeObj[key].specId === '') {
			setInstanceSpec('Customize');
			field.setValues({
				cpu: nodeObj[key].cpu,
				memory: nodeObj[key].memory
			});
		} else {
			setInstanceSpec('General');
		}
		field.setValues({
			storageClass: nodeObj[key].storageClass,
			storageQuota: nodeObj[key].storageQuota
		});
	};

	const checkGeneral = (value) => {
		setSpecId(value);
		let temp = nodeObj[nodeModify.nodeName];
		switch (value) {
			case '1':
				temp.cpu = 1;
				temp.memory = 2;
				break;
			case '2':
				temp.cpu = 2;
				temp.memory = 8;
				break;
			case '3':
				temp.cpu = 4;
				temp.memory = 16;
				break;
			case '4':
				temp.cpu = 8;
				temp.memory = 32;
				break;
			case '5':
				temp.cpu = 16;
				temp.memory = 64;
				break;
			default:
				break;
		}
		setNodeObj({
			...nodeObj,
			[nodeModify.nodeName]: temp
		});
	};

	const handleSubmit = () => {
		field.validate((err, values) => {
			if (values.name === 'redis') return;
			if (!err) {
				let sendData = {
					chartName: chartName,
					chartVersion: chartVersion,
					clusterId: globalCluster.id,
					namespace: globalNamespace.name,
					type: 'redis',
					name: values.name,
					aliasName: values.aliasName,
					labels: values.labels,
					annotations: values.annotations,
					description: values.description,
					version: version,
					password: values.pwd,
					mode: mode,
					filelogEnabled: fileLog,
					stdoutEnabled: standardLog,
					quota: {}
				};
				// * 动态表单相关
				if (customForm) {
					const dynamicValues = {};
					let keys = [];
					for (let i in customForm) {
						const list = getCustomFormKeys(customForm[i]);
						keys = [...list, ...keys];
					}
					keys.forEach((item) => {
						dynamicValues[item] = values[item];
					});
					sendData.dynamicValues = dynamicValues;
				}
				if (affinity.flag) {
					if (affinity.label === '') {
						Message.show(
							messageConfig('error', '错误', '请选择主机亲和。')
						);
						return;
					} else {
						sendData.nodeAffinity = [
							{
								label: affinity.label,
								required: affinity.checked,
								namespace: globalNamespace.name
							}
						];
					}
				}
				if (mode === 'cluster') {
					sendData.quota = {
						redis: {
							num: clusterMode === '3s-3m' ? 6 : 10,
							storageClassName: values.storageClass,
							storageClassQuota: values.storageQuota
						}
					};
					if (instanceSpec === 'General') {
						switch (specId) {
							case '1':
								sendData.quota.redis.cpu = 1;
								sendData.quota.redis.memory = '2Gi';
								break;
							case '2':
								sendData.quota.redis.cpu = 2;
								sendData.quota.redis.memory = '8Gi';
								break;
							case '3':
								sendData.quota.redis.cpu = 4;
								sendData.quota.redis.memory = '16Gi';
								break;
							case '4':
								sendData.quota.redis.cpu = 8;
								sendData.quota.redis.memory = '32Gi';
								break;
							case '5':
								sendData.quota.redis.cpu = 16;
								sendData.quota.redis.memory = '64Gi';
								break;
							default:
								break;
						}
					} else if (instanceSpec === 'Customize') {
						sendData.quota.redis.cpu = values.cpu;
						sendData.quota.redis.memory = values.memory + 'Gi';
					}
				} else {
					if (nodeObj) {
						sendData.quota = {};
						for (let key in nodeObj) {
							if (!nodeObj[key].disabled) {
								if (nodeObj[key].storageClass === '') {
									Message.show(
										messageConfig(
											'error',
											'失败',
											`${key}节点没有选择存储类型`
										)
									);
									modifyQuota(key);
									return;
								}
								if (nodeObj[key].storageQuota === 0) {
									Message.show(
										messageConfig(
											'error',
											'失败',
											`${key}节点存储配额不能为0`
										)
									);
									modifyQuota(key);
									return;
								}
								sendData.quota[key] = {
									...nodeObj[key],
									storageClassName: nodeObj[key].storageClass,
									storageClassQuota: nodeObj[key].storageQuota
								};
							}
						}
					}
				}
				console.log(sendData);
				postMiddleware(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', {
								message: '中间件Redis正在创建中'
							})
						);
						history.push({
							pathname: '/serviceList',
							query: { key: 'Redis', timer: true }
						});
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		});
	};

	// 全局资源池更新
	useEffect(() => {
		if (JSON.stringify(globalCluster) !== '{}') {
			getNodePort({ clusterId: globalCluster.id }).then((res) => {
				if (res.success) {
					setLabelList(res.data);
				}
			});
		}
		getAspectFrom().then((res) => {
			if (res.success) {
				setCustomForm(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	}, [globalCluster]);

	// 全局分区更新
	useEffect(() => {
		getStorageClass({
			clusterId: globalCluster.id,
			namespace: globalNamespace.name
		}).then((res) => {
			if (res.success) {
				// for (let i = 0; i < res.data.length; i++) {
				// 	if (res.data[i].type === 'CSI-LVM') {
				// 		const { redis, sentinel } = nodeObj;
				// 		redis.storageClass = res.data[i].name;
				// 		redis.storageQuota = 5;
				// 		setNodeObj({ redis, sentinel });
				// 		field.setValues({
				// 			storageClass: res.data[i].name
				// 		});
				// 		break;
				// 	}
				// }
				setStorageClassList(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
		if (JSON.stringify(globalNamespace) !== '{}') {
			// 克隆服务
			if (backupFileName) {
				getMiddlewareDetail({
					clusterId: globalCluster.id,
					namespace: globalNamespace.name,
					middlewareName: middlewareName,
					type: 'redis'
				}).then((res) => {
					console.log(res.data);
				});
			}
		}
	}, [globalNamespace]);
	const childrenRender = (values) => {
		if (values) {
			const keys = Object.keys(values);
			return (
				<div>
					{keys.map((item) => {
						return (
							<FormBlock key={item} title={item}>
								<div className="w-50">
									<ul className="form-layout">
										{values[item].map((formItem) => {
											return (
												<React.Fragment
													key={formItem.variable}
												>
													{renderFormItem(
														formItem,
														field,
														globalCluster,
														globalNamespace
													)}
												</React.Fragment>
											);
										})}
									</ul>
								</div>
							</FormBlock>
						);
					})}
				</div>
			);
		}
	};
	return (
		<Page>
			<Page.Header
				title="发布Redis服务"
				className="page-header"
				hasBackArrow
				onBackArrowClick={() => {
					window.history.back();
				}}
			/>
			<Page.Content>
				<Form {...formItemLayout} field={field} onChange={formHandle}>
					<FormBlock title="基础信息">
						<div className={styles['basic-info']}>
							<ul className="form-layout">
								<li className="display-flex">
									<label className="form-name">
										<span className="ne-required">
											服务名称
										</span>
									</label>
									<div className="form-content">
										<FormItem
											required
											requiredMessage="请输入服务名称"
											pattern={pattern.name}
											patternMessage="请输入由小写字母数字及“-”组成的2-40个字符"
											validateState={
												field.getValue('name') ===
													'redis' && 'error'
											}
										>
											<Input
												name="name"
												placeholder="请输入由小写字母数字及“-”组成的2-40个字符"
												trim
											/>
											{field.getValue('name') ===
												'redis' && (
												<Form.Error>
													<span
														style={{
															color: '#C80000'
														}}
													>
														服务名称不能与类型同名
													</span>
												</Form.Error>
											)}
										</FormItem>
									</div>
								</li>
								<li className="display-flex">
									<label className="form-name">
										<span>显示名称</span>
									</label>
									<div className="form-content">
										<FormItem
											minLength={2}
											maxLength={80}
											minmaxLengthMessage="请输入由汉字、字母、数字及“-”或“.”或“_”组成的2-80个字符"
											pattern={pattern.nickname}
											patternMessage="请输入由汉字、字母、数字及“-”或“.”或“_”组成的2-80个字符"
										>
											<Input
												name="aliasName"
												placeholder="请输入由汉字、字母、数字及“-”或“.”或“_”组成的2-80个字符"
											/>
										</FormItem>
									</div>
								</li>
								<li className="display-flex">
									<label className="form-name">
										<span>标签</span>
									</label>
									<div className="form-content">
										<FormItem
											pattern={pattern.labels}
											patternMessage="请输入key=value格式的标签，多个标签以英文逗号分隔"
										>
											<Input
												name="labels"
												placeholder="请输入key=value格式的标签，多个标签以英文逗号分隔"
											/>
										</FormItem>
									</div>
								</li>
								<li className="display-flex">
									<label className="form-name">
										<span>注解</span>
									</label>
									<div className="form-content">
										<FormItem
											pattern={pattern.labels}
											patternMessage="请输入key=value格式的标签，多个注解以英文逗号分隔"
										>
											<Input
												name="annotations"
												placeholder="请输入key=value格式的标签，多个注解以英文逗号分隔"
											/>
										</FormItem>
									</div>
								</li>
								<li className="display-flex">
									<label className="form-name">
										<span>描述</span>
									</label>
									<div className="form-content">
										<FormItem>
											<Input.TextArea
												name="description"
												placeholder="请输入描述信息"
											/>
										</FormItem>
									</div>
								</li>
							</ul>
						</div>
					</FormBlock>
					<FormBlock title="调度策略">
						<div className={styles['schedule-strategy']}>
							<ul className="form-layout">
								<li className="display-flex form-li">
									<label className="form-name">
										<span style={{ marginRight: 8 }}>
											主机亲和
										</span>
										<Balloon
											trigger={
												<Icon
													type="question-circle"
													size="xs"
												/>
											}
											closable={false}
										>
											勾选强制亲和时，服务只会部署在具备相应标签的主机上，若主机资源不足，可能会导致启动失败
										</Balloon>
									</label>
									<div
										className={`form-content display-flex ${styles['host-affinity']}`}
									>
										<div className={styles['switch']}>
											{affinity.flag ? '已开启' : '关闭'}
											<Switch
												checked={affinity.flag}
												onChange={(value) =>
													changeAffinity(
														value,
														'flag'
													)
												}
												size="small"
												style={{
													marginLeft: 16,
													verticalAlign: 'middle'
												}}
											/>
										</div>
										{affinity.flag ? (
											<>
												<div
													className={styles['input']}
												>
													<Select.AutoComplete
														value={affinity.label}
														onChange={(value) =>
															changeAffinity(
																value,
																'label'
															)
														}
														dataSource={labelList}
														style={{
															width: '100%'
														}}
													/>
												</div>
												<div
													className={styles['check']}
												>
													<Checkbox
														checked={
															affinity.checked
														}
														onChange={(value) =>
															changeAffinity(
																value,
																'checked'
															)
														}
														label="强制亲和"
													/>
												</div>
											</>
										) : null}
									</div>
								</li>
							</ul>
						</div>
					</FormBlock>
					<FormBlock title="日志收集">
						<div className={styles['log-collection']}>
							<ul className="form-layout">
								<li className="display-flex form-li">
									<label className="form-name">
										<span style={{ marginRight: 8 }}>
											文件日志收集
										</span>
										<Balloon
											trigger={
												<Icon
													type="question-circle"
													size="xs"
												/>
											}
											closable={false}
										>
											<span
												style={{ lineHeight: '18px' }}
											>
												开启该功能，平台会将日志目录下的文件日志收集至Elasticsearch中，可以在服务详情下的“日志管理”菜单下查看具体的日志，如果当前资源池未部署/对接Elasticsearch组件，则无法启用该功能
											</span>
										</Balloon>
									</label>
									<div
										className={`form-content display-flex ${styles['file-log']}`}
									>
										<div className={styles['switch']}>
											{fileLog ? '已开启' : '关闭'}
											<Switch
												checked={fileLog}
												onChange={(value) =>
													setFileLog(value)
												}
												size="small"
												style={{
													marginLeft: 16,
													verticalAlign: 'middle'
												}}
											/>
										</div>
										{/* {fileLog ? (
											<>
												<div
													className={styles['input']}
												>
													<TagGroup
														style={{ marginTop: 4 }}
													>
														{directoryList.map(
															(item, index) => (
																<ClosableTag
																	key={index}
																	onClose={() =>
																		delDirectory(
																			index
																		)
																	}
																>
																	{item}
																</ClosableTag>
															)
														)}
													</TagGroup>
													<Input
														innerBefore={
															<Icon
																type="add"
																style={{
																	marginLeft: 8
																}}
															/>
														}
														placeholder="添加日志目录"
														value={directory}
														onChange={(value) =>
															setDirectory(value)
														}
														onKeyPress={(event) => {
															if (
																event.charCode ===
																13
															) {
																addDirectory(
																	event
																);
															}
														}}
														onBlur={(e) => {
															addDirectory(e);
														}}
													/>
												</div>
											</>
										) : null} */}
									</div>
								</li>
							</ul>
						</div>
						<div className={styles['log-collection']}>
							<ul className="form-layout">
								<li className="display-flex form-li">
									<label className="form-name">
										<span style={{ marginRight: 8 }}>
											标准日志收集
										</span>
										<Balloon
											trigger={
												<Icon
													type="question-circle"
													size="xs"
												/>
											}
											closable={false}
										>
											<span
												style={{ lineHeight: '18px' }}
											>
												开启该功能，平台会将标准输出（stdout）的日志收集至Elasticsearch中，可以在服务详情下的“日志管理”菜单下查看具体的日志，如果当前资源池未部署/对接Elasticsearch组件，则无法启用该功能
											</span>
										</Balloon>
									</label>
									<div
										className={`form-content display-flex ${styles['standard-log']}`}
									>
										<div className={styles['switch']}>
											{standardLog ? '已开启' : '关闭'}
											<Switch
												checked={standardLog}
												onChange={(value) =>
													setStandardLog(value)
												}
												size="small"
												style={{
													marginLeft: 16,
													verticalAlign: 'middle'
												}}
											/>
										</div>
									</div>
								</li>
							</ul>
						</div>
					</FormBlock>
					<FormBlock title="Redis配置">
						<div className={styles['mysql-config']}>
							<ul className="form-layout">
								<li className="display-flex form-li">
									<label className="form-name">
										<span>版本</span>
									</label>
									<div
										className={`form-content display-flex`}
									>
										<SelectBlock
											options={versionList}
											currentValue={version}
											onCallBack={(value) =>
												setVersion(value)
											}
										/>
									</div>
								</li>
								<li className="display-flex form-li">
									<label className="form-name">
										<span>初始密码</span>
									</label>
									<div
										className="form-content"
										style={{ flex: '0 0 376px' }}
									>
										<FormItem>
											<Input
												htmlType="password"
												name="pwd"
												placeholder="请输入初始密码，输入空则由平台随机生成"
												trim
											/>
										</FormItem>
									</div>
								</li>
							</ul>
						</div>
					</FormBlock>
					<FormBlock title="规格配置">
						<div className={styles['spec-config']}>
							<ul className="form-layout">
								<li className="display-flex form-li">
									<label className="form-name">
										<span>高可用模式</span>
									</label>
									<div
										className={`form-content display-flex ${styles['redis-mode']}`}
									>
										<Select
											value={mode}
											onChange={(value) => setMode(value)}
											style={{ width: 150 }}
										>
											{modeList.map((item, index) => (
												<Select.Option
													key={index}
													value={item.value}
												>
													{item.label}
												</Select.Option>
											))}
										</Select>
										{mode === 'cluster' ? (
											<div style={{ marginLeft: 16 }}>
												<SelectBlock
													options={clusterModeList}
													currentValue={clusterMode}
													onCallBack={(value) =>
														setClusterMode(value)
													}
												/>
											</div>
										) : null}
									</div>
								</li>
								<li className="display-flex form-li">
									<label className="form-name">
										<span></span>
									</label>
									<div>
										{mode === 'sentinel' ? (
											<div
												className={`display-flex ${styles['mode-content']}`}
											>
												{Object.keys(nodeObj).map(
													(key) => {
														if (
															nodeObj[key]
																.disabled
														)
															return (
																<div
																	className={`${styles['node-box']} ${styles['disabled']}`}
																	key={key}
																>
																	<div
																		className={
																			styles[
																				'node-type'
																			]
																		}
																	>
																		{
																			nodeObj[
																				key
																			]
																				.title
																		}
																	</div>
																	<div
																		className={
																			styles[
																				'node-data'
																			]
																		}
																	>
																		<span
																			className={
																				styles[
																					'not-start'
																				]
																			}
																		>
																			未启用
																		</span>
																	</div>
																</div>
															);
														else
															return (
																<div
																	className={
																		styles[
																			'node-box'
																		]
																	}
																	key={key}
																>
																	<div
																		className={
																			styles[
																				'node-type'
																			]
																		}
																	>
																		{
																			nodeObj[
																				key
																			]
																				.title
																		}{' '}
																		<span
																			className={
																				styles[
																					'circle'
																				]
																			}
																		>
																			{
																				nodeObj[
																					key
																				]
																					.num
																			}
																		</span>
																	</div>
																	<div
																		className={
																			styles[
																				'node-data'
																			]
																		}
																	>
																		<ul>
																			<li>
																				<span>
																					CPU：
																				</span>
																				<span>
																					{
																						nodeObj[
																							key
																						]
																							.cpu
																					}{' '}
																					Core
																				</span>
																			</li>
																			<li>
																				<span>
																					内存：
																				</span>
																				<span>
																					{
																						nodeObj[
																							key
																						]
																							.memory
																					}{' '}
																					Gi
																				</span>
																			</li>
																			{nodeObj[
																				key
																			]
																				.storageClass &&
																				nodeObj[
																					key
																				]
																					.storageClass !==
																					'' && (
																					<li>
																						<span>
																							{
																								nodeObj[
																									key
																								]
																									.storageClass
																							}

																							：
																						</span>
																						<span>
																							{
																								nodeObj[
																									key
																								]
																									.storageQuota
																							}{' '}
																							GB
																						</span>
																					</li>
																				)}
																		</ul>
																		<div
																			className={
																				styles[
																					'btn'
																				]
																			}
																		>
																			{key ===
																			nodeModify.nodeName ? (
																				<Button
																					type="primary"
																					onClick={() =>
																						putAway(
																							key
																						)
																					}
																				>
																					收起
																					<Icon type="arrow-up" />
																				</Button>
																			) : (
																				<Button
																					type="primary"
																					disabled={
																						nodeModify.nodeName !==
																							'' &&
																						key !==
																							nodeModify.nodeName
																					}
																					onClick={() =>
																						modifyQuota(
																							key
																						)
																					}
																				>
																					修改
																				</Button>
																			)}
																		</div>
																	</div>
																</div>
															);
													}
												)}
											</div>
										) : null}
									</div>
								</li>
								{nodeModify.flag && (
									<li className="display-flex form-li">
										<label className="form-name">
											<span>节点数量</span>
										</label>
										<div
											className={`form-content display-flex ${styles['input-flex-length']}`}
										>
											<CalInput
												value={nodeNum}
												onChange={(value) => {
													setNodeNum(value);
													let tempObj =
														nodeObj[
															nodeModify.nodeName
														];
													tempObj.num = value;
													setNodeObj({
														...nodeObj,
														[nodeModify.nodeName]:
															tempObj
													});
												}}
											/>
										</div>
									</li>
								)}
								{(mode === 'cluster' || nodeModify.flag) && (
									<>
										<li className="display-flex form-li">
											<label className="form-name">
												<span>节点规格</span>
											</label>
											<div
												className={`form-content display-flex ${styles['instance-spec-content']}`}
											>
												<SelectBlock
													options={instanceSpecList}
													currentValue={instanceSpec}
													onCallBack={(value) =>
														setInstanceSpec(value)
													}
												/>
												{instanceSpec === 'General' ? (
													<div
														style={{
															width: 652,
															marginTop: 16
														}}
													>
														<TableRadio
															id={specId}
															onCallBack={(
																value
															) =>
																checkGeneral(
																	value
																)
															}
														/>
													</div>
												) : null}
												{instanceSpec ===
												'Customize' ? (
													<div
														className={
															styles[
																'spec-custom'
															]
														}
													>
														<ul className="form-layout">
															<li className="display-flex">
																<label className="form-name">
																	<span className="ne-required">
																		CPU
																	</span>
																</label>
																<div className="form-content">
																	<FormItem
																		min={
																			0.1
																		}
																		minmaxMessage={`最小为0.1,不能超过当前分区配额剩余的最大值（${maxCpu.max}Core）`}
																		required
																		requiredMessage="请输入自定义CPU配额，单位为Core"
																		{...maxCpu}
																	>
																		<Input
																			name="cpu"
																			htmlType="number"
																			min={
																				0.1
																			}
																			step={
																				0.1
																			}
																			placeholder="请输入自定义CPU配额，单位为Core"
																			trim
																		/>
																	</FormItem>
																</div>
															</li>
															<li className="display-flex">
																<label className="form-name">
																	<span className="ne-required">
																		内存
																	</span>
																</label>
																<div className="form-content">
																	<FormItem
																		min={
																			0.1
																		}
																		minmaxMessage={`最小为0.1,不能超过当前分区配额剩余的最大值（${maxMemory.max}Gi`}
																		required
																		requiredMessage="请输入自定义内存配额，单位为Gi"
																		{...maxMemory}
																	>
																		<Input
																			name="memory"
																			htmlType="number"
																			min={
																				0.1
																			}
																			step={
																				0.1
																			}
																			placeholder="请输入自定义内存配额，单位为Gi"
																			trim
																		/>
																	</FormItem>
																</div>
															</li>
														</ul>
													</div>
												) : null}
											</div>
										</li>
										{nodeModify.nodeName !== 'sentinel' && (
											<li className="display-flex">
												<label className="form-name">
													<span className="ne-required">
														存储配额
													</span>
												</label>
												<div
													className={`form-content display-flex`}
												>
													<FormItem
														required
														requiredMessage="请选择存储类型"
													>
														<Select
															name="storageClass"
															style={{
																marginRight: 8
															}}
															autoWidth={false}
														>
															{storageClassList.map(
																(
																	item,
																	index
																) => {
																	return (
																		<Select.Option
																			key={
																				index
																			}
																			value={
																				item.name
																			}
																		>
																			{
																				item.name
																			}
																		</Select.Option>
																	);
																}
															)}
														</Select>
													</FormItem>
													<FormItem
														pattern={pattern.posInt}
														patternMessage="请输入小于21位的正整数"
														required
														requiredMessage="请输入存储配额大小（GB）"
													>
														<Input
															name="storageQuota"
															htmlType="number"
															defaultValue={5}
															min={1}
															placeholder="请输入存储配额大小"
															addonTextAfter="GB"
														/>
													</FormItem>
												</div>
											</li>
										)}
									</>
								)}
							</ul>
						</div>
					</FormBlock>
					{childrenRender(customForm)}
					<div className={styles['summit-box']}>
						<Form.Submit
							type="primary"
							validate
							style={{ marginRight: 8 }}
							onClick={handleSubmit}
						>
							提交
						</Form.Submit>
						<Button
							type="normal"
							onClick={() => window.history.back()}
						>
							取消
						</Button>
					</div>
				</Form>
			</Page.Content>
		</Page>
	);
};

export default connect(({ globalVar }) => ({ globalVar }), {})(RedisCreate);
