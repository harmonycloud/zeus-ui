import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import {
	Form,
	Input,
	Switch,
	Tooltip,
	Select,
	Button,
	notification,
	Result,
	AutoComplete,
	InputNumber,
	Tag
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
	getMiddlewareDetail,
	postMiddleware
} from '@/services/middleware';
import { getMirror } from '@/services/common';
import {
	CreateProps,
	CreateParams,
	AffinityProps,
	AffinityLabelsItem,
	TolerationsProps,
	RMQSendDataParams
} from '../catalog';
import { applyBackup } from '@/services/backup';
import Affinity from '@/components/Affinity';
import { StoreState } from '@/types';
import { AutoCompleteOptionItem, middlewareDetailProps } from '@/types/comment';
import pattern from '@/utils/pattern';
import { instanceSpecList, mqDataList } from '@/utils/const';
// * 外接动态表单相关
import { getAspectFrom } from '@/services/common';
import { getCustomFormKeys, childrenRender } from '@/utils/utils';
import styles from './rocketmq.module.scss';
import { NamespaceItem } from '@/pages/ProjectDetail/projectDetail';
import { getProjectNamespace } from '@/services/project';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ModePost from '../components/ModePost';
import StorageQuota from '@/components/StorageQuota';
import storage from '@/utils/storage';
import transUnit from '@/utils/transUnit';
import VersionForm from '../components/VersionForm';

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
	const { chartName, chartVersion, aliasName, middlewareName, namespace } =
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
	const [affinityFlag, setAffinityFlag] = useState<boolean>(false);
	// * 主机反亲和
	const [antiFlag, setAntiFlag] = useState<boolean>(false);
	const [antiLabels, setAntiLabels] = useState<AffinityLabelsItem[]>([]);
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

	// * 当导航栏的命名空间为全部时
	const [namespaceList, setNamespaceList] = useState<NamespaceItem[]>([]);

	// 日志
	const [fileLog, setFileLog] = useState<boolean>(true);
	const [standardLog, setStandardLog] = useState<boolean>(true);

	// RMQ配置
	const [version, setVersion] = useState<string>('');
	// const versionList = [
	// 	{
	// 		label: '4.8.0',
	// 		value: '4.8.0'
	// 	}
	// ];
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
	const [maxCpu, setMaxCpu] = useState<{ max: number }>(); // 自定义cpu的最大值
	const [maxMemory, setMaxMemory] = useState<{ max: number }>(); // 自定义memory的最大值
	// * acl相关
	const [aclCheck, setAclCheck] = useState<boolean>(false);
	const [aclData, setAclData] = useState();
	// * 外接的动态表单
	const [customForm, setCustomForm] = useState<any>();
	// * 集群外访问
	// const [hostNetwork, setHostNetwork] = useState<boolean>(false);
	// * 是否点击提交跳转至结果页
	const [commitFlag, setCommitFlag] = useState<boolean>(false);
	// * 发布成功
	const [successFlag, setSuccessFlag] = useState<boolean>(false);
	// * 发布失败
	const [errorFlag, setErrorFlag] = useState<boolean>(false);
	// * 创建返回的服务名称
	const [createData, setCreateData] = useState<middlewareDetailProps>();
	// * 创建失败返回的失败信息
	const [errorData, setErrorData] = useState<string>('');
	// * DLedger模式节点数量
	const [replicaCount, setReplicaCount] = useState(3);
	// * DLedger模式组数
	const [groupCount, setGroupCount] = useState(2);

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
			getProjectNamespace({
				projectId: project.projectId,
				clusterId: globalCluster.id
			}).then((res) => {
				if (res.success) {
					const list = res.data.filter(
						(item: NamespaceItem) => item.availableDomain !== true
					);
					setNamespaceList(list);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		}
	}, [project, globalNamespace]);

	const handleSubmit = () => {
		form.validateFields().then((values) => {
			console.log(values);
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
				// hostNetwork: hostNetwork,
				quota: {
					rocketmq: {
						storageClassName: values.storageClass.split('/')[0],
						storageClassQuota: values.storageQuota
					}
				},
				rocketMQParam: {
					acl: {
						enable: aclCheck || false
					},
					autoCreateTopicEnable: values.autoCreateTopicEnable
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
				sendData.rocketMQParam.group = groupCount;
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
			// * 主机亲和
			if (affinityFlag) {
				if (!affinityLabels.length) {
					notification.error({
						message: '错误',
						description: '请选择主机亲和。'
					});
					return;
				} else {
					const nodeAffinity = affinityLabels.map((item) => {
						return {
							label: item.label,
							required: item.checked || item.required || false,
							anti: item.anti,
							namespace: globalNamespace.name
						};
					});
					const nodeAnti = antiLabels.map((item) => {
						return {
							label: item.label,
							required: item.checked || item.required || false,
							anti: item.anti,
							namespace: globalNamespace.name
						};
					});
					if (antiFlag) {
						sendData.nodeAffinity = nodeAffinity.concat(nodeAnti);
					} else {
						sendData.nodeAffinity = nodeAffinity;
					}
				}
			}
			if (antiFlag) {
				if (!antiLabels.length) {
					notification.error({
						message: '错误',
						description: '请选择主机反亲和。'
					});
					return;
				} else {
					const nodeAffinity = affinityLabels.map((item) => {
						return {
							label: item.label,
							required: item.checked || item.required || false,
							anti: item.anti,
							namespace: globalNamespace.name
						};
					});
					const nodeAnti = antiLabels.map((item) => {
						return {
							label: item.label,
							required: item.checked || item.required || false,
							anti: item.anti,
							namespace: globalNamespace.name
						};
					});
					if (affinityFlag) {
						sendData.nodeAffinity = nodeAffinity.concat(nodeAnti);
					} else {
						sendData.nodeAffinity = nodeAnti;
					}
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
						sendData.quota.rocketmq.cpu = 2;
						sendData.quota.rocketmq.memory = '4Gi';
						break;
					case '2':
						sendData.quota.rocketmq.cpu = 4;
						sendData.quota.rocketmq.memory = '8Gi';
						break;
					case '3':
						sendData.quota.rocketmq.cpu = 8;
						sendData.quota.rocketmq.memory = '16Gi';
						break;
					case '4':
						sendData.quota.rocketmq.cpu = 12;
						sendData.quota.rocketmq.memory = '24Gi';
						break;
					case '5':
						sendData.quota.rocketmq.cpu = 16;
						sendData.quota.rocketmq.memory = '32Gi';
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
			// if (hostNetwork) {
			// 	sendData.ingresses = values.ingresses;
			// }
			if (namespace) {
				sendData.namespace = namespace;
			}
			// 克隆服务
			if (middlewareName) {
				const result = {
					clusterId: globalCluster.id,
					namespace: namespace,
					middlewareName: values.name,
					type: storage.getLocal('backupDetail').sourceType,
					backupName:
						storage.getLocal('backupDetail').pause === 'off'
							? storage.getLocal('backupDetail').newBackupName
							: storage.getLocal('backupDetail').backupName
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
			// console.log(sendData);
			setCommitFlag(true);
			postMiddleware(sendData).then((res) => {
				if (res.success) {
					setCreateData(res.data);
					setSuccessFlag(true);
					setErrorFlag(false);
					setCommitFlag(false);
				} else {
					setErrorData(res.errorMsg);
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
							label: item,
							value: item
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
							label: item,
							value: item
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
			console.log(params);

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
			type: 'rocketmq'
		}).then((res) => {
			if (!res.data) return;
			setInstanceSpec('Customize');
			if (res.data?.nodeAffinity?.length > 0) {
				setAffinity({
					flag: true,
					label: '',
					checked: false
				});
				setAffinityLabels(res.data?.nodeAffinity || []);
			}
			if (res.data?.tolerations?.length) {
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
				setMode(res.data.mode);
			}
			if (res.data.version) {
				setVersion(res.data.version);
			}
			setAclCheck(res.data?.rocketMQParam?.acl?.enable);
			setAclData(res.data?.rocketMQParam.acl);
			form.setFieldsValue({
				name: res.data.name + '-backup',
				labels: res.data.labels,
				annotations: res.data.annotations,
				description: res.data.description,
				password: res.data.password,
				cpu: Number(res.data.quota.rocketmq.cpu),
				memory: Number(
					transUnit.removeUnit(res.data.quota.rocketmq.memory, 'Gi')
				),
				mirrorImageId: res.data.mirrorImage,
				storageClass: res.data.quota.rocketmq.storageClassName,
				storageQuota: transUnit.removeUnit(
					res.data.quota.rocketmq.storageClassQuota,
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
						subTitle={errorData}
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
	// const childrenPostRender = (mode: string) => {
	// 	return (
	// 		<FormItem name="ingresses" noStyle>
	// 			<ModePost
	// 				mode={mode}
	// 				clusterId={globalCluster.id}
	// 				middlewareName={form.getFieldValue('name')}
	// 				form={form}
	// 				middlewareType={chartName}
	// 			/>
	// 		</FormItem>
	// 	);
	// };
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
											<FormItem required name="namespace">
												<Select
													placeholder="请选择命名空间"
													style={{ width: '100%' }}
													dropdownMatchSelectWidth={
														false
													}
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
																	<p
																		title={
																			item.aliasName
																		}
																	>
																		{item
																			.aliasName
																			.length >
																		30
																			? item.aliasName.substring(
																					0,
																					30
																			  ) +
																			  '...'
																			: item.aliasName}
																	</p>
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
										disabled={!!middlewareName}
									/>
								</span>
							</span>
						}
					>
						{aclCheck ? (
							<div className={styles['acl-config']}>
								<RocketACLForm
									form={form}
									data={aclData}
									disabled={!!middlewareName}
								/>
							</div>
						) : null}
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
									disabled={!!middlewareName}
								/>
								<Affinity
									flag={antiFlag}
									flagChange={setAntiFlag}
									values={antiLabels}
									onChange={setAntiLabels}
									cluster={globalCluster}
									disabled={!!middlewareName}
									isAnti
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
												disabled={!!middlewareName}
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
														onBlur={() => {
															if (
																tolerations.label &&
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
													disabled={!!middlewareName}
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
													disabled={!!middlewareName}
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
								<VersionForm
									type={chartName}
									chartVersion={chartVersion}
									version={version}
									setVersion={setVersion}
									disabled={!!middlewareName}
								/>
								<li className="display-flex form-li">
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
											required
											name="mirrorImageId"
											rules={[
												{
													required: true,
													message: '请选择镜像仓库'
												}
											]}
											initialValue={
												mirrorList?.[0]?.address
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
													width: '376px'
												}}
											/>
										</FormItem>
									</div>
								</li>
								<li className="display-flex">
									<label className="form-name">
										<span style={{ marginRight: 8 }}>
											自动创建Topic
										</span>
									</label>
									<div
										className="form-content"
										style={{ flex: '0 0 376px' }}
									>
										<FormItem
											name="autoCreateTopicEnable"
											initialValue={false}
										>
											<Switch
												size="small"
												style={{
													verticalAlign: 'middle'
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
											disabled={!!middlewareName}
										/>
										{/* <div
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
										</div> */}
									</div>
								</li>
								{mode === 'dledger' && (
									<li className="display-flex form-li">
										<label className="form-name">
											DLedger组数
										</label>
										<div className="form-content">
											<InputNumber
												name="组数"
												value={groupCount}
												onChange={(
													value: number | null
												) =>
													setGroupCount(
														value as number
													)
												}
												// min={2}
												// max={10}
												disabled={!!middlewareName}
											/>
										</div>
									</li>
								)}
								{mode === 'dledger' && (
									<li className="display-flex form-li">
										<label className="form-name">
											副本数
										</label>
										<div className="form-content">
											<InputNumber
												name="节点数量"
												value={replicaCount}
												onChange={(value) =>
													setReplicaCount(value || 0)
												}
												// min={3}
												// max={10}
												disabled={!!middlewareName}
											/>
										</div>
									</li>
								)}
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
											disabled={!!middlewareName}
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
													dataList={mqDataList}
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
																		type: 'number',
																		message: `最小为0.1`
																	},
																	{
																		required:
																			true,
																		message:
																			'请输入自定义CPU配额，单位为Core'
																	}
																]}
																required
															>
																<InputNumber
																	style={{
																		width: '100%'
																	}}
																	step={0.1}
																	placeholder="请输入自定义CPU配额，单位为Core"
																	disabled={
																		!!middlewareName
																	}
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
																		message: `最小为0.1`
																	},
																	{
																		required:
																			true,
																		message:
																			'请输入自定义内存配额，单位为Gi'
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
																	disabled={
																		!!middlewareName
																	}
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
								{/* {mode !== 'dledger' && (
									<>
										<li
											className="display-flex form-li"
											style={{
												alignItems: 'center'
											}}
										>
											<label className="form-name">
												<span className="ne-required">
													集群外访问
												</span>
											</label>
											<div
												className={`form-content display-flex ${styles['standard-log']}`}
											>
												<div
													className={styles['switch']}
												>
													{hostNetwork
														? '已开启'
														: '关闭'}
													<Switch
														checked={hostNetwork}
														onChange={(value) =>
															setHostNetwork(
																value
															)
														}
														size="small"
														style={{
															marginLeft: 16,
															verticalAlign:
																'middle'
														}}
													/>
												</div>
											</div>
										</li>
										{hostNetwork &&
											childrenPostRender(mode)}
									</>
								)} */}
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
