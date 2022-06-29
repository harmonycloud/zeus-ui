import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import FormBlock from '@/components/FormBlock';
import SelectBlock from '@/components/SelectBlock';
import {
	Input,
	Switch,
	Select,
	AutoComplete,
	Button,
	Popover,
	Form,
	notification,
	Result,
	Tag
} from 'antd';
import {
	QuestionCircleOutlined,
	PlusOutlined,
	CloseCircleFilled
} from '@ant-design/icons';
import pattern from '@/utils/pattern';
import styles from './elasticsearch.module.scss';
import {
	getNodePort,
	getNodeTaint,
	postMiddleware,
	getMiddlewareDetail
} from '@/services/middleware';
import { getMirror } from '@/services/common';
import ModeItem from '@/components/ModeItem';
import Affinity from '@/components/Affinity';
import {
	CreateProps,
	CreateParams,
	AffinityProps,
	AffinityLabelsItem,
	TolerationsProps,
	EsSendDataParams,
	EsCreateValuesParams
} from '../catalog';
import { TolerationLabelItem } from '@/components/FormTolerations/formTolerations';
import { StoreState } from '@/types';
// * 外接动态表单相关
import { getAspectFrom } from '@/services/common';
import { getCustomFormKeys, childrenRender } from '@/utils/utils';
import { NamespaceItem } from '@/pages/ProjectDetail/projectDetail';
import { getProjectNamespace } from '@/services/project';
import {
	middlewareDetailProps,
	MirrorItem,
	AutoCompleteOptionItem
} from '@/types/comment';
import storage from '@/utils/storage';
import { applyBackup } from '@/services/backup';
import transUnit from '@/utils/transUnit';

const { Item: FormItem } = Form;

