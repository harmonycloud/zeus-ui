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
	Select,
	AutoComplete,
	Button,
	Popover,
	Form,
	notification,
	Result,
	InputNumber,
	Tag,
	Checkbox,
	Tooltip,
	Modal
} from 'antd';
import { QuestionCircleOutlined, PlusOutlined } from '@ant-design/icons';
import pattern from '@/utils/pattern';
import transUnit from '@/utils/transUnit';
import styles from './redis.module.scss';
import {
	getNodePort,
	getNodeTaint,
	getStorageClass,
	getMiddlewareDetail,
	postMiddleware,
	getKey,
	getTolerations
} from '@/services/middleware';
import { getMirror } from '@/services/common';
import ModeItem from '@/components/ModeItem';
import DirectoryItem from '@/components/DirectoryItem';
import { instanceSpecList, redisDataList } from '@/utils/const';
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
import Affinity from '@/components/Affinity';
import { getCustomFormKeys, childrenRender } from '@/utils/utils';
import { TolerationLabelItem } from '@/components/FormTolerations/formTolerations';
import {
	middlewareDetailProps,
	StorageClassProps,
	MirrorItem,
	AutoCompleteOptionItem
} from '@/types/comment';
import { applyBackup } from '@/services/backup';
import { StoreState } from '@/types';
// * 外接动态表单相关
import { getAspectFrom } from '@/services/common';

