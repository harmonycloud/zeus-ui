import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
	Form,
	Input,
	Tooltip,
	Switch,
	Select,
	Button,
	InputNumber,
	notification,
	AutoComplete,
	Result,
	Tag
} from 'antd';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import { useHistory, useParams } from 'react-router';
import FormBlock from '@/components/FormBlock';
import SelectBlock from '@/components/SelectBlock';
import TableRadio from '../components/TableRadio';
import Affinity from '@/components/Affinity';

import {
	getNodePort,
	getNodeTaint,
	getStorageClass,
	postMiddleware
} from '@/services/middleware';
import { getMirror } from '@/services/common';
import { getAspectFrom } from '@/services/common';
import { getProjectNamespace } from '@/services/project';

import {
	AffinityLabelsItem,
	AffinityProps,
	CreateParams,
	CreateProps,
	KafkaDTO,
	KafkaSendDataParams,
	TolerationsProps
} from '../catalog';
import { TolerationLabelItem } from '@/components/FormTolerations/formTolerations';
import {
	AutoCompleteOptionItem,
	middlewareDetailProps,
	StorageClassProps
} from '@/types/comment';
import { StoreState } from '@/types';
import { instanceSpecList, kafkaDataList } from '@/utils/const';
import { childrenRender, getCustomFormKeys } from '@/utils/utils';
import pattern from '@/utils/pattern';
import { NamespaceItem } from '@/pages/ProjectDetail/projectDetail';
import {
	CloseCircleFilled,
	PlusOutlined,
	QuestionCircleOutlined
} from '@ant-design/icons';
import styles from './kafka.module.scss';
import ModePost from '../components/ModePost';
import StorageQuota from '@/components/StorageQuota';

const FormItem = Form.Item;

