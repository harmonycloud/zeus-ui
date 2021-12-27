import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import {
	Button,
	Message,
	Dialog,
	Checkbox,
	Balloon
} from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import Table from '@/components/MidTable';
import {
	serviceListItemProps,
	serviceProps,
	CurrentService
} from './service.list';
import { StoreState } from '@/types/index';
import {
	getList,
	deleteMiddlewareStorage,
	recoveryMiddleware,
	ParamsProps
} from '@/services/serviceList';
import { deleteMiddleware } from '@/services/middleware';
import { states } from '@/utils/const';
import { serviceListStatusRender, timeRender } from '@/utils/utils';
import { tabJudge, serviceListProps } from './index';
import messageConfig from '@/components/messageConfig';
import {
	setCluster,
	setNamespace,
	setRefreshCluster
} from '@/redux/globalVar/var';
import storage from '@/utils/storage';
import { getComponents } from '@/services/common';

const Tooltip = Balloon.Tooltip;
interface paramsProps {
	name: string;
	aliasName: string;
}
const ServiceListByType = (props: serviceListProps) => {
	const { setCluster, setNamespace, setRefreshCluster } = props;
	const {
		cluster,
		namespace,
		clusterList: globalClusterList,
		namespaceList: globalNamespaceList
	} = props.globalVar;
	const [currentService, setCurrentServiceType] = useState<CurrentService>();
	const [dataSource, setDataSource] = useState<serviceListItemProps>();
	const [showDataSource, setShowDataSource] = useState<serviceProps[]>([]);
	const [backupCheck, setBackupCheck] = useState<boolean>(false);
	const [keyword, setKeyword] = useState<string>('');
	const [selectedKeys, setSelectKeys] = useState<string[]>([]);
	const [cantRelease, setCantRelease] = useState<boolean>(false);
	const history = useHistory();
	const params: paramsProps = useParams();
	const { name, aliasName } = params;
	useEffect(() => {
		setCurrentServiceType({
			name: aliasName,
			type: name
		});
	}, [params]);
	useEffect(() => {
		let mounted = true;
		if (JSON.stringify(namespace) !== '{}') {
			if (mounted) {
				if (currentService && currentService?.type !== '') {
					getList({
						clusterId: cluster.id,
						namespace: namespace.name,
						keyword: keyword,
						type: currentService?.type
					}).then((res) => {
						if (res.success) {
							res.data && setDataSource(res.data[0]);
							res.data &&
								setShowDataSource(res.data[0].serviceList);
						} else {
							Message.show(messageConfig('error', '失败', res));
						}
					});
				}
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
			}
		}
		return () => {
			mounted = false;
		};
	}, [namespace, currentService]);
	const getData = () => {
		getList({
			clusterId: cluster.id,
			namespace: namespace.name,
			keyword: keyword,
			type: currentService?.type
		}).then((res) => {
			if (res.success) {
				setDataSource(res.data[0]);
				res.data[0] && setShowDataSource(res.data[0].serviceList);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
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
								messageConfig(
									'success',
									'成功',
									'删除成功, 3秒后刷新'
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
		if (dataSource?.official) {
			switch (dataSource.chartName) {
				case 'mysql':
					history.push(
						`/serviceList/mysqlCreate/${currentService?.name}/${dataSource.chartName}/${dataSource.chartVersion}`
					);
					break;
				case 'redis':
					history.push(
						`/serviceList/redisCreate/${currentService?.name}/${dataSource?.chartName}/${dataSource?.chartVersion}`
					);
					break;
				case 'elasticsearch':
					history.push(
						`/serviceList/elasticsearchCreate/${currentService?.name}/${dataSource?.chartName}/${dataSource?.chartVersion}`
					);
					break;
				case 'rocketmq':
					history.push(
						`/serviceList/rocketmqCreate/${currentService?.name}/${dataSource?.chartName}/${dataSource?.chartVersion}`
					);
					break;
				default:
					history.push(
						`/serviceList/dynamicForm/${currentService?.name}/${dataSource?.chartName}/${dataSource?.chartVersion}/${dataSource?.version}`
					);
					break;
			}
		} else {
			history.push(
				`/serviceList/dynamicForm/${currentService?.name}/${dataSource?.chartName}/${dataSource?.chartVersion}/${dataSource?.version}`
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
									'该服务已彻底删除,3秒后刷新'
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
	const operation = () => {
		if (cantRelease) {
			if (currentService?.type === 'mysql') {
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
		} else if (!dataSource) {
			if (currentService?.type === 'mysql') {
				return {
					primary: (
						<Tooltip
							trigger={
								<Button
									onClick={releaseMiddleware}
									type="primary"
									disabled={!dataSource}
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
									disabled={!dataSource}
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
			if (currentService?.type === 'mysql') {
				return {
					primary: (
						<Button
							onClick={releaseMiddleware}
							type="primary"
							disabled={!dataSource}
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
							disabled={!dataSource}
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
					disabled={!record.managePlatform}
					onClick={() => {
						if (record.managePlatformAddress === '') {
							Message.show(
								messageConfig(
									'error',
									'失败',
									'服务控制台地址为空。'
								)
							);
							return;
						}
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
							!record.managePlatform
								? '该中间件发布的服务组件暂不支持该功能'
								: '服务控制台'
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
							`/serviceList/paramterSetting/${record.name}/${record.type}/${record.chartVersion}`
						);
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
							`/ServerVersion/${record.type}/${record.name}/${record.aliasName}`
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
			pathname: `/serviceList/basicInfo/${record.mysqlDTO.relationName}/${
				record.mysqlDTO.type || 'mysql'
			}/${record.chartVersion}`,
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
					<div>
						<div
							className="name-link"
							onClick={() => toDetail(record)}
						>
							{record?.mysqlDTO?.relationName}
						</div>
						<div>
							{record?.mysqlDTO?.relationAliasName ||
								record?.mysqlDTO?.relationName}
						</div>
					</div>
				) : null}
			</div>
		);
	};
	const nameRender = (value: string, index: number, record: serviceProps) => {
		if (record.status === 'Deleted') {
			return (
				<div>
					<div className="displayed-name">{record.name}</div>
					<div>{record.aliasName}</div>
				</div>
			);
		}
		return (
			<div className="display-flex flex-align">
				{record?.mysqlDTO ? (
					record?.mysqlDTO.openDisasterRecoveryMode &&
					!record?.mysqlDTO.isSource ? (
						<div className="gray-circle">备</div>
					) : null
				) : null}
				<div>
					<div
						className="name-link"
						onClick={() => {
							history.push(
								`/serviceList/basicInfo/${record.name}/${record.type}/${record.chartVersion}`
							);
						}}
					>
						{record.name}
					</div>
					<div>{record.aliasName}</div>
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
						`/serviceList/highAvailability/${record.name}/${record.type}/${record.chartVersion}`
					);
				}}
			>
				{value}
			</span>
		);
	};
	return (
		<Page>
			<Header
				title={`${currentService?.name || ''}服务列表`}
				subTitle="已发布中间件服务管理列表"
			/>
			<Content>
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
						dataIndex="annotation"
						width={200}
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
						lock="right"
					/>
				</Table>
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
