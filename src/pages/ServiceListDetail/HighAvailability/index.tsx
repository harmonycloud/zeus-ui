import React, { useState, useEffect } from 'react';
import {
	Modal,
	notification,
	Switch,
	Button,
	Tooltip,
	Select,
	Form,
	Progress
} from 'antd';
import {
	QuestionCircleOutlined,
	CheckCircleFilled,
	CloseCircleFilled
} from '@ant-design/icons';
import { getMasterName, getBurstList } from '@/services/middleware';
import Actions from '@/components/Actions';
import ProTable from '@/components/ProTable';
import Visualization from './visualization';
import DefaultPicture from '@/components/DefaultPicture';
import EditNodeSpe from './editNodeSpe';
import EsEditNodeSpe from './esEditNodeSpe';
import CustomEditNodeSpe from './customEditNodeSpe';
import Console from './console';
import YamlForm from './yamlForm';
import DilatationForm from './dilatationForm';
import EditBrust from './editBrust';
import styles from './esEdit.module.scss';
import './index.scss';

import {
	getPods,
	getSwitch,
	restartPods,
	switchMiddlewareMasterSlave,
	updateMiddleware,
	rebootService,
	storageDilatation
} from '@/services/middleware';
import transTime from '@/utils/transTime';
import {
	ConsoleDataProps,
	ContainerItem,
	HighProps,
	PodItem,
	PodSendData,
	QuotaParams
} from '../detail';
import RedisSentinelNodeSpe from './redisSentinelNodeSpe';

