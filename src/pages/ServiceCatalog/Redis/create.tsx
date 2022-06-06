import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import FormBlock from '@/components/FormBlock';
import SelectBlock from '@/components/SelectBlock';
import TableRadio from '../components/TableRadio/index';
import {
	Input,
	Switch,
	Checkbox,
	Select,
	AutoComplete,
	Button,
	Popover,
	Form,
	notification,
	Result,
	InputNumber
} from 'antd';
import {
	QuestionCircleOutlined,
	PlusOutlined,
	CloseCircleFilled
} from '@ant-design/icons';
import pattern from '@/utils/pattern';
import styles from './redis.module.scss';
import {
	getNodePort,
	getNodeTaint,
	getStorageClass,
	postMiddleware
} from '@/services/middleware';
import { getMirror } from '@/services/common';
import ModeItem from '@/components/ModeItem';
import { instanceSpecList } from '@/utils/const';
import {
	CreateProps,
	CreateParams,
	AffinityProps,
	AffinityLabelsItem,
	TolerationsProps,
	RedisSendDataParams,
	RedisCreateValuesParams,
	NodeModifyParams,
	NodeObjParams
} from '../catalog';
import { getCustomFormKeys, childrenRender } from '@/utils/utils';
import { TolerationLabelItem } from '@/components/FormTolerations/formTolerations';
import {
	middlewareDetailProps,
	StorageClassProps,
	MirrorItem,
	AutoCompleteOptionItem
} from '@/types/comment';
import { StoreState } from '@/types';
// * 外接动态表单相关
import { getAspectFrom } from '@/services/common';

import { NamespaceItem } from '@/pages/ProjectDetail/projectDetail';
import { getProjectNamespace } from '@/services/project';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

