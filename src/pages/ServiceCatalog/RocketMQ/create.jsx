import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import Page from '@alicloud/console-components-page';
import FormBlock from '../components/FormBlock/index';
import SelectBlock from '../components/SelectBlock/index';
import TableRadio from '../components/TableRadio/index';
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
} from '@alicloud/console-components';
import pattern from '@/utils/pattern';
import styles from './rocketmq.module.scss';
import {
	getNodePort,
	getNodeTaint,
	getStorageClass,
	postMiddleware,
	getMiddlewareDetail
} from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import RocketACLForm from '@/components/RocketACLForm';
import { judgeObjArrayAttrIsNull } from '@/utils/utils';
// * 外接动态表单相关
import { getAspectFrom } from '@/services/common';
import { getCustomFormKeys, childrenRender } from '@/utils/utils';

const { Item: FormItem } = Form;
const formItemLayout = {
	labelCol: {
		fixedSpan: 6
	},
	wrapperCol: {
		span: 14
	}
};

const RocketMQCreate = (props) => {
	const { cluster: globalCluster, namespace: globalNamespace } =
		props.globalVar;
	const {
		chartName,
		chartVersion,
		middlewareName,
		backupFileName,
		aliasName
	} = useParams();
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
	const [affinityLabels, setAffinityLabels] = useState([]);
	// 主机容忍
	const [tolerations, setTolerations] = useState({
		flag: false,
		label: ''
	});
	const [tolerationList, setTolerationList] = useState([]);
	const changeTolerations = (value, key) => {
		setTolerations({
			...tolerations,
			[key]: value
		});
	};
	const [tolerationsLabels, setTolerationsLabels] = useState([]);

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

	// 对外访问
	// const [exportWay, setExportWay] = useState('not');
	// const [ingress, setIngress] = useState({
	// 	protocol: 'TCP',
	// 	Port: '',
	// 	domain: ''
	// });
	// const [nodePort, setNodePort] = useState({
	// 	protocol: 'TCP',
	// 	hostPort: ''
	// });
	// const exportWayList = [
	// 	{
	// 		label: 'Ingress',
	// 		value: 'Ingress'
	// 	},
	// 	{
	// 		label: 'NodePort',
	// 		value: 'NodePort'
	// 	},
	// 	{
	// 		label: '不对外暴露',
	// 		value: 'not'
	// 	}
	// ];
	// const ingressHandle = (value, key) => {
	// 	setIngress({
	// 		...ingress,
	// 		[key]: value
	// 	});
	// };
	// const nodePortHandle = (value, key) => {
	// 	setNodePort({
	// 		...nodePort,
	// 		[key]: value
	// 	});
	// };

	// MySQL配置
	const [version, setVersion] = useState('4.5.0');
	const versionList = [
		{
			label: '4.5.0',
			value: '4.5.0'
		}
	];
	const [mode, setMode] = useState('2m-noslave');
	const modeList = [
		{
			label: '双主',
			value: '2m-noslave'
		},
		{
			label: '双主双从',
			value: '2m-2s'
		},
		{
			label: '三主三从',
			value: '3m-3s'
		}
	];
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
	// * acl相关
	const [aclCheck, setAclCheck] = useState(false);
	// * 外接的动态表单
	const [customForm, setCustomForm] = useState();
	// * 集群外访问
	const [hostNetwork, setHostNetwork] = useState();

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

	const handleSubmit = () => {
		field.validate((err, values) => {
			if (!err) {
				let sendData = {
					chartName: chartName,
					chartVersion: chartVersion,
					clusterId: globalCluster.id,
					namespace: globalNamespace.name,
					type: 'rocketmq',
					name: values.name,
					aliasName: values.aliasName,
					labels: values.labels,
					annotations: values.annotations,
					description: values.description,
					version: version,
					mode: mode,
					filelogEnabled: fileLog,
					stdoutEnabled: standardLog,
					hostNetwork: hostNetwork,
					quota: {
						rocketmq: {
							storageClassName: values.storageClass,
							storageClassQuota: values.storageQuota
						}
					},
					rocketMQParam: {
						acl: {
							enable: aclCheck
						}
					}
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
						sendData.nodeAffinity = affinityLabels.map((item) => {
							return {
								label: item.label,
								required: affinity.checked,
								namespace: globalNamespace.name
							};
						});
					}
				}
				if (tolerations.flag) {
					if (!tolerationsLabels.length) {
						Message.show(
							messageConfig('error', '错误', '请选择主机容忍。')
						);
						return;
					} else {
						sendData.tolerations = tolerationsLabels.map(
							(item) => item.label
						);
					}
				}
				if (instanceSpec === 'General') {
					switch (specId) {
						case '1':
							sendData.quota.rocketmq.cpu = 1;
							sendData.quota.rocketmq.memory = '2Gi';
							break;
						case '2':
							sendData.quota.rocketmq.cpu = 2;
							sendData.quota.rocketmq.memory = '4Gi';
							break;
						case '3':
							sendData.quota.rocketmq.cpu = 4;
							sendData.quota.rocketmq.memory = '16Gi';
							break;
						case '4':
							sendData.quota.rocketmq.cpu = 8;
							sendData.quota.rocketmq.memory = '32Gi';
							break;
						case '5':
							sendData.quota.rocketmq.cpu = 16;
							sendData.quota.rocketmq.memory = '64Gi';
							break;
						default:
							break;
					}
				} else if (instanceSpec === 'Customize') {
					sendData.quota.rocketmq.cpu = values.cpu;
					sendData.quota.rocketmq.memory = values.memory + 'Gi';
				}
				if (aclCheck) {
					if (
						judgeObjArrayAttrIsNull(
							values.rocketMQAccountList,
							'accessKey',
							'secretKey'
						)
					) {
						Message.show(
							messageConfig(
								'error',
								'失败',
								'账户密码格式输入错误，长度在7-20个字符'
							)
						);
						return;
					} else {
						sendData.rocketMQParam.acl.globalWhiteRemoteAddresses =
							values.globalWhiteRemoteAddresses;
						sendData.rocketMQParam.acl.rocketMQAccountList =
							values.rocketMQAccountList;
					}
				}
				// console.log(sendData);
				postMiddleware(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', {
								data: '中间件RocketMQ正在创建中'
							})
						);
						history.push({
							pathname: `/serviceList/${chartName}/${aliasName}`
						});
					} else {
						Message.show(messageConfig('error', '错误', res));
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
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
			getNodeTaint({ clusterid: globalCluster.id }).then((res) => {
				if (res.success) {
					setTolerationList(res.data);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
			getAspectFrom().then((res) => {
				if (res.success) {
					setCustomForm(res.data);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			});
		}
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
				// 		// setDefaultStorageClass(res.data[i].name);
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
		// if (JSON.stringify(globalNamespace) !== '{}') {
		// 	// 克隆服务
		// 	if (backupFileName) {
		// 		getMiddlewareDetail({
		// 			clusterId: globalCluster.id,
		// 			namespace: globalNamespace.name,
		// 			middlewareName: middlewareName,
		// 			type: 'rocketmq'
		// 		}).then((res) => {
		// 			console.log(res.data);
		// 		});
		// 	}
		// }
	}, [globalNamespace]);

	// * acl 相关
	const aclSwitchChange = (checked) => {
		setAclCheck(checked);
	};

	return (
		<Page>
			<Page.Header
				title="发布RocketMQ服务"
				className="page-header"
				hasBackArrow
				onBackArrowClick={() => {
					window.history.back();
				}}
			/>
			<Page.Content>
				<Form {...formItemLayout} field={field}>
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
										>
											<Input
												name="name"
												placeholder="请输入由小写字母数字及“-”组成的2-40个字符"
												trim
											/>
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
											patternMessage="请输入key=value格式的注解，多个注解以英文逗号分隔"
										>
											<Input
												name="annotations"
												placeholder="请输入key=value格式的注解，多个注解以英文逗号分隔"
											/>
										</FormItem>
									</div>
								</li>
								<li className="display-flex">
									<label className="form-name">
										<span>备注</span>
									</label>
									<div className="form-content">
										<FormItem>
											<Input.TextArea
												name="description"
												placeholder="请输入备注信息"
											/>
										</FormItem>
									</div>
								</li>
							</ul>
						</div>
					</FormBlock>
					<FormBlock
						title={
							<span>
								访问权限控制认证
								<span className={styles['acl-title-flag']}>
									{aclCheck ? '已开启' : '已关闭'}
									<Switch
										style={{
											marginLeft: 16,
											verticalAlign: 'middle'
										}}
										size="small"
										value={aclCheck}
										onChange={aclSwitchChange}
									/>
								</span>
							</span>
						}
					>
						{aclCheck ? (
							<div className={styles['acl-config']}>
								<RocketACLForm field={field} />
							</div>
						) : null}
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
								{affinityLabels.length ? (
									<div className={styles['tags']}>
										{affinityLabels.map((item) => {
											return (
												<p
													className={styles['tag']}
													key={item.label}
												>
													<span>{item.label}</span>
													<Icon
														type="error"
														size="xs"
														className={
															styles['tag-close']
														}
														onClick={() => {
															if (!affinityLabels.find(item => item.label === affinity.label)) {
																setAffinityLabels([
																	...affinityLabels,
																	{
																		label: affinity.label,
																		id: Math.random()
																	}
																])
																changeAffinity('', 'label')
															}
														}}
													/>
												</p>
											);
										})}
									</div>
								) : null}
								<li className="display-flex form-li">
									<label className="form-name">
										<span className="mr-8">主机容忍</span>
									</label>
									<div
										className={`form-content display-flex ${styles['host-affinity']}`}
									>
										<div className={styles['switch']}>
											{tolerations.flag
												? '已开启'
												: '关闭'}
											<Switch
												checked={tolerations.flag}
												onChange={(value) =>
													changeTolerations(
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
										{tolerations.flag ? (
											<>
												<div
													className={styles['input']}
												>
													<Select.AutoComplete
														value={
															tolerations.label
														}
														onChange={(value) =>
															changeTolerations(
																value,
																'label'
															)
														}
														dataSource={
															tolerationList
														}
														style={{
															width: '100%'
														}}
													/>
												</div>
												<div className={styles['add']}>
													<Button
														style={{
															marginLeft: '4px',
															padding: '0 9px'
														}}
														onClick={() => {
															if (!tolerationsLabels.find(item => item.label === tolerations.label)) {
																setTolerationsLabels(
																	[
																		...tolerationsLabels,
																		{
																			label: tolerations.label,
																			id: Math.random()
																		}
																	]
																)
																changeTolerations('', 'label')
															}
														}}
													>
														<Icon
															style={{
																color: '#005AA5'
															}}
															type="add"
														/>
													</Button>
												</div>
											</>
										) : null}
									</div>
								</li>
								{tolerationsLabels.length ? (
									<div className={styles['tags']}>
										{tolerationsLabels.map((item) => {
											return (
												<p
													className={styles['tag']}
													key={item.label}
												>
													<span>{item.label}</span>
													<Icon
														type="error"
														size="xs"
														className={
															styles['tag-close']
														}
														onClick={() =>
															setTolerationsLabels(
																tolerationsLabels.filter(
																	(arr) =>
																		arr.id !==
																		item.id
																)
															)
														}
													/>
												</p>
											);
										})}
									</div>
								) : null}
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
					{/* <FormBlock title="对外访问">
						<div className={styles['foreign-visit']}>
							<ul className="form-layout">
								<li className="display-flex form-li">
									<label className="form-name">
										<span>暴露方式</span>
									</label>
									<div
										className={`form-content display-flex ${styles['export-way']}`}
									>
										<SelectBlock
											options={exportWayList}
											currentValue={exportWay}
											onCallBack={(value) =>
												setExportWay(value)
											}
										/>
										{exportWay !== 'not' ? (
											<div
												className={`display-flex ${styles['export-content']}`}
											>
												{exportWay === 'Ingress' ? (
													<ul className="form-layout">
														<li className="display-flex form-li">
															<label className="form-name">
																<span>
																	访问协议
																</span>
															</label>
															<div className="form-content">
																<Select
																	value={
																		ingress.protocol
																	}
																	onChange={(
																		value
																	) =>
																		ingressHandle(
																			value,
																			'protocol'
																		)
																	}
																	dataSource={[
																		'TCP',
																		'HTTP'
																	]}
																	style={{
																		width:
																			'100%'
																	}}
																/>
															</div>
														</li>
														{ingress.protocol ===
														'TCP' ? (
															<li className="display-flex form-li">
																<label className="form-name">
																	<span className="ne-required">
																		对外端口
																	</span>
																</label>
																<div className="form-content">
																	<Input
																		value={
																			ingress.port
																		}
																		onChange={(
																			value
																		) =>
																			ingressHandle(
																				value,
																				'port'
																			)
																		}
																		placeholder="范围：30000-65535"
																		style={{
																			width:
																				'100%'
																		}}
																	/>
																</div>
															</li>
														) : null}
														{ingress.protocol ===
														'HTTP' ? (
															<li className="display-flex form-li">
																<label className="form-name">
																	<span className="ne-required">
																		访问域名
																	</span>
																</label>
																<div className="form-content">
																	<Input
																		value={
																			ingress.domain
																		}
																		onChange={(
																			value
																		) =>
																			ingressHandle(
																				value,
																				'domain'
																			)
																		}
																		placeholder="例如：www.example.com"
																		style={{
																			width:
																				'100%'
																		}}
																	/>
																</div>
															</li>
														) : null}
													</ul>
												) : null}
												{exportWay === 'NodePort' ? (
													<ul className="form-layout">
														<li className="display-flex form-li">
															<label className="form-name">
																<span>
																	访问协议
																</span>
															</label>
															<div className="form-content">
																<p
																	style={{
																		padding:
																			'6px 12px'
																	}}
																>
																	{
																		nodePort.protocol
																	}
																</p>
															</div>
														</li>
														<li className="display-flex form-li">
															<label className="form-name">
																<span className="ne-required">
																	主机端口
																</span>
															</label>
															<div className="form-content">
																<Input
																	value={
																		nodePort.hostPort
																	}
																	onChange={(
																		value
																	) =>
																		nodePortHandle(
																			value,
																			'hostPort'
																		)
																	}
																	placeholder="范围：30000-32767"
																	style={{
																		width:
																			'100%'
																	}}
																/>
															</div>
														</li>
													</ul>
												) : null}
											</div>
										) : null}
									</div>
								</li>
							</ul>
						</div>
					</FormBlock> */}
					<FormBlock title="RocketMQ配置">
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
							</ul>
						</div>
					</FormBlock>
					<FormBlock title="规格配置">
						<div className={styles['spec-config']}>
							<ul className="form-layout">
								<li className="display-flex form-li">
									<label className="form-name">
										<span>模式</span>
									</label>
									<div
										className={`form-content display-flex`}
									>
										<SelectBlock
											options={modeList}
											currentValue={mode}
											onCallBack={(value) =>
												setMode(value)
											}
										/>
									</div>
								</li>
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
													onCallBack={(value) =>
														setSpecId(value)
													}
												/>
											</div>
										) : null}
										{instanceSpec === 'Customize' ? (
											<div
												className={
													styles['spec-custom']
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
																min={0.1}
																minmaxMessage={`最小为0.1,不能超过当前分区配额剩余的最大值（${maxCpu.max}Core）`}
																required
																requiredMessage="请输入自定义CPU配额，单位为Core"
																{...maxCpu}
															>
																<Input
																	name="cpu"
																	htmlType="number"
																	min={0.1}
																	step={0.1}
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
																min={0.1}
																minmaxMessage={`最小为0.1,不能超过当前分区配额剩余的最大值（${maxMemory.max}Gi`}
																required
																requiredMessage="请输入自定义内存配额，单位为Gi"
																{...maxMemory}
															>
																<Input
																	name="memory"
																	htmlType="number"
																	min={0.1}
																	step={0.1}
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
												style={{ marginRight: 8 }}
												autoWidth={false}
											>
												{storageClassList.map(
													(item, index) => {
														return (
															<Select.Option
																key={index}
																value={
																	item.name
																}
															>
																{item.name}
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
												defaultValue={5}
												htmlType="number"
												placeholder="请输入存储配额大小"
												addonTextAfter="GB"
											/>
										</FormItem>
									</div>
								</li>
								<li
									className="display-flex form-li"
									style={{ alignItems: 'center' }}
								>
									<label className="form-name">
										<span className="ne-required">
											集群外访问
										</span>
									</label>
									<div
										className={`form-content display-flex ${styles['standard-log']}`}
									>
										<div className={styles['switch']}>
											{hostNetwork ? '已开启' : '关闭'}
											<Switch
												checked={hostNetwork}
												onChange={(value) =>
													setHostNetwork(value)
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
					{childrenRender(
						customForm,
						field,
						globalCluster,
						globalNamespace
					)}
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

export default connect(({ globalVar }) => ({ globalVar }), {})(RocketMQCreate);
