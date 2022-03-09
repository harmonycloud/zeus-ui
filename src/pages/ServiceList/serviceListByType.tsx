import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import {
	Button,
	Message,
	Dialog,
	Checkbox,
	Balloon,
	Loading
} from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
// --- 自定义组件
import Table from '@/components/MidTable';
// --- 方法
import {
	getList,
	deleteMiddlewareStorage,
	recoveryMiddleware,
	ParamsProps
} from '@/services/serviceList';
import {
	deleteMiddleware,
	getCanReleaseMiddleware
} from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import { getComponents } from '@/services/common';
import {
	setCluster,
	setNamespace,
	setRefreshCluster
} from '@/redux/globalVar/var';
// --- 类型定义 / 常量 / 工具
import {
	serviceListItemProps,
	serviceProps,
	serviceListProps,
	middlewareProps,
	ListParamsProps
} from './service.list';
import { StoreState } from '@/types/index';
import storage from '@/utils/storage';
import { states } from '@/utils/const';
import { serviceListStatusRender, timeRender, nullRender } from '@/utils/utils';
// --- css样式

const tabJudge: (record: serviceProps, tab: string) => boolean = (
	record: serviceProps,
	tab: string
) => {
	if (record.capabilities === null) {
		return false;
	} else {
		if (record.capabilities.includes(tab)) {
			return false;
		} else {
			return true;
		}
	}
};
const Tooltip = Balloon.Tooltip;

