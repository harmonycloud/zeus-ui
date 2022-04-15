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
	ParamsProps,
	getPlatformAdd
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
import { StoreState, User } from '@/types/index';
import storage from '@/utils/storage';
import { states } from '@/utils/const';
import { serviceListStatusRender, timeRender, nullRender } from '@/utils/utils';
import GuidePage from '../GuidePage';
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
		project,
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
					projectId: project.projectId,
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
			projectId: project.projectId,
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
					namespace: record.namespace,
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
			namespace: record.namespace,
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
			namespace: record.namespace,
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
		const jsonRole: User = JSON.parse(storage.getLocal('role'));
		console.log(jsonRole);
		let getFlag = false;
		let createFlag = false;
		if (jsonRole.userRoleList.some((i: any) => i.roleId === 1)) {
			getFlag = true;
			createFlag = true;
		} else {
			getFlag =
				jsonRole.userRoleList.find(
					(item) => item.projectId === project.projectId
				)?.power[name][0] === '1'
					? true
					: false;
			createFlag =
				jsonRole.userRoleList.find(
					(item) => item.projectId === project.projectId
				)?.power[name][2] === '1'
					? true
					: false;
		}
		if (!createFlag || !getFlag) {
			if (name === 'mysql') {
				return {
					primary: (
						<Tooltip
							trigger={
								<Button
									type="primary"
									disabled={!createFlag || !getFlag}
								>
									发布服务
								</Button>
							}
						>
							当前用户无该操作的权限!
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
									type="primary"
									disabled={!createFlag || !getFlag}
								>
									发布服务
								</Button>
							}
						>
							当前用户无该操作的权限!
						</Tooltip>
					)
				};
			}
		}
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
		const jsonRole: User = JSON.parse(storage.getLocal('role'));
		console.log(jsonRole);
		let deleteFlag = false;
		let operateFlag = false;
		if (jsonRole.userRoleList[0].roleId === 1) {
			deleteFlag = true;
			operateFlag = true;
		} else {
			deleteFlag =
				jsonRole.userRoleList.find(
					(item) => item.projectId === project.projectId
				)?.power[record.type][3] === '1'
					? true
					: false;
			operateFlag =
				jsonRole.userRoleList.find(
					(item) => item.projectId === project.projectId
				)?.power[record.type][1] === '1'
					? true
					: false;
		}
		if (record.status === 'Preparing' || record.status === 'failed') {
			return (
				<Actions>
					<LinkButton
						disabled={!deleteFlag}
						onClick={() => deleteFn(record)}
					>
						删除
					</LinkButton>
				</Actions>
			);
		}
		if (record.status === 'Deleted') {
			return (
				<Actions>
					<LinkButton
						disabled={!operateFlag}
						onClick={() => recoveryService(record)}
					>
						恢复服务
					</LinkButton>
					<LinkButton
						disabled={!deleteFlag}
						onClick={() => deleteStorage(record)}
					>
						彻底删除
					</LinkButton>
				</Actions>
			);
		}
		return (
			<Actions>
				<LinkButton
					disabled={!operateFlag}
					onClick={() => {
						const sendData = {
							clusterId: cluster.id,
							namespace: record.namespace,
							middlewareName: record.name,
							type: record.type
						};
						getPlatformAdd(sendData).then((res) => {
							if (res.success) {
								console.log(res);
								if (res.data) {
									window.open(
										`${window.location.protocol.toLowerCase()}//${
											res.data
										}`,
										'_blank'
									);
								} else {
									const sn =
										record.type === 'elasticsearch'
											? `${record.name}-kibana`
											: record.type === 'rocketmq'
											? `${record.name}-console-svc`
											: `${record.name}-manager-svc`;
									Message.show(
										messageConfig(
											'error',
											'失败',
											`请先前往“服务暴露”暴露该服务的${sn}服务`
										)
									);
								}
							} else {
								Message.show(
									messageConfig('error', '失败', res)
								);
							}
						});
					}}
				>
					<span title={operateFlag ? '当前用户无改操作的权限' : ''}>
						服务控制台
					</span>
				</LinkButton>
				<LinkButton
					disabled={!operateFlag}
					onClick={() =>
						history.push(
							`/serviceList/${name}/${aliasName}/serverVersion/${record.name}/${record.type}/${record.namespace}`
						)
					}
				>
					<span title={!operateFlag ? '当前用户无改操作的权限' : ''}>
						版本管理
					</span>
				</LinkButton>
				<LinkButton
					disabled={!deleteFlag}
					onClick={() => deleteFn(record)}
				>
					<span title={!deleteFlag ? '当前用户无改操作的权限' : ''}>
						删除
					</span>
				</LinkButton>
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
			}/${record.mysqlDTO.type || 'mysql'}/${record.chartVersion}/${
				record.namespace
			}`,
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
							title={record?.mysqlDTO?.relationName || '--'}
							className="name-link text-overflow"
							onClick={() => toDetail(record)}
						>
							{record?.mysqlDTO?.relationName || '--'}
						</div>
						<div
							title={
								record?.mysqlDTO?.relationAliasName ||
								record?.mysqlDTO?.relationName
							}
							className="text-overflow"
						>
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
					<div
						title={record.name}
						className="displayed-name text-overflow"
					>
						{record.name}
					</div>
					<div
						title={record.aliasName || ''}
						className="text-overflow"
					>
						{record.aliasName}
					</div>
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
								`/serviceList/${name}/${aliasName}/basicInfo/${record.name}/${record.type}/${record.chartVersion}/${record.namespace}`
							);
						}}
						title={record.name}
					>
						{record.name}
					</div>
					<div
						title={record.aliasName || ''}
						className="text-overflow"
					>
						{record.aliasName}
					</div>
				</div>
			</div>
		);
	};
	const podRender = (value: string, index: number, record: serviceProps) => {
		const jsonRole: User = JSON.parse(storage.getLocal('role'));
		let operateFlag = false;
		if (jsonRole.userRoleList.some((i: any) => i.roleId === 1)) {
			operateFlag = true;
		} else {
			operateFlag =
				jsonRole.userRoleList.find(
					(item) => item.projectId === project.projectId
				)?.power[record.type][1] === '1'
					? true
					: false;
		}
		return (
			<span
				className={operateFlag ? 'name-link' : ''}
				onClick={() => {
					if (operateFlag) {
						history.push(
							`/serviceList/${name}/${aliasName}/highAvailability/${record.name}/${record.type}/${record.chartVersion}/${record.namespace}`
						);
						storage.setLocal('backKey', 'highAvailability');
					}
				}}
			>
				{value || '--'}
			</span>
		);
	};
	if (JSON.stringify(cluster) === '{}' || JSON.stringify(project) === '{}') {
		return <GuidePage />;
	}
	return (
		<Page>
			<Header
				title={`${aliasName || ''}服务列表`}
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
					loading={loadingVisible}
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
