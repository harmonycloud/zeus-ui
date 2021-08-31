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
} from '@alicloud/console-components';
import pattern from '@/utils/pattern';
import styles from './elasticsearch.module.scss';
import {
	getNodePort,
	getStorageClass,
	postMiddleware,
	getMiddlewareDetail
} from '@/services/middleware';
import messageConfig from '@/components/messageConfig';

const { Item: FormItem } = Form;
const formItemLayout = {
	labelCol: {
		fixedSpan: 6
	},
	wrapperCol: {
		span: 14
	}
};

const ElasticsearchCreate = (props) => {
	const {
		cluster: globalCluster,
		namespace: globalNamespace
	} = props.globalVar;
	const {
		chartName,
		chartVersion,
		middlewareName,
		backupFileName
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

	// Elasticsearch配置
	const [version, setVersion] = useState('6.8.10');
	const versionList = [
		{
			label: '6.8.10',
			value: '6.8.10'
		}
	];
	const [mode, setMode] = useState('simple');
	const modeList = [
		{
			label: 'N主',
			value: 'simple'
		},
		{
			label: 'N主 N数据',
			value: 'regular'
		},
		{
			label: 'N主 N数据 N协调',
			value: 'complex'
		}
	];
	const [nodeObj, setNodeObj] = useState({
		master: {
			disabled: false,
			title: '主节点',
			num: 3,
			specId: '1',
			cpu: 1,
			memory: 2,
			storageClass: '',
			storageQuota: 0
		},
		kibana: {
			disabled: false,
			title: 'Kibana节点',
			num: 1,
			specId: '1',
			cpu: 1,
			memory: 2
		},
		data: {
			disabled: true,
			title: '数据节点',
			num: 3,
			specId: '1',
			cpu: 1,
			memory: 2,
			storageClass: '',
			storageQuota: 0
		},
		client: {
			disabled: true,
			title: '协调节点',
			num: 2,
			specId: '1',
			cpu: 1,
			memory: 2,
			storageClass: '',
			storageQuota: 0
		}
	});
	const [nodeModify, setNodeModify] = useState({
		nodeName: '',
		flag: false
	});
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
	const [nodeNum, setNodeNum] = useState(0);
	const [specId, setSpecId] = useState('1');
	const [storageClassList, setStorageClassList] = useState([]);

	const formHandle = (obj, item) => {
		if (
			['cpu', 'memory', 'storageClass', 'storageQuota'].indexOf(
				item.name
			) > -1
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
			if (!err) {
				let sendData = {
					chartName: chartName,
					chartVersion: chartVersion,
					clusterId: globalCluster.id,
					namespace: globalNamespace.name,
					type: 'elasticsearch',
					name: values.name,
					aliasName: values.aliasName,
					labels: values.labels,
					annotation: values.annotation,
					version: version,
					password: values.pwd,
					filelogEnabled: fileLog,
					stdoutEnabled: standardLog,
					mode: mode
				};
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
				if (nodeObj) {
					sendData.quota = {};
					for (let key in nodeObj) {
						if (!nodeObj[key].disabled)
							sendData.quota[key] = {
								...nodeObj[key],
								storageClassName: nodeObj[key].storageClass,
								storageClassQuota: nodeObj[key].storageQuota
							};
					}
				}
				// console.log(sendData);
				postMiddleware(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', {
								data: '中间件Elasticsearch正在创建中'
							})
						);
						history.push({
							pathname: '/instanceList',
							query: { key: 'Elasticsearch', timer: true }
						});
					} else {
						Message.show(messageConfig('error', '错误', res));
					}
				});
			}
		});
	};

	// 全局集群更新
	useEffect(() => {
		if (JSON.stringify(globalCluster) !== '{}') {
			getNodePort({ clusterId: globalCluster.id }).then((res) => {
				if (res.success) {
					setLabelList(res.data);
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
				for (let i = 0; i < res.data.length; i++) {
					if (res.data[i].type === 'CSI-LVM') {
						const { master, kibana, data, client } = nodeObj;
						master.storageClass = res.data[i].name;
						master.storageQuota = 5;
						data.storageClass = res.data[i].name;
						data.storageQuota = 5;
						client.storageClass = res.data[i].name;
						client.storageQuota = 5;
						setNodeObj({ master, kibana, data, client });
						break;
					}
				}
				setStorageClassList(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
		if (JSON.stringify(globalNamespace) !== '{}') {
			// 克隆实例
			if (backupFileName) {
				getMiddlewareDetail({
					clusterId: globalCluster.id,
					namespace: globalNamespace.name,
					middlewareName: middlewareName,
					type: 'elasticsearch'
				}).then((res) => {
					console.log(res.data);
				});
			}
		}
	}, [globalNamespace]);

	// 模式变更
	useEffect(() => {
		if (mode) {
			let { master, kibana, data, client } = nodeObj;
			if (mode === 'simple') {
				master.disabled = false;
				kibana.disabled = false;
				data.disabled = true;
				client.disabled = true;
			} else if (mode === 'regular') {
				master.disabled = false;
				kibana.disabled = false;
				data.disabled = false;
				client.disabled = true;
			} else if (mode === 'complex') {
				master.disabled = false;
				kibana.disabled = false;
				data.disabled = false;
				client.disabled = false;
			}
			setNodeObj({ master, kibana, data, client });
		}
	}, [mode]);

	return (
		<Page>
			<Page.Header
				title="发布Elasticsearch实例"
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
											实例名称
										</span>
									</label>
									<div className="form-content">
										<FormItem
											required
											requiredMessage="请输入实例名称"
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
										<span>描述</span>
									</label>
									<div className="form-content">
										<FormItem>
											<Input.TextArea
												name="annotation"
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
										<span className="mr-8">主机亲和</span>
										<Balloon
											trigger={
												<Icon
													type="question-circle"
													size="xs"
												/>
											}
											closable={false}
										>
											勾选强制亲和时，实例只会部署在具备相应标签的主机上，若主机资源不足，可能会导致启动失败
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
												className={styles['component']}
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
												开启该功能，平台会将日志目录下的文件日志收集至Elasticsearch中，可以在实例详情下的“日志管理”菜单下查看具体的日志，如果当前集群未部署/对接Elasticsearch组件，则无法启用该功能
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
												开启该功能，平台会将标准输出（stdout）的日志收集至Elasticsearch中，可以在实例详情下的“日志管理”菜单下查看具体的日志，如果当前集群未部署/对接Elasticsearch组件，则无法启用该功能
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
					<FormBlock title="Elasticsearch配置">
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
								<li className="display-flex mt-8">
									<label className="form-name">
										<span>初始密码</span>
									</label>
									<div
										className={`form-content ${styles['input-flex-length']}`}
									>
										<FormItem>
											<Input
												htmlType="password"
												name="pwd"
												placeholder="请输入初始密码，输入为空则由平台随机生成"
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
										<span>模式</span>
									</label>
									<div
										className={`form-content display-flex ${styles['es-mode']}`}
									>
										<SelectBlock
											options={modeList}
											currentValue={mode}
											onCallBack={(value) =>
												setMode(value)
											}
										/>
										<div
											className={`display-flex ${styles['mode-content']}`}
										>
											{Object.keys(nodeObj).map((key) => {
												if (nodeObj[key].disabled)
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
																	nodeObj[key]
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
																	nodeObj[key]
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
																		].num
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
											})}
										</div>
									</div>
								</li>
								{nodeModify.flag && (
									<>
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
																nodeModify
																	.nodeName
															];
														tempObj.num = value;
														setNodeObj({
															...nodeObj,
															[nodeModify.nodeName]: tempObj
														});
													}}
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
																		minmaxMessage="最小为0.1"
																		required
																		requiredMessage="请输入自定义CPU配额，单位为Core"
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
																		minmaxMessage="最小为0.1"
																		required
																		requiredMessage="请输入自定义内存配额，单位为Gi"
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
										{nodeModify.nodeName !== 'kibana' && (
											<li className="display-flex mt-8">
												<label className="form-name">
													<span>存储配额</span>
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
															defaultValue={5}
															htmlType="number"
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

export default connect(
	({ globalVar }) => ({ globalVar }),
	{}
)(ElasticsearchCreate);
