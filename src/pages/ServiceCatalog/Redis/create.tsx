import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import Page from '@alicloud/console-components-page';
import FormBlock from '@/components/FormBlock';
import SelectBlock from '@/components/SelectBlock';
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
import styles from './redis.module.scss';
import {
	getNodePort,
	getNodeTaint,
	getStorageClass,
	postMiddleware
} from '@/services/middleware';
import { getMirror } from '@/services/common';
import messageConfig from '@/components/messageConfig';
import ModeItem from '@/components/ModeItem';
// * 结果页相关-start
import SuccessPage from '@/components/ResultPage/SuccessPage';
import ErrorPage from '@/components/ResultPage/ErrorPage';
import LoadingPage from '@/components/ResultPage/LoadingPage';
// * 结果页相关-end
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
import { StorageClassProps } from '@/types/comment';
import { StoreState } from '@/types';
// * 外接动态表单相关
import { getAspectFrom } from '@/services/common';
import { formItemLayout614 } from '@/utils/const';

const { Item: FormItem } = Form;
const RedisCreate: (props: CreateProps) => JSX.Element = (
	props: CreateProps
) => {
	const { cluster: globalCluster, namespace: globalNamespace } =
		props.globalVar;
	const params: CreateParams = useParams();
	const { chartName, chartVersion, aliasName } = params;
	const field = Field.useField();
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
			label: '资源池模式',
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
	const [createData, setCreateData] = useState<string>();

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
		field.validate((err, value) => {
			const values: RedisCreateValuesParams = field.getValues();
			if (!err) {
				const sendData: RedisSendDataParams = {
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
					quota: { redis: {} },
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
			}
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
		}
	}, [globalCluster, globalNamespace]);
	// * 结果页相关
	if (commitFlag) {
		return (
			<div style={{ height: '100%', textAlign: 'center', marginTop: 46 }}>
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
		);
	}
	if (successFlag) {
		return (
			<div style={{ height: '100%', textAlign: 'center', marginTop: 46 }}>
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
							pathname: `/serviceList/${chartName}/${aliasName}/basicInfo/${createData}/${chartName}/${chartVersion}`
						});
					}}
				/>
			</div>
		);
	}

	if (errorFlag) {
		return (
			<div style={{ height: '100%', textAlign: 'center', marginTop: 46 }}>
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
		);
	}

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
				<Form
					{...formItemLayout614}
					field={field}
					onChange={formHandle}
				>
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
											patternMessage="请输入由小写字母数字及“-”组成的2-24个字符"
										>
											<Input
												name="name"
												placeholder="请输入由小写字母数字及“-”组成的2-24个字符"
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
													<Select.AutoComplete
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
																// changeTolerations(
																// 	'',
																// 	'label'
																// );
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
					<FormBlock title="日志收集">
						<div className={styles['log-collection-content']}>
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
													style={{
														lineHeight: '18px'
													}}
												>
													安装日志采集组件ES后，开启日志收集按钮，会将该类型日志存储于ES中，若您现在不开启，发布完之后再开启，将导致服务重启。
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
													style={{
														lineHeight: '18px'
													}}
												>
													安装日志采集组件ES后，开启日志收集按钮，会将该类型日志存储于ES中，若您现在不开启，发布完之后再开启，将导致服务重启。
												</span>
											</Balloon>
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
												htmlType="password"
												name="pwd"
												placeholder="请输入初始密码，输入空则由平台随机生成"
												trim
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
																		min={
																			0.1
																		}
																		minmaxMessage={`最小为0.1,不能超过当前分区配额剩余的最大值（${maxCpu?.max}Core）`}
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
																		minmaxMessage={`最小为0.1,不能超过当前分区配额剩余的最大值（${maxMemory?.max}Gi`}
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
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {})(RedisCreate);
