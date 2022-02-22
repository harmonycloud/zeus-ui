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
	Message,
	CascaderSelect
	// NumberPicker 一主多从
} from '@alicloud/console-components';
import pattern from '@/utils/pattern';
import styles from './mysql.module.scss';
import {
	getNodePort,
	getNodeTaint,
	getStorageClass,
	postMiddleware,
	getMiddlewareDetail,
	addDisasterIns
} from '@/services/middleware';
import { getClusters, getNamespaces, getAspectFrom } from '@/services/common';
import messageConfig from '@/components/messageConfig';
import transUnit from '@/utils/transUnit';
import { StoreState, clusterType, namespaceType } from '@/types/index';
import { middlewareDetailProps, StorageClassProps } from '@/types/comment';
import {
	CreateProps,
	CreateParams,
	AffinityProps,
	TolerationsProps,
	AffinityLabelsItem,
	TolerationsLabelsItem,
	MysqlSendDataParams,
	MysqlCreateValuesParams,
	MysqlSendDataTempParams
} from '../catalog';
import { data } from '@alicloud/console-components/types/cascader';
import { instanceSpecList } from '@/utils/const';
// * 外接动态表单相关
import { getCustomFormKeys, childrenRender } from '@/utils/utils';

const { Item: FormItem } = Form;
const formItemLayout = {
	labelCol: {
		fixedSpan: 6
	},
	wrapperCol: {
		span: 14
	}
};
const MysqlCreate: (props: CreateProps) => JSX.Element = (
	props: CreateProps
) => {
	const { cluster: globalCluster, namespace: globalNamespace } =
		props.globalVar;
	const params: CreateParams = useParams();
	const {
		chartName,
		chartVersion,
		middlewareName,
		backupFileName,
		aliasName
	} = params;
	const { state } = props.location;
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
		TolerationsLabelsItem[]
	>([]);

	// 日志
	const [fileLog, setFileLog] = useState<boolean>(false);
	const [standardLog, setStandardLog] = useState<boolean>(false);

	// MySQL配置
	const [version, setVersion] = useState<string>('5.7');
	const versionList = [
		{
			label: '5.7',
			value: '5.7'
		}
	];
	const [charSet, setCharSet] = useState<string>('utf8mb4');
	const charSetList = [
		{
			label: 'utf8mb4',
			value: 'utf8mb4'
		},
		{
			label: 'utf8',
			value: 'utf8'
		},
		{
			label: 'latin1',
			value: 'latin1'
		}
	];
	const [mode, setMode] = useState<string>('1m-1s');
	const modeList = [
		{
			label: '主从模式',
			value: '1m-1s'
		}
	];
	const [instanceSpec, setInstanceSpec] = useState<string>('General');
	const [specId, setSpecId] = useState<string>('1');
	const [storageClassList, setStorageClassList] = useState<
		StorageClassProps[]
	>([]);
	const [maxCpu, setMaxCpu] = useState<{ max: number }>(); // 自定义cpu的最大值
	const [maxMemory, setMaxMemory] = useState<{ max: number }>(); // 自定义memory的最大值
	// const [replicaCount, setReplicaCount] = useState(1); // * 一主多从

	// * 灾备
	const [backupFlag, setBackupFlag] = useState<boolean>(false);
	const [reuse, setReuse] = useState<boolean>(true);
	const [dataSource, setDataSource] = useState<data[]>([]);
	const [relationClusterId, setRelationClusterId] = useState<string>();
	const [relationNamespace, setRelationNamespace] = useState<string>();
	const [originData, setOriginData] = useState<middlewareDetailProps>();
	const [reClusterFlag, setReClusterFlag] = useState<boolean>(false);
	// * 外接的动态表单
	const [customForm, setCustomForm] = useState<any>();

	useEffect(() => {
		getClusters().then((res) => {
			if (res.success) {
				const list: data[] = res.data.map((item: clusterType) => {
					return {
						value: item.id,
						label: item.nickname,
						children: []
					};
				});
				setDataSource(list);
			}
		});
		getAspectFrom().then((res) => {
			if (res.success) {
				setCustomForm(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	}, []);

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

	const handleSubmit = () => {
		field.validate((err, value) => {
			const values: MysqlCreateValuesParams = field.getValues();
			if (!err) {
				let sendData: MysqlSendDataParams = {
					chartName: chartName,
					chartVersion: chartVersion,
					clusterId: globalCluster.id,
					namespace: globalNamespace.name,
					type: 'mysql',
					name: values.name,
					aliasName: values.aliasName,
					labels: values.labels,
					annotations: values.annotations,
					description: values.description,
					version: version,
					charSet: charSet,
					port: values.mysqlPort,
					password: values.mysqlPwd,
					mode: mode,
					filelogEnabled: fileLog,
					stdoutEnabled: standardLog,
					quota: {
						mysql: {
							storageClassName: values.storageClass,
							storageClassQuota: values.storageQuota
						}
					},
					mysqlDTO: {
						replicaCount: 1,
						openDisasterRecoveryMode: backupFlag,
						type: 'master-master'
					}
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
				// 主机亲和
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
				// 主机容忍
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
				// 配额
				if (instanceSpec === 'General') {
					switch (specId) {
						case '1':
							sendData.quota.mysql.cpu = 1;
							sendData.quota.mysql.memory = '2Gi';
							break;
						case '2':
							sendData.quota.mysql.cpu = 2;
							sendData.quota.mysql.memory = '4Gi';
							break;
						case '3':
							sendData.quota.mysql.cpu = 4;
							sendData.quota.mysql.memory = '16Gi';
							break;
						case '4':
							sendData.quota.mysql.cpu = 8;
							sendData.quota.mysql.memory = '32Gi';
							break;
						case '5':
							sendData.quota.mysql.cpu = 16;
							sendData.quota.mysql.memory = '64Gi';
							break;
						default:
							break;
					}
				} else if (instanceSpec === 'Customize') {
					sendData.quota.mysql.cpu = values.cpu;
					sendData.quota.mysql.memory = values.memory + 'Gi';
				}
				// 克隆服务
				if (backupFileName) {
					sendData.middlewareName = middlewareName;
					sendData.backupFileName = backupFileName;
				}
				// 灾备服务-源服务和备服务同时创建
				if (backupFlag) {
					sendData.mysqlDTO.relationName = values.relationName;
					sendData.mysqlDTO.relationAliasName =
						values.relationAliasName;
					sendData.mysqlDTO.relationClusterId = relationClusterId;
					sendData.mysqlDTO.relationNamespace = relationNamespace;
					sendData.mysqlDTO.type = 'master-master';
					sendData.mysqlDTO.isSource = true;
					sendData.relationMiddleware = {
						chartName: chartName,
						chartVersion: chartVersion,
						type: 'mysql',
						labels: values.labels,
						annotations: values.annotations,
						description: values.description,
						version: version,
						charSet: charSet,
						port: values.mysqlPort,
						password: values.mysqlPwd,
						mode: mode,
						filelogEnabled: fileLog,
						stdoutEnabled: standardLog,
						nodeAffinity: sendData.nodeAffinity,
						tolerations: sendData.tolerations,
						quota: {
							mysql: {
								storageClassName: values.storageClass,
								storageClassQuota: values.storageQuota
							}
						}
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
						sendData.relationMiddleware.dynamicValues =
							dynamicValues;
					}
				}
				// 灾备服务-在已有源服务上创建备服务
				if (state && state.disasterOriginName && originData) {
					const sendDataTemp: MysqlSendDataTempParams = {
						chartName: chartName,
						chartVersion: originData.chartVersion,
						clusterId: globalCluster.id,
						namespace: globalNamespace.name,
						type: 'mysql',
						middlewareName: originData.name,
						name: originData.name,
						aliasName: originData.aliasName,
						labels: originData.labels,
						annotations: values.annotations,
						description: values.description,
						version: originData.version,
						charSet: originData.charSet,
						port: originData.port,
						password: originData.password,
						mode: originData.mode,
						filelogEnabled: originData.filelogEnabled,
						stdoutEnabled: originData.stdoutEnabled,
						quota: {
							mysql: {
								cpu: originData.quota.mysql.cpu,
								memory: originData.quota.mysql.memory,
								storageClassName:
									originData.quota.mysql.storageClass,
								storageClassQuota:
									originData.quota.mysql.storageQuota
							}
						},
						mysqlDTO: {
							replicaCount: 1,
							openDisasterRecoveryMode: true,
							relationName: values.name,
							relationAliasName: values.aliasName,
							relationClusterId: relationClusterId,
							relationNamespace: relationNamespace,
							isSource: true
						},
						relationMiddleware: {
							chartName: chartName,
							chartVersion: chartVersion,
							type: 'mysql',
							labels: values.labels,
							annotations: values.annotations,
							description: values.description,
							version: version,
							charSet: charSet,
							port: values.mysqlPort,
							password: values.mysqlPwd,
							mode: mode,
							filelogEnabled: fileLog,
							stdoutEnabled: standardLog,
							backupFileName: values.dataSource,
							dynamicValues: null,
							quota: {
								mysql: {
									cpu: sendData.quota.mysql.cpu,
									memory: sendData.quota.mysql.memory,
									storageClassName: values.storageClass,
									storageClassQuota: values.storageQuota
								}
							}
						}
					};
					// 主机亲和
					if (affinity.flag) {
						if (!affinityLabels.length) {
							Message.show(
								messageConfig(
									'error',
									'错误',
									'请选择主机亲和。'
								)
							);
							return;
						} else {
							sendDataTemp.nodeAffinity = affinityLabels.map(
								(item) => {
									return {
										label: item.label,
										required: affinity.checked,
										namespace: globalNamespace.name
									};
								}
							);
							sendDataTemp.relationMiddleware.nodeAffinity =
								sendDataTemp.nodeAffinity;
						}
					}
					// 主机容忍
					if (tolerations.flag) {
						if (!tolerationsLabels.length) {
							Message.show(
								messageConfig(
									'error',
									'错误',
									'请选择主机容忍。'
								)
							);
							return;
						} else {
							sendDataTemp.tolerations = tolerationsLabels.map(
								(item) => item.label
							);
							sendDataTemp.relationMiddleware.tolerations =
								sendDataTemp.tolerations;
						}
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
						sendDataTemp.dynamicValues = dynamicValues;
						sendDataTemp.relationMiddleware.dynamicValues =
							dynamicValues;
					}
					sendData = sendDataTemp;
				}
				if (state && state.disasterOriginName) {
					addDisasterIns(sendData).then((res) => {
						if (res.success) {
							Message.show(
								messageConfig(
									'success',
									'成功',
									'中间件mysql正在创建中'
								)
							);
							history.push({
								pathname: `/serviceList/${chartName}/${aliasName}`
							});
						} else {
							Message.show(messageConfig('error', '失败', res));
						}
					});
				} else {
					postMiddleware(sendData).then((res) => {
						if (res.success) {
							Message.show(
								messageConfig('success', '成功', {
									data: '中间件Mysql正在创建中'
								})
							);
							history.push({
								pathname: `/serviceList/${chartName}/${aliasName}`
							});
						} else {
							Message.show(messageConfig('error', '错误', res));
						}
					});
				}
			}
		});
	};

	// 全局资源池更新
	useEffect(() => {
		if (JSON.stringify(globalCluster) !== '{}') {
			getNodePort({ clusterId: globalCluster.id }).then((res) => {
				if (res.success) {
					setLabelList(res.data);
				}
			});
			getNodeTaint({ clusterid: globalCluster.id }).then((res) => {
				if (res.success) {
					setTolerationList(res.data);
				}
			});
		}
	}, [globalCluster]);

	const getMiddlewareDetailAndSetForm = (middlewareName: string) => {
		getMiddlewareDetail({
			clusterId: globalCluster.id,
			namespace: globalNamespace.name,
			middlewareName: middlewareName,
			type: 'mysql'
		}).then((res) => {
			console.log(res);
			setOriginData(res.data);
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
			if (res.data.charSet) {
				setCharSet(res.data.charSet);
			}
			if (res.data.version) {
				setVersion(res.data.version);
			}
			field.setValues({
				name: backupFileName ? res.data.name + '-backup' : '',
				labels: res.data.labels,
				annotations: res.data.annotations,
				description: res.data.description,
				mysqlPort: res.data.port,
				mysqlPwd: res.data.password,
				cpu: res.data.quota.mysql.cpu,
				memory: transUnit.removeUnit(res.data.quota.mysql.memory, 'Gi'),
				storageClass: res.data.quota.mysql.storageClassName,
				storageQuota: transUnit.removeUnit(
					res.data.quota.mysql.storageClassQuota,
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
	const handleReuse = (checked: boolean) => {
		setReuse(checked);
		if (!checked) {
			setAffinity({
				flag: false,
				label: '',
				checked: false
			});
			setCharSet('utf8mb4');
			setInstanceSpec('General');
			field.setValues({
				aliasName: '',
				labels: '',
				annotations: '',
				description: '',
				mysqlPort: '',
				mysqlPwd: '',
				cpu: '',
				memory: '',
				storageClass: '',
				storageQuota: ''
			});
			if (customForm) {
				let keys: string[] = [];
				for (const i in customForm) {
					const list = getCustomFormKeys(customForm[i]);
					keys = [...list, ...keys];
				}
				keys.forEach((item) => {
					field.setValue(item, '');
				});
			}
		} else {
			if (originData?.nodeAffinity) {
				setAffinity({
					flag: false,
					label: originData.nodeAffinity[0].label,
					checked: originData.nodeAffinity[0].required
				});
			}
			if (originData?.charSet) {
				setCharSet(originData.charSet);
			}
			setInstanceSpec('Customize');
			field.setValues({
				aliasName: originData?.aliasName,
				labels: originData?.labels,
				annotations: originData?.annotations,
				description: originData?.description,
				mysqlPort: originData?.port,
				mysqlPwd: originData?.password,
				cpu: originData?.quota.mysql.cpu,
				memory: transUnit.removeUnit(
					originData?.quota.mysql.memory,
					'Gi'
				),
				storageClass: originData?.quota.mysql.storageClassName,
				storageQuota: transUnit.removeUnit(
					originData?.quota.mysql.storageClassQuota,
					'Gi'
				)
			});
			if (customForm) {
				let keys: string[] = [];
				for (const i in customForm) {
					const list = getCustomFormKeys(customForm[i]);
					keys = [...list, ...keys];
				}
				keys.forEach((item) => {
					field.setValue(item, originData?.dynamicValues[item]);
				});
			}
		}
	};

	// 全局分区更新
	useEffect(() => {
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
			if (backupFileName) {
				getMiddlewareDetailAndSetForm(middlewareName);
			}
		}
		if (JSON.stringify(globalNamespace) !== '{}') {
			// 灾备服务
			if (state && state.disasterOriginName) {
				getMiddlewareDetailAndSetForm(state.disasterOriginName);
			}
		}
	}, [globalNamespace]);

	const handleChange = (value: any, data: any) => {
		setRelationClusterId(data.parent);
		if (data.parent === globalCluster.id) {
			setReClusterFlag(true);
		} else {
			setReClusterFlag(false);
		}
		setRelationNamespace(data.value);
	};
	const onLoadData = (data: any) => {
		return getNamespaces({ clusterId: data.value }).then((res) => {
			if (res.success) {
				const list = res.data.map((item: namespaceType) => {
					return {
						parent: data.value,
						label: item.name,
						value: item.name,
						isLeaf: true
					};
				});
				const dsTemp = dataSource.map((item) => {
					if (item.value === data.value) {
						item.children = list;
					}
					return item;
				});
				setDataSource(dsTemp);
			}
		});
	};

	return (
		<Page>
			<Page.Header
				title="发布MySQL服务"
				className="page-header"
				hasBackArrow
				onBackArrowClick={() => {
					history.push({
						pathname: `/serviceList/${chartName}/${aliasName}`
					});
				}}
			/>
			<Page.Content>
				<Form {...formItemLayout} field={field}>
					{state && state.disasterOriginName ? (
						<>
							<FormBlock title="源服务信息">
								<div className={styles['origin-info']}>
									<ul className="form-layout">
										<li className="display-flex">
											<label className="form-name">
												<span>资源池</span>
											</label>
											<div className="form-content">
												<FormItem>
													<Input
														disabled={true}
														style={{
															width: '378px'
														}}
														value={globalCluster.id}
													/>
												</FormItem>
											</div>
										</li>
										<li className="display-flex">
											<label className="form-name">
												<span>服务名称</span>
											</label>
											<div className="form-content">
												<FormItem>
													<Input
														disabled={true}
														style={{
															width: '378px'
														}}
														value={
															globalNamespace.name
														}
													/>
												</FormItem>
											</div>
										</li>
									</ul>
								</div>
							</FormBlock>
							<FormBlock
								title={
									<span>
										复用源服务信息
										<span className="ml-24">
											{reuse ? '已开启' : '已关闭'}
											<Switch
												style={{
													marginLeft: 16,
													verticalAlign: 'middle'
												}}
												size="small"
												checked={reuse}
												onChange={handleReuse}
											/>
										</span>
									</span>
								}
							>
								<div className={styles['reuse-origin-info']}>
									<ul className="form-layout">
										<li className="display-flex">
											<label className="form-name">
												<span className="ne-required">
													灾备服务资源池
												</span>
											</label>
											<div className="form-content">
												<FormItem
													required
													requiredMessage="请选择灾备服务资源池"
												>
													<CascaderSelect
														listStyle={{
															width: '189px'
														}}
														name="clusterAndNamespace"
														style={{
															width: '378px'
														}}
														dataSource={dataSource}
														loadData={onLoadData}
														onChange={handleChange}
														expandTriggerType="hover"
													/>
												</FormItem>
												{reClusterFlag && (
													<Form.Error>
														若有可用的其它资源池的情况下，不建议将灾备服务和源服务部署在一个资源池
													</Form.Error>
												)}
											</div>
										</li>
									</ul>
								</div>
							</FormBlock>
						</>
					) : null}
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
											patternMessage="请输入由小写字母数字及“-”组成的2-30个字符"
										>
											<Input
												name="name"
												placeholder="请输入由小写字母数字及“-”组成的2-30个字符"
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
												开启该功能，平台会将日志目录下的文件日志收集至Elasticsearch中，可以在服务详情下的“日志管理”菜单下查看具体的日志，如果当前资源池未部署/对接Elasticsearch组件，则无法启用该功能
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
												style={{ lineHeight: '18px' }}
											>
												开启该功能，平台会将标准输出（stdout）的日志收集至Elasticsearch中，可以在服务详情下的“日志管理”菜单下查看具体的日志，如果当前资源池未部署/对接Elasticsearch组件，则无法启用该功能
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
					<FormBlock title="MySQL配置">
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
										<span>字符集</span>
									</label>
									<div
										className={`form-content display-flex`}
									>
										<SelectBlock
											options={charSetList}
											currentValue={charSet}
											onCallBack={(value: any) =>
												setCharSet(value)
											}
										/>
									</div>
								</li>
								<li
									className="display-flex"
									style={{ paddingTop: 8 }}
								>
									<label className="form-name">
										<span>端口号</span>
									</label>
									<div
										className="form-content"
										style={{ flex: '0 0 376px' }}
									>
										<FormItem
											min={1}
											max={65535}
											minmaxLengthMessage="端口范围为1至65535的正整数,默认为3306"
										>
											<Input
												htmlType="number"
												name="mysqlPort"
												placeholder="请输入mysql的服务端口号，默认为3306"
												trim
											/>
										</FormItem>
									</div>
								</li>
								<li className="display-flex">
									<label className="form-name">
										<span>root密码</span>
									</label>
									<div
										className="form-content"
										style={{ flex: '0 0 376px' }}
									>
										<FormItem
											pattern={pattern.mysqlPwd}
											patternMessage="由1-16位字母和数字以及特殊字符组成"
										>
											<Input
												htmlType="password"
												name="mysqlPwd"
												placeholder="请输入root密码，输入为空则由平台随机生成"
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
										className={`form-content display-flex`}
									>
										<SelectBlock
											options={modeList}
											currentValue={mode}
											onCallBack={(value: any) =>
												setMode(value)
											}
										/>
										{/* 一主多从 */}
										{/* <div>
											<label style={{ margin: '0 16px' }}>
												自定义从节点数量
											</label>
											<NumberPicker
												type="inline"
												name="从节点数量字段"
												defaultValue={1}
												onChange={(value) =>
													setReplicaCount(value)
												}
												value={replicaCount}
												max={10}
												min={1}
											/>
										</div> */}
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
													isMysql={true}
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
																minmaxMessage={`最小为0.1,不能超过当前分区配额剩余的最大值（${maxMemory?.max}Gi）`}
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
											min={5}
											minmaxMessage="mysql存储配额不得低于5GB"
										>
											<Input
												name="storageQuota"
												defaultValue={5}
												htmlType="number"
												min={5}
												placeholder="请输入存储配额大小"
												addonTextAfter="GB"
											/>
										</FormItem>
									</div>
								</li>
							</ul>
						</div>
					</FormBlock>
					{!state || !state.disasterOriginName ? (
						<FormBlock title="灾备服务基础信息">
							<div className={styles['backup-info']}>
								<ul className="form-layout">
									<li className="display-flex">
										<label className="form-name">
											<span style={{ marginRight: 8 }}>
												灾备模式
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
													开启该模式，您可在本资源池或者其他资源池内创建一个同样配置的备用MySQL服务，可在“服务列表→灾备管理”菜单查看详情
												</span>
											</Balloon>
										</label>
										<div
											className={`form-content display-flex ${styles['backup']}`}
										>
											<FormItem>
												<div
													className={styles['switch']}
												>
													{backupFlag
														? '已开启'
														: '关闭'}
													<Switch
														checked={backupFlag}
														onChange={(value) =>
															setBackupFlag(value)
														}
														size="small"
														style={{
															marginLeft: 16,
															verticalAlign:
																'middle'
														}}
													/>
												</div>
											</FormItem>
										</div>
									</li>
									{backupFlag && (
										<>
											<li className="display-flex">
												<label className="form-name">
													<span className="ne-required">
														灾备服务资源池
													</span>
												</label>
												<div className="form-content">
													<FormItem
														required
														requiredMessage="请选择灾备服务资源池"
													>
														<CascaderSelect
															listStyle={{
																width: '189px'
															}}
															name="clusterAndNamespace"
															style={{
																width: '378px'
															}}
															dataSource={
																dataSource
															}
															loadData={
																onLoadData
															}
															onChange={
																handleChange
															}
															expandTriggerType="hover"
														/>
													</FormItem>
													{reClusterFlag && (
														<Form.Error>
															若有可用的其它资源池的情况下，不建议将灾备服务和源服务部署在一个资源池
														</Form.Error>
													)}
												</div>
											</li>
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
														patternMessage="请输入由小写字母数字及“-”组成的2-40个字符"
													>
														<Input
															name="relationName"
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
														pattern={
															pattern.nickname
														}
														patternMessage="请输入由汉字、字母、数字及“-”或“.”或“_”组成的2-80个字符"
													>
														<Input
															name="relationAliasName"
															placeholder="请输入由汉字、字母、数字及“-”或“.”或“_”组成的2-80个字符"
														/>
													</FormItem>
												</div>
											</li>
										</>
									)}
								</ul>
							</div>
						</FormBlock>
					) : null}
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
							onClick={() =>
								history.push({
									pathname: `/serviceList/${chartName}/${aliasName}`
								})
							}
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
export default connect(mapStateToProps, {})(MysqlCreate);