const ServiceListByType = (props: serviceListProps) => {
	const { setCluster, setNamespace, setRefreshCluster } = props;
	const {
		cluster,
		namespace,
		clusterList: globalClusterList,
		namespaceList: globalNamespaceList
	} = props.globalVar;
	const [dataSource, setDataSource] = useState<serviceListItemProps>();
	const [showDataSource, setShowDataSource] = useState<serviceProps[]>([]);
	const [backupCheck, setBackupCheck] = useState<boolean>(false);
	const [keyword, setKeyword] = useState<string>('');
	const [selectedKeys, setSelectKeys] = useState<string[]>([]);
	const [cantRelease, setCantRelease] = useState<boolean>(false);
	const history = useHistory();
	const params: ListParamsProps = useParams();
	const { name, aliasName } = params;
	const [lock, setLock] = useState<any>({ lock: 'right' });
	const [middlewareInfo, setMiddlewareInfo] = useState<middlewareProps>();
	const [loadingVisible, setLoadingVisible] = useState<boolean>(true);

	useEffect(() => {
		window.onresize = function () {
			document.body.clientWidth >= 2300
				? setLock(null)
				: setLock({ lock: 'right' });
		};
	}, []);
	useEffect(() => {
		let mounted = true;
		if (JSON.stringify(namespace) !== '{}') {
			if (mounted) {
				setLoadingVisible(true);
				getList({
					clusterId: cluster.id,
					namespace: namespace.name,
					keyword: keyword,
					type: name
				})
					.then((res) => {
						if (res.success) {
							if (res.data.length > 0) {
								setDataSource(res.data[0]);
								setShowDataSource(res.data[0].serviceList);
							} else {
								setDataSource(undefined);
								setShowDataSource([]);
							}
						} else {
							Message.show(messageConfig('error', '失败', res));
						}
					})
					.finally(() => {
						setLoadingVisible(false);
					});
				getComponents({ clusterId: cluster.id }).then((res) => {
					if (res.success) {
						const temp = res.data.find(
							(item: any) =>
								item.component === 'middleware-controller'
						);
						if (temp.status === 3) {
							setCantRelease(false);
						} else {
							setCantRelease(true);
						}
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
				getCanReleaseMiddleware({
					clusterId: cluster.id,
					type: name
				}).then((res) => {
					if (res.success) {
						setMiddlewareInfo(res.data);
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		}
		return () => {
			setShowDataSource([]);
			mounted = false;
		};
	}, [namespace, params]);
	const getData = () => {
		setLoadingVisible(true);
		getList({
			clusterId: cluster.id,
			namespace: namespace.name,
			keyword: keyword,
			type: name
		})
			.then((res) => {
				if (res.success) {
					if (res.data.length > 0) {
						setDataSource(res.data[0]);
						setShowDataSource(res.data[0].serviceList);
					} else {
						setDataSource(undefined);
						setShowDataSource([]);
					}
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			})
			.finally(() => {
				setLoadingVisible(false);
			});
	};
	const handleChange: (value: string) => void = (value: string) => {
		setKeyword(value);
	};
	const handleSearch = () => {
		getData();
	};
	const deleteFn = (record: serviceProps) => {
		Dialog.show({
			title: '提示',
			content: '确定删除该服务？',
			onOk: () => {
				return deleteMiddleware({
					clusterId: cluster.id,
					namespace: namespace.name,
					middlewareName: record.name,
					type: record.type
				})
					.then((res) => {
						if (res.success) {
							Message.show(
								messageConfig('success', '成功', '删除成功')
							);
						} else {
							Message.show(messageConfig('error', '失败', res));
						}
					})
					.finally(() => {
						getData();
					});
			}
		});
	};
	const onSort = (dataIndex: string, order: string) => {
		if (dataIndex === 'createTime') {
			const tempDataSource = showDataSource.sort((a, b) => {
				const result = a['createTimeNum'] - b['createTimeNum'];
				return order === 'asc'
					? result > 0
						? 1
						: -1
					: result > 0
					? -1
					: 1;
			});
			setShowDataSource([...tempDataSource]);
		}
	};
	const onFilter = (filterParams: any) => {
		const {
			status: { selectedKeys }
		} = filterParams;
		setSelectKeys(selectedKeys);
		if (selectedKeys.length === 0) {
			setShowDataSource(dataSource?.serviceList || []);
		} else {
			let tempData: serviceProps[] | undefined = [];
			if (selectedKeys[0] !== 'Other') {
				tempData = dataSource?.serviceList.filter((item) => {
					return item.status === selectedKeys[0];
				});
			} else if (selectedKeys[0] === 'Other') {
				tempData = dataSource?.serviceList.filter((item) => {
					return (
						item.status !== 'Running' && item.status !== 'Creating'
					);
				});
			}
			if (backupCheck) {
				tempData = tempData?.filter(
					(item) => item?.mysqlDTO?.openDisasterRecoveryMode === true
				);
			}
			setShowDataSource(tempData || []);
		}
	};
	const onRowProps = (record: serviceProps) => {
		if (record.status === 'deleted') {
			return { style: { background: '#F8F8F9', color: '#CCCCCC' } };
		}
	};
	const handleFilterBackup = (checked: boolean) => {
		setBackupCheck(checked);
		let list = dataSource?.serviceList || [];
		if (selectedKeys.length > 0) {
			if (selectedKeys[0] !== 'Other') {
				list = list.filter((item) => {
					return item.status === selectedKeys[0];
				});
			} else if (selectedKeys[0] === 'Other') {
				list = list.filter((item) => {
					return (
						item.status !== 'Running' && item.status !== 'Creating'
					);
				});
			}
		}
		if (checked) {
			list = showDataSource.filter(
				(item) => item?.mysqlDTO?.openDisasterRecoveryMode === true
			);
		}

		setShowDataSource(list);
	};
	const releaseMiddleware = () => {
		if (middlewareInfo?.official) {
			switch (middlewareInfo.chartName) {
				case 'mysql':
					history.push(
						`/serviceList/${name}/${aliasName}/mysqlCreate/${middlewareInfo?.chartVersion}`
					);
					break;
				case 'redis':
					history.push(
						`/serviceList/${name}/${aliasName}/redisCreate/${middlewareInfo?.chartVersion}`
					);
					break;
				case 'elasticsearch':
					history.push(
						`/serviceList/${name}/${aliasName}/elasticsearchCreate/${middlewareInfo?.chartVersion}`
					);
					break;
				case 'rocketmq':
					history.push(
						`/serviceList/${name}/${aliasName}/rocketmqCreate/${middlewareInfo?.chartVersion}`
					);
					break;
				case 'kafka':
					history.push(
						`/serviceList/${name}/${aliasName}/kafkaCreate/${middlewareInfo?.chartVersion}`
					);
					break;
				default:
					history.push(
						`/serviceList/${name}/${aliasName}/dynamicForm/${middlewareInfo?.chartVersion}/${middlewareInfo?.version}`
					);
					break;
			}
		} else {
			history.push(
				`/serviceList/${name}/${aliasName}/dynamicForm/${middlewareInfo?.chartVersion}/${middlewareInfo?.version}`
			);
		}
	};
	const recoveryService = (record: serviceProps) => {
		const sendData: ParamsProps = {
			clusterId: cluster.id,
			namespace: namespace.name,
			chartName: record.type,
			chartVersion: record.chartVersion || null,
			middlewareName: record.name,
			type: record.type
		};
		Dialog.show({
			title: '操作确认',
			content: '请确认是否恢复该服务！',
			onOk: () => {
				return recoveryMiddleware(sendData)
					.then((res) => {
						if (res.success) {
							Message.show(
								messageConfig(
									'success',
									'成功',
									'该服务已恢复,3秒后刷新'
								)
							);
						} else {
							Message.show(messageConfig('error', '失败', res));
						}
					})
					.finally(() => {
						setTimeout(() => {
							getData();
						}, 3000);
					});
			}
		});
	};
	const deleteStorage = (record: serviceProps) => {
		const sendData: ParamsProps = {
			clusterId: cluster.id,
			namespace: namespace.name,
			middlewareName: record.name,
			type: record.type
		};
		Dialog.show({
			title: '操作确认',
			content: '删除后无法恢复该服务，请谨慎操作！',
			onOk: () => {
				return deleteMiddlewareStorage(sendData)
					.then((res) => {
						if (res.success) {
							Message.show(
								messageConfig(
									'success',
									'成功',
									'该服务已彻底删除'
								)
							);
						} else {
							Message.show(messageConfig('error', '失败', res));
						}
					})
					.finally(() => {
						getData();
					});
			}
		});
	};
	const operation = () => {
		if (cantRelease) {
			if (name === 'mysql') {
				return {
					primary: (
						<Tooltip
							trigger={
								<Button
									onClick={releaseMiddleware}
									type="primary"
									disabled={cantRelease}
								>
									发布服务
								</Button>
							}
						>
							请前往平台组件界面安装中间件管理组件！
						</Tooltip>
					),
					secondary: (
						<Checkbox
							checked={backupCheck}
							onChange={handleFilterBackup}
						>
							灾备服务
						</Checkbox>
					)
				};
			} else {
				return {
					primary: (
						<Tooltip
							trigger={
								<Button
									onClick={releaseMiddleware}
									type="primary"
									disabled={cantRelease}
								>
									发布服务
								</Button>
							}
						>
							请前往平台组件界面安装中间件管理组件！
						</Tooltip>
					)
				};
			}
		} else if (!middlewareInfo) {
			if (name === 'mysql') {
				return {
					primary: (
						<Tooltip
							trigger={
								<Button
									onClick={releaseMiddleware}
									type="primary"
									disabled={!middlewareInfo}
								>
									发布服务
								</Button>
							}
						>
							数据加载中，请稍后...
						</Tooltip>
					),
					secondary: (
						<Checkbox
							checked={backupCheck}
							onChange={handleFilterBackup}
						>
							灾备服务
						</Checkbox>
					)
				};
			} else {
				return {
					primary: (
						<Tooltip
							trigger={
								<Button
									onClick={releaseMiddleware}
									type="primary"
									disabled={!middlewareInfo}
								>
									发布服务
								</Button>
							}
						>
							数据加载中，请稍后...
						</Tooltip>
					)
				};
			}
		} else {
			if (name === 'mysql') {
				return {
					primary: (
						<Button
							onClick={releaseMiddleware}
							type="primary"
							disabled={!middlewareInfo}
						>
							发布服务
						</Button>
					),
					secondary: (
						<Checkbox
							checked={backupCheck}
							onChange={handleFilterBackup}
						>
							灾备服务
						</Checkbox>
					)
				};
			} else {
				return {
					primary: (
						<Button
							onClick={releaseMiddleware}
							type="primary"
							disabled={!middlewareInfo}
						>
							发布服务
						</Button>
					)
				};
			}
		}
	};
	const actionRender = (
		value: string,
		index: number,
		record: serviceProps
	) => {
		if (record.status === 'Preparing' || record.status === 'failed') {
			return (
				<Actions>
					<LinkButton onClick={() => deleteFn(record)}>
						删除
					</LinkButton>
				</Actions>
			);
		}
		if (record.status === 'Deleted') {
			return (
				<Actions>
					<LinkButton onClick={() => recoveryService(record)}>
						恢复服务
					</LinkButton>
					<LinkButton onClick={() => deleteStorage(record)}>
						彻底删除
					</LinkButton>
				</Actions>
			);
		}
		return (
			<Actions>
				<LinkButton
					disabled={tabJudge(record, 'high')}
					onClick={() => {
						storage.setSession(
							'service-available-current',
							record.type
						);
						history.push({
							pathname: '/serviceAvailable',
							state: {
								middlewareName: record.name
							}
						});
					}}
				>
					<span
						title={
							tabJudge(record, 'high')
								? '该中间件发布的服务组件暂不支持该功能'
								: '服务暴露'
						}
					>
						服务暴露
					</span>
				</LinkButton>
				<LinkButton
					disabled={tabJudge(record, 'monitoring')}
					onClick={() => {
						history.push({
							pathname: '/monitorAlarm/dataMonitor',
							state: {
								middlewareName: record.name,
								middlewareType: record.type
							}
						});
					}}
				>
					<span
						title={
							tabJudge(record, 'monitoring')
								? '该中间件发布的服务组件暂不支持该功能'
								: '数据监控'
						}
					>
						数据监控
					</span>
				</LinkButton>
				<LinkButton
					disabled={tabJudge(record, 'log')}
					onClick={() =>
						history.push({
							pathname: '/monitorAlarm/logDetail',
							state: {
								middlewareName: record.name,
								middlewareType: record.type
							}
						})
					}
				>
					<span
						title={
							tabJudge(record, 'log')
								? '该中间件发布的服务组件暂不支持该功能'
								: '日志详情'
						}
					>
						日志详情
					</span>
				</LinkButton>
				<LinkButton
					disabled={!record.managePlatform || record.managePlatformAddress === ''}
					onClick={() => {
						// if (record.managePlatformAddress === '') {
						// 	Message.show(
						// 		messageConfig(
						// 			'error',
						// 			'失败',
						// 			`请先到服务暴露中，暴露${record.name}的${
						// 				record.name
						// 			}${
						// 				record.type === 'elasticsearch'
						// 					? '-kibana'
						// 					: record.type === 'kafka'
						// 					? '-manager-svc'
						// 					: '-console-svc'
						// 			}服务。`
						// 		)
						// 	);
						// 	return;
						// }
						window.open(
							`${window.location.protocol.toLowerCase()}//${
								record.managePlatformAddress as string
							}`,
							'_blank'
						);
					}}
				>
					<span
						title={
							record.managePlatform
								? record.managePlatformAddress === ''
									? `请先到服务暴露中，暴露${record.name}的${
											record.name
									  }${
											record.type === 'elasticsearch'
												? '-kibana'
												: record.type === 'kafka'
												? '-manager-svc'
												: '-console-svc'
									  }服务。`
									: '服务控制台'
								: '该中间件发布的服务组件暂不支持该功能'
						}
					>
						服务控制台
					</span>
				</LinkButton>
				<LinkButton
					disabled={record.type !== 'mysql'}
					onClick={() => {
						history.push({
							pathname: '/disasterBackup/disasterCenter',
							state: {
								middlewareName: record.name,
								middlewareType: record.type
							}
						});
					}}
				>
					<span
						title={
							record.type !== 'mysql'
								? '该中间件发布的服务组件暂不支持该功能'
								: '灾备服务'
						}
					>
						灾备服务
					</span>
				</LinkButton>
				<LinkButton
					disabled={tabJudge(record, 'alert')}
					onClick={() =>
						history.push({
							pathname: '/monitorAlarm/alarmCenter',
							state: {
								middlewareName: record.name,
								middlewareType: record.type
							}
						})
					}
				>
					<span
						title={
							tabJudge(record, 'alert')
								? '该中间件发布的服务组件暂不支持该功能'
								: '告警规则'
						}
					>
						告警规则
					</span>
				</LinkButton>
				<LinkButton
					disabled={tabJudge(record, 'backup')}
					onClick={() => {
						history.push({
							pathname: '/disasterBackup/dataSecurity',
							state: {
								middlewareName: record.name,
								middlewareType: record.type
							}
						});
					}}
				>
					<span
						title={
							tabJudge(record, 'backup')
								? '该中间件发布的服务组件暂不支持该功能'
								: '数据安全'
						}
					>
						数据安全
					</span>
				</LinkButton>
				<LinkButton
					disabled={tabJudge(record, 'config')}
					onClick={() => {
						history.push(
							`/serviceList/${name}/${aliasName}/paramterSetting/${record.name}/${record.type}/${record.chartVersion}`
						);
						storage.setLocal('backKey', 'paramterSetting');
					}}
				>
					<span
						title={
							tabJudge(record, 'config')
								? '该中间件发布的服务组件暂不支持该功能'
								: '参数设置'
						}
					>
						参数设置
					</span>
				</LinkButton>
				<LinkButton
					onClick={() =>
						history.push(
							`/serviceList/${name}/${aliasName}/serverVersion/${record.name}/${record.type}`
						)
					}
				>
					版本管理
				</LinkButton>
				<LinkButton onClick={() => deleteFn(record)}>删除</LinkButton>
			</Actions>
		);
	};
	const toDetail = (record: any) => {
		if (!record.mysqlDTO.relationExist) {
			Message.show(
				messageConfig('error', '失败', '该关联实例不存在，无法进行跳转')
			);
			return;
		}
		const cs = globalClusterList.filter(
			(item) => item.id === record.mysqlDTO.relationClusterId
		);
		setCluster(cs[0]);
		storage.setLocal('cluster', JSON.stringify(cs[0]));
		const ns = globalNamespaceList.filter(
			(item) => item.name === record.mysqlDTO.relationNamespace
		);
		setNamespace(ns[0]);
		storage.setLocal('namespace', JSON.stringify(ns[0]));
		setRefreshCluster(true);
		history.push({
			pathname: `/serviceList/${name}/${aliasName}/basicInfo/${
				record.mysqlDTO.relationName
			}/${record.mysqlDTO.type || 'mysql'}/${record.chartVersion}`,
			state: {
				flag: true
			}
		});
	};
	const associatedRender = (
		value: string,
		index: number,
		record: serviceProps
	) => {
		return (
			<div className="display-flex flex-align">
				{/* 主备标识符 */}
				{record?.mysqlDTO?.openDisasterRecoveryMode === true ? (
					record?.mysqlDTO?.isSource ? (
						<div className="gray-circle">备</div>
					) : (
						<div className="blue-circle">源</div>
					)
				) : null}
				{record?.mysqlDTO?.isSource !== null ? (
					<div
						style={{
							maxWidth:
								record?.mysqlDTO?.openDisasterRecoveryMode ===
								true
									? '120px'
									: '160px'
						}}
					>
						<div
							className="name-link text-overflow"
							onClick={() => toDetail(record)}
						>
							{record?.mysqlDTO?.relationName || '--'}
						</div>
						<div className="text-overflow">
							{record?.mysqlDTO?.relationAliasName ||
								record?.mysqlDTO?.relationName}
						</div>
					</div>
				) : (
					'--'
				)}
			</div>
		);
	};
	const nameRender = (value: string, index: number, record: serviceProps) => {
		if (record.status === 'Deleted') {
			return (
				<div style={{ maxWidth: '160px' }}>
					<div className="displayed-name text-overflow">
						{record.name}
					</div>
					<div className="text-overflow">{record.aliasName}</div>
				</div>
			);
		}
		if (record.status === 'Preparing') {
			return (
				<div style={{ maxWidth: '160px' }}>
					<div
						className="displayed-name text-overflow"
						title="服务创建中，无法操作"
					>
						{record.name}
					</div>
					<div className="text-overflow">{record.aliasName}</div>
				</div>
			);
		}
		if (record.status === 'failed') {
			return (
				<div style={{ maxWidth: '160px' }}>
					<div
						className="displayed-name text-overflow"
						title="服务创建失败，无法操作"
					>
						{record.name}
					</div>
					<div className="text-overflow">{record.aliasName}</div>
				</div>
			);
		}
		return (
			<div className="display-flex flex-align">
				{record?.mysqlDTO ? (
					record?.mysqlDTO?.openDisasterRecoveryMode &&
					!record?.mysqlDTO?.isSource ? (
						<div className="gray-circle">备</div>
					) : null
				) : null}
				<div
					style={{
						maxWidth:
							record?.mysqlDTO?.openDisasterRecoveryMode &&
							!record?.mysqlDTO?.isSource
								? '120px'
								: '160px'
					}}
				>
					<div
						className="name-link text-overflow"
						onClick={() => {
							history.push(
								`/serviceList/${name}/${aliasName}/basicInfo/${record.name}/${record.type}/${record.chartVersion}`
							);
						}}
					>
						{record.name}
					</div>
					<div className="text-overflow">{record.aliasName}</div>
				</div>
			</div>
		);
	};
	const podRender = (value: string, index: number, record: serviceProps) => {
		return (
			<span
				className="name-link"
				onClick={() => {
					history.push(
						`/serviceList/${name}/${aliasName}/highAvailability/${record.name}/${record.type}/${record.chartVersion}`
					);
					storage.setLocal('backKey', 'highAvailability');
				}}
			>
				{value || '--'}
			</span>
		);
	};
	return (
		<Page>
			<Header
				title={`${aliasName || ''}服务列表`}
				subTitle="已发布中间件服务管理列表"
			/>
			<Content>
				<Loading visible={loadingVisible}>
					<Table
						dataSource={showDataSource}
						exact
						fixedBarExpandWidth={[24]}
						affixActionBar
						showColumnSetting
						showRefresh
						onRefresh={getData}
						primaryKey="name"
						operation={operation()}
						search={{
							value: keyword,
							onChange: handleChange,
							onSearch: handleSearch,
							placeholder: '请输入搜索内容'
						}}
						onSort={onSort}
						onFilter={onFilter}
						rowProps={onRowProps}
					>
						<Table.Column
							title="服务名称/中文别名"
							dataIndex="name"
							width={180}
							cell={nameRender}
							lock="left"
						/>
						<Table.Column
							title="状态"
							dataIndex="status"
							width={150}
							cell={serviceListStatusRender}
							filters={states}
							filterMode="single"
						/>
						<Table.Column
							title="实例数"
							dataIndex="podNum"
							cell={podRender}
							width={80}
						/>
						<Table.Column
							title="备注"
							dataIndex="description"
							cell={nullRender}
						/>
						<Table.Column
							title="关联服务名称/中文别名"
							dataIndex="associated"
							width={180}
							cell={associatedRender}
						/>
						<Table.Column
							title="创建时间"
							dataIndex="createTime"
							width={180}
							sortable={true}
							cell={timeRender}
						/>
						<Table.Column
							title="操作"
							dataIndex="action"
							cell={actionRender}
							width={300}
							{...lock}
						/>
					</Table>
				</Loading>
			</Content>
		</Page>
	);
};
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {
	setCluster,
	setNamespace,
	setRefreshCluster
})(ServiceListByType);