const ElasticsearchCreate: (props: CreateProps) => JSX.Element = (
	props: CreateProps
) => {
	const {
		cluster: globalCluster,
		namespace: globalNamespace,
		project
	} = props.globalVar;
	const params: CreateParams = useParams();
	const { chartName, chartVersion, aliasName, namespace, middlewareName } =
		params;
	const [form] = Form.useForm();
	const history = useHistory();

	// 主机亲和
	const [affinity, setAffinity] = useState<AffinityProps>({
		flag: false,
		label: '',
		checked: false
	});
	const [labelList, setLabelList] = useState<AutoCompleteOptionItem[]>([]);
	const changeAffinity = (value: any, key: string) => {
		setAffinity({
			...affinity,
			[key]: value
		});
	};
	const [affinityLabels, setAffinityLabels] = useState<AffinityLabelsItem[]>(
		[]
	);
	const [affinityFlag, setAffinityFlag] = useState<boolean>(false);
	// 主机容忍
	const [tolerations, setTolerations] = useState<TolerationsProps>({
		flag: false,
		label: ''
	});
	const [tolerationList, setTolerationList] = useState<
		AutoCompleteOptionItem[]
	>([]);
	const changeTolerations = (value: any, key: string) => {
		setTolerations({
			...tolerations,
			[key]: value
		});
	};
	const [tolerationsLabels, setTolerationsLabels] = useState<
		TolerationLabelItem[]
	>([]);

	// 日志
	const [fileLog, setFileLog] = useState<boolean>(false);
	const [standardLog, setStandardLog] = useState<boolean>(false);
	// * 当导航栏的命名空间为全部时
	const [namespaceList, setNamespaceList] = useState<NamespaceItem[]>([]);

	// Elasticsearch配置
	const [version, setVersion] = useState<string>('6.8');
	const versionList = [
		{
			label: '6.8',
			value: '6.8'
		},
		{
			label: '7.16',
			value: '7.16'
		}
	];
	const [mode, setMode] = useState<string>('simple');
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
		},
		{
			label: 'N主 N数据 N冷',
			value: 'complex-cold'
		},
		{
			label: 'N主 N数据 N冷 N协调',
			value: 'cold-complex'
		}
	];
	const [mirrorList, setMirrorList] = useState<MirrorItem[]>([]);
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
		},
		cold: {
			disabled: true,
			title: '冷数据节点',
			num: 3,
			specId: '1',
			cpu: 1,
			memory: 2,
			storageClass: '',
			storageQuota: 0
		}
	});

	// * 外接的动态表单
	const [customForm, setCustomForm] = useState<any>();
	// * 是否点击提交跳转至结果页
	const [commitFlag, setCommitFlag] = useState<boolean>(false);
	// * 发布成功
	const [successFlag, setSuccessFlag] = useState<boolean>(false);
	// * 发布失败
	const [errorFlag, setErrorFlag] = useState<boolean>(false);
	// * 创建返回的服务名称
	const [createData, setCreateData] = useState<middlewareDetailProps>();

	const handleSubmit = () => {
		console.log(globalNamespace.name);

		form.validateFields().then((values: EsCreateValuesParams) => {
			const sendData: EsSendDataParams = {
				chartName: chartName,
				chartVersion: chartVersion,
				clusterId: globalCluster.id,
				namespace:
					globalNamespace.name === '*'
						? values.namespace
						: globalNamespace.name,
				type: 'elasticsearch',
				name: values.name,
				aliasName: values.aliasName,
				labels: values.labels,
				annotations: values.annotations,
				description: values.description,
				version: version,
				password: values.pwd,
				filelogEnabled: fileLog,
				stdoutEnabled: standardLog,
				mode,
				mirrorImageId:
					mirrorList
						.find(
							(item: MirrorItem) =>
								item.address === values.mirrorImageId
						)
						?.id.toString() || ''
			};
			// * 动态表单相关
			if (customForm) {
				const dynamicValues = {};
				let keys: string[] = [];
				for (const i in customForm) {
					const list = getCustomFormKeys(customForm[i]);
					keys = [...list, ...keys];
				}
				keys.forEach((item) => {
					dynamicValues[item] = values[item];
				});
				sendData.dynamicValues = dynamicValues;
			}
			if (affinityFlag) {
				if (!affinityLabels.length) {
					notification.error({
						message: '错误',
						description: '请选择主机亲和。'
					});
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
					notification.error({
						message: '错误',
						description: '请选择主机容忍。'
					});
					return;
				} else {
					sendData.tolerations = tolerationsLabels.map(
						(item) => item.label
					);
				}
			}
			if (nodeObj) {
				sendData.quota = {};
				for (const key in nodeObj) {
					if (!nodeObj[key].disabled) {
						if (nodeObj[key].storageClass === '') {
							notification.error({
								message: '失败',
								description: `请选择${key}节点存储类型`
							});
							return;
						}
						sendData.quota[key] = {
							...nodeObj[key],
							storageClassName:
								nodeObj[key].storageClass?.split('/')[0],
							storageClassQuota: nodeObj[key].storageQuota
						};
					}
				}
			}
			if (namespace) {
				sendData.namespace = namespace;
			}
			if (middlewareName) {
				const result = {
					clusterId: globalCluster.id,
					namespace: namespace,
					middlewareName: values.name,
					type: storage.getLocal('backupDetail').sourceType,
					cron: storage.getLocal('backupDetail').cron,
					backupName: storage.getLocal('backupDetail').backupName,
					addressName: storage.getLocal('backupDetail').addressName
				};
				applyBackup(result).then((res) => {
					// if (res.success) {
					// 	notification.success({
					// 		message: '成功',
					// 		description: '克隆成功'
					// 	});
					// } else {
					// 	notification.error({
					// 		message: '失败',
					// 		description: res.errorMsg
					// 	});
					// }
				});
			}
			setCommitFlag(true);
			postMiddleware(sendData).then((res) => {
				if (res.success) {
					setCreateData(res.data);
					setSuccessFlag(true);
					setErrorFlag(false);
					setCommitFlag(false);
				} else {
					setSuccessFlag(false);
					setErrorFlag(true);
					setCommitFlag(false);
				}
			});
		});
	};

	// 全局集群更新
	useEffect(() => {
		if (
			JSON.stringify(globalCluster) !== '{}' &&
			JSON.stringify(globalNamespace) !== '{}'
		) {
			getNodePort({ clusterId: globalCluster.id }).then((res) => {
				if (res.success) {
					const list = res.data.map((item: string) => {
						return {
							value: item,
							label: item
						};
					});
					setLabelList(list);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
			getNodeTaint({ clusterid: globalCluster.id }).then((res) => {
				if (res.success) {
					const list = res.data.map((item: string) => {
						return {
							value: item,
							label: item
						};
					});
					setTolerationList(list);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
			getAspectFrom().then((res) => {
				if (res.success) {
					setCustomForm(res.data);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
			getMirror({
				clusterId: globalCluster.id
			}).then((res) => {
				if (res.success) {
					setMirrorList(res.data.list);
				}
			});
		}
	}, [globalCluster, globalNamespace]);
	// 全局分区更新
	useEffect(() => {
		if (JSON.stringify(globalNamespace) !== '{}') {
			// 克隆服务
			if (middlewareName) {
				getMiddlewareDetailAndSetForm(middlewareName);
			}
		}
	}, [globalNamespace]);

	const getMiddlewareDetailAndSetForm = (middlewareName: string) => {
		getMiddlewareDetail({
			clusterId: globalCluster.id,
			namespace: namespace || globalNamespace.name,
			middlewareName: middlewareName,
			type: 'elasticsearch'
		}).then((res) => {
			if (!res.data) return;
			// setInstanceSpec('Customize');
			if (res.data.nodeAffinity) {
				setAffinity({
					flag: true,
					label: '',
					checked: false
				});
				setAffinityLabels(res.data?.nodeAffinity || []);
			}
			if (res.data.tolerations) {
				setTolerations({
					flag: true,
					label: ''
				});
				setTolerationsLabels(
					res.data?.tolerations?.map((item: string) => {
						return { label: item };
					}) || []
				);
			}
			if (res.data.mode) {
				setNodeObj({
					master: {
						disabled: false,
						title: '主节点',
						num: res.data.quota.master.num,
						specId: '1',
						cpu: res.data.quota.master.cpu,
						memory: Number(
							transUnit.removeUnit(
								res.data.quota.master.memory,
								'Gi'
							)
						),
						storageClass: res.data.quota.master.storageClassName,
						storageQuota: Number(
							transUnit.removeUnit(
								res.data.quota.master.storageClassQuota,
								'Gi'
							)
						)
					},
					kibana: {
						disabled: false,
						title: 'Kibana节点',
						num: res.data.quota.kibana.num,
						specId: '1',
						cpu: res.data.quota.kibana.cpu,
						memory: Number(
							transUnit.removeUnit(
								res.data.quota.kibana.memory,
								'Gi'
							)
						)
					},
					data: {
						disabled: true,
						title: '数据节点',
						num: res.data.quota.data.num,
						specId: '1',
						cpu: res.data.quota.data.cpu,
						memory: Number(
							transUnit.removeUnit(
								res.data.quota.data.memory,
								'Gi'
							)
						),
						storageClass: res.data.quota.data.storageClassName,
						storageQuota: Number(
							transUnit.removeUnit(
								res.data.quota.data.storageClassQuota,
								'Gi'
							)
						)
					},
					client: {
						disabled: true,
						title: '协调节点',
						num: res.data.quota.client.num,
						specId: '1',
						cpu: res.data.quota.client.cpu,
						memory: Number(
							transUnit.removeUnit(
								res.data.quota.client.memory,
								'Gi'
							)
						),
						storageClass: res.data.quota.client.storageClassName,
						storageQuota: Number(
							transUnit.removeUnit(
								res.data.quota.client.storageClassQuota,
								'Gi'
							)
						)
					},
					cold: {
						disabled: true,
						title: '冷数据节点',
						num: res.data.quota.cold.num,
						specId: '1',
						cpu: res.data.quota.cold.cpu,
						memory: Number(
							transUnit.removeUnit(
								res.data.quota.cold.memory,
								'Gi'
							)
						),
						storageClass: res.data.quota.cold.storageClassName,
						storageQuota: Number(
							transUnit.removeUnit(
								res.data.quota.cold.storageClassQuota,
								'Gi'
							)
						)
					}
				});
				setMode(res.data.mode);
			}
			if (res.data.version) {
				setVersion(res.data.version);
			}
			form.setFieldsValue({
				name: res.data.name + '-backup',
				labels: res.data.labels,
				annotations: res.data.annotations,
				description: res.data.description,
				password: res.data.password,
				cpu: res.data.quota.master.cpu,
				memory: transUnit.removeUnit(
					res.data.quota.master.memory,
					'Gi'
				),
				storageClass: res.data.quota.master.storageClassName,
				storageQuota: transUnit.removeUnit(
					res.data.quota.master.storageClassQuota,
					'Gi'
				)
			});
			if (res.data.dynamicValues) {
				for (const i in res.data.dynamicValues) {
					form.setFieldsValue({ [i]: res.data.dynamicValues[i] });
				}
			}
		});
	};
	useEffect(() => {
		if (JSON.stringify(project) !== '{}' && globalNamespace.name === '*') {
			getProjectNamespace({ projectId: project.projectId }).then(
				(res) => {
					console.log(res);
					if (res.success) {
						const list = res.data.filter(
							(item: NamespaceItem) =>
								item.clusterId === globalCluster.id
						);
						setNamespaceList(list);
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				}
			);
		}
	}, [project, globalNamespace]);
	// 模式变更
	useEffect(() => {
		if (mode) {
			const { master, kibana, data, client, cold } = nodeObj;
			if (mode === 'simple') {
				master.disabled = false;
				kibana.disabled = false;
				data.disabled = true;
				client.disabled = true;
				cold.disabled = true;
			} else if (mode === 'regular') {
				master.disabled = false;
				kibana.disabled = false;
				data.disabled = false;
				client.disabled = true;
				cold.disabled = true;
			} else if (mode === 'complex') {
				master.disabled = false;
				kibana.disabled = false;
				data.disabled = false;
				client.disabled = false;
				cold.disabled = true;
			} else if (mode === 'complex-cold') {
				master.disabled = false;
				kibana.disabled = false;
				data.disabled = false;
				client.disabled = true;
				cold.disabled = false;
			} else if (mode === 'cold-complex') {
				master.disabled = false;
				kibana.disabled = false;
				data.disabled = false;
				client.disabled = false;
				cold.disabled = false;
			}
			setNodeObj({ master, kibana, data, client, cold });
		}
	}, [mode]);

	// * 结果页相关
	if (commitFlag) {
		return (
			<ProPage>
				<ProHeader />
				<ProContent>
					<Result
						title="发布中"
						extra={
							<Button
								type="primary"
								onClick={() => {
									history.push({
										pathname: `/serviceList/${chartName}/${aliasName}`
									});
								}}
							>
								返回列表
							</Button>
						}
					/>
				</ProContent>
			</ProPage>
		);
	}
	if (successFlag) {
		return (
			<ProPage>
				<ProHeader />
				<ProContent>
					<Result
						status="success"
						title="发布成功"
						extra={[
							<Button
								key="list"
								type="primary"
								onClick={() => {
									history.push({
										pathname: `/serviceList/${chartName}/${aliasName}`
									});
								}}
							>
								返回列表
							</Button>,
							<Button
								key="detail"
								onClick={() => {
									history.push({
										pathname: `/serviceList/${chartName}/${aliasName}/basicInfo/${createData?.name}/${chartName}/${chartVersion}/${createData?.namespace}`
									});
								}}
							>
								查看详情
							</Button>
						]}
					/>
				</ProContent>
			</ProPage>
		);
	}

	if (errorFlag) {
		return (
			<ProPage>
				<ProHeader />
				<ProContent>
					<Result
						status="error"
						title="发布失败"
						extra={
							<Button
								type="primary"
								onClick={() => {
									history.push({
										pathname: `/serviceList/${chartName}/${aliasName}`
									});
								}}
							>
								返回列表
							</Button>
						}
					/>
				</ProContent>
			</ProPage>
		);
	}

	return (
		<ProPage>
			<ProHeader
				title="发布Elasticsearch服务"
				className="page-header"
				onBack={() => {
					window.history.back();
				}}
			/>
			<ProContent>
				<Form form={form}>
					{globalNamespace.name === '*' && !namespace && (
						<FormBlock title="选择命名空间">
							<div className={styles['basic-info']}>
								<ul className="form-layout">
									<li className="display-flex">
										<label className="form-name">
											<span className="ne-required">
												命名空间
											</span>
										</label>
										<div className="form-content">
											<FormItem
												name="namespace"
												rules={[
													{
														required: true,
														message:
															'请输入命名空间'
													}
												]}
											>
												<Select
													style={{ width: '100%' }}
												>
													{namespaceList.map(
														(item) => {
															return (
																<Select.Option
																	key={
																		item.name
																	}
																	value={
																		item.name
																	}
																>
																	{
																		item.aliasName
																	}
																</Select.Option>
															);
														}
													)}
												</Select>
											</FormItem>
										</div>
									</li>
								</ul>
							</div>
						</FormBlock>
					)}
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
											name="name"
											rules={[
												{
													required: true,
													message: '请输入服务名称'
												},
												{
													pattern: new RegExp(
														pattern.name
													),
													message:
														'请输入以小写字母开头，小写字母数字及“-”组成的2-24个字符'
												}
											]}
										>
											<Input placeholder="请输入以小写字母开头，小写字母数字及“-”组成的2-24个字符" />
										</FormItem>
									</div>
								</li>
								<li className="display-flex">
									<label className="form-name">
										<span>显示名称</span>
									</label>
									<div className="form-content">
										<FormItem
											rules={[
												{
													type: 'string',
													min: 2,
													max: 80,
													message:
														'请输入由汉字、字母、数字及“-”或“.”或“_”组成的2-80个字符'
												},
												{
													pattern: new RegExp(
														pattern.nickname
													),
													message:
														'请输入由汉字、字母、数字及“-”或“.”或“_”组成的2-80个字符'
												}
											]}
											name="aliasName"
										>
											<Input placeholder="请输入由汉字、字母、数字及“-”或“.”或“_”组成的2-80个字符" />
										</FormItem>
									</div>
								</li>
								<li className="display-flex">
									<label className="form-name">
										<span>标签</span>
									</label>
									<div className="form-content">
										<FormItem
											rules={[
												{
													pattern: new RegExp(
														pattern.labels
													),
													message:
														'请输入key=value格式的标签，多个标签以英文逗号分隔'
												}
											]}
											name="labels"
										>
											<Input placeholder="请输入key=value格式的标签，多个标签以英文逗号分隔" />
										</FormItem>
									</div>
								</li>
								<li className="display-flex">
									<label className="form-name">
										<span>注解</span>
									</label>
									<div className="form-content">
										<FormItem
											rules={[
												{
													pattern: new RegExp(
														pattern.labels
													),
													message:
														'请输入key=value格式的标签，多个标签以英文逗号分隔'
												}
											]}
											name="annotations"
										>
											<Input placeholder="请输入key=value格式的注解，多个注解以英文逗号分隔" />
										</FormItem>
									</div>
								</li>
								<li className="display-flex">
									<label className="form-name">
										<span>备注</span>
									</label>
									<div className="form-content">
										<FormItem name="description">
											<Input.TextArea placeholder="请输入备注信息" />
										</FormItem>
									</div>
								</li>
							</ul>
						</div>
					</FormBlock>
					<FormBlock title="调度策略">
						<div className={styles['schedule-strategy']}>
							<ul className="form-layout">
								<Affinity
									flag={affinityFlag}
									flagChange={setAffinityFlag}
									values={affinityLabels}
									onChange={setAffinityLabels}
									cluster={globalCluster}
								/>
								<li className="display-flex form-li flex-center">
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
													<AutoComplete
														value={
															tolerations.label
														}
														onChange={(value) =>
															changeTolerations(
																value,
																'label'
															)
														}
														allowClear={true}
														options={tolerationList}
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
														disabled={
															tolerations.label
																? false
																: true
														}
														onClick={() => {
															if (
																!tolerationsLabels.find(
																	(item) =>
																		item.label ===
																		tolerations.label
																)
															) {
																setTolerationsLabels(
																	[
																		...tolerationsLabels,
																		{
																			label: tolerations.label,
																			id: Math.random()
																		}
																	]
																);
															}
														}}
														icon={
															<PlusOutlined
																style={{
																	color: '#005AA5'
																}}
															/>
														}
													></Button>
												</div>
											</>
										) : null}
									</div>
								</li>
								{tolerations.flag &&
								tolerationsLabels.length ? (
									<div className={styles['tags']}>
										{tolerationsLabels.map((item) => {
											return (
												<Tag
													key={item.label}
													closable
													style={{
														padding: '4px 10px'
													}}
													onClose={() =>
														setTolerationsLabels(
															tolerationsLabels.filter(
																(arr) =>
																	arr.id !==
																	item.id
															)
														)
													}
												>
													{item.label}
												</Tag>
											);
										})}
									</div>
								) : null}
							</ul>
						</div>
					</FormBlock>
					<FormBlock title="日志收集">
						<div className={styles['log-collection-content']}>
							<div className={styles['log-collection']}>
								<ul className="form-layout">
									<li className="display-flex form-li flex-center">
										<label className="form-name">
											<span style={{ marginRight: 8 }}>
												文件日志收集
											</span>
											<Popover
												content={
													'安装日志采集组件ES后，开启日志收集按钮，会将该类型日志存储于ES中，若您现在不开启，发布完之后再开启，将导致服务重启。'
												}
											>
												<span
													style={{
														lineHeight: '18px'
													}}
												>
													<QuestionCircleOutlined />
												</span>
											</Popover>
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
										</div>
									</li>
								</ul>
							</div>
							<div className={styles['log-collection']}>
								<ul className="form-layout">
									<li className="display-flex form-li flex-center">
										<label className="form-name">
											<span style={{ marginRight: 8 }}>
												标准日志收集
											</span>
											<Popover
												content={
													'安装日志采集组件ES后，开启日志收集按钮，会将该类型日志存储于ES中，若您现在不开启，发布完之后再开启，将导致服务重启。'
												}
											>
												<span
													style={{
														lineHeight: '18px'
													}}
												>
													<QuestionCircleOutlined />
												</span>
											</Popover>
										</label>
										<div
											className={`form-content display-flex ${styles['standard-log']}`}
										>
											<div className={styles['switch']}>
												{standardLog
													? '已开启'
													: '关闭'}
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
						</div>
					</FormBlock>
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
											onCallBack={(value: any) =>
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
											<Input.Password
												name="pwd"
												placeholder="请输入初始密码，输入为空则由平台随机生成"
											/>
										</FormItem>
									</div>
								</li>
								<li className="display-flex">
									<label className="form-name">
										<span
											className="ne-required"
											style={{ marginRight: 8 }}
										>
											镜像仓库
										</span>
									</label>
									{mirrorList.length && (
										<div
											className="form-content"
											style={{ flex: '0 0 376px' }}
										>
											<FormItem
												rules={[
													{
														required: true,
														message:
															'请选择镜像仓库'
													}
												]}
												name="mirrorImageId"
												initialValue={
													mirrorList[0].address
												}
											>
												<AutoComplete
													placeholder="请选择"
													allowClear={true}
													options={mirrorList.map(
														(item: any) => {
															return {
																label: item.address,
																value: item.address
															};
														}
													)}
													style={{
														width: '100%'
													}}
												/>
											</FormItem>
										</div>
									)}
								</li>
							</ul>
						</div>
					</FormBlock>
					<FormBlock title="规格配置">
						<div className={styles['spec-config']}>
							<ul className="form-layout">
								<li className="display-flex form-li">
									<label className="form-name">
										<span
											className="ne-required"
											style={{ marginRight: 8 }}
										>
											模式
										</span>
										<Popover
											content={
												'主节点负责集群管理相关操作；数据节点负责数据存储；协调节点负责负载均衡，路由分发；冷节点负责低优先级数据存储'
											}
											placement="right"
										>
											<QuestionCircleOutlined />
										</Popover>
									</label>
									<div
										className={`form-content display-flex ${styles['es-mode']}`}
									>
										<SelectBlock
											options={modeList}
											currentValue={mode}
											onCallBack={(value: any) =>
												setMode(value)
											}
										/>
										<div
											className={`display-flex ${styles['mode-content']}`}
										>
											{Object.keys(nodeObj).map((key) => (
												<ModeItem
													middlewareType={chartName}
													key={key}
													type={key}
													data={nodeObj[key]}
													clusterId={globalCluster.id}
													namespace={
														globalNamespace.name
													}
													onChange={(values) => {
														setNodeObj({
															...nodeObj,
															[key]: values
														});
													}}
												/>
											))}
										</div>
									</div>
								</li>
							</ul>
						</div>
					</FormBlock>
					{childrenRender(
						customForm,
						form,
						globalCluster,
						globalNamespace
					)}
					<div style={{ marginTop: '40px' }}></div>
					<div className={styles['summit-box']}>
						<Button
							type="primary"
							htmlType="submit"
							style={{ marginRight: 8 }}
							onClick={handleSubmit}
						>
							提交
						</Button>
						<Button onClick={() => window.history.back()}>
							取消
						</Button>
					</div>
				</Form>
			</ProContent>
		</ProPage>
	);
};
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {})(ElasticsearchCreate);