function KafkaCreate(props: CreateProps): JSX.Element {
	const {
		cluster: globalCluster,
		namespace: globalNamespace,
		project
	} = props.globalVar;
	const history = useHistory();
	const params: CreateParams = useParams();
	const [form] = Form.useForm();
	const { chartName, aliasName, chartVersion } = params;
	const [mirrorList, setMirrorList] = useState<any[]>([]);
	// * 主机亲和-start
	const [affinity, setAffinity] = useState<AffinityProps>({
		flag: false,
		label: '',
		checked: false
	});
	const [affinityFlag, setAffinityFlag] = useState<boolean>(false);
	const [affinityLabels, setAffinityLabels] = useState<AffinityLabelsItem[]>(
		[]
	);
	// * 主机亲和 - end
	// * 主机容忍 - start
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
	// * 主机容忍 - end
	// * 日志-start
	const [fileLog, setFileLog] = useState<boolean>(false);
	const [standardLog, setStandardLog] = useState<boolean>(false);
	// * 日志-end
	// * Kafka配置-start
	const [version, setVersion] = useState<string>('2.6.0');
	const versionList = [
		{
			label: '2.6.0',
			value: '2.6.0'
		}
	];
	const [kfkDTO, setKfkDTO] = useState<KafkaDTO>({
		path: '',
		zkAddress: '',
		zkPort: 0
	});
	// * Kafka配置-end
	// * 规格配置 -start
	const [mode, setMode] = useState<string>('cluster');
	const modeList = [
		{
			label: '集群模式（beta版）',
			value: 'cluster'
		}
	];
	const [instanceSpec, setInstanceSpec] = useState<string>('General');
	const [specId, setSpecId] = useState<string>('1');
	const [storageClassList, setStorageClassList] = useState<
		StorageClassProps[]
	>([]);
	const [customCluster, setCustomCluster] = useState<number>(3);
	const [maxCpu, setMaxCpu] = useState<{ max: number }>(); // 自定义cpu的最大值
	const [maxMemory, setMaxMemory] = useState<{ max: number }>(); // 自定义memory的最大值
	// * 外接的动态表单-start
	const [customForm, setCustomForm] = useState<any>();
	// * 外接动态表单-end
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
	// * 集群外访问
	const [hostNetwork, setHostNetwork] = useState<boolean>(false);
	// * 根据命名空间，来提示可编辑的最大最小值
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
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
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
	// * 表单提交
	const handleSubmit = () => {
		form.validateFields().then((values) => {
			const sendData: KafkaSendDataParams = {
				chartName,
				chartVersion,
				clusterId: globalCluster.id,
				namespace:
					globalNamespace.name === '*'
						? values.namespace
						: globalNamespace.name,
				type: 'kafka',
				name: values.name,
				aliasName: values.aliasName,
				labels: values.labels,
				annotations: values.annotations,
				description: values.description,
				version: version,
				mode,
				filelogEnabled: fileLog,
				stdoutEnabled: standardLog,
				kafkaDTO: kfkDTO,
				hostNetwork: hostNetwork,
				quota: {
					kafka: {
						num: customCluster,
						storageClassName: values.storageClass,
						storageClassQuota: values.storageQuota
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
			// * 主机亲和
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
							required: item.checked,
							namespace: globalNamespace.name
						};
					});
				}
			}
			// * 主机容忍
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
			// * 配额
			if (instanceSpec === 'General') {
				switch (specId) {
					case '1':
						sendData.quota.kafka.cpu = 2;
						sendData.quota.kafka.memory = '4Gi';
						break;
					case '2':
						sendData.quota.kafka.cpu = 4;
						sendData.quota.kafka.memory = '8Gi';
						break;
					case '3':
						sendData.quota.kafka.cpu = 8;
						sendData.quota.kafka.memory = '16Gi';
						break;
					case '4':
						sendData.quota.kafka.cpu = 12;
						sendData.quota.kafka.memory = '24Gi';
						break;
					case '5':
						sendData.quota.kafka.cpu = 16;
						sendData.quota.kafka.memory = '32Gi';
						break;
					default:
						break;
				}
			} else if (instanceSpec === 'Customize') {
				sendData.quota.kafka.cpu = values.cpu;
				sendData.quota.kafka.memory = values.memory + 'Gi';
			}
			if (
				values.ingresses?.[0].serviceList.some(
					(item: any) => item.exposePort === null
				)
			) {
				notification.error({
					message: '失败',
					description: '请输入端口号'
				});
				return;
			}
			if (hostNetwork) {
				sendData.ingresses = values.ingresses;
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
	const childrenPostRender = (mode: string) => {
		return (
			<FormItem name="ingresses">
				<ModePost
					mode={mode}
					clusterId={globalCluster.id}
					middlewareName={form.getFieldValue('name')}
					form={form}
					middlewareType={chartName}
					customCluster={customCluster}
				/>
			</FormItem>
		);
	};
	return (
		<ProPage>
			<ProHeader
				title="创建Kafka服务"
				onBack={() => {
					history.push({
						pathname: `/serviceList/${chartName}/${aliasName}`
					});
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
								<li className="display-flex form-li flex-align">
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
									<li className="display-flex form-li flex-align">
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
									<li className="display-flex form-li flex-align">
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
					<FormBlock title="Kafka配置">
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
										<span className="ne-required">
											Zookeeper服务
										</span>
									</label>
									<div
										className={`form-content display-flex ${styles['zeus-zk-service']}`}
									>
										<Input
											className={
												styles['zeus-zk-address']
											}
											placeholder="请输入服务地址"
											value={kfkDTO.zkAddress}
											onChange={(e) =>
												setKfkDTO({
													...kfkDTO,
													zkAddress: e.target.value
												})
											}
										/>
										<InputNumber
											className={styles['zeus-zk-port']}
											style={{ width: '95px' }}
											value={kfkDTO.zkPort}
											placeholder="请输入服务端口"
											onChange={(value: number) =>
												setKfkDTO({
													...kfkDTO,
													zkPort: value
												})
											}
											min={0}
										/>
										<Input
											className={styles['zeus-zk-path']}
											value={kfkDTO.path}
											placeholder="请输入服务路径"
											onChange={(e) =>
												setKfkDTO({
													...kfkDTO,
													path: e.target.value
												})
											}
										/>
									</div>
								</li>
								{mirrorList.length && (
									<li className="display-flex">
										<label className="form-name">
											<span
												className="ne-required"
												style={{ marginRight: 8 }}
											>
												镜像仓库
											</span>
										</label>
										<div className="form-content">
											<FormItem
												name="mirrorImageId"
												required
												rules={[
													{
														required: true,
														message:
															'请选择镜像仓库'
													}
												]}
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
																value: item.address,
																label: item.address
															};
														}
													)}
													style={{
														width: '100%'
													}}
												/>
											</FormItem>
										</div>
									</li>
								)}
							</ul>
						</div>
					</FormBlock>
					<FormBlock title="规格配置">
						<div className={styles['spec-config']}>
							<ul className="form-layout">
								<li className="display-flex form-li flex-align">
									<label className="form-name">
										<span style={{ marginRight: 8 }}>
											模式
										</span>
										<Tooltip title="集群模式中，具备自动选举leader能力，保证高可用">
											<QuestionCircleOutlined />
										</Tooltip>
									</label>
									<div
										className={`form-content display-flex ${styles['custom-cluster-number']}`}
									>
										<SelectBlock
											options={modeList}
											currentValue={mode}
											onCallBack={(value: any) =>
												setMode(value)
											}
										/>
										<label
											className={
												styles[
													'custom-cluster-number-label'
												]
											}
										>
											自定义集群实例数量
										</label>
										<InputNumber
											min={3}
											value={customCluster}
											onChange={(value: number) =>
												setCustomCluster(value)
											}
											max={10}
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
													dataList={kafkaDataList}
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
																rules={[
																	{
																		min: 0.1,
																		type: 'number',
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
																		type: 'number',
																		message: `最小为0.1,不能超过当前分区配额剩余的最大值（${maxCpu?.max}Core）`
																	}
																]}
																required
																name="cpu"
															>
																<InputNumber
																	style={{
																		width: '100%'
																	}}
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
																		type: 'number',
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
																		type: 'number',
																		message: `最小为0.1,不能超过当前分区配额剩余的最大值（${maxMemory?.max}Gi`
																	}
																]}
																required
															>
																<InputNumber
																	style={{
																		width: '100%'
																	}}
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
								<StorageQuota clusterId={globalCluster.id} />
								{/* <li className="display-flex">
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
												style={{
													marginRight: 8,
													width: 150
												}}
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
								</li> */}
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
								{hostNetwork && childrenPostRender(mode)}
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
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps)(KafkaCreate);
