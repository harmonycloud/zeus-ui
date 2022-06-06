import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import {
	Form,
	Input,
	Switch,
	Checkbox,
	Tooltip,
	Select,
	Button,
	notification,
	Result,
	AutoComplete,
	InputNumber
} from 'antd';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import FormBlock from '@/components/FormBlock';
import SelectBlock from '@/components/SelectBlock';
import TableRadio from '../components/TableRadio/index';
import RocketACLForm from '@/components/RocketACLForm';
import { TolerationLabelItem } from '@/components/FormTolerations/formTolerations';
import {
	getNodePort,
	getNodeTaint,
	getStorageClass,
	postMiddleware
} from '@/services/middleware';
import { getMirror } from '@/services/common';
import {
	CreateProps,
	CreateParams,
	AffinityProps,
	AffinityLabelsItem,
	TolerationsProps,
	RMQSendDataParams,
	RMQCreateValuesParams
} from '../catalog';
import { StoreState } from '@/types';
import { middlewareDetailProps, StorageClassProps } from '@/types/comment';
import pattern from '@/utils/pattern';
import { instanceSpecList } from '@/utils/const';
// * 外接动态表单相关
import { getAspectFrom } from '@/services/common';
import { getCustomFormKeys, childrenRender } from '@/utils/utils';
import styles from './rocketmq.module.scss';
import { NamespaceItem } from '@/pages/ProjectDetail/projectDetail';
import { getProjectNamespace } from '@/services/project';
import {
	CloseCircleFilled,
	PlusOutlined,
	QuestionCircleOutlined
} from '@ant-design/icons';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const { Item: FormItem } = Form;