import { NamespaceItem } from '@/pages/ProjectDetail/projectDetail';
import { getProjectNamespace } from '@/services/project';
import StorageQuota from '@/components/StorageQuota';
import storage from '@/utils/storage';
import VersionForm from '../components/VersionForm';

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
	const { chartName, chartVersion, aliasName, namespace, middlewareName } =
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
	const [affinityFlag, setAffinityFlag] = useState<boolean>(false);
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
		TolerationLabelItem[]
	>([]);

	// 日志
	const [fileLog, setFileLog] = useState<boolean>(true);
	const [standardLog, setStandardLog] = useState<boolean>(true);

	// Redis配置
	const [version, setVersion] = useState<string>('');
	const [mode, setMode] = useState<string>('cluster');
	const [modeList, setModeList] = useState([
		{
			label: '集群模式',
			value: 'cluster'
		},
		{
			label: '哨兵模式',
			value: 'sentinel'
		},
		{
			label: '集群代理模式',
			value: 'agent'
		},
		{
			label: '哨兵代理模式',
			value: 'readWriteProxy'
		}
	]);
	const [clusterMode, setClusterMode] = useState<string>('3s-3m');
	const [clusterModeNum, setClusterModeNum] = useState<number | null>(3);
	const [sentinelMode, setSentinelMode] = useState<string>('1s-1m');
	const clusterModeList = [
		{
			label: '三分片',
			value: '3s-3m'
		},
		{
			label: '五分片',
			value: '5s-5m'
		},
		{
			label: '自定义',
			value: 'one'
		}
	];
	const sentinelModeList = [
		{
			label: '单分片',
			value: '1s-1m',
			num: 2
		},
		{
			label: '双分片',
			value: '2s-2m',
			num: 4
		},
		{
			label: '四分片',
			value: '4s-4m',
			num: 8
		},
		{
			label: '八分片',
			value: '8s-8m',
			num: 16
		}
	];
	const [nodeObj, setNodeObj] = useState<NodeObjParams>({
		redis: {
			disabled: false,
			title: 'Redis 节点',
			num: 3,
			specId: '1',
			cpu: 2,
			memory: 1,
			storageClass: '',
			storageQuota: 0
		},
		sentinel: {
			disabled: false,
			title: '哨兵节点',
			num: 3,
			specId: '0',
			cpu: 0.2,
			memory: 0.512
		}
	});
	const [pathObj, setPathObj] = useState<any>({
		'redis-data': {
			title: '数据目录',
			hostPath: '',
			mountPath: '',
			storageClass: null,
			volumeSize: 1,
			targetContainers: ['redis-cluster']
		},
		'redis-logs': {
			title: '日志目录',
			hostPath: '',
			mountPath: '',
			storageClass: null,
			volumeSize: 1,
			targetContainers: ['redis-cluster']
		}
	});
	const [nodeModify, setNodeModify] = useState<NodeModifyParams>({
		nodeName: '',
		flag: false
	});
	const [instanceSpec, setInstanceSpec] = useState<string>('General');
	const [specId, setSpecId] = useState<string>('1');
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
	// * 创建失败返回的失败信息
	const [errorData, setErrorData] = useState<string>('');
	// * 当导航栏的命名空间为全部时
	const [namespaceList, setNamespaceList] = useState<NamespaceItem[]>([]);
	const [selectNamespace, setSelectNamespace] = useState<string>();
	// * 主机网络
	const [hostNetwork, setHostNetwork] = useState<boolean>(false);
	// * 目录分盘
	const [directory, setDirectory] = useState<boolean>(false);

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
		if (globalNamespace.availableDomain) {
			setModeList([
				{
					label: '哨兵模式',
					value: 'sentinel'
				},
				{
					label: '哨兵代理模式',
					value: 'readWriteProxy'
				}
			]);
			setMode('sentinel');
		}
	}, [project, globalNamespace]);

	useEffect(() => {
		if (
			namespaceList.find((item) => item.name === selectNamespace)
				?.availableDomain
		) {
			setModeList([
				{
					label: '哨兵模式',
					value: 'sentinel'
				},
				{
					label: '哨兵代理模式',
					value: 'readWriteProxy'
				}
			]);
			setMode('sentinel');
		} else {
			setModeList([
				{
					label: '集群模式',
					value: 'cluster'
				},
				{
					label: '哨兵模式',
					value: 'sentinel'
				},
				{
					label: '代理模式',
					value: 'agent'
				},
				{
					label: '读写分离模式',
					value: 'readWriteProxy'
				}
			]);
			setMode('cluster');
		}
	}, [selectNamespace]);

	const modifyQuota = (key: string) => {
		// setNodeModify({
		// 	nodeName: key,
		// 	flag: true
		// });
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
	};

	const handleSubmit = () => {
		form.validateFields().then((values: RedisCreateValuesParams) => {
			Modal.info({
				title: '提醒',
				content: `当前初始密码为${values.pwd}，请妥善保存`
			});
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
				mode:
					mode === 'readWriteProxy' || mode === 'agent'
						? mode === 'readWriteProxy'
							? 'sentinel'
							: 'cluster'
						: mode,
				filelogEnabled: fileLog,
				stdoutEnabled: standardLog,
				readWriteProxy: {
					enabled:
						mode === 'readWriteProxy' || mode === 'agent'
							? true
							: false
				},
				quota: { redis: {} },
				mirrorImageId:
					mirrorList
						.find(
							(item: MirrorItem) =>
								item.address === values.mirrorImageId
						)
						?.id.toString() || '',
				redisParam: {
					hostNetwork
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
			if (mode === 'cluster' || mode === 'agent') {
				if (!directory) {
					let storageClassNameTemp = '';
					if (typeof values.storageClass === 'string') {
						storageClassNameTemp =
							values.storageClass.split('/')[0];
					} else {
						storageClassNameTemp = values.storageClass
							.map((item: string) => item.split('/')[0])
							.join(',');
					}
					sendData.quota = {
						redis: {
							num:
								clusterMode === 'one'
									? clusterModeNum
										? clusterModeNum * 2
										: 6
									: clusterMode === '3s-3m'
									? 6
									: 10,
							storageClassName: storageClassNameTemp,
							storageClassQuota: values.storageQuota
						}
					};
				} else {
					sendData.customVolumes = {};
					for (const key in pathObj) {
						let storageClassNameTemp = '';
						if (typeof pathObj[key].storageClass === 'string') {
							storageClassNameTemp =
								pathObj[key].storageClass?.split('/')[0];
						} else {
							storageClassNameTemp = pathObj[key].storageClass
								?.map((item: string) => item.split('/')[0])
								.join(',');
						}
						if (!pathObj[key].disabled) {
							// if (pathObj[key].storageClass === '') {
							// 	return;
							// }
							// if (pathObj[key].storageQuota === 0) {
							// 	notification.error({
							// 		message: '失败',
							// 		description: `${key}节点存储配额不能为0`
							// 	});
							// 	return;
							// }
							sendData.quota = {
								redis: {
									num:
										clusterMode === 'one'
											? clusterModeNum
												? clusterModeNum * 2
												: 6
											: clusterMode === '3s-3m'
											? 6
											: 10
								}
							};
							sendData.customVolumes[key] = {
								...pathObj[key]
							};
						}
					}
				}
				if (instanceSpec === 'General') {
					switch (specId) {
						case '1':
							sendData.quota.redis.cpu = 2;
							sendData.quota.redis.memory = '1Gi';
							break;
						case '2':
							sendData.quota.redis.cpu = 2;
							sendData.quota.redis.memory = '2Gi';
							break;
						case '3':
							sendData.quota.redis.cpu = 2;
							sendData.quota.redis.memory = '4Gi';
							break;
						case '4':
							sendData.quota.redis.cpu = 2;
							sendData.quota.redis.memory = '8Gi';
							break;
						case '5':
							sendData.quota.redis.cpu = 2;
							sendData.quota.redis.memory = '16Gi';
							break;
						case '6':
							sendData.quota.redis.cpu = 2;
							sendData.quota.redis.memory = '32Gi';
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
					console.log(nodeObj);
					sendData.quota = { redis: {} };
					for (const key in nodeObj) {
						let storageClassNameTemp = '';
						if (typeof nodeObj[key].storageClass === 'string') {
							storageClassNameTemp =
								nodeObj[key].storageClass?.split('/')[0];
						} else {
							storageClassNameTemp = nodeObj[key].storageClass
								?.map((item: string) => item.split('/')[0])
								.join(',');
						}
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
								num:
									key === 'redis'
										? sentinelModeList.find(
												(item) =>
													item.value === sentinelMode
										  )?.num
										: nodeObj[key].num,
								storageClassName: storageClassNameTemp,
								storageClassQuota: nodeObj[key].storageQuota
							};
						}
					}
				}
			}
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
					backupName: storage.getLocal('backupDetail').backupName
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
	}, [globalCluster, globalNamespace]);

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

	// 全局分区更新
	useEffect(() => {
		if (JSON.stringify(globalNamespace) !== '{}') {
			// 克隆服务
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
			type: 'redis'
		}).then((res) => {
			if (!res.data) return;
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
				if (res.data.readWriteProxy?.enabled) {
					res.data.mode === 'cluster'
						? setMode('agent')
						: setMode('readWriteProxy');
				} else {
					setMode(res.data.mode);
				}
			}
			if (res.data.version) {
				setVersion(res.data.version);
			}
			form.setFieldsValue({
				name: res.data.name + '-backup',
				labels: res.data.labels,
				annotations: res.data.annotations,
				description: res.data.description,
				mirrorImage: res.data.mirrorImage,
				pwd: res.data.password,
				cpu: Number(res.data.quota.redis.cpu),
				memory: Number(
					transUnit.removeUnit(res.data.quota.redis.memory, 'Gi')
				),
				mirrorImageId: res.data.mirrorImage,
				storageClass: res.data.quota.redis.storageClassName,
				storageQuota: transUnit.removeUnit(
					res.data.quota.redis.storageClassQuota,
					'Gi'
				)
			});
			let storageClassName: string | string[];
			if (res.data.quota.redis.storageClassName.includes(',')) {
				const storageClassAliasNameTemp =
					res.data.quota.redis.storageClassAliasName.split(',');
				storageClassName = res.data.quota.redis.storageClassName
					.split(',')
					.map(
						(item: string, index: number) =>
							`${item}/${storageClassAliasNameTemp[index]}`
					);
			} else {
				storageClassName = `${res.data.quota.redis.storageClassName}/${res.data.quota.redis.storageClassAliasName}`;
			}
			switch (res.data.quota.redis.num) {
				case 2:
					setSentinelMode('1s-1m');
					break;
				case 4:
					setSentinelMode('2s-2m');
					break;
				case 8:
					setSentinelMode('4m-4s');
					break;
				case 16:
					setSentinelMode('8s-8m');
					break;
				default:
					break;
			}
			setNodeObj({
				redis: {
					disabled: false,
					title: 'Redis 节点',
					num: res.data.quota.redis.num,
					specId: '1',
					cpu: Number(res.data.quota.redis.cpu),
					memory: Number(
						transUnit.removeUnit(res.data.quota.redis.memory, 'Gi')
					),
					storageClass: storageClassName,
					storageQuota: Number(
						transUnit.removeUnit(
							res.data.quota.redis.storageClassQuota,
							'Gi'
						)
					)
				},
				sentinel: {
					disabled: false,
					title: '哨兵节点',
					num: res.data.quota.sentinel.num,
					specId: '1',
					cpu: Number(res.data.quota.sentinel.cpu),
					memory: Number(
						transUnit.removeUnit(
							res.data.quota.sentinel.memory,
							'Gi'
						)
					)
				}
			});
			if (res.data.dynamicValues) {
				for (const i in res.data.dynamicValues) {
					form.setFieldsValue({ [i]: res.data.dynamicValues[i] });
				}
			}
		});
	};
	const judgeActiveActive = (namespaceTemp: string) => {
		console.log(namespaceTemp);
		const temp = namespaceList.filter((item) => {
			if (item.name === namespaceTemp) {
				return item;
			}
		});
		console.log(temp);
		return temp[0]?.availableDomain || false;
	};
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
				title="发布Redis服务"
				className="page-header"
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
													placeholder="请选择命名空间"
													style={{ width: '100%' }}
													dropdownMatchSelectWidth={
														false
													}
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
																	// disabled={
																	// 	item.availableDomain
																	// }
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
																	{/* {item.availableDomain ? (
																		<Popover
																			content={
																				'当前无法选择可用区命名空间，如需要发布可用区请切换到对应可用区命名空间'
																			}
																		>
																			<p>
																				{
																					item.aliasName
																				}
																				<span className="available-domain">
																					可用区
																				</span>
																			</p>
																		</Popover>
																	) : (
																		item.aliasName
																	)} */}
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
								<li className="display-flex flex-center form-li">
									<label className="form-name">
										<span className="mr-8">主机网络</span>
										<Tooltip
											title={
												'通过设置spec.hostNetwork参数，使用主机的网络命名空间'
											}
										>
											<QuestionCircleOutlined />
										</Tooltip>
									</label>
									<div
										className={`form-content display-flex ${styles['host-affinity']}`}
									>
										<div className={styles['switch']}>
											{tolerations.flag
												? '已开启'
												: '关闭'}
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
												disabled={!!middlewareName}
											/>
										</div>
									</div>
								</li>
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
													disabled={!!middlewareName}
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
													disabled={!!middlewareName}
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
											初始密码
										</span>
									</label>
									<div
										className="form-content"
										style={{ flex: '0 0 376px' }}
									>
										<FormItem
											name="pwd"
											rules={[
												{
													required: true,
													message: '请输入初始密码'
												}
											]}
										>
											<Input.Password
												placeholder="请输入初始密码"
												disabled={!!middlewareName}
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
											rules={[
												{
													required: true,
													message: '请选择镜像仓库'
												}
											]}
											name="mirrorImageId"
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
										<span>模式</span>
									</label>
									<div
										className={`form-content ${styles['redis-mode']}`}
									>
										<Select
											value={mode}
											onChange={(value) => setMode(value)}
											style={{
												width: 182,
												marginBottom: 12
											}}
											disabled={!!middlewareName}
											dropdownMatchSelectWidth={false}
										>
											{modeList.map(
												(item: any, index: number) => (
													<Select.Option
														key={index}
														value={item.value}
													>
														{item.label}
													</Select.Option>
												)
											)}
										</Select>
										{mode === 'cluster' ||
										mode === 'agent' ? (
											<div
												style={{
													marginTop: 12
												}}
											>
												<SelectBlock
													options={clusterModeList}
													currentValue={clusterMode}
													onCallBack={(value: any) =>
														setClusterMode(value)
													}
													disabled={!!middlewareName}
												/>
											</div>
										) : null}
										{mode === 'sentinel' ? (
											<div
												style={{
													marginTop: 12
												}}
											>
												<SelectBlock
													options={[
														sentinelModeList[0]
													]}
													currentValue={sentinelMode}
													onCallBack={(value: any) =>
														setSentinelMode(value)
													}
													disabled={!!middlewareName}
												/>
											</div>
										) : null}
										{clusterMode === 'one' ? (
											<div
												style={{
													marginTop: 12
												}}
											>
												<span
													style={{
														width: 182,
														marginLeft: 8,
														color: '#333',
														fontWeight: 500,
														display: 'inline-block'
													}}
												>
													自定义分片数量
												</span>
												<InputNumber
													style={{
														width: 182
													}}
													value={clusterModeNum}
													onChange={(value) =>
														setClusterModeNum(value)
													}
													min={3}
													max={10}
													disabled={!!middlewareName}
												/>
											</div>
										) : null}
									</div>
								</li>
								{mode === 'readWriteProxy' ? (
									<li className="display-flex form-li">
										<label className="form-name">
											<span>分片数</span>
										</label>
										<div
											className={`form-content ${styles['redis-mode']}`}
										>
											<Select
												value={sentinelMode}
												onChange={(value) =>
													setSentinelMode(value)
												}
												style={{
													width: 182
												}}
												disabled={!!middlewareName}
												dropdownMatchSelectWidth={false}
											>
												{sentinelModeList.map(
													(item, index) => (
														<Select.Option
															key={index}
															value={item.value}
														>
															{item.label}
														</Select.Option>
													)
												)}
											</Select>
										</div>
									</li>
								) : null}
								{mode === 'sentinel' ||
								mode === 'readWriteProxy' ? (
									<li className="display-flex form-li">
										<label className="form-name">
											<span></span>
										</label>
										<div>
											<div
												className={`display-flex ${styles['mode-content']}`}
											>
												{Object.keys(nodeObj).map(
													(key) => (
														<ModeItem
															middlewareType={
																chartName
															}
															key={key}
															type={key}
															data={nodeObj[key]}
															clusterId={
																globalCluster.id
															}
															mode={mode}
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
															disabled={
																!!middlewareName
															}
															isActiveActive={
																globalNamespace.name ===
																'*'
																	? !namespace
																		? judgeActiveActive(
																				form.getFieldValue(
																					'namespace'
																				)
																		  )
																		: judgeActiveActive(
																				namespace
																		  )
																	: globalNamespace.availableDomain
															}
														/>
													)
												)}
											</div>
										</div>
									</li>
								) : null}
								{(mode === 'cluster' ||
									mode === 'agent' ||
									nodeModify.flag) && (
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
															onCallBack={(
																value: any
															) =>
																checkGeneral(
																	value
																)
															}
															dataList={
																redisDataList
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
																				message: `最小为0.1`
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
																				message: `最小为0.1`
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
										<li className="display-flex form-li flex-align">
											<label className="form-name">
												<span
													style={{ marginRight: 8 }}
												>
													挂载目录选择
												</span>
											</label>
											<div
												className="form-content"
												style={{ flex: '0 0 376px' }}
											>
												<Switch
													checked={directory}
													onChange={(value) =>
														setDirectory(value)
													}
													size="small"
												/>
											</div>
										</li>
										{directory ? (
											<div
												className={`display-flex ${styles['mode-content']}`}
												style={{ marginLeft: 120 }}
											>
												{Object.keys(pathObj).map(
													(key) => (
														<DirectoryItem
															middlewareType={
																chartName
															}
															key={key}
															type={key}
															data={pathObj[key]}
															clusterId={
																globalCluster.id
															}
															mode={mode}
															namespace={
																globalNamespace.name
															}
															onChange={(
																values
															) => {
																setPathObj({
																	...pathObj,
																	[key]: values
																});
															}}
															disabled={
																!!middlewareName
															}
														/>
													)
												)}
												{console.log(nodeObj)}
											</div>
										) : null}
										{nodeModify.nodeName !== 'sentinel' &&
											!directory && (
												<StorageQuota
													clusterId={globalCluster.id}
												/>
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
