import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { useHistory, useParams } from 'react-router-dom';
import { Button, notification, Modal, Checkbox, Tooltip } from 'antd';
// --- 自定义组件
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import ProTable from '@/components/ProTable';
import Actions from '@/components/Actions';
import GuidePage from '../GuidePage';
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
	ListParamsProps,
	ShowDataSourceParams
} from './service.list';
import { StoreState, User } from '@/types/index';
import storage from '@/utils/storage';
import { states } from '@/utils/const';
import { serviceListStatusRender, timeRender, nullRender } from '@/utils/utils';
import { checkLicense } from '@/services/user';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
// --- css样式

const { confirm } = Modal;
const LinkButton = Actions.LinkButton;

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
	const [showDataSource, setShowDataSource] =
		useState<ShowDataSourceParams>();
	const [backupCheck, setBackupCheck] = useState<boolean>(false);
	const [keyword, setKeyword] = useState<string>('');
	const [cantRelease, setCantRelease] = useState<boolean>(false);
	const history = useHistory();
	const params: ListParamsProps = useParams();
	const { name, aliasName } = params;
	const [middlewareInfo, setMiddlewareInfo] = useState<middlewareProps>();
	const [loadingVisible, setLoadingVisible] = useState<boolean>(true);
	// * 角色权限
	const [role] = useState<User>(JSON.parse(storage.getLocal('role')));
	// ! true 为当前用户具有该操作的权限 false 为当前用户不具有该操作的权限
	const [roleFlag, setRoleFlag] = useState({
		getFlag: false,
		createFlag: false,
		operateFlag: false,
		deleteFlag: false
	});
	const [license, setLicense] = useState<boolean>(false);
	useEffect(() => {
		let getFlag = false;
		let createFlag = false;
		let operateFlag = false;
		let deleteFlag = false;
		if (role.userRoleList.some((i: any) => i.roleId === 1)) {
			getFlag = true;
			createFlag = true;
			operateFlag = true;
			deleteFlag = true;
		} else {
			getFlag =
				role.userRoleList.find(
					(item) => item.projectId === project.projectId
				)?.power[name][0] === '1'
					? true
					: false;
			createFlag =
				role.userRoleList.find(
					(item) => item.projectId === project.projectId
				)?.power[name][2] === '1'
					? true
					: false;
			deleteFlag =
				role.userRoleList.find(
					(item) => item.projectId === project.projectId
				)?.power[name][3] === '1'
					? true
					: false;
			operateFlag =
				role.userRoleList.find(
					(item) => item.projectId === project.projectId
				)?.power[name][1] === '1'
					? true
					: false;
		}
		setRoleFlag({
			getFlag,
			createFlag,
			operateFlag,
			deleteFlag
		});
		getLicenseCheck();
	}, []);
	useEffect(() => {
		if (JSON.stringify(cluster) !== '{}') {
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
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		}
	}, [cluster]);
	useEffect(() => {
		if (JSON.stringify(cluster) !== '{}') {
			getCanReleaseMiddleware({
				clusterId: cluster.id,
				type: name
			}).then((res) => {
				if (res.success) {
					setMiddlewareInfo(res.data);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		}
	}, [cluster, name]);
	useEffect(() => {
		let mounted = true;
		if (
			JSON.stringify(cluster) !== '{}' &&
			JSON.stringify(namespace) !== '{}'
		) {
			if (mounted) {
				setDataSource(undefined);
				setShowDataSource({ '': [] });
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
							console.log(res.data);
							if (res.data.length > 0) {
								setDataSource(res.data[0]);
								setShowDataSource({
									[res.data[0].name]: res.data[0].serviceList
								});
								console.log({
									[res.data[0].name]: res.data[0].serviceList
								});
							} else {
								setDataSource(undefined);
								setShowDataSource({ '': [] });
							}
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
						}
					})
					.finally(() => {
						setLoadingVisible(false);
					});
			}
		}
		return () => {
			setShowDataSource({ '': [] });
			mounted = false;
		};
	}, [cluster, namespace, name]);
	const getLicenseCheck = () => {
		checkLicense({ license: '' }).then((res) => {
			if (res.success) {
				setLicense(false);
			} else {
				setLicense(true);
			}
		});
	};
	const getData = () => {
		setLoadingVisible(true);
		setDataSource(undefined);
		setShowDataSource({ '': [] });
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
						setShowDataSource({
							[res.data[0].name]: res.data[0].serviceList
						});
						console.log({
							[res.data[0].name]: res.data[0].serviceList
						});
					} else {
						setDataSource(undefined);
						setShowDataSource({ '': [] });
					}
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			})
			.finally(() => {
				setLoadingVisible(false);
			});
	};
	const handleChange: (e: any) => void = (e: any) => {
		setKeyword(e.target.value);
	};
	const handleSearch = () => {
		getData();
	};
	const deleteFn = (record: serviceProps) => {
		confirm({
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
							notification.success({
								message: '成功',
								description: '删除成功'
							});
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
						}
					})
					.finally(() => {
						getData();
					});
			}
		});
	};
	const handleFilterBackup = (e: CheckboxChangeEvent) => {
		setBackupCheck(e.target.checked);
		let list = dataSource?.serviceList || [];
		if (e.target.checked) {
			list =
				showDataSource?.[name].filter(
					(item) => item?.mysqlDTO?.openDisasterRecoveryMode === true
				) || [];
		}
		setShowDataSource({ [name]: list });
	};
	const releaseMiddleware = () => {
		if (license) {
			confirm({
				title: '可用余额不足',
				content:
					'当前您的可用余额已不足2CPU，如果您想继续使用谐云zeus中间件一体化管理平台，请联系我们申请授权',
				okText: '立即前往'
				// onOk: () => {}
			});
		} else {
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
					case 'zookeeper':
						history.push(
							`/serviceList/${name}/${aliasName}/zookeeperCreate/${middlewareInfo?.chartVersion}`
						);
						break;
					case 'postgresql':
						history.push(
							`/serviceList/${name}/${aliasName}/postgresqlCreate/${middlewareInfo?.chartVersion}`
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
		confirm({
			title: '操作确认',
			content: '请确认是否恢复该服务！',
			onOk: () => {
				return recoveryMiddleware(sendData)
					.then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '该服务已恢复,3秒后刷新'
							});
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
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
		confirm({
			title: '操作确认',
			content: '删除后无法恢复该服务，请谨慎操作！',
			onOk: () => {
				return deleteMiddlewareStorage(sendData)
					.then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '该服务已彻底删除'
							});
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
						}
					})
					.finally(() => {
						getData();
					});
			}
		});
	};
	const operation = () => {
		if (!roleFlag.createFlag || !roleFlag.getFlag) {
			if (name === 'mysql') {
				return {
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
				return {};
			}
		}
		if (cantRelease) {
			if (name === 'mysql') {
				return {
					primary: (
						<Tooltip title="请前往平台组件界面安装中间件管理组件！">
							<Button
								onClick={releaseMiddleware}
								type="primary"
								disabled={cantRelease}
							>
								发布服务
							</Button>
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
						<Tooltip title="请前往平台组件界面安装中间件管理组件！">
							<Button
								onClick={releaseMiddleware}
								type="primary"
								disabled={cantRelease}
							>
								发布服务
							</Button>
						</Tooltip>
					)
				};
			}
		} else if (!middlewareInfo) {
			if (name === 'mysql') {
				return {
					primary: (
						<Tooltip title="数据加载中，请稍后...">
							<Button
								onClick={releaseMiddleware}
								type="primary"
								disabled={!middlewareInfo}
							>
								发布服务
							</Button>
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
						<Tooltip title="数据加载中，请稍后...">
							<Button
								onClick={releaseMiddleware}
								type="primary"
								disabled={!middlewareInfo}
							>
								发布服务
							</Button>
						</Tooltip>
					)
				};
			}
		} else if (namespace.availableDomain) {
			if (name !== 'mysql' && name !== 'redis' && name !== 'postgresql') {
				return {
					primary: (
						<Tooltip title="当前中间件不支持同城双活">
							<Button
								onClick={releaseMiddleware}
								type="primary"
								disabled={namespace.availableDomain}
							>
								发布服务
							</Button>
						</Tooltip>
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
		record: serviceProps,
		index: number
	) => {
		if (record.status === 'Preparing' || record.status === 'failed') {
			return (
				<Actions>
					<LinkButton
						disabled={!roleFlag.deleteFlag}
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
						disabled={!roleFlag.operateFlag}
						onClick={() => recoveryService(record)}
					>
						恢复服务
					</LinkButton>
					<LinkButton
						disabled={!roleFlag.deleteFlag}
						onClick={() => deleteStorage(record)}
					>
						彻底删除
					</LinkButton>
				</Actions>
			);
		}
		if (!roleFlag.operateFlag && roleFlag.deleteFlag) {
			return (
				<Actions>
					<LinkButton onClick={() => deleteFn(record)}>
						<span>删除</span>
					</LinkButton>
				</Actions>
			);
		}
		if (roleFlag.operateFlag && !roleFlag.deleteFlag) {
			return (
				<Actions>
					{(name === 'kafka' ||
						name === 'rocketmq' ||
						name === 'elasticsearch') && (
						<LinkButton
							onClick={() => {
								const sendData = {
									clusterId: cluster.id,
									namespace: record.namespace,
									middlewareName: record.name,
									type: record.type
								};
								getPlatformAdd(sendData).then((res) => {
									if (res.success) {
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
											notification.error({
												message: '失败',
												description: `请前往服务暴露页面暴露管理页面服务`
											});
										}
									} else {
										notification.info({
											message: '提醒',
											description: res.errorMsg
										});
									}
								});
							}}
						>
							<span>服务控制台</span>
						</LinkButton>
					)}
					<LinkButton
						onClick={() =>
							history.push(
								`/serviceList/${name}/${aliasName}/serverVersion/${record.name}/${record.type}/${record.namespace}`
							)
						}
					>
						<span>版本管理</span>
					</LinkButton>
					{(name === 'mysql' ||
						name === 'redis' ||
						name === 'postgresql') && (
						<LinkButton
							onClick={() => {
								window.open(
									`#/operationalPanel/sqlConsole/${project.projectId}/${cluster.id}/${record.namespace}/${name}/${record.name}`,
									'_blank'
								);
							}}
						>
							运维面板
						</LinkButton>
					)}
				</Actions>
			);
		}
		return (
			<Actions>
				{(name === 'kafka' ||
					name === 'rocketmq' ||
					name === 'elasticsearch') && (
					<LinkButton
						disabled={!roleFlag.operateFlag}
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
										notification.error({
											message: '失败',
											description: `请前往服务暴露页面暴露管理页面服务`
										});
									}
								} else {
									notification.info({
										message: '提醒',
										description: res.errorMsg
									});
								}
							});
						}}
					>
						<span
							title={
								!roleFlag.operateFlag
									? '当前用户无改操作的权限'
									: ''
							}
						>
							服务控制台
						</span>
					</LinkButton>
				)}
				<LinkButton
					disabled={!roleFlag.operateFlag}
					onClick={() =>
						history.push(
							`/serviceList/${name}/${aliasName}/serverVersion/${record.name}/${record.type}/${record.namespace}`
						)
					}
				>
					<span
						title={
							!roleFlag.operateFlag
								? '当前用户无改操作的权限'
								: ''
						}
					>
						版本管理
					</span>
				</LinkButton>
				{(name === 'mysql' ||
					name === 'redis' ||
					name === 'postgresql') && (
					<LinkButton
						onClick={() => {
							window.open(
								`#/operationalPanel/sqlConsole/${project.projectId}/${cluster.id}/${record.namespace}/${name}/${record.name}`,
								'_blank'
							);
						}}
					>
						运维面板
					</LinkButton>
				)}
				<LinkButton
					disabled={!roleFlag.deleteFlag}
					onClick={() => deleteFn(record)}
				>
					<span
						title={
							!roleFlag.deleteFlag ? '当前用户无改操作的权限' : ''
						}
					>
						删除
					</span>
				</LinkButton>
			</Actions>
		);
	};
	const toDetail = (record: any) => {
		if (!record.mysqlDTO.relationExist) {
			notification.error({
				message: '失败',
				description: '该关联实例不存在，无法进行跳转'
			});
			return;
		}
		const cs = globalClusterList.filter(
			(item) => item.id === record.mysqlDTO.relationClusterId
		);
		setCluster(cs[0]);
		storage.setLocal('cluster', JSON.stringify(cs[0]));
		// const ns = globalNamespaceList.filter(
		// 	(item) => item.name === record.mysqlDTO.relationNamespace
		// );
		setNamespace({ name: '*', aliasName: '全部' });
		storage.setLocal(
			'namespace',
			JSON.stringify({ name: '*', aliasName: '全部' })
		);
		setRefreshCluster(true);
		history.push({
			pathname: `/serviceList/${name}/${aliasName}/basicInfo/${
				record.mysqlDTO.relationName
			}/${record.mysqlDTO.type || 'mysql'}/${record.chartVersion}/${
				record.mysqlDTO.relationNamespace
			}`,
			state: {
				flag: true
			}
		});
	};
	const associatedRender = (
		value: string,
		record: serviceProps,
		index: number
	) => {
		if (name !== 'mysql') return '--';
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
	const nameRender = (value: string, record: serviceProps, index: number) => {
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
	const podRender = (value: string, record: serviceProps, index: number) => {
		if (record.status === 'Deleted') return '--';
		return (
			<span
				className={roleFlag.operateFlag ? 'name-link' : ''}
				onClick={() => {
					if (roleFlag.operateFlag) {
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
		<ProPage>
			<ProHeader
				title={`${aliasName || ''}服务列表`}
				subTitle="已发布中间件服务管理列表"
			/>
			<ProContent>
				<ProTable
					dataSource={showDataSource?.[name] || []}
					showColumnSetting
					showRefresh
					onRefresh={getData}
					rowKey="name"
					operation={operation()}
					loading={loadingVisible}
					search={{
						value: keyword,
						onChange: handleChange,
						onSearch: handleSearch,
						placeholder: '请输入搜索内容'
					}}
					rowClassName={(record) => {
						if (record.status === 'Deleted') {
							return 'table-row-delete';
						}
						return '';
					}}
				>
					<ProTable.Column
						title="服务名称/中文别名"
						dataIndex="name"
						width={180}
						render={nameRender}
						fixed="left"
					/>
					<ProTable.Column
						title="状态"
						dataIndex="status"
						width={150}
						render={serviceListStatusRender}
						filters={states}
						filterMultiple={false}
						onFilter={(
							value: string | number | boolean,
							record: serviceProps
						) => {
							return record.status === value;
						}}
					/>
					<ProTable.Column
						title="实例数"
						dataIndex="podNum"
						render={podRender}
						width={80}
					/>
					<ProTable.Column
						title="备注"
						dataIndex="description"
						render={nullRender}
					/>
					<ProTable.Column
						title="关联服务名称/中文别名"
						dataIndex="associated"
						width={180}
						render={associatedRender}
					/>
					<ProTable.Column
						title="创建时间"
						dataIndex="createTime"
						width={180}
						sorter={(a: serviceProps, b: serviceProps) =>
							moment(a.createTime).unix() -
							moment(b.createTime).unix()
						}
						render={timeRender}
					/>
					{roleFlag.createFlag !== false ||
					roleFlag.operateFlag !== false ||
					roleFlag.deleteFlag !== false ? (
						<ProTable.Column
							title="操作"
							dataIndex="action"
							render={actionRender}
							width={300}
						/>
					) : null}
				</ProTable>
			</ProContent>
		</ProPage>
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
