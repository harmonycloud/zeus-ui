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
import { instanceSpecList, zkpDataList } from '@/utils/const';
import { childrenRender, getCustomFormKeys } from '@/utils/utils';
import pattern from '@/utils/pattern';
import { NamespaceItem } from '@/pages/ProjectDetail/projectDetail';
import {
	CloseCircleFilled,
	PlusOutlined,
	QuestionCircleOutlined
} from '@ant-design/icons';
import styles from '../Kafka/kafka.module.scss';
import ModePost from '../components/ModePost';
import StorageQuota from '@/components/StorageQuota';

const FormItem = Form.Item;

function ZookeeperCreate(props: CreateProps): JSX.Element {
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
	// * ????????????-start
	const [affinity, setAffinity] = useState<AffinityProps>({
		flag: false,
		label: '',
		checked: false
	});
	const [affinityFlag, setAffinityFlag] = useState<boolean>(false);
	const [affinityLabels, setAffinityLabels] = useState<AffinityLabelsItem[]>(
		[]
	);
	// * ???????????? - end
	// * ???????????? - start
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
	// * ???????????? - end
	// * ??????-start
	const [fileLog, setFileLog] = useState<boolean>(false);
	const [standardLog, setStandardLog] = useState<boolean>(false);
	// * ??????-end
	// * Zookeeper??????-start
	const [version, setVersion] = useState<string>('3.7.0');
	const versionList = [
		{
			label: '3.7.0',
			value: '3.7.0'
		},
		{
			label: '3.6.3',
			value: '3.6.3'
		},
		{
			label: '3.5.9',
			value: '3.5.9'
		}
	];
	const [kfkDTO, setKfkDTO] = useState<KafkaDTO>({
		path: '',
		zkAddress: '',
		zkPort: 0
	});
	// * Zookeeper??????-end
	// * ???????????? -start
	const [mode, setMode] = useState<string>('cluster');
	const modeList = [
		{
			label: '????????????',
			value: 'cluster'
		}
	];
	const [instanceSpec, setInstanceSpec] = useState<string>('General');
	const [specId, setSpecId] = useState<string>('1');
	const [storageClassList, setStorageClassList] = useState<
		StorageClassProps[]
	>([]);
	const [customCluster, setCustomCluster] = useState<number>(3);
	const [maxCpu, setMaxCpu] = useState<{ max: number }>(); // ?????????cpu????????????
	const [maxMemory, setMaxMemory] = useState<{ max: number }>(); // ?????????memory????????????
	// * ?????????????????????-start
	const [customForm, setCustomForm] = useState<any>();
	// * ??????????????????-end
	// * ????????????????????????????????????
	const [commitFlag, setCommitFlag] = useState<boolean>(false);
	// * ????????????
	const [successFlag, setSuccessFlag] = useState<boolean>(false);
	// * ????????????
	const [errorFlag, setErrorFlag] = useState<boolean>(false);
	// * ???????????????????????????
	const [createData, setCreateData] = useState<middlewareDetailProps>();
	// * ?????????????????????????????????
	const [errorData, setErrorData] = useState<string>('');
	// * ???????????????????????????????????????
	const [namespaceList, setNamespaceList] = useState<NamespaceItem[]>([]);
	// * ???????????????
	const [hostNetwork, setHostNetwork] = useState<boolean>(false);
	// * ?????????????????????????????????????????????????????????
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
							message: '??????',
							description: res.errorMsg
						});
					}
				}
			);
		}
	}, [project, globalNamespace]);
	// ???????????????????????????
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
						message: '??????',
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
						message: '??????',
						description: res.errorMsg
					});
				}
			});
			getAspectFrom().then((res) => {
				if (res.success) {
					setCustomForm(res.data);
				} else {
					notification.error({
						message: '??????',
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
						message: '??????',
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
						message: '??????',
						description: res.errorMsg
					});
				}
			});
		}
	}, [globalCluster, globalNamespace]);
	// * ????????????
	const handleSubmit = () => {
		form.validateFields().then((values) => {
			const sendData: any = {
				chartName,
				chartVersion,
				clusterId: globalCluster.id,
				namespace:
					globalNamespace.name === '*'
						? values.namespace
						: globalNamespace.name,
				type: 'zookeeper',
				name: values.name,
				aliasName: values.aliasName,
				labels: values.labels,
				annotations: values.annotations,
				description: values.description,
				version: version,
				mode,
				filelogEnabled: fileLog,
				stdoutEnabled: standardLog,
				quota: {
					zookeeper: {
						num: customCluster,
						storageClassName: values.storageClass.split('/')[0],
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
			// * ????????????
			if (affinityFlag) {
				if (!affinityLabels.length) {
					notification.error({
						message: '??????',
						description: '????????????????????????'
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
			// * ????????????
			if (tolerations.flag) {
				if (!tolerationsLabels.length) {
					notification.error({
						message: '??????',
						description: '????????????????????????'
					});
					return;
				} else {
					sendData.tolerations = tolerationsLabels.map(
						(item) => item.label
					);
				}
			}
			// * ??????
			if (instanceSpec === 'General') {
				switch (specId) {
					case '1':
						sendData.quota.zookeeper.cpu = 1;
						sendData.quota.zookeeper.memory = '2Gi';
						break;
					case '2':
						sendData.quota.zookeeper.cpu = 2;
						sendData.quota.zookeeper.memory = '4Gi';
						break;
					case '3':
						sendData.quota.zookeeper.cpu = 4;
						sendData.quota.zookeeper.memory = '8Gi';
						break;
					case '4':
						sendData.quota.zookeeper.cpu = 8;
						sendData.quota.zookeeper.memory = '16Gi';
						break;
					case '5':
						sendData.quota.zookeeper.cpu = 16;
						sendData.quota.zookeeper.memory = '32Gi';
						break;
					default:
						break;
				}
			} else if (instanceSpec === 'Customize') {
				sendData.quota.zookeeper.cpu = values.cpu;
				sendData.quota.zookeeper.memory = values.memory + 'Gi';
			}
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
	// * ???????????????
	if (commitFlag) {
		return (
			<ProPage>
				<ProContent>
					<Result
						title="?????????"
						extra={
							<Button
								type="primary"
								onClick={() => {
									history.push({
										pathname: `/serviceList/${chartName}/${aliasName}`
									});
								}}
							>
								????????????
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
						title="????????????"
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
								????????????
							</Button>,
							<Button
								key="detail"
								onClick={() => {
									history.push({
										pathname: `/serviceList/${chartName}/${aliasName}/basicInfo/${createData?.name}/${chartName}/${chartVersion}/${createData?.namespace}`
									});
								}}
							>
								????????????
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
						title="????????????"
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
								????????????
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
				title="??????Zookeeper??????"
				onBack={() => {
					history.push({
						pathname: `/serviceList/${chartName}/${aliasName}`
					});
				}}
			/>
			<ProContent>
				<Form form={form}>
					{globalNamespace.name === '*' && (
						<FormBlock title="??????????????????">
							<div className={styles['basic-info']}>
								<ul className="form-layout">
									<li className="display-flex">
										<label className="form-name">
											<span className="ne-required">
												????????????
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
					<FormBlock title="????????????">
						<div className={styles['basic-info']}>
							<ul className="form-layout">
								<li className="display-flex">
									<label className="form-name">
										<span className="ne-required">
											????????????
										</span>
									</label>
									<div className="form-content">
										<FormItem
											name="name"
											required
											rules={[
												{
													required: true,
													message: '?????????????????????'
												},
												{
													pattern: new RegExp(
														pattern.name
													),
													message:
														'?????????????????????????????????????????????????????????-????????????2-24?????????'
												}
											]}
										>
											<Input placeholder="?????????????????????????????????????????????????????????-????????????2-24?????????" />
										</FormItem>
									</div>
								</li>
								<li className="display-flex">
									<label className="form-name">
										<span>????????????</span>
									</label>
									<div className="form-content">
										<FormItem
											name="aliasName"
											rules={[
												{
													min: 2,
													message:
														'??????????????????????????????????????????-?????????.?????????_????????????2-80?????????'
												},
												{
													max: 80,
													message:
														'??????????????????????????????????????????-?????????.?????????_????????????2-80?????????'
												},
												{
													pattern: new RegExp(
														pattern.nickname
													),
													message:
														'??????????????????????????????????????????-?????????.?????????_????????????2-80?????????'
												}
											]}
										>
											<Input placeholder="??????????????????????????????????????????-?????????.?????????_????????????2-80?????????" />
										</FormItem>
									</div>
								</li>
								<li className="display-flex">
									<label className="form-name">
										<span>??????</span>
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
														'?????????key=value???????????????????????????????????????????????????'
												}
											]}
										>
											<Input placeholder="?????????key=value???????????????????????????????????????????????????" />
										</FormItem>
									</div>
								</li>
								<li className="display-flex">
									<label className="form-name">
										<span>??????</span>
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
														'?????????key=value???????????????????????????????????????????????????'
												}
											]}
										>
											<Input placeholder="?????????key=value???????????????????????????????????????????????????" />
										</FormItem>
									</div>
								</li>
								<li className="display-flex">
									<label className="form-name">
										<span>??????</span>
									</label>
									<div className="form-content">
										<FormItem name="description">
											<Input.TextArea placeholder="?????????????????????" />
										</FormItem>
									</div>
								</li>
							</ul>
						</div>
					</FormBlock>
					<FormBlock title="????????????">
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
										<span className="mr-8">????????????</span>
									</label>
									<div
										className={`form-content display-flex ${styles['host-affinity']}`}
									>
										<div className={styles['switch']}>
											{tolerations.flag
												? '?????????'
												: '??????'}
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
					{/* <FormBlock title="????????????">
						<div className={styles['log-collection-content']}>
							<div className={styles['log-collection']}>
								<ul className="form-layout">
									<li className="display-flex form-li flex-align">
										<label className="form-name">
											<span style={{ marginRight: 8 }}>
												??????????????????
											</span>
											<Tooltip title="????????????????????????ES???????????????????????????????????????????????????????????????ES?????????????????????????????????????????????????????????????????????????????????">
												<QuestionCircleOutlined />
											</Tooltip>
										</label>
										<div
											className={`form-content display-flex ${styles['file-log']}`}
										>
											<div className={styles['switch']}>
												{fileLog ? '?????????' : '??????'}
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
												??????????????????
											</span>
											<Tooltip title="????????????????????????ES???????????????????????????????????????????????????????????????ES?????????????????????????????????????????????????????????????????????????????????">
												<QuestionCircleOutlined />
											</Tooltip>
										</label>
										<div
											className={`form-content display-flex ${styles['standard-log']}`}
										>
											<div className={styles['switch']}>
												{standardLog
													? '?????????'
													: '??????'}
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
					</FormBlock> */}
					<FormBlock title="Zookeeper??????">
						{/* <div className={styles['mysql-config']}> */}
						<div>
							<ul className="form-layout">
								<li className="display-flex form-li">
									<label className="form-name">
										<span>??????</span>
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
								{mirrorList.length && (
									<li className="display-flex">
										<label className="form-name">
											<span
												className="ne-required"
												style={{ marginRight: 8 }}
											>
												????????????
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
															'?????????????????????'
													}
												]}
												initialValue={
													mirrorList[0].address
												}
											>
												<AutoComplete
													placeholder="?????????"
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
														width: '380px'
													}}
												/>
											</FormItem>
										</div>
									</li>
								)}
							</ul>
						</div>
					</FormBlock>
					<FormBlock title="????????????">
						<div className={styles['spec-config']}>
							<ul className="form-layout">
								<li className="display-flex form-li flex-align">
									<label className="form-name">
										<span style={{ marginRight: 8 }}>
											??????
										</span>
										<Tooltip title="????????????????????????????????????leader????????????????????????">
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
											???????????????????????????
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
										<span>????????????</span>
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
													dataList={zkpDataList}
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
																		message: `?????????0.1`
																	},
																	{
																		required:
																			true,
																		message:
																			'??????????????????CPU??????????????????Core'
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
																	placeholder="??????????????????CPU??????????????????Core"
																/>
															</FormItem>
														</div>
													</li>
													<li className="display-flex">
														<label className="form-name">
															<span className="ne-required">
																??????
															</span>
														</label>
														<div className="form-content">
															<FormItem
																name="memory"
																rules={[
																	{
																		min: 0.1,
																		type: 'number',
																		message: `?????????0.1`
																	},
																	{
																		required:
																			true,
																		message:
																			'??????????????????????????????????????????Gi'
																	}
																]}
																required
															>
																<InputNumber
																	style={{
																		width: '100%'
																	}}
																	step={0.1}
																	placeholder="??????????????????????????????????????????Gi"
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
							??????
						</Button>
						<Button
							type="default"
							onClick={() => window.history.back()}
						>
							??????
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
export default connect(mapStateToProps)(ZookeeperCreate);