const { Item: FormItem } = Form;
const RedisCreate: (props: CreateProps) => JSX.Element = (
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
	const history = useHistory();

	// 主机亲和
	const [affinity, setAffinity] = useState<AffinityProps>({
		flag: false,
		label: '',
		checked: false
	});
	const [labelList, setLabelList] = useState<AutoCompleteOptionItem[]>([]);
	const [mirrorList, setMirrorList] = useState<MirrorItem[]>([]);
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

	// Redis配置
	const [version, setVersion] = useState<string>('5.0');
	const versionList = [
		{
			label: '5.0',
			value: '5.0'
		}
	];
	const [mode, setMode] = useState<string>('cluster');
	const modeList = [
		{
			label: '集群模式',
			value: 'cluster'
		},
		{
			label: '哨兵模式',
			value: 'sentinel'
		}
	];
	const [clusterMode, setClusterMode] = useState<string>('3s-3m');
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
	const [nodeObj, setNodeObj] = useState<NodeObjParams>({
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
	const [nodeModify, setNodeModify] = useState<NodeModifyParams>({
		nodeName: '',
		flag: false
	});
	const [instanceSpec, setInstanceSpec] = useState<string>('General');
	const [specId, setSpecId] = useState<string>('1');
	const [storageClassList, setStorageClassList] = useState<
		StorageClassProps[]
	>([]);
	const [maxCpu, setMaxCpu] = useState<{ max: number }>(); // 自定义cpu的最大值
	const [maxMemory, setMaxMemory] = useState<{ max: number }>(); // 自定义memory的最大值
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
	// * 当导航栏的命名空间为全部时
	const [namespaceList, setNamespaceList] = useState<NamespaceItem[]>([]);
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

	const formHandle = (obj: any, item: any) => {
		if (
			['cpu', 'memory', 'storageClass', 'storageQuota'].indexOf(
				item.name
			) > -1 &&
			mode === 'sentinel'
		) {
			const temp = nodeObj[nodeModify.nodeName];
			temp[item.name] = item.value;
			setNodeObj({
				...nodeObj,
				[nodeModify.nodeName]: temp
			});
		}
	};

	const modifyQuota = (key: string) => {
		setNodeModify({
			nodeName: key,
			flag: true
		});
		setSpecId(nodeObj[key].specId);
		if (nodeObj[key].specId === '') {
			setInstanceSpec('Customize');
			form.setFieldsValue({
				cpu: nodeObj[key].cpu,
				memory: nodeObj[key].memory
			});
		} else {
			setInstanceSpec('General');
		}
		form.setFieldsValue({
			storageClass: nodeObj[key].storageClass,
			storageQuota: nodeObj[key].storageQuota
		});
	};

	const checkGeneral = (value: any) => {
		setSpecId(value);
		const temp = nodeObj[nodeModify.nodeName];
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
		form.validateFields().then((values: RedisCreateValuesParams) => {
			const sendData: RedisSendDataParams = {
				chartName: chartName,
				chartVersion: chartVersion,
				clusterId: globalCluster.id,
				namespace:
					globalNamespace.name === '*'
						? values.namespace
						: globalNamespace.name,
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
				quota: { redis: {} },
				mirrorImageId:
					mirrorList
						.find(
							(item: MirrorItem) =>
								item.address === values.mirrorImageId
						)
						?.id.toString() || ''
				// mirrorImageId: mirrorList.find(
				// 	(item) => item.address === values['mirrorImageId']
				// )
				// 	? mirrorList
				// 			.find(
				// 				(item) =>
				// 					item.address === values['mirrorImageId']
				// 			)
				// 			.id.toString()
				// 	: ''
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
					sendData.quota = { redis: {} };
					for (const key in nodeObj) {
						if (!nodeObj[key].disabled) {
							if (nodeObj[key].storageClass === '') {
								modifyQuota(key);
								return;
							}
							if (nodeObj[key].storageQuota === 0) {
								notification.error({
									message: '失败',
									description: `${key}节点存储配额不能为0`
								});
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
				title="发布Redis服务"
				className="page-header"
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
											<FormItem
												rules={[
													{
														required: true,
														message:
															'请输入命名空间'
													}
												]}
												name="namespace"
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
											name="name"
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
														'请输入key=value格式的注解，多个注解以英文逗号分隔'
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
					<FormBlock title="调度策略">
						<div className={styles['schedule-strategy']}>
							<ul className="form-layout">
								<li className="display-flex flex-center form-li">
									<label className="form-name">
										<span style={{ marginRight: 8 }}>
											主机亲和
										</span>
										<Popover
											content={
												'勾选强制亲和时，服务只会部署在具备相应标签的主机上，若主机资源不足，可能会导致启动失败'
											}
										>
											<QuestionCircleOutlined />
										</Popover>
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
														icon={
															<PlusOutlined
																style={{
																	color: '#005AA5'
																}}
															/>
														}
													></Button>
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
														onClick={() =>
															setAffinityLabels(
																affinityLabels.filter(
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
								<li className="display-flex flex-center form-li">
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
																// changeTolerations(
																// 	'',
																// 	'label'
																// );
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
									<li className="display-flex flex-center form-li">
										<label className="form-name">
											<span style={{ marginRight: 8 }}>
												文件日志收集
											</span>
											<Popover
												content={
													<span
														style={{
															lineHeight: '18px'
														}}
													>
														安装日志采集组件ES后，开启日志收集按钮，会将该类型日志存储于ES中，若您现在不开启，发布完之后再开启，将导致服务重启。
													</span>
												}
											>
												<QuestionCircleOutlined />
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
									<li className="display-flex flex-center form-li">
										<label className="form-name">
											<span style={{ marginRight: 8 }}>
												标准日志收集
											</span>
											<Popover
												content={
													<span
														style={{
															lineHeight: '18px'
														}}
													>
														安装日志采集组件ES后，开启日志收集按钮，会将该类型日志存储于ES中，若您现在不开启，发布完之后再开启，将导致服务重启。
													</span>
												}
											>
												<QuestionCircleOutlined />
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
											onCallBack={(value: any) =>
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
												type="password"
												name="pwd"
												placeholder="请输入初始密码，输入空则由平台随机生成"
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
													onCallBack={(value: any) =>
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
													(key) => (
														<ModeItem
															key={key}
															type={key}
															data={nodeObj[key]}
															clusterId={
																globalCluster.id
															}
															namespace={
																globalNamespace.name
															}
															onChange={(
																values
															) => {
																setNodeObj({
																	...nodeObj,
																	[key]: values
																});
															}}
														/>
													)
												)}
											</div>
										) : null}
									</div>
								</li>
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
															onCallBack={(
																value: any
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
																		rules={[
																			{
																				required:
																					true,
																				message:
																					'请输入自定义CPU配额，单位为Core'
																			},
																			{
																				type: 'number',
																				min: 0.1,
																				...maxCpu,
																				message: `最小为0.1,不能超过当前分区配额剩余的最大值（${
																					maxCpu?.max ||
																					''
																				}Core）`
																			}
																		]}
																		name="cpu"
																	>
																		<InputNumber
																			step={
																				0.1
																			}
																			style={{
																				width: '100%'
																			}}
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
																		rules={[
																			{
																				required:
																					true,
																				message:
																					'请输入自定义内存配额，单位为Gi'
																			},
																			{
																				type: 'number',
																				min: 0.1,
																				...maxMemory,
																				message: `最小为0.1,不能超过当前分区配额剩余的最大值（${
																					maxMemory?.max ||
																					''
																				}Gi`
																			}
																		]}
																		name="memory"
																	>
																		<InputNumber
																			step={
																				0.1
																			}
																			style={{
																				width: '100%'
																			}}
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
														rules={[
															{
																required: true,
																message:
																	'请选择存储类型'
															}
														]}
														name="storageClass"
													>
														<Select
															style={{
																marginRight: 8,
																width: 150
															}}
															placeholder="请选择"
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
														rules={[
															{
																required: true,
																message:
																	'请输入存储配额大小（GB）'
															},
															{
																pattern:
																	new RegExp(
																		pattern.posInt
																	),
																message:
																	'请输入小于21位的正整数'
															}
														]}
														name="storageQuota"
														initialValue={5}
													>
														<InputNumber
															style={{
																width: '100%'
															}}
															placeholder="请输入存储配额大小"
															addonAfter="GB"
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
					{childrenRender(
						customForm,
						form,
						globalCluster,
						globalNamespace
					)}
					<div className={styles['summit-box']}>
						<Button
							type="primary"
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
export default connect(mapStateToProps, {})(RedisCreate);
