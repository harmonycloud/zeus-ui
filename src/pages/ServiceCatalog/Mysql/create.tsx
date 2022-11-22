import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import FormBlock from '@/components/FormBlock';
import SelectBlock from '@/components/SelectBlock';
import TableRadio from '../components/TableRadio/index';
import {
	Result,
	Form,
	Input,
	Switch,
	Select,
	Button,
	notification,
	InputNumber,
	Cascader,
	Tooltip,
	AutoComplete,
	Tag,
	Popover,
	Radio,
	DatePicker
} from 'antd';
import {
	getNodePort,
	getNodeTaint,
	postMiddleware,
	getMiddlewareDetail,
	addDisasterIns,
	getKey,
	getTolerations
} from '@/services/middleware';
import { getDisaster, getMirror } from '@/services/common';
import { getClusters, getNamespaces, getAspectFrom } from '@/services/common';
import { getProjectNamespace } from '@/services/project';
import { instanceSpecList, mysqlDataList } from '@/utils/const';
import transUnit from '@/utils/transUnit';
import { applyBackup, getIncBackup } from '@/services/backup';
import pattern from '@/utils/pattern';
// * 外接动态表单相关
import { getCustomFormKeys, childrenRender } from '@/utils/utils';
import Affinity from '@/components/Affinity';
import moment from 'moment';

import { NamespaceItem } from '@/pages/ProjectDetail/projectDetail';
import {
	CreateProps,
	CreateParams,
	AffinityProps,
	TolerationsProps,
	AffinityLabelsItem,
	TolerationsLabelsItem,
	MysqlSendDataParams,
	MysqlSendDataTempParams
} from '../catalog';
import { StoreState, clusterType, namespaceType } from '@/types/index';
import {
	AutoCompleteOptionItem,
	middlewareDetailProps,
	MirrorItem
} from '@/types/comment';

import styles from './mysql.module.scss';
import {
	CheckCircleFilled,
	CloseCircleFilled,
	PlusOutlined,
	QuestionCircleOutlined
} from '@ant-design/icons';
import StorageQuota from '@/components/StorageQuota';
import storage from '@/utils/storage';

export const mysqlNewList = [
	{
		value: '1',
		label: (
			<div>
				<p>CPU: 1Core</p>
				<p>内存: 2Gi</p>
			</div>
		)
	},
	{
		value: '2',
		label: (
			<div>
				<p>CPU: 2Core</p>
				<p>内存: 8Gi</p>
			</div>
		)
	},
	{
		value: '3',
		label: (
			<div>
				<p>CPU: 4Core</p>
				<p>内存: 16Gi</p>
			</div>
		)
	},
	{
		value: '4',
		label: (
			<div>
				<p>CPU: 8Core</p>
				<p>内存: 32Gi</p>
			</div>
		)
	},
	{
		value: '5',
		label: <div style={{ lineHeight: '28px' }}>自定义</div>
	}
];

