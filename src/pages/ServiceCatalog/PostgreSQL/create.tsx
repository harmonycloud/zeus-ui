import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
	Form,
	Field,
	Input,
	Icon,
	Balloon,
	Switch,
	Select,
	Button,
	Checkbox,
	NumberPicker,
	Message
} from '@alicloud/console-components';
import { Page, Header, Content } from '@alicloud/console-components-page';
import { useHistory, useParams } from 'react-router';
import FormBlock from '@/components/FormBlock';
import LoadingPage from '@/components/ResultPage/LoadingPage';
import SuccessPage from '@/components/ResultPage/SuccessPage';
import ErrorPage from '@/components/ResultPage/ErrorPage';
import SelectBlock from '@/components/SelectBlock';
import TableRadio from '../components/TableRadio';

import {
	getNodePort,
	getNodeTaint,
	getStorageClass,
	postMiddleware,
	getMiddlewareDetail
} from '@/services/middleware';
import { getMirror } from '@/services/common';
import { getAspectFrom } from '@/services/common';

import {
	AffinityLabelsItem,
	AffinityProps,
	CreateParams,
	CreateProps,
	PostgresqlCreateValuesParams,
	PostgresqlSendDataParams,
	TolerationsProps
} from '../catalog';
import { TolerationLabelItem } from '@/components/FormTolerations/formTolerations';
import { middlewareDetailProps, StorageClassProps } from '@/types/comment';
import { StoreState } from '@/types';
import { formItemLayout614, instanceSpecList } from '@/utils/const';
import { childrenRender, getCustomFormKeys } from '@/utils/utils';
import transUnit from '@/utils/transUnit';
import pattern from '@/utils/pattern';
import messageConfig from '@/components/messageConfig';

import styles from './postgresql.module.scss';
import { NamespaceItem } from '@/pages/ProjectDetail/projectDetail';
import { getProjectNamespace } from '@/services/project';

const { AutoComplete } = Select;
const FormItem = Form.Item;
const Password = Input.Password;

