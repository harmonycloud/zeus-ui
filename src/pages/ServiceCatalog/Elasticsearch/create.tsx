import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import Page from '@alicloud/console-components-page';
import FormBlock from '@/components/FormBlock';
import SelectBlock from '@/components/SelectBlock';
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
	getNodeTaint,
	postMiddleware
} from '@/services/middleware';
import { getMirror } from '@/services/common';
import messageConfig from '@/components/messageConfig';
import ModeItem from '@/components/ModeItem';
// * 结果页相关-start
import LoadingPage from '@/components/ResultPage/LoadingPage';
import SuccessPage from '@/components/ResultPage/SuccessPage';
import ErrorPage from '@/components/ResultPage/ErrorPage';
// * 结果页相关-end
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
import { formItemLayout614 } from '@/utils/const';

const { Item: FormItem } = Form;

const ElasticsearchCreate: (props: CreateProps) => JSX.Element = (
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
	const [mirrorList, setMirrorList] = useState<any[]>([]);
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
	const [createData, setCreateData] = useState<string>();

	const handleSubmit = () => {
		field.validate((err) => {
			const values: EsCreateValuesParams = field.getValues();
			if (!err) {
				const sendData: EsSendDataParams = {
					chartName: chartName,
					chartVersion: chartVersion,
					clusterId: globalCluster.id,
					namespace: globalNamespace.name,
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
				if (nodeObj) {
					sendData.quota = {};
					for (const key in nodeObj) {
						if (!nodeObj[key].disabled) {
							if (nodeObj[key].storageClass === '') {
								Message.show(
									messageConfig(
										'error',
										'失败',
										`请选择${key}节点存储类型`
									)
								);
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

	// 全局资源池更新
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
				clusterId: globalCluster.id,
			}).then((res) => {
				if (res.success) {
					setMirrorList(res.data.list);
				}
			});
		}
	}, [globalCluster, globalNamespace]);

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
				title="发布Elasticsearch服务"
				className="page-header"
				hasBackArrow
				onBackArrowClick={() => {
					window.history.back();
				}}
			/>
			<Page.Content>
				<Form {...formItemLayout614} field={field}>
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
											<Input
												htmlType="password"
												name="pwd"
												placeholder="请输入初始密码，输入为空则由平台随机生成"
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
										<span
											className="ne-required"
											style={{ marginRight: 8 }}
										>
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
											主节点负责集群管理相关操作；数据节点负责数据存储；协调节点负责负载均衡，路由分发；冷节点负责低优先级数据存储
										</Balloon>
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
export default connect(mapStateToProps, {})(ElasticsearchCreate);