const { Item: FormItem } = Form;
const Password = Input.Password;
const MysqlCreate: (props: CreateProps) => JSX.Element = (
	props: CreateProps
) => {
	const {
		cluster: globalCluster,
		namespace: globalNamespace,
		project
	} = props.globalVar;
	const params: CreateParams = useParams();
	const {
		chartName,
		chartVersion,
		middlewareName,
		backupFileName,
		aliasName,
		namespace,
		backup
	} = params;
	const { state } = props.location;
	const [form] = Form.useForm();
	// const field = Field.useField();
	const history = useHistory();
	// 主机亲和
	const [affinity, setAffinity] = useState<AffinityProps>({
		flag: false,
		label: '',
		checked: false
	});
	const [labelList, setLabelList] = useState<AutoCompleteOptionItem[]>([]);
	const [mirrorList, setMirrorList] = useState<MirrorItem[]>([]);
	// const changeAffinity = (value: any, key: string) => {
	// 	setAffinity({
	// 		...affinity,
	// 		[key]: value
	// 	});
	// };
	const [affinityFlag, setAffinityFlag] = useState<boolean>(false);

	const [affinityLabels, setAffinityLabels] = useState<AffinityLabelsItem[]>(
		[]
	);
	// 主机反亲和
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
		},
		{
			label: '8.0',
			value: '8.0'
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
	const [modeList, setModeList] = useState([
		{
			label: '一主一从',
			value: '1m-1s'
		},
		{
			label: '一主多从',
			value: '1m-ns'
		}
	]);
	const [instanceSpec, setInstanceSpec] = useState<string>('General');
	const [specId, setSpecId] = useState<string>('1');
	const [newSpecId, setNewSpecId] = useState<string>('1');
	const [proxySpecId, setProxySpecId] = useState<string>('1');
	const [maxCpu, setMaxCpu] = useState<{ max: number }>(); // 自定义cpu的最大值
	const [maxMemory, setMaxMemory] = useState<{ max: number }>(); // 自定义memory的最大值
	const [replicaCount, setReplicaCount] = useState(2); // * 一主多从

	// * 灾备
	const [backupFlag, setBackupFlag] = useState<boolean>(false);
	const [reuse, setReuse] = useState<boolean>(true);
	const [dataSource, setDataSource] = useState([]);
	const [relationClusterId, setRelationClusterId] = useState<string>();
	const [relationNamespace, setRelationNamespace] = useState<string>();
	const [originData, setOriginData] = useState<middlewareDetailProps>();
	const [reClusterFlag, setReClusterFlag] = useState<boolean>(false);
	const [relationMirrorList, setRelationMirrorList] = useState<MirrorItem[]>(
		[]
	);
	const [relationActive, setRelationActive] = useState<boolean>(false);
	// * 外接的动态表单
	const [customForm, setCustomForm] = useState<any>();
	// * 后端是否开启灾备开关
	const [disasterOpen] = useState<boolean>(
		storage.getSession('disasterOpen') || false
	);
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
	// * 当导航栏的命名空间为全部时
	const [namespaceList, setNamespaceList] = useState<NamespaceItem[]>([]);
	const [selectNamespace, setSelectNamespace] = useState<string>();
	// * root密码
	const [mysqlPwd, setMysqlPwd] = useState<string>('');
	const [checks, setChecks] = useState<boolean[]>([false, false]);
	// * 读写分离模式
	const [readWriteProxy, setReadWriteProxy] = useState<string>('false');
	// * 备份
	const backupDetail = storage.getLocal('backupDetail');
	// * 灾备是否开启判断
	const [disasterOpen, setDisasterOpen] = useState<boolean>(false);
	const disabledDate = (current: any) => {
		// Can not select days before today and today
		return (
			current < moment(new Date(backupDetail?.startTime)) ||
			current >
				moment(
					new Date(new Date(backupDetail?.endTime).getTime() + 1000)
				)
		);
	};
	const range = (start: number, end: number) => {
		const result = [];
		for (let i = start; i < end; i++) {
			result.push(i);
		}
		return result;
	};

	const disabledDateTime = (date: any) => {
		if (
			moment(date).format('YYYY-MM-DD') ===
			backupDetail?.startTime?.substring(0, 10)
		)
			return {
				disabledHours: () =>
					range(0, moment(backupDetail?.startTime).hour() + 1),
				disabledMinutes: () =>
					range(0, moment(backupDetail?.startTime).minute() + 1),
				disabledSeconds: () =>
					range(0, moment(backupDetail?.startTime).second())
			};
		else if (
			moment(date).format('YYYY-MM-DD') ===
			backupDetail?.endTime?.substring(0, 10)
		) {
			return {
				disabledHours: () =>
					range(moment(backupDetail?.endTime).hour(), 60),
				disabledMinutes: () =>
					range(moment(backupDetail?.endTime).minute(), 60),
				disabledSeconds: () =>
					range(moment(backupDetail?.endTime).second(), 60)
			};
		} else {
			return {
				disabledHours: () => range(0, 0),
				disabledMinutes: () => range(0, 0),
				disabledSeconds: () => range(0, 0)
			};
		}
	};

	useEffect(() => {
		getDisaster().then((res) => {
			if (res.success) {
				setDisasterOpen(JSON.parse(res.data));
			}
		});
		getClusters().then((res) => {
			if (res.success) {
				const list = res.data.map((item: clusterType) => {
					return {
						value: item.id,
						label: item.nickname,
						isLeaf: false
					};
				});
				setDataSource(list);
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
		if (globalNamespace.availableDomain) {
			setModeList([
				{
					label: '一主一从',
					value: '1m-1s'
				},
				{
					label: '一主三从',
					value: '1m-3s'
				}
			]);
			setMode('1m-1s');
		}
	}, []);

	useEffect(() => {
		if (
			namespaceList.find((item) => item.name === selectNamespace)
				?.availableDomain
		) {
			setModeList([
				{
					label: '一主一从',
					value: '1m-1s'
				},
				{
					label: '一主三从',
					value: '1m-3s'
				}
			]);
			setMode('1m-1s');
		}
	}, [selectNamespace]);

	useEffect(() => {
		if (JSON.stringify(project) !== '{}' && globalNamespace.name === '*') {
			getProjectNamespace({
				projectId: project.projectId,
				clusterId: globalCluster.id
			}).then((res) => {
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
			});
		}
		getKey().then((res) => {
			if (res.success && globalNamespace.availableDomain) {
				if (res.data?.anti) {
					setAntiFlag(true);
					setAntiLabels([
						{
							label: res.data.label,
							checked: res.data.required,
							anti: true,
							id: Math.random()
						}
					]);
				} else {
					setAffinityFlag(true);
					setAffinityLabels([
						{
							label: res.data.label,
							checked: res.data.required,
							anti: false,
							id: Math.random()
						}
					]);
				}
			}
		});
		getTolerations().then((res) => {
			if (res.success && globalNamespace.availableDomain) {
				setTolerations({ flag: true, label: '' });
				setTolerationsLabels([{ label: res.data, id: Math.random() }]);
			}
		});
	}, [project, globalNamespace]);

	useEffect(() => {
		if (judgeActiveActive(form.getFieldValue('namespace'))) {
			getKey().then((res) => {
				if (res.success) {
					if (res.data?.anti) {
						setAntiFlag(true);
						setAntiLabels([
							{
								label: res.data.label,
								checked: res.data.required,
								anti: true,
								id: Math.random()
							}
						]);
					} else {
						setAffinityFlag(true);
						setAffinityLabels([
							{
								label: res.data.label,
								checked: res.data.required,
								anti: false,
								id: Math.random()
							}
						]);
					}
				}
			});
			getTolerations().then((res) => {
				if (res.success) {
					setTolerations({ flag: true, label: '' });
					setTolerationsLabels([
						{ label: res.data, id: Math.random() }
					]);
				}
			});
		}
	}, [form.getFieldValue('namespace')]);

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
		form.validateFields().then((values) => {
			console.log(values);
			let storageClassTemp = '';
			if (typeof values.storageClass === 'string') {
				storageClassTemp = values.storageClass.split('/')[0];
			} else {
				storageClassTemp = values.storageClass
					.map((item: string) => item.split('/')[0])
					.join(',');
			}
			let sendData: MysqlSendDataParams = {
				chartName: chartName,
				chartVersion: chartVersion,
				clusterId: globalCluster.id,
				namespace:
					globalNamespace.name === '*'
						? values.namespace
						: globalNamespace.name,
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
				readWriteProxy: {
					enabled: readWriteProxy === 'true' ? true : false
				},
				quota: {
					mysql: {
						storageClassName: storageClassTemp,
						storageClassQuota: values.storageQuota
					}
				},
				mysqlDTO: {
					replicaCount:
						mode.charAt(3) === 'n'
							? replicaCount
							: Number(mode.charAt(3)),
					openDisasterRecoveryMode: backupFlag,
					type: mode === '1m-1s' ? 'master-master' : 'master-slave'
				},
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
			// 主机亲和
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
							required:
								item.checked || item.required || false || false,
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
					sendData.nodeAffinity = nodeAffinity.concat(nodeAnti);
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
					sendData.nodeAffinity = nodeAffinity.concat(nodeAnti);
				}
			}
			// 主机容忍
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
			// 配额
			if (instanceSpec === 'General' && readWriteProxy !== 'true') {
				switch (specId) {
					case '1':
						sendData.quota.mysql.cpu = 2;
						sendData.quota.mysql.memory = '4Gi';
						break;
					case '2':
						sendData.quota.mysql.cpu = 4;
						sendData.quota.mysql.memory = '8Gi';
						break;
					case '3':
						sendData.quota.mysql.cpu = 4;
						sendData.quota.mysql.memory = '16Gi';
						break;
					case '4':
						sendData.quota.mysql.cpu = 8;
						sendData.quota.mysql.memory = '16Gi';
						break;
					case '5':
						sendData.quota.mysql.cpu = 8;
						sendData.quota.mysql.memory = '32Gi';
						break;
					case '6':
						sendData.quota.mysql.cpu = 16;
						sendData.quota.mysql.memory = '64Gi';
						break;
					default:
						break;
				}
			} else if (readWriteProxy === 'true') {
				switch (specId) {
					case '1':
						sendData.quota.mysql.cpu = 1;
						sendData.quota.mysql.memory = '2Gi';
						break;
					case '2':
						sendData.quota.mysql.cpu = 2;
						sendData.quota.mysql.memory = '8Gi';
						break;
					case '3':
						sendData.quota.mysql.cpu = 4;
						sendData.quota.mysql.memory = '16Gi';
						break;
					case '4':
						sendData.quota.mysql.cpu = 8;
						sendData.quota.mysql.memory = '32Gi';
						break;
					default:
						break;
				}
			} else if (instanceSpec === 'Customize' || newSpecId === '5') {
				sendData.quota.mysql.cpu = values.cpu;
				sendData.quota.mysql.memory = values.memory + 'Gi';
			}
			if (namespace) {
				sendData.namespace = namespace;
			}
			// 克隆服务
			if (storage.getLocal('backupDetail').backupFileName) {
				sendData.middlewareName = middlewareName;
				sendData.backupFileName = backupFileName;
			}
			// 灾备服务-源服务和备服务同时创建
			if (backupFlag) {
				let relactionStorageClassTemp = '';
				if (typeof values.relationStorageClass === 'string') {
					relactionStorageClassTemp =
						values.relationStorageClass.split('/')[0];
				} else {
					relactionStorageClassTemp = values.relationStorageClass
						.map((item: string) => item.split('/')[0])
						.join(',');
				}
				sendData.mysqlDTO.relationName = values.relationName;
				sendData.mysqlDTO.relationAliasName = values.relationAliasName;
				sendData.mysqlDTO.relationClusterId = relationClusterId;
				sendData.mysqlDTO.relationNamespace = relationNamespace;
				sendData.mysqlDTO.type =
					mode === '1m-1s' ? 'master-master' : 'master-slave';
				sendData.mysqlDTO.isSource = true;
				sendData.mysqlDTO.replicaCount =
					mode.charAt(3) === 'n'
						? replicaCount
						: Number(mode.charAt(3));
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
					mirrorImageId:
						relationMirrorList
							.find(
								(item: MirrorItem) =>
									item.address ===
									values.relationMirrorImageId
							)
							?.id.toString() || '',
					quota: {
						mysql: {
							storageClassName: relactionStorageClassTemp,
							storageClassQuota: values.relationStorageQuota
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
					sendData.relationMiddleware.dynamicValues = dynamicValues;
				}
			}
			// 灾备服务-在已有源服务上创建备服务
			if (state && state.disasterOriginName && originData) {
				let disStorageClassTemp = '';
				if (typeof values.storageClass === 'string') {
					disStorageClassTemp = values.storageClass.split('/')[0];
				} else {
					disStorageClassTemp = values.storageClass
						.map((item: string) => item.split('/')[0])
						.join(',');
				}
				const sendDataTemp: MysqlSendDataTempParams = {
					chartName: chartName,
					chartVersion: originData.chartVersion,
					clusterId: globalCluster.id,
					namespace: namespace as string,
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
					readWriteProxy: {
						enabled: readWriteProxy === 'true' ? true : false
					},
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
						replicaCount:
							mode.charAt(3) === 'n'
								? replicaCount
								: Number(mode.charAt(3)),
						openDisasterRecoveryMode: true,
						relationName: values.name,
						relationAliasName: values.aliasName,
						relationClusterId: relationClusterId,
						relationNamespace: relationNamespace,
						isSource: true,
						type:
							mode === '1m-1s' ? 'master-master' : 'master-slave'
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
								storageClassName: disStorageClassTemp,
								storageClassQuota: values.storageQuota
							}
						},
						mirrorImageId:
							relationMirrorList
								.find(
									(item: MirrorItem) =>
										item.address === values.mirrorImageId
								)
								?.id.toString() || ''
					}
				};
				// 主机亲和
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
								required:
									item.checked || item.required || false,
								anti: item.anti,
								namespace: globalNamespace.name
							};
						});
						const nodeAnti = antiLabels.map((item) => {
							return {
								label: item.label,
								required:
									item.checked || item.required || false,
								anti: item.anti,
								namespace: globalNamespace.name
							};
						});
						if (antiFlag) {
							sendData.nodeAffinity =
								nodeAffinity.concat(nodeAnti);
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
								required:
									item.checked || item.required || false,
								anti: item.anti,
								namespace: globalNamespace.name
							};
						});
						const nodeAnti = antiLabels.map((item) => {
							return {
								label: item.label,
								required:
									item.checked || item.required || false,
								anti: item.anti,
								namespace: globalNamespace.name
							};
						});
						if (affinityFlag) {
							sendData.nodeAffinity =
								nodeAffinity.concat(nodeAnti);
						} else {
							sendData.nodeAffinity = nodeAnti;
						}
					}
				}
				// 主机容忍
				if (tolerations.flag) {
					if (!tolerationsLabels.length) {
						notification.error({
							message: '错误',
							description: '请选择主机容忍。'
						});
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
			if (history.location.pathname.includes('backup')) {
				const result = {
					clusterId: globalCluster.id,
					namespace: namespace,
					middlewareName: values.name,
					restoreTime:
						backupDetail.recoveryType === 'time'
							? moment(values.restoreTime).format(
									'YYYY-MM-DD HH:mm:ss'
							  )
							: '',
					type: storage.getLocal('backupDetail').sourceType,
					backupName: backupDetail.backupName
				};
				applyBackup(result).then((res) => {
					// * 恢复服务时，需要调用发布接口和备份接口
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
			if (state && state.disasterOriginName) {
				setCommitFlag(true);
				addDisasterIns(sendData).then((res) => {
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
			} else {
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
			}
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

	const getMiddlewareDetailAndSetForm = (middlewareName: string) => {
		getMiddlewareDetail({
			clusterId: globalCluster.id,
			namespace: namespace || globalNamespace.name,
			middlewareName: middlewareName,
			type: 'mysql'
		}).then((res) => {
			if (!res.data) return;
			setOriginData(res.data);
			setInstanceSpec('Customize');
			if (res.data?.nodeAffinity?.length > 0) {
				if (
					res.data?.nodeAffinity?.filter((item: any) => !item.anti)
						.length
				) {
					setAffinityFlag(true);
					setAffinityLabels(
						res.data?.nodeAffinity?.filter(
							(item: any) => !item.anti
						) || []
					);
				}
				if (
					res.data?.nodeAffinity?.filter((item: any) => item.anti)
						.length
				) {
					setAntiFlag(true);
					setAntiLabels(
						res.data?.nodeAffinity?.filter(
							(item: any) => item.anti
						) || []
					);
				}
			}
			if (res.data?.tolerations?.length > 0) {
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
				if (res.data.mode === '1m-0s') {
					setReadWriteProxy(res.data.mode);
				}
				setMode(res.data.mode);
			}
			if (res.data.charSet) {
				setCharSet(res.data.charSet);
			}
			if (res.data.version) {
				setVersion(res.data.version);
			}
			res.data.readWriteProxy?.enabled && setReadWriteProxy('true');
			let storageClassTemp: string | string[];
			if (res.data.quota.mysql.storageClassName.includes(',')) {
				const storageClassAliasNameTemp =
					res.data.quota.mysql.storageClassAliasName.split(',');
				storageClassTemp = res.data.quota.mysql.storageClassName
					.split(',')
					.map(
						(item: string, index: number) =>
							`${item}/${storageClassAliasNameTemp[index]}`
					);
			} else {
				storageClassTemp = `${res.data.quota.mysql.storageClassName}/${res.data.quota.mysql.storageClassAliasName}`;
			}
			form.setFieldsValue({
				name: backupFileName ? res.data.name + '-backup' : '',
				labels: res.data.labels,
				annotations: res.data.annotations,
				description: res.data.description,
				mysqlPort: res.data.port,
				mysqlPwd: res.data.password,
				cpu: Number(res.data.quota.mysql.cpu),
				memory: Number(
					transUnit.removeUnit(res.data.quota.mysql.memory, 'Gi')
				),
				mirrorImageId: res.data.mirrorImage,
				storageClass: storageClassTemp,
				storageQuota: transUnit.removeUnit(
					res.data.quota.mysql.storageClassQuota,
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
			form.setFieldsValue({
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
					form.setFieldsValue({ [item]: '' });
					// field.setValue(item, '');
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
			let storageClassTemp: string | string[];
			if (originData?.quota.mysql.storageClassName.includes(',')) {
				const storageClassAliasNameTemp =
					originData.quota.mysql.storageClassAliasName.split(',');
				storageClassTemp = originData.quota.mysql.storageClassName
					.split(',')
					.map(
						(item: string, index: number) =>
							`${item}/${storageClassAliasNameTemp[index]}`
					);
			} else {
				storageClassTemp = `${originData?.quota.mysql.storageClassName}/${originData?.quota.mysql.storageClassAliasName}`;
			}
			form.setFieldsValue({
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
				storageClass: storageClassTemp,
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
					form.setFieldsValue({
						[item]: originData?.dynamicValues[item]
					});
				});
			}
		}
	};

	// 全局分区更新
	useEffect(() => {
		if (JSON.stringify(globalNamespace) !== '{}') {
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
		}
	}, [globalNamespace]);

	const handleChange = (value: any, data: any) => {
		console.log(value, data);
		setRelationClusterId(value[0]);
		getMirror({
			clusterId: value[0]
		}).then((res) => {
			if (res.success) {
				setRelationMirrorList(res.data.list);
			}
		});
		// form.setFieldsValue({ relationStorageClass: null });
		if (value[0] === globalCluster.id) {
			setReClusterFlag(true);
		} else {
			setReClusterFlag(false);
		}
		setRelationActive(data[1].availableDomain);
		setRelationNamespace(value[1]);
	};
	const onLoadData = (selectedOptions: any) => {
		const targetOption = selectedOptions[selectedOptions.length - 1];
		targetOption.loading = true;
		getNamespaces({
			clusterId: targetOption.value,
			projectId: project.projectId
		}).then((res) => {
			targetOption.loading = false;
			if (res.success) {
				targetOption.children = res.data.map((item: namespaceType) => {
					return {
						label: item.aliasName || item.name,
						value: item.name,
						availableDomain: item.availableDomain
					};
				});
			} else {
				targetOption.children = [];
			}
			setDataSource([...dataSource]);
		});
	};
	const judgeActiveActive = (namespaceTemp: string) => {
		const temp = namespaceList.filter((item) => {
			if (item.name === namespaceTemp) {
				return item;
			}
		});
		return temp[0]?.availableDomain || false;
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
		if (state && state.disasterOriginName) {
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
											pathname: `/serviceList/${chartName}/${aliasName}/disaster/${originData?.name}/${chartName}/${chartVersion}/${originData?.namespace}`
										});
									}}
								>
									返回
								</Button>
							]}
						/>
					</ProContent>
				</ProPage>
			);
		}
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

	const mysqlPwdChange = (e: any) => {
		const temp = [...checks];
		if (e.target.value.length >= 8 && e.target.value.length <= 32) {
			temp[0] = true;
		} else {
			temp[0] = false;
		}
		if (
			/^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)[a-zA-Z0-9\W_]{3,}$/.test(
				e.target.value
			)
		) {
			temp[1] = true;
		} else {
			temp[1] = false;
		}
		setChecks(temp);
		setMysqlPwd(e.target.value);
	};

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

	return (
		<ProPage>
			<ProHeader
				title="发布MySQL服务"
				onBack={() => {
					history.goBack();
				}}
			/>
			<ProContent>
				<Form form={form}>
					{disasterOpen && state && state.disasterOriginName ? (
						<>
							<FormBlock title="源服务信息">
								<div className={styles['origin-info']}>
									<ul className="form-layout">
										<li className="display-flex">
											<label className="form-name">
												<span>集群</span>
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
															state.disasterOriginName
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
													灾备服务集群
												</span>
											</label>
											<div className="form-content">
												<FormItem
													name="clusterAndNamespace"
													rules={[
														{
															required: true,
															message:
																'请选择灾备服务集群'
														}
													]}
													required
												>
													<Cascader
														style={{
															width: '380px'
														}}
														options={dataSource}
														loadData={onLoadData}
														onChange={handleChange}
													/>
												</FormItem>
												{reClusterFlag && (
													<span>
														若有可用的其它集群的情况下，不建议将灾备服务和源服务部署在一个集群
													</span>
												)}
											</div>
										</li>
									</ul>
								</div>
							</FormBlock>
						</>
					) : null}
					{globalNamespace.name === '*' && !state && !namespace && (
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
													dropdownMatchSelectWidth={
														false
													}
													placeholder="请选择命名空间"
													value={selectNamespace}
													onChange={(value) =>
														setSelectNamespace(
															value
														)
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
																		25
																			? item.aliasName.substring(
																					0,
																					25
																			  ) +
																			  '...'
																			: item.aliasName}
																		{item.availableDomain ? (
																			<span className="available-domain">
																				可用区
																			</span>
																		) : null}
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
									disabled={!!backupFileName}
								/>
								<Affinity
									flag={antiFlag}
									flagChange={setAntiFlag}
									values={antiLabels}
									onChange={setAntiLabels}
									cluster={globalCluster}
									disabled={!!backupFileName}
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
												disabled={!!backupFileName}
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
													disabled={!!backupFileName}
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
													disabled={!!backupFileName}
												/>
											</div>
										</div>
									</li>
								</ul>
							</div>
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
											disabled={!!backupFileName}
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
											disabled={!!backupFileName}
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
									<div className="form-content">
										<FormItem
											name="mysqlPort"
											rules={[
												{
													min: 1,
													type: 'number',
													message:
														'端口范围为1至65535的正整数,默认为3306'
												},
												{
													max: 65535,
													type: 'number',
													message:
														'端口范围为1至65535的正整数,默认为3306'
												}
											]}
										>
											<InputNumber
												style={{ width: '380px' }}
												placeholder="请输入mysql的服务端口号，默认为3306"
												disabled={!!backupFileName}
											/>
										</FormItem>
									</div>
								</li>
								<li className="display-flex">
									<label className="form-name">
										<span>root密码</span>
									</label>
									<div className="form-content">
										<Tooltip
											title={
												<ul>
													<li
														className={
															styles[
																'edit-form-icon-style'
															]
														}
													>
														{checks[0] ? (
															<CheckCircleFilled
																style={{
																	color: '#68B642',
																	marginRight: 4
																}}
															/>
														) : (
															<CloseCircleFilled
																style={{
																	color: '#Ef595C',
																	marginRight: 4
																}}
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
															<CheckCircleFilled
																style={{
																	color: '#68B642',
																	marginRight: 4
																}}
															/>
														) : (
															<CloseCircleFilled
																style={{
																	color: '#Ef595C',
																	marginRight: 4
																}}
															/>
														)}
														<span>
															至少包含以下字符中的三种：大写字母、小写字母、数字和特殊字符～!@%^*-_=+?,()&
														</span>
													</li>
												</ul>
											}
										>
											<FormItem name="mysqlPwd">
												<Password
													style={{ width: '380px' }}
													value={mysqlPwd}
													placeholder="请输入root密码，输入为空则由平台随机生成"
													onChange={mysqlPwdChange}
													disabled={!!backupFileName}
												/>
											</FormItem>
										</Tooltip>
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
									<div className="form-content">
										<FormItem
											name="mirrorImageId"
											required
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
													(item) => {
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
										<Tooltip title="本模式中的主、从节点，特指不同类型实例个数">
											<QuestionCircleOutlined />
										</Tooltip>
									</label>
									<div className={`form-content`}>
										<Select
											value={readWriteProxy}
											onChange={(val) => {
												val === '1m-0s'
													? setMode('1m-0s')
													: setMode(
															modeList[0].value
													  );
												setReadWriteProxy(val);
											}}
											style={{
												marginBottom: 12,
												width: 182
											}}
											disabled={!!backupFileName}
										>
											<Select.Option key="false">
												高可用模式
											</Select.Option>
											<Select.Option key="true">
												读写分离模式
											</Select.Option>
											{globalNamespace.availableDomain ||
											namespaceList.find(
												(item) =>
													item.name ===
													selectNamespace
											)?.availableDomain ? null : (
												<Select.Option key="1m-0s">
													单实例模式
												</Select.Option>
											)}
										</Select>
										{readWriteProxy !== '1m-0s' ? (
											<div className={`display-flex`}>
												<SelectBlock
													options={modeList}
													currentValue={mode}
													onCallBack={(value: any) =>
														setMode(value)
													}
													disabled={!!backupFileName}
												/>
											</div>
										) : null}
									</div>
								</li>
								{mode === '1m-ns' ? (
									<li className="display-flex form-li">
										<label className="form-name">
											从节点数
										</label>
										<div className="form-content">
											<InputNumber
												name="从节点数量字段"
												defaultValue={2}
												onChange={(
													value: number | null
												) =>
													setReplicaCount(
														value as number
													)
												}
												value={replicaCount}
												max={6}
												min={2}
												disabled={!!backupFileName}
											/>
										</div>
									</li>
								) : null}
								{readWriteProxy !== 'true' ? (
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
												disabled={!!backupFileName}
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
														onCallBack={(
															value: any
														) => setSpecId(value)}
														dataList={mysqlDataList}
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
																			required:
																				true,
																			message:
																				'请输入自定义CPU配额，单位为Core'
																		},
																		{
																			min: 0.1,
																			type: 'number',
																			message: `最小为0.1`
																		}
																	]}
																	required
																>
																	<InputNumber
																		style={{
																			width: '100%'
																		}}
																		step={
																			0.1
																		}
																		placeholder="请输入自定义CPU配额，单位为Core"
																		disabled={
																			!!backupFileName
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
																	rules={[
																		{
																			required:
																				true,
																			message:
																				'请输入自定义内存配额，单位为Core'
																		},
																		{
																			min: 0.1,
																			type: 'number',
																			message: `最小为0.1`
																		}
																	]}
																	required
																	name="memory"
																>
																	<InputNumber
																		style={{
																			width: '100%'
																		}}
																		step={
																			0.1
																		}
																		placeholder="请输入自定义内存配额，单位为Gi"
																		disabled={
																			!!backupFileName
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
								) : (
									<>
										<li className="display-flex form-li">
											<label className="form-name">
												<span>普通节点规格</span>
											</label>
											<div
												className={`form-content display-flex ${styles['instance-spec-content']}`}
											>
												<SelectBlock
													options={mysqlNewList}
													currentValue={newSpecId}
													onCallBack={(value: any) =>
														setNewSpecId(value)
													}
													disabled={!!backupFileName}
												/>
												{newSpecId === '5' ? (
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
																		name="cpu"
																		rules={[
																			{
																				required:
																					true,
																				message:
																					'请输入自定义CPU配额，单位为Core'
																			},
																			{
																				min: 0.1,
																				type: 'number',
																				message: `最小为0.1`
																			}
																		]}
																		required
																	>
																		<InputNumber
																			style={{
																				width: '100%'
																			}}
																			step={
																				0.1
																			}
																			placeholder="请输入自定义CPU配额，单位为Core"
																			disabled={
																				!!backupFileName
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
																		rules={[
																			{
																				required:
																					true,
																				message:
																					'请输入自定义内存配额，单位为Core'
																			},
																			{
																				min: 0.1,
																				type: 'number',
																				message: `最小为0.1`
																			}
																		]}
																		required
																		name="memory"
																	>
																		<InputNumber
																			style={{
																				width: '100%'
																			}}
																			step={
																				0.1
																			}
																			placeholder="请输入自定义内存配额，单位为Gi"
																			disabled={
																				!!backupFileName
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
										<li className="display-flex form-li">
											<label className="form-name">
												<span>proxy节点规格</span>
											</label>
											<div
												className={`form-content display-flex ${styles['instance-spec-content']}`}
											>
												<SelectBlock
													options={[
														mysqlNewList[0],
														mysqlNewList[1],
														mysqlNewList[2],
														mysqlNewList[3]
													]}
													currentValue={proxySpecId}
													onCallBack={(value: any) =>
														setProxySpecId(value)
													}
													disabled={!!backupFileName}
												/>
											</div>
										</li>
									</>
								)}
								<StorageQuota
									clusterId={
										originData
											? relationClusterId
											: globalCluster.id
									}
									isActiveActive={
										globalNamespace.name === '*'
											? !namespace
												? judgeActiveActive(
														form.getFieldValue(
															'namespace'
														)
												  )
												: namespace
											: globalNamespace.availableDomain
									}
								/>
							</ul>
						</div>
					</FormBlock>
					{disasterOpen &&
					(!state || !state.disasterOriginName) &&
					!globalNamespace.availableDomain ? (
						<FormBlock title="灾备服务基础信息">
							<div className={styles['backup-info']}>
								<ul className="form-layout">
									<li className="display-flex">
										<label className="form-name">
											<span style={{ marginRight: 8 }}>
												灾备模式
											</span>
											<Tooltip title="开启该模式，您可在本集群或者其他集群内创建一个同样配置的备用MySQL服务，可在“服务列表→灾备管理”菜单查看详情">
												<QuestionCircleOutlined />
											</Tooltip>
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
														disabled={
															!!backupFileName
														}
													/>
												</div>
											</FormItem>
										</div>
									</li>
									{backupFlag && (
										<>
											<li
												className="display-flex"
												style={{ width: '600px' }}
											>
												<label className="form-name">
													<span className="ne-required">
														灾备服务集群
													</span>
												</label>
												<div className="form-content">
													<FormItem
														name="clusterAndNamespace"
														required
														rules={[
															{
																required: true,
																message:
																	'请选择灾备服务集群'
															}
														]}
													>
														<Cascader
															options={dataSource}
															loadData={
																onLoadData
															}
															onChange={
																handleChange
															}
															expandTrigger="hover"
														/>
													</FormItem>
													{reClusterFlag && (
														<p>
															若有可用的其它集群的情况下，不建议将灾备服务和源服务部署在一个集群
														</p>
													)}
												</div>
											</li>
											<li
												className="display-flex"
												style={{ width: '600px' }}
											>
												<label className="form-name">
													<span className="ne-required">
														服务名称
													</span>
												</label>
												<div className="form-content">
													<FormItem
														name="relationName"
														required
														rules={[
															{
																required: true,
																message:
																	'请输入服务名称'
															},
															{
																pattern:
																	new RegExp(
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
											<li
												className="display-flex"
												style={{ width: '600px' }}
											>
												<label className="form-name">
													<span>显示名称</span>
												</label>
												<div className="form-content">
													<FormItem
														name="relationAliasName"
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
																pattern:
																	new RegExp(
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
											<li
												className="display-flex"
												style={{ width: '600px' }}
											>
												<label className="form-name">
													<span
														className="ne-required"
														style={{
															marginRight: 8
														}}
													>
														镜像仓库
													</span>
												</label>
												<div className="form-content">
													<FormItem
														name="relationMirrorImageId"
														required
														rules={[
															{
																required: true,
																message:
																	'请选择镜像仓库'
															}
														]}
													>
														<AutoComplete
															placeholder="请选择"
															allowClear={true}
															options={relationMirrorList.map(
																(item) => {
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
											<StorageQuota
												clusterId={relationClusterId}
												type="relation"
												isActiveActive={relationActive}
											/>
										</>
									)}
								</ul>
							</div>
						</FormBlock>
					) : null}
					{history.location.pathname.includes('backup') &&
					backupDetail.recoveryType === 'time' ? (
						<FormBlock title="恢复配置">
							<div className={styles['basic-info']}>
								<div>
									可恢复的时间范围:{' '}
									{backupDetail
										? (backupDetail?.startTime || '--') +
										  ' —— ' +
										  (backupDetail?.endTime || '--')
										: '--'}
								</div>
								<ul className="form-layout">
									<li className="display-flex">
										<label className="form-name">
											<span className="ne-required">
												选择恢复的时间点
											</span>
										</label>
										<div className="form-content">
											<FormItem
												rules={[
													{
														required: true,
														message:
															'请选择恢复的时间点'
													}
												]}
												name="restoreTime"
											>
												<DatePicker
													showNow={false}
													showTime
													disabledDate={disabledDate}
													// disabledTime={
													// 	disabledDateTime
													// }
												/>
											</FormItem>
										</div>
									</li>
									{/* <li className="display-flex">
										<label className="form-name">
											<span className="ne-required">
												冲突处理
											</span>
										</label>
										<div className="form-content">
											<FormItem required name="backType">
												<Radio.Group defaultValue="x">
													<Radio value="x">
														遇到同名对象失败
													</Radio>
													<Radio value="y">
														遇到同名对象则重命名
													</Radio>
												</Radio.Group>
											</FormItem>
										</div>
									</li> */}
								</ul>
							</div>
						</FormBlock>
					) : null}
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
export default connect(mapStateToProps, {})(MysqlCreate);