const RocketMQCreate: (props: CreateProps) => JSX.Element = (
	props: CreateProps
) => {
	const {
		cluster: globalCluster,
		namespace: globalNamespace,
		project
	} = props.globalVar;
	const params: CreateParams = useParams();
	const { chartName, chartVersion, aliasName } = params;
	const [form] = Form.useForm();
	// const field = Field.useField();
	const history = useHistory();

	// 主机亲和
	const [affinity, setAffinity] = useState<AffinityProps>({
		flag: false,
		label: '',
		checked: false
	});
	const [labelList, setLabelList] = useState<string[]>([]);
	const [mirrorList, setMirrorList] = useState<any[]>([]);
	const changeAffinity = (value: any, key: string) => {
		setAffinity({
			...affinity,
			[key]: value
		});
	};
	const [affinityLabels, setAffinityLabels] = useState<AffinityLabelsItem[]>(
		[]
	);
	// 主机容忍
	const [tolerations, setTolerations] = useState<TolerationsProps>({
		flag: false,
		label: ''
	});
	const [tolerationList, setTolerationList] = useState<string[]>([]);
	const changeTolerations = (value: any, key: string) => {
		setTolerations({
			...tolerations,
			[key]: value
		});
	};
	const [tolerationsLabels, setTolerationsLabels] = useState<
		TolerationLabelItem[]
	>([]);

	// * 当导航栏的命名空间为全部时
	const [namespaceList, setNamespaceList] = useState<NamespaceItem[]>([]);

	// 日志
	const [fileLog, setFileLog] = useState<boolean>(false);
	const [standardLog, setStandardLog] = useState<boolean>(false);

	// RMQ配置
	const [version, setVersion] = useState<string>('4.8');
	const versionList = [
		{
			label: '4.8',
			value: '4.8'
		}
	];
	const [mode, setMode] = useState<string>('2m-noslave');
	const modeList = [
		{
			label: '双主',
			value: '2m-noslave'
		},
		{
			label: '两主两从',
			value: '2m-2s'
		},
		{
			label: '三主三从',
			value: '3m-3s'
		},
		{
			label: 'DLedger模式',
			value: 'dledger'
		}
	];
	const [instanceSpec, setInstanceSpec] = useState<string>('General');
	const [specId, setSpecId] = useState<string>('1');
	const [storageClassList, setStorageClassList] = useState<
		StorageClassProps[]
	>([]);
	const [maxCpu, setMaxCpu] = useState<{ max: number }>(); // 自定义cpu的最大值
	const [maxMemory, setMaxMemory] = useState<{ max: number }>(); // 自定义memory的最大值
	// * acl相关
	const [aclCheck, setAclCheck] = useState<boolean>(false);
	// * 外接的动态表单
	const [customForm, setCustomForm] = useState<any>();
	// * 集群外访问
	const [hostNetwork, setHostNetwork] = useState<boolean>(false);
	// * 是否点击提交跳转至结果页
	const [commitFlag, setCommitFlag] = useState<boolean>(false);
	// * 发布成功
	const [successFlag, setSuccessFlag] = useState<boolean>(false);
	// * 发布失败
	const [errorFlag, setErrorFlag] = useState<boolean>(false);
	// * 创建返回的服务名称
	const [createData, setCreateData] = useState<middlewareDetailProps>();
	// * DLedger模式节点数量
	const [replicaCount, setReplicaCount] = useState(1);

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

	const handleSubmit = () => {
		form.validateFields().then((values) => {
			const sendData: RMQSendDataParams = {
				chartName: chartName,
				chartVersion: chartVersion,
				clusterId: globalCluster.id,
				namespace:
					globalNamespace.name === '*'
						? values.namespace
						: globalNamespace.name,
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
				},
				mirrorImageId: mirrorList.find(
					(item) => item.address === values['mirrorImageId']
				)
					? mirrorList
							.find(
								(item) =>
									item.address === values['mirrorImageId']
							)
							.id.toString()
					: ''
			};
			if (mode === 'dledger') {
				sendData.rocketMQParam.replicas = replicaCount;
			}
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
			if (affinity.flag) {
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
				sendData.rocketMQParam.acl.globalWhiteRemoteAddresses =
					values.globalWhiteRemoteAddresses;
				sendData.rocketMQParam.acl.rocketMQAccountList =
					values.rocketMQAccountList;
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

	// 全局集群、分区更新
	useEffect(() => {
		if (
			JSON.stringify(globalCluster) !== '{}' &&
			JSON.stringify(globalNamespace) !== '{}'
		) {
			getNodePort({ clusterId: globalCluster.id }).then((res) => {
				if (res.success) {
					setLabelList(res.data);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
			getNodeTaint({ clusterid: globalCluster.id }).then((res) => {
				if (res.success) {
					setTolerationList(res.data);
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
			getStorageClass({
				clusterId: globalCluster.id,
				namespace: globalNamespace.name
			}).then((res) => {
				if (res.success) {
					setStorageClassList(res.data);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		}
	}, [globalCluster, globalNamespace]);

	// * 结果页相关
	if (commitFlag) {
		return (
			<ProPage>
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
				title="发布RocketMQ服务"
				onBack={() => {
					window.history.back();
				}}
			/>
			<ProContent>
				<Form form={form}>
					{globalNamespace.name === '*' && (
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
											<FormItem required name="namespace">
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
											required
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
											name="aliasName"
											rules={[
												{
													min: 2,
													message:
														'请输入由汉字、字母、数字及“-”或“.”或“_”组成的2-80个字符'
												},
												{
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
											name="labels"
											rules={[
												{
													pattern: new RegExp(
														pattern.labels
													),
													message:
														'请输入key=value格式的标签，多个标签以英文逗号分隔'
												}
											]}
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
											name="annotations"
											rules={[
												{
													pattern: new RegExp(
														pattern.labels
													),
													message:
														'请输入key=value格式的注解，多个注解以英文逗号分隔'
												}
											]}
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
										checked={aclCheck}
										onChange={(checked: boolean) =>
											setAclCheck(checked)
										}
									/>
								</span>
							</span>
						}
					>
						{aclCheck ? (
							<div className={styles['acl-config']}>
								<RocketACLForm form={form} />
							</div>
						) : null}
					</FormBlock>
					<FormBlock title="调度策略">
						<div className={styles['schedule-strategy']}>
							<ul className="form-layout">
								<li className="display-flex form-li flex-align">
									<label className="form-name">
										<span style={{ marginRight: 8 }}>
											主机亲和
										</span>
										<Tooltip title="勾选强制亲和时，服务只会部署在具备相应标签的主机上，若主机资源不足，可能会导致启动失败">
											<QuestionCircleOutlined />
										</Tooltip>
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
													<AutoComplete
														value={affinity.label}
														onChange={(value) =>
															changeAffinity(
																value,
																'label'
															)
														}
														allowClear={true}
														dataSource={labelList}
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
															affinity.label
																? false
																: true
														}
														onClick={() => {
															if (
																!affinityLabels.find(
																	(item) =>
																		item.label ===
																		affinity.label
																)
															) {
																setAffinityLabels(
																	[
																		...affinityLabels,
																		{
																			label: affinity.label,
																			id: Math.random()
																		}
																	]
																);
															}
														}}
													>
														<PlusOutlined
															style={{
																color: '#005AA5'
															}}
														/>
													</Button>
												</div>
												<div
													className={styles['check']}
												>
													<Checkbox
														checked={
															affinity.checked
														}
														onChange={(
															e: CheckboxChangeEvent
														) =>
															changeAffinity(
																e.target
																	.checked,
																'checked'
															)
														}
													>
														强制亲和
													</Checkbox>
												</div>
											</>
										) : null}
									</div>
								</li>
								{affinity.flag && affinityLabels.length ? (
									<div className={styles['tags']}>
										{affinityLabels.map((item) => {
											return (
												<p
													className={styles['tag']}
													key={item.label}
												>
													<span>{item.label}</span>
													<CloseCircleFilled
														className={
															styles['tag-close']
														}
														onClick={() => {
															if (
																!affinityLabels.find(
																	(item) =>
																		item.label ===
																		affinity.label
																)
															) {
																setAffinityLabels(
																	[
																		...affinityLabels,
																		{
																			label: affinity.label,
																			id: Math.random()
																		}
																	]
																);
																changeAffinity(
																	'',
																	'label'
																);
															}
														}}
													/>
													{/* <Icon
														type="error"
														size="xs"
														className={
															styles['tag-close']
														}
														onClick={() => {
															if (
																!affinityLabels.find(
																	(item) =>
																		item.label ===
																		affinity.label
																)
															) {
																setAffinityLabels(
																	[
																		...affinityLabels,
																		{
																			label: affinity.label,
																			id: Math.random()
																		}
																	]
																);
																changeAffinity(
																	'',
																	'label'
																);
															}
														}}
													/> */}
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
													>
														<PlusOutlined
															style={{
																color: '#005AA5'
															}}
														/>
													</Button>
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
												<p
													className={styles['tag']}
													key={item.label}
												>
													<span>{item.label}</span>
													<CloseCircleFilled
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
						<div className={styles['log-collection-content']}>
							<div className={styles['log-collection']}>
								<ul className="form-layout">
									<li className="display-flex form-li">
										<label className="form-name">
											<span style={{ marginRight: 8 }}>
												文件日志收集
											</span>
											<Tooltip title="安装日志采集组件ES后，开启日志收集按钮，会将该类型日志存储于ES中，若您现在不开启，发布完之后再开启，将导致服务重启。">
												<QuestionCircleOutlined />
											</Tooltip>
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
									<li className="display-flex form-li">
										<label className="form-name">
											<span style={{ marginRight: 8 }}>
												标准日志收集
											</span>
											<Tooltip title="安装日志采集组件ES后，开启日志收集按钮，会将该类型日志存储于ES中，若您现在不开启，发布完之后再开启，将导致服务重启。">
												<QuestionCircleOutlined />
											</Tooltip>
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
											onCallBack={(value: any) =>
												setVersion(value)
											}
										/>
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
									<div
										className="form-content"
										style={{ flex: '0 0 376px' }}
									>
										<FormItem
											required
											name="mirrorImageId"
											rules={[
												{
													required: true,
													message: '请选择镜像仓库'
												}
											]}
										>
											<AutoComplete
												placeholder="请选择"
												allowClear={true}
												defaultValue={
													mirrorList[0]?.address
												}
												dataSource={mirrorList.map(
													(item: any) => item.address
												)}
												style={{
													width: '100%'
												}}
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
										<span style={{ marginRight: 8 }}>
											模式
										</span>
										<Tooltip
											title={
												<>
													<p>
														双主：主实例宕机期间，未被消费的信息在机器未恢复之前不可消费
													</p>
													<p>
														两主两丛：主实例宕机期间，从实例仍可以对外提供消息的消费，但不支持写入，从实例无法自动切换为主实例
													</p>
													<p>
														三主三从：主实例宕机期间，从实例仍可以对外提供消息的消费，但不支持写入，从实例无法自动切换为主实例
													</p>
													<p>
														多副本模式：即DLedger模式，主实例宕机期间，自动进行选主，不影响消息的写入和消费
													</p>
												</>
											}
										>
											<QuestionCircleOutlined />
										</Tooltip>
									</label>
									<div
										className={`form-content display-flex`}
									>
										<SelectBlock
											options={modeList}
											currentValue={mode}
											onCallBack={(value: any) =>
												setMode(value)
											}
										/>
										<div
											style={{
												display:
													mode === 'dledger'
														? 'block'
														: 'none'
											}}
										>
											<label style={{ margin: '0 16px' }}>
												自定义集群实例数量
											</label>
											<InputNumber
												name="节点数量"
												defaultValue={3}
												onChange={(value) =>
													setReplicaCount(value)
												}
												min={3}
												max={10}
											/>
										</div>
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
											onCallBack={(value: any) =>
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
													onCallBack={(value: any) =>
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
																name="cpu"
																rules={[
																	{
																		min: 0.1,
																		message: `最小为0.1,不能超过当前分区配额剩余的最大值（${maxCpu?.max}Core）`
																	},
																	{
																		required:
																			true,
																		message:
																			'请输入自定义CPU配额，单位为Core'
																	},
																	{
																		max: maxCpu?.max,
																		message: `最小为0.1,不能超过当前分区配额剩余的最大值（${maxCpu?.max}Core）`
																	}
																]}
																required
															>
																<InputNumber
																	step={0.1}
																	placeholder="请输入自定义CPU配额，单位为Core"
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
																name="memory"
																rules={[
																	{
																		min: 0.1,
																		message: `最小为0.1,不能超过当前分区配额剩余的最大值（${maxMemory?.max}Gi`
																	},
																	{
																		required:
																			true,
																		message:
																			'请输入自定义内存配额，单位为Gi'
																	},
																	{
																		max: maxMemory?.max,
																		message: `最小为0.1,不能超过当前分区配额剩余的最大值（${maxMemory?.max}Gi`
																	}
																]}
																required
															>
																<InputNumber
																	step={0.1}
																	placeholder="请输入自定义内存配额，单位为Gi"
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
											name="storageClass"
											required
											rules={[
												{
													required: true,
													message: '请选择存储类型'
												}
											]}
										>
											<Select
												placeholder="请选择存储类型"
												style={{ marginRight: 8 }}
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
											name="storageQuota"
											rules={[
												{
													pattern: new RegExp(
														pattern.posInt
													),
													message:
														'请输入小于21位的正整数'
												},
												{
													required: true,
													message:
														'请输入存储配额大小（GB）'
												}
											]}
											required
											initialValue={5}
										>
											<InputNumber
												placeholder="请输入存储配额大小"
												addonAfter="GB"
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
											主机网络
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
						form,
						globalCluster,
						globalNamespace
					)}
					<div className={styles['summit-box']}>
						<Button
							type="primary"
							htmlType="submit"
							style={{ marginRight: 8 }}
							onClick={handleSubmit}
						>
							提交
						</Button>
						<Button
							type="default"
							onClick={() => window.history.back()}
						>
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
export default connect(mapStateToProps, {})(RocketMQCreate);