function PostgreSQLCreate(props: CreateProps): JSX.Element {
	const {
		cluster: globalCluster,
		namespace: globalNamespace,
		project
	} = props.globalVar;
	const history = useHistory();
	const params: CreateParams = useParams();
	const field = Field.useField();
	const {
		chartName,
		aliasName,
		chartVersion,
		middlewareName,
		backupFileName,
		namespace
	} = params;
	const [mirrorList, setMirrorList] = useState<any[]>([]);
	// * 主机亲和-start
	const [affinity, setAffinity] = useState<AffinityProps>({
		flag: false,
		label: '',
		checked: false
	});
	const [labelList, setLabelList] = useState<string[]>([]);
	const changeAffinity = (value: any, key: string) => {
		setAffinity({
			...affinity,
			[key]: value
		});
	};
	const [affinityLabels, setAffinityLabels] = useState<AffinityLabelsItem[]>(
		[]
	);
	// * 主机亲和 - end
	// * 主机容忍 - start
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
	// * 主机容忍 - end
	// * PostgreSQL配置-start
	const [version, setVersion] = useState<string>('14');
	const versionList = [
		{
			label: '14',
			value: '14'
		},
		{
			label: '13',
			value: '13'
		},
		{
			label: '12',
			value: '12'
		},
		{
			label: '11',
			value: '11'
		},
		{
			label: '9.6',
			value: '9.6'
		}
	];
	// * PostgreSQL配置-end
	// * 规格配置 -start
	const [mode, setMode] = useState<string>('1m-1s');
	const modeList = [
		{
			label: '一主一从',
			value: '1m-1s'
		},
		{
			label: '一主多从（beta版）',
			value: '1m-ns'
		}
	];
	const [instanceSpec, setInstanceSpec] = useState<string>('General');
	const [specId, setSpecId] = useState<string>('1');
	const [storageClassList, setStorageClassList] = useState<
		StorageClassProps[]
	>([]);
	const [maxCpu, setMaxCpu] = useState<{ max: number }>(); // 自定义cpu的最大值
	const [maxMemory, setMaxMemory] = useState<{ max: number }>(); // 自定义memory的最大值
	const [replicaCount, setReplicaCount] = useState(2); // * 一主多从
	// * root密码
	const [pgsqlPwd, setPgsqlPwd] = useState<string>('');
	const [checks, setChecks] = useState<boolean[]>([false, false]);
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
						Message.show(messageConfig('error', '失败', res));
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
					Message.show(messageConfig('error', '失败', res));
				}
			});
			if (JSON.stringify(globalNamespace) !== '{}') {
				// 克隆服务
				console.log(
					'克隆服务',
					globalNamespace,
					backupFileName,
					middlewareName
				);
				if (backupFileName) {
					getMiddlewareDetailAndSetForm(middlewareName);
				}
			}
		}
	}, [globalCluster, globalNamespace]);

	const getMiddlewareDetailAndSetForm = (middlewareName: string) => {
		console.log(namespace);
		getMiddlewareDetail({
			clusterId: globalCluster.id,
			namespace: namespace,
			middlewareName: middlewareName,
			type: 'postgresql'
		}).then((res) => {
			// console.log(res);
			setInstanceSpec('Customize');
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
				setMode(res.data.mode);
			}
			if (res.data.version) {
				setVersion(res.data.version);
			}
			field.setValues({
				name: backupFileName ? res.data.name + '-backup' : '',
				labels: res.data.labels,
				annotations: res.data.annotations,
				description: res.data.description,
				postgresqlPwd: res.data.password,
				cpu: res.data.quota.postgresql.cpu,
				memory: transUnit.removeUnit(
					res.data.quota.postgresql.memory,
					'Gi'
				),
				storageClass: res.data.quota.postgresql.storageClassName,
				storageQuota: transUnit.removeUnit(
					res.data.quota.postgresql.storageClassQuota,
					'Gi'
				)
			});
			if (res.data.dynamicValues) {
				for (const i in res.data.dynamicValues) {
					field.setValue(i, res.data.dynamicValues[i]);
				}
			}
		});
	};

	// * 表单提交
	const handleSubmit = () => {
		field.validate((err) => {
			const values: PostgresqlCreateValuesParams = field.getValues();
			if (err) return;
			const sendData: PostgresqlSendDataParams = {
				chartName,
				chartVersion,
				clusterId: globalCluster.id,
				namespace:
					globalNamespace.name === '*'
						? values.namespace
						: globalNamespace.name,
				type: 'postgresql',
				name: values.name,
				aliasName: values.aliasName,
				labels: values.labels,
				annotations: values.annotations,
				description: values.description,
				password: values.pgsqlPwd,
				version: version,
				mode,
				replicaCount: mode === '1m-1s' ? 1 : replicaCount,
				quota: {
					postgresql: {
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
			if (affinity.flag) {
				if (!affinityLabels.length) {
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
			// * 主机容忍
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
			// * 配额
			if (instanceSpec === 'General') {
				switch (specId) {
					case '1':
						sendData.quota.postgresql.cpu = 1;
						sendData.quota.postgresql.memory = '2Gi';
						break;
					case '2':
						sendData.quota.postgresql.cpu = 2;
						sendData.quota.postgresql.memory = '4Gi';
						break;
					case '3':
						sendData.quota.postgresql.cpu = 4;
						sendData.quota.postgresql.memory = '16Gi';
						break;
					case '4':
						sendData.quota.postgresql.cpu = 8;
						sendData.quota.postgresql.memory = '32Gi';
						break;
					case '5':
						sendData.quota.postgresql.cpu = 16;
						sendData.quota.postgresql.memory = '64Gi';
						break;
					default:
						break;
				}
			} else if (instanceSpec === 'Customize') {
				sendData.quota.postgresql.cpu = values.cpu;
				sendData.quota.postgresql.memory = values.memory + 'Gi';
			}
			setCommitFlag(true);
			console.log(sendData);
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
			<Page>
				<Header />
				<Content>
					<div
						style={{
							height: '100%',
							textAlign: 'center',
							marginTop: 46
						}}
					>
						<LoadingPage
							title="发布中"
							btnHandle={() => {
								history.push({
									pathname: `/serviceList/${chartName}/${aliasName}`
								});
							}}
							btnText="返回列表"
						/>
					</div>
				</Content>
			</Page>
		);
	}
	if (successFlag) {
		return (
			<Page>
				<Header />
				<Content>
					<div
						style={{
							height: '100%',
							textAlign: 'center',
							marginTop: 46
						}}
					>
						<SuccessPage
							title="发布成功"
							leftText="返回列表"
							rightText="查看详情"
							leftHandle={() => {
								history.push({
									pathname: `/serviceList/${chartName}/${aliasName}`
								});
							}}
							rightHandle={() => {
								history.push({
									pathname: `/serviceList/${chartName}/${aliasName}/basicInfo/${createData?.name}/${chartName}/${chartVersion}/${createData?.namespace}`
								});
							}}
						/>
					</div>
				</Content>
			</Page>
		);
	}

	const pgsqlPwdChange = (value: string) => {
		const temp = [...checks];
		if (value.length >= 8 && value.length <= 32) {
			temp[0] = true;
		} else {
			temp[0] = false;
		}
		if (
			/^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)[a-zA-Z0-9\W_]{3,}$/.test(
				value
			)
		) {
			temp[1] = true;
		} else {
			temp[1] = false;
		}
		setChecks(temp);
		setPgsqlPwd(value);
	};

	if (errorFlag) {
		return (
			<Page>
				<Header />
				<Content>
					<div
						style={{
							height: '100%',
							textAlign: 'center',
							marginTop: 46
						}}
					>
						<ErrorPage
							title="发布失败"
							btnHandle={() => {
								history.push({
									pathname: `/serviceList/${chartName}/${aliasName}`
								});
							}}
							btnText="返回列表"
						/>
					</div>
				</Content>
			</Page>
		);
	}
	return (
		<Page>
			<Header
				title="发布PostgreSQL服务"
				className="page-header"
				hasBackArrow
				onBackArrowClick={() => {
					history.push({
						// pathname: `/serviceList/${chartName}/${aliasName}`
						pathname: `/serviceList/${chartName}/${aliasName}`
					});
				}}
			/>
			<Content>
				<Form field={field} {...formItemLayout614}>
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
												required
												requiredMessage="请选择命名空间"
											>
												<Select
													name="namespace"
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
											required
											requiredMessage="请输入服务名称"
											pattern={pattern.name}
											patternMessage="请输入以小写字母开头，小写字母数字及“-”组成的2-24个字符"
										>
											<Input
												name="name"
												placeholder="请输入以小写字母开头，小写字母数字及“-”组成的2-24个字符"
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
													<AutoComplete
														value={affinity.label}
														onChange={(value) =>
															changeAffinity(
																value,
																'label'
															)
														}
														hasClear={true}
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
														<Icon
															style={{
																color: '#005AA5'
															}}
															type="add"
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
								{affinity.flag && affinityLabels.length ? (
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
														hasClear={true}
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
					<FormBlock title="PostgreSQL配置">
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
										<span>postgre密码</span>
									</label>
									<div
										className="form-content"
										style={{ flex: '0 0 376px' }}
									>
										<Balloon
											trigger={
												<FormItem>
													<Password
														value={pgsqlPwd}
														name="pgsqlPwd"
														placeholder="请输入密码，输入为空则由平台随机生成"
														trim
														onChange={
															pgsqlPwdChange
														}
													/>
												</FormItem>
											}
											closable={false}
											align="r"
										>
											<ul>
												<li
													className={
														styles[
															'edit-form-icon-style'
														]
													}
												>
													{checks[0] ? (
														<Icon
															type="success-filling1"
															style={{
																color: '#68B642',
																marginRight: 4
															}}
															size="xs"
														/>
													) : (
														<Icon
															type="times-circle-fill"
															style={{
																color: '#Ef595C',
																marginRight: 4
															}}
															size="xs"
														/>
													)}
													<span>
														(长度需要8-32之间)
													</span>
												</li>
												<li
													className={
														styles[
															'edit-form-icon-style'
														]
													}
												>
													{checks[1] ? (
														<Icon
															type="success-filling1"
															style={{
																color: '#68B642',
																marginRight: 4
															}}
															size="xs"
														/>
													) : (
														<Icon
															type="times-circle-fill"
															style={{
																color: '#Ef595C',
																marginRight: 4
															}}
															size="xs"
														/>
													)}
													<span>
														至少包含以下字符中的三种：大写字母、小写字母、数字和特殊字符～!@%^*-_=+?,()&
													</span>
												</li>
											</ul>
										</Balloon>
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
											requiredMessage="请选择镜像仓库"
										>
											<Select.AutoComplete
												name="mirrorImageId"
												placeholder="请选择"
												hasClear={true}
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
										<Balloon
											trigger={
												<Icon
													type="question-circle"
													size="xs"
												/>
											}
											closable={false}
										>
											本模式中的主、从节点，特指不同类型实例个数
										</Balloon>
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
										<div
											style={{
												display:
													mode === '1m-1s'
														? 'none'
														: 'block'
											}}
										>
											<label style={{ margin: '0 16px' }}>
												自定义从节点实例数量
											</label>
											<NumberPicker
												name="从节点数量字段"
												defaultValue={2}
												onChange={(value) =>
													setReplicaCount(value)
												}
												value={replicaCount}
												max={6}
												min={2}
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
																min={0.1}
																minmaxMessage={`最小为0.1,不能超过当前分区配额剩余的最大值（${maxCpu?.max}Core）`}
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
																minmaxMessage={`最小为0.1,不能超过当前分区配额剩余的最大值（${maxMemory?.max}Gi`}
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
							onClick={() => {
								history.push({
									pathname: `/serviceList/${chartName}/${aliasName}`
								});
							}}
						>
							取消
						</Button>
					</div>
				</Form>
			</Content>
		</Page>
	);
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps)(PostgreSQLCreate);
