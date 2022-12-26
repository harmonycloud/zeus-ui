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
	Tooltip,
	Tag,
	DatePicker,
	Modal,
	Checkbox
} from 'antd';
import {
	QuestionCircleOutlined,
	PlusOutlined,
	CloseCircleFilled,
	CheckCircleFilled
} from '@ant-design/icons';
import pattern from '@/utils/pattern';
import styles from './pgsql.module.scss';
import moment from 'moment';
import {
	getNodePort,
	getNodeTaint,
	getStorageClass,
	postMiddleware,
	getMiddlewareDetail,
	getKey,
	getTolerations
} from '@/services/middleware';
import { getMirror } from '@/services/common';
import { instanceSpecList, mysqlDataList } from '@/utils/const';
import transUnit from '@/utils/transUnit';
import {
	CreateProps,
	CreateParams,
	AffinityProps,
	AffinityLabelsItem,
	TolerationsProps,
	PostgresqlSendDataParams
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
import { StoreState } from '@/types';
import storage from '@/utils/storage';
import { applyBackup } from '@/services/backup';
// * 外接动态表单相关
import { getAspectFrom } from '@/services/common';

import { NamespaceItem } from '@/pages/ProjectDetail/projectDetail';
import { getProjectNamespace } from '@/services/project';
import StorageQuota from '@/components/StorageQuota';
import DirectoryItem from '@/components/DirectoryItem';
import VersionForm from '../components/VersionForm';

const { Item: FormItem } = Form;
const Password = Input.Password;
const PostgreSQLCreate: (props: CreateProps) => JSX.Element = (
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
		aliasName,
		chartVersion,
		middlewareName,
		backupFileName,
		namespace
	} = params;
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

	// pgsql配置
	const [version, setVersion] = useState<string>('');
	const [mode, setMode] = useState<string>('1m-1s');
	const [modeList, setModeList] = useState([
		{
			label: '一主一从',
			value: '1m-1s'
		},
		{
			label: '一主多从',
			value: '1m-ns'
		},
		{
			label: '单实例',
			value: '1m-0s'
		}
	]);
	const [allDirectory, setAllDirectory] = useState<boolean>(false);
	const [nodeObj, setNodeObj] = useState<any>({
		pgdb: {
			title: '数据目录',
			hostPath: '/pgdata',
			mountPath: '/pgdata',
			volumeSize: 1,
			storageClass: null,
			targetContainers: ['postgres']
		},
		pgwal: {
			title: 'wal日志目录',
			hostPath: '/pgwal',
			mountPath: '/pgwal',
			volumeSize: 1,
			storageClass: null,
			targetContainers: ['postgres']
		},
		pglog: {
			title: 'PostgreSQL日志目录',
			hostPath: '/pglog',
			mountPath: '/pglog',
			volumeSize: 1,
			storageClass: null,
			targetContainers: ['postgres']
		},
		pgarch: {
			title: 'wal日志归档目录',
			hostPath: '',
			mountPath: '/pgarch',
			volumeSize: 1,
			storageClass: null,
			targetContainers: ['postgres']
		},
		pgextension: {
			title: 'PostgreSQL插件目录',
			hostPath: '',
			mountPath: '/pgextension',
			volumeSize: 1,
			storageClass: null,
			targetContainers: ['postgres']
		}
	});
	const [instanceSpec, setInstanceSpec] = useState<string>('General');
	const [specId, setSpecId] = useState<string>('1');
	const [maxCpu, setMaxCpu] = useState<{ max: number }>(); // 自定义cpu的最大值
	const [maxMemory, setMaxMemory] = useState<{ max: number }>(); // 自定义memory的最大值
	const [replicaCount, setReplicaCount] = useState(2); // * 一主多从
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
	// * root密码
	const [pgsqlPwd, setPgsqlPwd] = useState<string>('');
	const [checks, setChecks] = useState<boolean[]>([false, false]);
	// * 备份
	const backupDetail = storage.getLocal('backupDetail');
	// * 主机网络
	const [hostNetwork, setHostNetwork] = useState<boolean>(false);
	// * 目录分盘
	const [directory, setDirectory] = useState<boolean>(false);
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
	// const range = (start: number, end: number) => {
	// 	const result = [];
	// 	for (let i = start; i < end; i++) {
	// 		result.push(i);
	// 	}
	// 	return result;
	// };

	// const disabledDateTime = (date: any) => {
	// 	if (
	// 		moment(date).format('YYYY-MM-DD') ===
	// 		backupDetail?.startTime?.substring(0, 10)
	// 	)
	// 		return {
	// 			disabledHours: () =>
	// 				range(0, moment(backupDetail?.startTime).hour() + 1),
	// 			disabledMinutes: () =>
	// 				range(0, moment(backupDetail?.startTime).minute() + 1),
	// 			disabledSeconds: () =>
	// 				range(0, moment(backupDetail?.startTime).second() + 1)
	// 		};
	// 	else if (
	// 		moment(date).format('YYYY-MM-DD') ===
	// 		backupDetail?.endTime?.substring(0, 10)
	// 	) {
	// 		return {
	// 			disabledHours: () =>
	// 				range(moment(backupDetail?.endTime).hour() - 1, 60),
	// 			disabledMinutes: () =>
	// 				range(moment(backupDetail?.endTime).minute() - 1, 60),
	// 			disabledSeconds: () =>
	// 				range(moment(backupDetail?.endTime).second() - 1, 60)
	// 		};
	// 	} else {
	// 		return {
	// 			disabledHours: () => range(0, 0),
	// 			disabledMinutes: () => range(0, 0),
	// 			disabledSeconds: () => range(0, 0)
	// 		};
	// 	}
	// };
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
		if (globalNamespace.availableDomain) {
			setModeList([
				{
					label: '一主一从',
					value: '1m-1s'
				},
				{
					label: '一主多从',
					value: '1m-ns'
				}
			]);
			setMode('1m-1s');
		}
	}, [props]);
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
					label: '一主多从',
					value: '1m-ns'
				}
			]);
			setMode('1m-1s');
		} else if (globalNamespace.name === '*') {
			setModeList([
				{
					label: '一主一从',
					value: '1m-1s'
				},
				{
					label: '一主多从',
					value: '1m-ns'
				},
				{
					label: '单实例',
					value: '1m-0s'
				}
			]);
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

	const checkGeneral = (value: any) => {
		setSpecId(value);
	};

	const handleSubmit = () => {
		form.validateFields().then((values) => {
			let storageClassTemp = '';
			if (!directory) {
				if (typeof values.storageClass === 'string') {
					storageClassTemp = values.storageClass.split('/')[0];
				} else {
					storageClassTemp = values.storageClass
						.map((item: string) => item.split('/')[0])
						.join(',');
				}
			}
			const sendData: PostgresqlSendDataParams = {
				chartName: chartName,
				chartVersion: chartVersion,
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
				version: version,
				password: values.pgsqlPwd,
				mode: mode,
				quota: {
					postgresql: {
						num:
							mode.charAt(3) === 'n'
								? replicaCount
								: Number(mode.charAt(3)),
						storageClassName: storageClassTemp,
						storageClassQuota: values.storageQuota
					}
				},
				mirrorImageId:
					mirrorList
						.find(
							(item: MirrorItem) =>
								item.address === values.mirrorImageId
						)
						?.id.toString() || '',
				postgresqlParam: {
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
			if (namespace) {
				sendData.namespace = namespace;
			}
			// if (backupFileName) {
			// 	sendData.middlewareName = middlewareName;
			// 	sendData.backupFileName = backupFileName;
			// }
			if (directory) {
				sendData.quota = {
					postgresql: {
						num:
							mode.charAt(3) === 'n'
								? replicaCount
								: Number(mode.charAt(3))
					}
				};
			}
			if (instanceSpec === 'General') {
				switch (specId) {
					case '1':
						sendData.quota.postgresql.cpu = 2;
						sendData.quota.postgresql.memory = '4Gi';
						break;
					case '2':
						sendData.quota.postgresql.cpu = 4;
						sendData.quota.postgresql.memory = '8Gi';
						break;
					case '3':
						sendData.quota.postgresql.cpu = 4;
						sendData.quota.postgresql.memory = '16Gi';
						break;
					case '4':
						sendData.quota.postgresql.cpu = 8;
						sendData.quota.postgresql.memory = '16Gi';
						break;
					case '5':
						sendData.quota.postgresql.cpu = 8;
						sendData.quota.postgresql.memory = '32Gi';
						break;
					case '6':
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
			if (directory) {
				sendData.customVolumes = {};
				for (const key in nodeObj) {
					if (!nodeObj[key].disabled) {
						if (nodeObj[key].hostPath) {
							if (!nodeObj[key].storageClass) {
								return;
							}
						}
						// if (nodeObj[key].storageQuota === 0) {
						// 	notification.error({
						// 		message: '失败',
						// 		description: `${key}节点存储配额不能为0`
						// 	});
						// 	return;
						// }
						sendData.customVolumes[key] = {
							...nodeObj[key]
						};
					}
				}
			}
			Modal.info({
				title: '提醒',
				content: `当前postgres密码为${values.pgsqlPwd}，请妥善保存`
			});
			if (middlewareName) {
				const result = {
					clusterId: globalCluster.id,
					namespace: namespace,
					middlewareName: values.name,
					type: backupDetail.sourceType,
					backupName: backupDetail.backupName,
					restoreTime: backupDetail.increment
						? moment(values.restoreTime).format(
								'YYYY-MM-DD HH:mm:ss'
						  )
						: ''
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

	const getMiddlewareDetailAndSetForm = (middlewareName: string) => {
		getMiddlewareDetail({
			clusterId: globalCluster.id,
			namespace: namespace || globalNamespace.name,
			middlewareName: middlewareName,
			type: 'postgresql'
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
			if (res.data?.postgresqlParam?.hostNetwork) {
				setHostNetwork(res.data?.postgresqlParam?.hostNetwork);
			}
			if (res.data.mode) {
				setMode(res.data.mode);
			}
			if (res.data.version) {
				setVersion(res.data.version);
			}
			let storageClassTemp: string | string[];
			if (
				res.data.customVolumes &&
				JSON.stringify(res.data.customVolumes !== '{}')
			) {
				setNodeObj({ ...res.data.customVolumes });
				setDirectory(true);
			} else {
				if (res.data.quota.postgresql.storageClassName.includes(',')) {
					const storageClassAliasNameTemp =
						res.data.quota.postgresql.storageClassAliasName.split(
							','
						);
					storageClassTemp =
						res.data.quota.postgresql.storageClassName
							.split(',')
							.map(
								(item: string, index: number) =>
									`${item}/${storageClassAliasNameTemp[index]}`
							);
				} else {
					storageClassTemp = `${res.data.quota.postgresql.storageClassName}/${res.data.quota.postgresql.storageClassAliasName}`;
				}
				form.setFieldsValue({
					storageClass: storageClassTemp,
					storageQuota: transUnit.removeUnit(
						res.data.quota.postgresql.storageClassQuota,
						'Gi'
					)
				});
			}
			form.setFieldsValue({
				name: res.data.name + '-backup',
				labels: res.data.labels,
				annotations: res.data.annotations,
				description: res.data.description,
				pgsqlPwd: res.data.password,
				cpu: Number(res.data.quota.postgresql.cpu),
				memory: Number(
					transUnit.removeUnit(res.data.quota.postgresql.memory, 'Gi')
				),
				mirrorImageId: res.data.mirrorImage
			});
			if (res.data.dynamicValues) {
				for (const i in res.data.dynamicValues) {
					form.setFieldsValue({ [i]: res.data.dynamicValues[i] });
				}
			}
		});
	};

	// 全局分区更新
	useEffect(() => {
		if (JSON.stringify(globalNamespace) !== '{}') {
			// 克隆服务
			if (middlewareName) {
				getMiddlewareDetailAndSetForm(middlewareName);
			}
		}
	}, [globalNamespace]);

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
	}, [globalCluster, globalNamespace]);
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
	const pgsqlPwdChange = (e: any) => {
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
		setPgsqlPwd(e.target.value);
	};

	return (
		<ProPage>
			<ProHeader
				title="发布PostgreSQL服务"
				onBack={() => {
					history.goBack();
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
					<FormBlock title="高级设置">
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
					<FormBlock title="PostgreSQL配置">
						<div className={styles['mysql-config']}>
							<ul className="form-layout">
								<VersionForm
									type={chartName}
									chartVersion={chartVersion}
									version={version}
									setVersion={setVersion}
									disabled={!!middlewareName}
								/>
								<li
									className="display-flex form-li"
									style={{ width: '800px' }}
								>
									<label className="form-name">
										<span
											className="ne-required"
											style={{ marginRight: 8 }}
										>
											postgres密码
										</span>
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
											<FormItem
												name="pgsqlPwd"
												style={{ marginBottom: 12 }}
												rules={[
													{
														required: true,
														message:
															'请输入postgres密码'
													}
												]}
											>
												<Password
													style={{ width: '380px' }}
													value={pgsqlPwd}
													placeholder="请输入postgres密码"
													onChange={pgsqlPwdChange}
													disabled={!!middlewareName}
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
												disabled={!!middlewareName}
											/>
										</FormItem>
									</div>
								</li>
								{/* <li className="display-flex">
									<label className="form-name">
										<span style={{ marginRight: 8 }}>
											目录分盘
										</span>
									</label>
									<div
										className="form-content"
										style={{ flex: '0 0 376px' }}
									>
										<Switch
											size="small"
											style={{
												verticalAlign: 'middle'
											}}
										/>
									</div>
								</li> */}
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
												disabled={!!middlewareName}
											/>
										</div>
									</li>
								) : null}
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
														checkGeneral(value)
													}
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
																	step={0.1}
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
																	step={0.1}
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
										<span style={{ marginRight: 8 }}>
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
								{!directory ? (
									<StorageQuota
										clusterId={globalCluster.id}
										isActiveActive={
											globalNamespace.name === '*'
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
								) : (
									<div
										className={`display-flex ${styles['mode-content']}`}
										style={{ marginLeft: 120 }}
									>
										{Object.keys(nodeObj).map((key) => (
											<DirectoryItem
												middlewareType={chartName}
												key={key}
												type={key}
												data={nodeObj[key]}
												clusterId={globalCluster.id}
												mode={mode}
												namespace={globalNamespace.name}
												onChange={(values) => {
													setNodeObj({
														...nodeObj,
														[key]: values
													});
												}}
												disabled={!!middlewareName}
											/>
										))}
									</div>
								)}
							</ul>
						</div>
					</FormBlock>
					{middlewareName && backupDetail.recoveryType === 'time' ? (
						<FormBlock title="恢复配置">
							<div className={styles['basic-info']}>
								<div>
									可恢复的时间范围:{' '}
									{backupDetail
										? (backupDetail?.startTime || '--') +
										  '-' +
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
													showTime
													showNow={false}
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
export default connect(mapStateToProps, {})(PostgreSQLCreate);