const { confirm } = Modal;
const LinkButton = Actions.LinkButton;
export default function HighAvailability(props: HighProps): JSX.Element {
	const {
		type,
		data,
		clusterId,
		namespace,
		chartName,
		chartVersion,
		onRefresh,
		customMid
	} = props;
	const [pods, setPods] = useState<PodItem[]>([]);
	const [switchValue, setSwitchValue] = useState<boolean>(false);
	const [lastAutoSwitchTime, setLastAutoSwitchTime] = useState<string>('');
	const [podVisible, setPodVisible] = useState<boolean>(false);
	const [containers, setContainers] = useState<string[]>([]);
	const [currentContainer, setCurrentContainer] = useState<string>('');
	const [consoleData, setConsoleData] = useState<ConsoleDataProps>();
	// * 其他默认中间件修改阶段规格
	const [visible, setVisible] = useState<boolean>(false);
	// * es中间件修改节点规格
	const [esVisible, setEsVisible] = useState<boolean>(false);
	// * redis 哨兵模式修改节点规格
	const [redisSentinelVisible, setRedisSentinelVisible] =
		useState<boolean>(false);
	// * 自定义中间件修改节点规格
	const [customVisible, setCustomVisible] = useState<boolean>(false);
	const [quotaValue, setQuotaValue] = useState<QuotaParams>();
	const [topoData, setTopoData] = useState();
	const [yamlVisible, setYamlVisible] = useState<boolean>(false);
	const [podData, setPodData] = useState<PodItem>();
	const [dilatationVisible, setDilationVisible] = useState<boolean>(false);
	const [podNum, setPodNum] = useState<number>(0);
	const [burstList, setBurstList] = useState<string[]>([]);
	const [selectSlave, setSelectSlave] = useState<string>();
	const [burstVisible, setBurstVisible] = useState<boolean>(false);
	// * redis手动切换状态
	const [switchStatus, setSwitchStatus] = useState<boolean>();
	// * redis手动切换失败原因
	const [switchReason, setSwitchReason] = useState<string>('');

	useEffect(() => {
		if (data !== undefined) {
			const sendData: PodSendData = {
				clusterId,
				namespace,
				middlewareName: data.name,
				type: data.type
			};
			data.type === 'redis' && getBurstLists();
			getPodList(sendData);
			getSwitchInfo();
			setQuotaValue(data.quota[type]);
			// setSwitchValue(data.autoSwitch);
		}
	}, [data]);
	// * 获取中间件切换信息
	const getSwitchInfo = () => {
		getSwitch({
			clusterId,
			namespace,
			middlewareName: data.name,
			type: data.type
		}).then((res) => {
			setSwitchValue(res.data?.isAuto);
			setLastAutoSwitchTime(res.data?.lastAutoSwitchTime);
		});
	};
	// * 获取pod列表
	const getPodList = (sendData: PodSendData) => {
		getPods(sendData).then((res) => {
			if (res.success) {
				const list: any = [];
				res.data &&
					res.data.podInfoGroup &&
					res.data.podInfoGroup.listChildGroup &&
					res.data.podInfoGroup.listChildGroup.forEach((el: any) => {
						if (el.role.includes('shard')) {
							list.push(
								...el.pods.map(
									(item: any, index: number, arr: any) => {
										if (index === 0) {
											return {
												...item,
												identify: el.role,
												span: arr.length
											};
										} else {
											return {
												...item,
												identify: el.role,
												span: 0
											};
										}
									}
								)
							);
						} else {
							list.push(
								...el.pods.map((item: any) => {
									return {
										...item,
										identify: el.role,
										span: 1
									};
								})
							);
						}
					});
				setPods(list);
				setTopoData(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	// * 获取redis主从关系列表
	const getBurstLists = () => {
		getBurstList({
			clusterId,
			namespace,
			middlewareName: data.name,
			mode: data.mode
		}).then((res) => {
			if (res.success) {
				if (res.data && JSON.stringify(res.data) !== '{}') {
					const list = [];
					for (const key in res.data) {
						list.push(`${key} -> ${res.data[key]}`);
					}
					setBurstList(list);
				}
			} else {
				notification.error({
					message: '失败',
					description: (
						<>
							<p>{res.errorMsg}</p>
							<p>{res.errorDetail}</p>
						</>
					)
				});
			}
		});
	};
	// * es 修改服务规格
	const editConfiguration = () => {
		if (data.status === 'Running') {
			if (customMid) {
				setCustomVisible(true);
			} else if (data.mode === 'sentinel') {
				setRedisSentinelVisible(true);
			} else {
				setVisible(true);
			}
		} else {
			notification.error({
				message: '失败',
				description: '该服务运行异常，无法修改该服务节点规格'
			});
		}
	};

	// * 重启节点
	const reStart = async (value: string, record: PodItem, index: number) => {
		if (data.status === 'Running') {
			let res;
			if (record.role === 'slave') {
				res = await getMasterName({
					clusterId,
					namespace,
					middlewareName: data.name,
					slaveName: record.podName,
					mode: data.mode
				});
			}
			const sendData = {
				clusterId,
				namespace,
				middlewareName: data.name,
				type: data.type,
				podName: record.podName
			};
			confirm({
				title: '重启确认',
				icon: null,
				content:
					data.type === 'redis' || data.type === 'postgres' ? (
						<div className={styles['pod-restart']}>
							<p className={styles['restart-title']}>
								您当前选择的是
							</p>

							<p>{record.podName}</p>
							<p>
								<span className={styles['label']}>
									运行状态：
								</span>
								{record.status}
							</p>
							<p>
								<span className={styles['label']}>
									节点角色：
								</span>
								{roleRender(value, record, index)}
							</p>
							<p>
								<span className={styles['label']}>
									绑定主节点：
								</span>
								{record.role === 'slave'
									? res.data || '-'
									: '-'}
							</p>
							<div
								className={
									styles[
										record.role !== 'master'
											? 'info-success'
											: 'info-error'
									]
								}
							>
								{record.role !== 'master' ? (
									<CheckCircleFilled
										style={{
											color: '#52c41a',
											marginRight: 4
										}}
									/>
								) : (
									<CloseCircleFilled
										style={{
											color: '#ff4d4f',
											marginRight: 4
										}}
									/>
								)}
								{record.role === 'master' &&
									'当前选择的是主节点,直接重启可能会对服务产生影响。'}
								{record.role === 'slave' &&
									'当前选择的是从节点,可以直接重启节点且不会对服务产生影响。'}
								{record.role !== 'master' &&
									record.role !== 'slave' &&
									`当前选择的是${roleRender(
										value,
										record,
										index
									)},可以直接重启节点且不会对服务产生影响。`}
							</div>
						</div>
					) : (
						'根据重启的节点角色不同，重启操作可能会导致服务中断，请谨慎操作'
					),
				onOk: () => {
					restartPods(sendData).then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '重启中, 3s 后获取数据'
							});
							setTimeout(function () {
								const sendData = {
									clusterId,
									namespace,
									middlewareName: data.name,
									type: data.type
								};
								getPodList(sendData);
							}, 3000);
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
						}
					});
				}
			});
		} else {
			notification.error({
				message: '失败',
				description: '该服务运行异常，无法重启该实例'
			});
		}
	};
	const openSSL = (record: PodItem) => {
		console.log(record);
		const strArr = record.containers.map(
			(item: ContainerItem) => item.name
		);
		const consoleDataTemp = {
			podName: record.podName,
			name: data.name,
			namespace: namespace,
			clusterId: clusterId,
			type: data.type,
			role: record.role
		};
		if (data.type === 'redis') {
			if (record.role === 'master' || record.role === 'slave') {
				setCurrentContainer('redis-cluster');
			} else {
				setCurrentContainer(strArr[0]);
			}
		} else {
			setCurrentContainer(strArr[0]);
		}
		setContainers(strArr);
		setConsoleData(consoleDataTemp);
		setPodVisible(true);
	};

	const actionRender = (value: any, record: PodItem, index: number) => {
		return (
			<Actions>
				<LinkButton onClick={() => openSSL(record)}>控制台</LinkButton>
				<LinkButton
					onClick={() => reStart(record.role, record, index)}
					disabled={!!podNum}
				>
					重启{podNum ? `(${podNum})` : ''}
				</LinkButton>
				<LinkButton
					onClick={() => {
						setPodData(record);
						setYamlVisible(true);
					}}
				>
					查看yaml
				</LinkButton>
			</Actions>
		);
	};

	const restartRender = (value: number, record: PodItem, index: number) => {
		return `${value}(${
			transTime.gmt2local(record.lastRestartTime) || '无'
		})`;
	};

	const onChange = (checked: boolean) => {
		if (data.status === 'Running') {
			setSwitchValue(checked);
			switchMiddleware(checked);
		} else {
			notification.error({
				message: '失败',
				description: '该服务运行异常，无法进行主备切'
			});
		}
	};

	const autoSwitch = () => {
		if (data.status === 'Running') {
			if (data.type === 'redis') {
				setBurstVisible(true);
			} else {
				confirm({
					title: '操作确认',
					content:
						'主备服务切换过程中可能会有闪断，请确保您的应用程序具有自动重连机制',
					onOk: () => {
						switchMiddleware(null);
					}
				});
			}
		} else {
			notification.error({
				message: '失败',
				description: '该服务运行异常，无法进行主备切换'
			});
		}
	};

	const switchMiddleware = (value: boolean | null) => {
		const sendData: any = {
			clusterId,
			namespace,
			middlewareName: data.name,
			type: data.type,
			isAuto: value
		};
		if (data.type === 'redis') {
			sendData.slaveName = selectSlave?.split(' -> ')[1];
		}
		switchMiddlewareMasterSlave(sendData).then((res) => {
			if (res.success) {
				if (typeof value !== 'boolean') {
					if (data.type === 'redis') {
						let num = 5;
						const time = setInterval(() => {
							num === 0 && clearInterval(time);
							setPodNum(num);
							num--;
						}, 1000);
						setSwitchStatus(true);
						setBurstVisible(false);
						getBurstLists();
					} else {
						notification.success({
							message: '成功',
							description:
								data.type === 'postgresql' ? (
									<span>
										已完成切换：
										<br />{' '}
										{
											pods.find(
												(item) => item.role === 'master'
											)?.podName
										}
										:{'主节点 -> 从节点'}
										<br />{' '}
										{
											pods.find(
												(item) =>
													item.role === 'sync_slave'
											)?.podName
										}
										:{'从节点 -> 主节点'}
									</span>
								) : (
									<span>
										已完成切换：
										<br /> {pods[0].podName}:{' '}
										{pods[0].role === 'master'
											? '主节点 -> 从节点'
											: '从节点 -> 主节点'}{' '}
										<br /> {pods[1].podName}:{' '}
										{pods[1].role === 'master'
											? '主节点 -> 从节点'
											: '从节点 -> 主节点'}
									</span>
								)
						});
					}
				} else {
					notification.success({
						message: '成功',
						description: `自动切换${value ? '开启' : '关闭'}成功！`
					});
				}
				setTimeout(function () {
					onRefresh('highAvailability');
				}, 3000);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
				setSwitchStatus(false);
				setSwitchReason(res.errorMsg);
			}
		});
	};
	// * 修改节点规格
	const updateMid = (sendData: any) => {
		confirm({
			title: '操作确认',
			content: '实例规格修改后将导致服务重启，是否继续？',
			onOk: () => {
				setVisible(false);
				setEsVisible(false);
				setCustomVisible(false);
				setRedisSentinelVisible(false);
				updateMiddleware(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '修改中, 3s 后获取数据'
						});
						setTimeout(function () {
							onRefresh('highAvailability');
						}, 3000);
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			}
		});
	};

	const onCreate = (value: any) => {
		const sendData = {
			clusterId,
			namespace,
			middlewareName: data.name,
			chartName: chartName,
			chartVersion: chartVersion,
			type: data.type,
			quota: {
				[data.type]: {
					cpu: value.cpu,
					memory: value.memory,
					num: data.quota[data.type].num
				}
			}
		};
		updateMid(sendData);
	};

	const onEsCreate = (values: any) => {
		const sendData = {
			clusterId,
			namespace,
			middlewareName: data.name,
			chartName: chartName,
			chartVersion: chartVersion,
			type: data.type,
			quota: values.quota
		};
		updateMid(sendData);
	};

	const onCustomCreate = (values: any) => {
		const sendData = {
			clusterId,
			namespace,
			middlewareName: data.name,
			chartName: chartName,
			chartVersion: chartVersion,
			type: data.type,
			quota: {
				variable: data.quota.variable,
				[data.type]: values
			}
		};
		updateMid(sendData);
	};

	const roleRender = (value: string, record: PodItem, index: number) => {
		if (record.podName.includes('exporter')) {
			return 'Exporter';
		} else {
			if (data.type === 'elasticsearch') {
				if (record.podName.includes('kibana')) {
					return 'Kibana';
				} else if (record.podName.includes('client')) {
					return '协调节点';
				} else if (record.podName.includes('master')) {
					return '主节点';
				} else if (record.podName.includes('data')) {
					return '数据节点';
				} else if (record.podName.includes('cold')) {
					return '冷节点';
				} else {
					return value
						? value.substring(0, 1).toUpperCase() +
								value.substring(1)
						: '/';
				}
			} else {
				switch (value) {
					case 'master':
						return '主节点';
					case 'slave':
						return '从节点';
					case 'data':
						return '数据节点';
					case 'client':
						return '协调节点';
					case 'cold':
						return '冷节点';
					case 'kibana':
						return 'Kibana';
					case 'nameserver':
						return 'Nameserver';
					case 'exporter':
						return 'Exporter';
					case 'sentinel':
						return '哨兵';
					case 'proxy':
						return '代理';
					case 'default':
						return '/';
					default:
						if (value?.includes('shard')) {
							return '分片';
						} else {
							return value
								? value.substring(0, 1).toUpperCase() +
										value.substring(1)
								: '/';
						}
				}
			}
		}
	};

	const resourceRender = (value: string, record: PodItem, index: number) => {
		return `${record.resources.cpu || 0}C/${record.resources.memory || 0}G`;
	};

	const storageRender = (value: string, record: PodItem, index: number) => {
		// return `${record.resources.storageClassQuota || '无'}(${
		// 	record.resources.storageClassName || '无'
		// })`;
		return `${
			record.storageResources
				?.map(
					(item) =>
						`${item.storageClassQuota}(${item.storageClassName})`
				)
				.join(', ') || '无(无)'
		}`;
	};

	const createTimeRender = (value: string) => {
		return transTime.gmt2local(value);
	};
	const podNameRender = (value: string) => {
		return (
			<div
				style={{ width: '150px', wordBreak: 'break-all' }}
				title={value}
			>
				{value}
			</div>
		);
	};
	const restartService = () => {
		confirm({
			title: '操作确认',
			content: '请确认是否重启服务？',
			onOk: () => {
				const sendData = {
					clusterId,
					middlewareName: data.name,
					namespace,
					type: data.type
				};
				rebootService(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '服务重启成功！'
						});
						onRefresh();
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			}
		});
	};
	const onDilatationCreate = (values: any) => {
		const sendData = {
			clusterId,
			namespace,
			middlewareName: data.name,
			type,
			chartName,
			chartVersion,
			quota: {
				mysql: {
					storageClassQuota: values.storageClassQuota + 'Gi'
				}
			}
		};
		storageDilatation(sendData).then((res) => {
			if (res.success) {
				notification.success({
					message: '成功',
					description: '存储扩容成功！'
				});
				const sendData = {
					clusterId,
					namespace,
					middlewareName: data.name,
					type: data.type
				};
				getPodList(sendData);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
		setDilationVisible(false);
	};
	const Operation = {
		primary: (
			<div className="title-content">
				<div className="blue-line"></div>
				<div className="detail-title">实例列表</div>
			</div>
		),
		secondary: (
			<>
				<Button type="primary" onClick={restartService}>
					重启服务
				</Button>
				{/* {type === 'mysql' && (
					<Button
						type="primary"
						onClick={() => setDilationVisible(true)}
						disabled={
							data?.status !== 'Running' ||
							!data?.mysqlDTO.isLvmStorage
						}
						title={
							data?.status !== 'Running'
								? '当前服务运行存在异常，无法进行存储扩容！'
								: !data?.mysqlDTO.isLvmStorage
								? '目前仅支持LVM类型的存储扩容！'
								: ''
						}
					>
						存储扩容
					</Button>
				)} */}
			</>
		)
	};
	const nodeNameRender = (value: string, record: PodItem) => {
		return (
			<span>
				{value}
				{record.nodeZone ? `(${record.nodeZone})` : ''}
			</span>
		);
	};

	return (
		<div>
			{customMid && !(data.capabilities || []).includes('high') ? (
				<DefaultPicture />
			) : (
				<>
					{(type === 'mysql' && data.mode === '1m-1s') ||
					(type === 'redis' && data.mode === 'cluster') ||
					(type === 'postgresql' && data.mode !== '1m-0s') ? (
						<>
							<div className="title-content">
								<div className="blue-line"></div>
								<div className="detail-title">主从切换 </div>
							</div>
							<div>
								<Button
									type="primary"
									onClick={autoSwitch}
									style={{ margin: '12px 0 0 0' }}
								>
									手动切换
								</Button>
								{typeof switchStatus === 'boolean' &&
								type === 'redis' ? (
									<span>
										{switchStatus ? (
											<>
												<CheckCircleFilled
													style={{
														color: '#52c41a',
														margin: '0 4px 0 8px'
													}}
												/>
												切换成功
											</>
										) : (
											<Tooltip title={switchReason}>
												<CloseCircleFilled
													style={{
														color: '#ff4d4f',
														margin: '0 4px 0 8px'
													}}
												/>
												切换失败
											</Tooltip>
										)}
									</span>
								) : null}
							</div>
							{(type === 'postgresql' ||
								(type === 'mysql' &&
									data.mode === '1m-1s')) && (
								<div
									className="display-flex switch-master flex-align"
									style={{ marginTop: 12 }}
								>
									<span style={{ marginRight: 12 }}>
										自动切换
									</span>
									<Tooltip title="开启状态下，在出现主节点异常重启的时候，会自动进行被动主从切换，在某些情况下，您也可以关闭主备自动切换，而采用人为介入的方式进行集群异常的处理。">
										<QuestionCircleOutlined />
									</Tooltip>
									<Switch
										style={{ marginLeft: 46 }}
										checked={switchValue}
										onChange={onChange}
									/>
								</div>
							)}
							{type !== 'postgresql' && type !== 'redis' && (
								<div
									className="display-flex switch-master flex-align"
									style={{ marginTop: 12 }}
								>
									<span style={{ marginRight: 32 }}>
										上一次切换时间
									</span>
									<label>{lastAutoSwitchTime || '/'}</label>
								</div>
							)}
							<div className="detail-divider" />
						</>
					) : null}
					<ProTable
						dataSource={pods}
						showColumnSetting
						showRefresh
						rowKey="podName"
						onRefresh={() => {
							const sendData = {
								clusterId,
								namespace,
								middlewareName: data.name,
								type: data.type
							};
							getPodList(sendData);
						}}
						operation={Operation}
						scroll={{ x: 1490 }}
					>
						{data.type === 'redis' && (
							<ProTable.Column
								title=""
								dataIndex="identify"
								render={roleRender}
								onCell={(_: any) => {
									return {
										rowSpan: _.span
									};
								}}
								width={100}
								fixed="left"
							/>
						)}
						<ProTable.Column
							title="实例名称"
							dataIndex="podName"
							render={podNameRender}
							width={170}
							fixed="left"
						/>
						<ProTable.Column
							title="状态"
							dataIndex="status"
							width={120}
						/>
						<ProTable.Column
							title="实例 IP"
							dataIndex="podIp"
							width={150}
						/>
						<ProTable.Column
							title="所在主机"
							dataIndex="nodeName"
							width={220}
							render={nodeNameRender}
						/>
						<ProTable.Column
							title="节点类型"
							dataIndex="role"
							render={roleRender}
							width={100}
						/>
						<ProTable.Column
							title="节点资源"
							dataIndex="resource"
							render={resourceRender}
							width={100}
						/>
						<ProTable.Column
							title="节点存储"
							dataIndex="storage"
							ellipsis
							render={storageRender}
							width={160}
						/>
						<ProTable.Column
							title="创建时间"
							dataIndex="createTime"
							render={createTimeRender}
							width={160}
						/>
						<ProTable.Column
							title="异常重启次数(最近时间)"
							dataIndex="restartCount"
							render={restartRender}
							width={180}
						/>
						<ProTable.Column
							title="操作"
							render={actionRender}
							width={200}
						/>
					</ProTable>
					<div style={{ marginBottom: '24px' }}></div>

					{topoData && (
						<>
							<Visualization
								topoData={topoData}
								serverData={data}
								openSSL={openSSL}
								reStart={reStart}
								setEsVisible={() => setEsVisible(true)}
								setRedisSentinelVisible={() =>
									setRedisSentinelVisible(true)
								}
								editConfiguration={editConfiguration}
							/>
							<div style={{ height: '24px' }} />
						</>
					)}
				</>
			)}
			{visible && (
				<EditNodeSpe
					visible={visible}
					onCreate={onCreate}
					onCancel={() => setVisible(false)}
					quota={quotaValue as QuotaParams}
				/>
			)}
			{esVisible && (
				<EsEditNodeSpe
					visible={esVisible}
					onCreate={onEsCreate}
					onCancel={() => setEsVisible(false)}
					data={data}
				/>
			)}
			{redisSentinelVisible && data.mode === 'sentinel' && (
				<RedisSentinelNodeSpe
					visible={redisSentinelVisible}
					onCreate={onEsCreate}
					onCancel={() => setRedisSentinelVisible(false)}
					data={data}
				/>
			)}
			{customVisible && (
				<CustomEditNodeSpe
					visible={customVisible}
					onCreate={onCustomCreate}
					onCancel={() => setCustomVisible(false)}
					quota={quotaValue as QuotaParams}
				/>
			)}
			{podVisible && consoleData && (
				<Console
					visible={podVisible}
					data={consoleData}
					onCancel={() => setPodVisible(false)}
					containers={containers}
					currentContainer={currentContainer}
				/>
			)}
			{yamlVisible && podData && (
				<YamlForm
					visible={yamlVisible}
					onCancel={() => setYamlVisible(false)}
					data={{
						clusterId,
						namespace,
						middlewareName: data.name,
						type: data.type,
						podName: podData.podName
					}}
				/>
			)}
			{dilatationVisible && (
				<DilatationForm
					visible={dilatationVisible}
					onCancel={() => setDilationVisible(false)}
					onCreate={onDilatationCreate}
					quota={quotaValue}
				/>
			)}
			{burstVisible && (
				<EditBrust
					open={burstVisible}
					onCancel={() => setBurstVisible(false)}
					onOk={() => {
						if (selectSlave) {
							switchMiddleware(null);
						} else {
							notification.warn({
								message: '提示',
								description: '请选择分片'
							});
						}
					}}
					burstList={burstList}
					selectSlave={selectSlave}
					onChange={(value: any) => setSelectSlave(value)}
				/>
			)}
		</div>
	);
}
