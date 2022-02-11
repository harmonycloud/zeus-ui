import React, { useState, useEffect } from 'react';
import {
	Dialog,
	Message,
	Switch,
	Icon,
	Balloon,
	Grid,
	Button
} from '@alicloud/console-components';
import Actions, { LinkButton } from '@alicloud/console-components-actions';

import Table from '@/components/MidTable';
import Visualization from './visualization';
import DefaultPicture from '@/components/DefaultPicture';
import EditNodeSpe from './editNodeSpe';
import EsEditNodeSpe from './esEditNodeSpe';
import CustomEditNodeSpe from './customEditNodeSpe';
import Console from './console';
import YamlForm from './yamlForm';
import DilatationForm from './dilatationForm';

import {
	getPods,
	restartPods,
	switchMiddlewareMasterSlave,
	updateMiddleware,
	rebootService,
	storageDilatation
} from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import transTime from '@/utils/transTime';

export default function HighAvailability(props) {
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
	const [pods, setPods] = useState([]);
	const [switchValue, setSwitchValue] = useState(true);
	const [podVisible, setPodVisible] = useState(false);
	const [containers, setContainers] = useState([]);
	const [consoleData, setConsoleData] = useState();
	// * 其他默认中间件修改阶段规格
	const [visible, setVisible] = useState(false);
	// * es中间件修改节点规格
	const [esVisible, setEsVisible] = useState(false);
	// * 自定义中间件修改节点规格
	const [customVisible, setCustomVisible] = useState(false);
	const [quotaValue, setQuotaValue] = useState();
	const [topoData, setTopoData] = useState();
	const [lock, setLock] = useState({ lock: 'right' });
	const [yamlVisible, setYamlVisible] = useState(false);
	const [podData, setPodData] = useState();
	const [dilatationVisible, setDilationVisible] = useState(false);

	useEffect(() => {
		window.onresize = function () {
			document.body.clientWidth >= 2300
				? setLock(null)
				: setLock({ lock: 'right' });
		};
	}, []);

	useEffect(() => {
		if (data !== undefined) {
			const sendData = {
				clusterId,
				namespace,
				middlewareName: data.name,
				type: data.type
			};
			getPodList(sendData);
			setQuotaValue(data.quota[type]);
		}
	}, [data]);
	// * 获取pod列表
	const getPodList = (sendData) => {
		getPods(sendData).then((res) => {
			if (res.success) {
				setPods(res.data.pods);
				setTopoData(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	// * es 修改服务规格
	const editConfiguration = () => {
		if (data.status === 'Running') {
			if (customMid) {
				setCustomVisible(true);
			} else {
				setVisible(true);
			}
		} else {
			Message.show(
				messageConfig(
					'error',
					'失败',
					'该服务运行异常，无法修改该服务节点规格'
				)
			);
		}
	};

	// * 重启节点
	const reStart = (record) => {
		if (data.status === 'Running') {
			const sendData = {
				clusterId,
				namespace,
				middlewareName: data.name,
				type: data.type,
				podName: record.podName
			};
			Dialog.show({
				title: '操作确认',
				content:
					'根据重启的节点角色不同，重启操作可能会导致服务中断，请谨慎操作',
				onOk: () => {
					restartPods(sendData).then((res) => {
						if (res.success) {
							Message.show({
								type: 'success',
								title: <div>成功</div>,
								content: (
									<div className="message-box">
										<p>重启中, 3s 后获取数据</p>
									</div>
								),
								duration: 3000,
								align: 'tr tr',
								closeable: true,
								offset: [-24, 62]
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
							Message.show(messageConfig('error', '失败', res));
						}
					});
				}
			});
		} else {
			Message.show(
				messageConfig('error', '失败', '该服务运行异常，无法重启该实例')
			);
		}
	};
	const openSSL = (record) => {
		const strArr = record.containers.map((item) => item.name);
		const consoleDataTemp = {
			podName: record.podName,
			namespace: namespace,
			clusterId: clusterId
		};
		setContainers(strArr);
		setConsoleData(consoleDataTemp);
		setPodVisible(true);
	};

	const actionRender = (value, index, record) => {
		return (
			<Actions>
				<LinkButton onClick={() => openSSL(record)}>控制台</LinkButton>
				<LinkButton onClick={() => reStart(record)}>重启</LinkButton>
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

	const restartRender = (value, index, record) => {
		return `${value}(${
			transTime.gmt2local(record.lastRestartTime) || '无'
		})`;
	};

	const onChange = (checked) => {
		if (data.status === 'Running') {
			setSwitchValue(checked);
			switchMiddleware(checked);
		} else {
			Message.show(
				messageConfig(
					'error',
					'失败',
					'该服务运行异常，无法进行主备切换'
				)
			);
		}
	};

	const autoSwitch = () => {
		if (data.status === 'Running') {
			Dialog.show({
				title: '操作确认',
				content:
					'主备服务切换过程中可能会有闪断，请确保您的应用程序具有自动重连机制',
				onOk: () => {
					switchMiddleware(null);
				}
			});
		} else {
			Message.show(
				messageConfig(
					'error',
					'失败',
					'该服务运行异常，无法进行主备切换'
				)
			);
		}
	};

	const switchMiddleware = (value) => {
		const sendData = {
			clusterId,
			namespace,
			middlewareName: data.name,
			type: data.type,
			isAuto: value
		};
		switchMiddlewareMasterSlave(sendData).then((res) => {
			if (res.success) {
				Message.show({
					type: 'success',
					title: <div>成功</div>,
					content: (
						<div className="message-box">
							<p>切换中, 3s 后获取数据</p>
						</div>
					),
					duration: 3000,
					align: 'tr tr',
					closeable: true,
					offset: [-24, 62]
				});
				setTimeout(function () {
					onRefresh('highAvailability');
				}, 3000);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	// * 修改节点规格
	const updateMid = (sendData) => {
		Dialog.show({
			title: '操作确认',
			content: '实例规格修改后将导致服务重启，是否继续？',
			onOk: () => {
				setVisible(false);
				setEsVisible(false);
				setCustomVisible(false);
				updateMiddleware(sendData).then((res) => {
					if (res.success) {
						Message.show({
							type: 'success',
							title: <div>成功</div>,
							content: (
								<div className="message-box">
									<p>修改中, 3s 后获取数据</p>
								</div>
							),
							duration: 3000,
							align: 'tr tr',
							closeable: true,
							offset: [-24, 62]
						});
						setTimeout(function () {
							onRefresh('highAvailability');
						}, 3000);
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		});
	};

	const onCreate = (value) => {
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

	const onEsCreate = (values) => {
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

	const onCustomCreate = (values) => {
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

	const roleRender = (value, index, record) => {
		if (record.podName.includes('exporter')) {
			return 'exporter';
		} else {
			if (data.type === 'elasticsearch') {
				if (record.podName.includes('kibana')) {
					return 'kibana';
				} else if (record.podName.includes('client')) {
					return '协调节点';
				} else if (record.podName.includes('master')) {
					return '主节点';
				} else if (record.podName.includes('data')) {
					return '数据节点';
				} else if (record.podName.includes('cold')) {
					return '冷节点';
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
						return 'kibana';
					case 'nameserver':
						return 'nameserver';
					case 'exporter':
						return 'exporter';
					default:
						return '未知';
				}
			}
		}
	};

	const resourceRender = (value, index, record) => {
		return `${record.resources.cpu || 0}C/${record.resources.memory || 0}G`;
	};

	const storageRender = (value, index, record) => {
		return `${record.resources.storageClassQuota || '无'}(${
			record.resources.storageClassName || '无'
		})`;
	};

	const createTimeRender = (value) => {
		return transTime.gmt2local(value);
	};
	const podNameRender = (value) => {
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
		Dialog.show({
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
						Message.show(
							messageConfig('success', '成功', '服务重启成功！')
						);
						onRefresh();
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		});
	};
	const onDilatationCreate = (values) => {
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
		// console.log(sendData);
		storageDilatation(sendData).then((res) => {
			if (res.success) {
				Message.show(
					messageConfig('success', '成功', '存储扩容成功！')
				);
				const sendData = {
					clusterId,
					namespace,
					middlewareName: data.name,
					type: data.type
				};
				getPodList(sendData);
			} else {
				Message.show(messageConfig('error', '失败', res));
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

	return (
		<div>
			{customMid && !(data.capabilities || []).includes('high') ? (
				<DefaultPicture />
			) : (
				<>
					{topoData && (
						<>
							<Visualization
								topoData={topoData}
								serverData={data}
								openSSL={openSSL}
								reStart={reStart}
								setEsVisible={() => setEsVisible(true)}
								editConfiguration={editConfiguration}
							/>
							<div style={{ height: '24px' }} />
						</>
					)}
					{type === 'mysql' ? (
						<>
							<div className="title-content">
								<div className="blue-line"></div>
								<div className="detail-title">
									主从切换{' '}
									<span
										className="name-link"
										style={{ marginLeft: 60 }}
										onClick={autoSwitch}
									>
										手动切换
									</span>{' '}
								</div>
							</div>
							<div
								className="display-flex switch-master"
								style={{ marginTop: 12 }}
							>
								<span style={{ marginRight: 12 }}>
									自动切换
								</span>
								<Balloon
									trigger={
										<Icon
											type="question-circle"
											size="xs"
										/>
									}
									closable={false}
									align={'r'}
								>
									<span className="balloon-text">
										开启状态下，在出现主节点异常重启的时候，会自动进行被动主从切换，在某些情况下，您也可以关闭主备自动切换，而采用人为介入的方式进行资源池异常的处理。
									</span>
								</Balloon>
								<Switch
									style={{ marginLeft: 68 }}
									checked={switchValue}
									onChange={onChange}
								/>
							</div>
							<div className="detail-divider" />
						</>
					) : null}

					<Table
						dataSource={pods}
						showColumnSetting
						showRefresh
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
					>
						<Table.Column
							title="实例名称"
							dataIndex="podName"
							cell={podNameRender}
							width={170}
							lock="left"
						/>
						<Table.Column
							title="状态"
							dataIndex="status"
							width={120}
						/>
						<Table.Column
							title="实例 IP"
							dataIndex="podIp"
							width={150}
						/>
						<Table.Column
							title="所在主机"
							dataIndex="nodeName"
							width={150}
						/>
						<Table.Column
							title="节点类型"
							dataIndex="role"
							cell={roleRender}
							width={100}
						/>
						<Table.Column
							title="节点资源"
							dataIndex="resource"
							cell={resourceRender}
							width={100}
						/>
						<Table.Column
							title="节点存储"
							dataIndex="storage"
							cell={storageRender}
							width={160}
						/>
						<Table.Column
							title="创建时间"
							dataIndex="createTime"
							cell={createTimeRender}
							width={160}
						/>
						<Table.Column
							title="异常重启次数(最近时间)"
							dataIndex="restartCount"
							cell={restartRender}
							width={180}
						/>
						<Table.Column
							title="操作"
							cell={actionRender}
							width={200}
							{...lock}
						/>
					</Table>
				</>
			)}
			{visible && (
				<EditNodeSpe
					visible={visible}
					onCreate={onCreate}
					onCancel={() => setVisible(false)}
					quota={quotaValue}
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
			{customVisible && (
				<CustomEditNodeSpe
					visible={customVisible}
					onCreate={onCustomCreate}
					onCancel={() => setCustomVisible(false)}
					quota={quotaValue}
				/>
			)}
			{podVisible && (
				<Console
					visible={podVisible}
					data={consoleData}
					onCancel={() => setPodVisible(false)}
					containers={containers}
				/>
			)}
			{yamlVisible && (
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
		</div>
	);
}
