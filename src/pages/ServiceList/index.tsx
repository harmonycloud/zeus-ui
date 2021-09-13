import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
	Button,
	Message,
	Dialog,
	Checkbox
} from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import Table from '@/components/MidTable';
import RapidScreening from '@/components/RapidScreening';
import { getList } from '@/services/serviceList';
import { deleteMiddleware } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import { serviceListStatusRender } from '@/utils/utils';
import { states } from '@/utils/const';
import { StoreState, globalVarProps } from '@/types/index';
import { serviceListItemProps, serviceProps } from './service.list';
import { listProps } from '@/components/RapidScreening';
import { iconTypeRender, timeRender } from '@/utils/utils';

interface serviceListProps {
	globalVar: globalVarProps;
}
function ServiceList(props: serviceListProps): JSX.Element {
	const { cluster, namespace } = props.globalVar;
	const history = useHistory();
	const [originData, setOriginData] = useState<serviceListItemProps[]>([]);
	const [dataSource, setDataSource] = useState<serviceProps[]>([]);
	const [showDataSource, setShowDataSource] = useState<serviceProps[]>([]);
	const [backupCheck, setBackupCheck] = useState<boolean>(false);
	const [keyword, setKeyword] = useState<string>('');
	const [list, setList] = useState<listProps[]>([
		{ name: '全部服务', count: 0 }
	]);
	const [selected, setSelected] = useState<string>('全部服务');

	useEffect(() => {
		let mounted = true;
		if (JSON.stringify(namespace) !== '{}') {
			getList({
				clusterId: cluster.id,
				namespace: namespace.name,
				keyword: keyword
			}).then((res) => {
				if (res.success) {
					if (mounted) {
						setOriginData(res?.data);
						const listTemp = [{ name: '全部服务', count: 0 }];
						res?.data.forEach((item: serviceListItemProps) => {
							listTemp.push({
								name: item.name,
								count: item.serviceNum
							});
						});
						listTemp[0].count = listTemp.reduce(
							(pre, cur: listProps) => {
								return pre + cur.count;
							},
							0
						);
						setList(listTemp);
					}
				}
			});
		}
		return () => {
			mounted = false;
		};
	}, [props]);
	useEffect(() => {
		const allList: serviceProps[] = [];
		originData.forEach((item) => {
			item.serviceList.length > 0 &&
				item.serviceList.forEach((i) => {
					i.imagePath = item.imagePath;
					allList.push(i);
				});
		});
		setDataSource(allList);
		setShowDataSource(allList);
	}, [originData]);
	useEffect(() => {
		if (selected !== '全部服务') {
			setShowDataSource(
				originData.filter((item) => item.chartName === selected)[0]
					.serviceList
			);
		} else {
			setShowDataSource(dataSource);
		}
	}, [selected]);
	useEffect(() => {
		getData();
	}, [keyword]);
	const getData: () => void = () => {
		if (JSON.stringify(namespace) !== '{}') {
			const sendData = {
				clusterId: cluster.id,
				namespace: namespace.name,
				keyword
			};
			getList(sendData).then((res) => {
				console.log(res);
				if (res.success) {
					setOriginData(res?.data);
					const listTemp = [{ name: '全部服务', count: 0 }];
					res?.data.forEach((item: serviceListItemProps) => {
						listTemp.push({
							name: item.name,
							count: item.serviceNum
						});
					});
					listTemp[0].count = listTemp.reduce(
						(pre, cur: listProps) => {
							return pre + cur.count;
						},
						0
					);
					setList(listTemp);
				}
			});
		}
	};
	const handleFilterBackup = (checked: boolean) => {
		setBackupCheck(checked);
		if (checked) {
			const list = dataSource.filter(
				(item) => item?.mysqlDTO?.openDisasterRecoveryMode === true
			);
			setShowDataSource(list);
		} else {
			setShowDataSource(dataSource);
		}
	};
	const handleSearch = (value: string) => {
		setKeyword(value);
	};
	const onSort = (dataIndex: string, order: string) => {
		if (dataIndex === 'createTime') {
			const tempDataSource = dataSource.sort((a, b) => {
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
		if (selectedKeys.length === 0) {
			setShowDataSource(dataSource);
		} else {
			let tempData: serviceProps[] = [];
			if (selectedKeys[0] !== 'Other') {
				tempData = dataSource.filter((item) => {
					return item.status === selectedKeys[0];
				});
			} else if (selectedKeys[0] === 'Other') {
				tempData = dataSource.filter((item) => {
					return (
						item.status !== 'Running' && item.status !== 'Creating'
					);
				});
			}
			setShowDataSource(tempData);
		}
	};
	// * 关联服务名称的跳转
	const toDetail = (record: any) => {
		console.log(record);
		console.log('to details');
		// const cs = globalClusterList.filter(
		// 	(item) => item.id === record.mysqlDTO.relationClusterId
		// );
		// setCluster(cs[0]);
		// storage.setLocal('cluster', JSON.stringify(cs[0]));
		// const ns = globalNamespaceList.filter(
		// 	(item) => item.name === record.mysqlDTO.relationNamespace
		// );
		// setNamespace(ns[0]);
		// storage.setLocal('namespace', JSON.stringify(ns[0]));
		// setRefreshCluster(true);
		// history.push({
		// 	pathname: `/instanceList/detail/${record.mysqlDTO.relationName}/${
		// 		record.mysqlDTO.type || 'mysql'
		// 	}/${instance.chartVersion}`,
		// 	state: {
		// 		flag: true
		// 	}
		// });
	};
	const deleteFn = (name: string) => {
		Dialog.show({
			title: '提示',
			content: '确定删除该服务？',
			onOk: () => {
				return deleteMiddleware({
					clusterId: cluster.id,
					namespace: namespace.name,
					middlewareName: name,
					type: 'mysql'
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
	const createService = () => {
		if (selected === '全部服务') {
			history.push('/middlewareRepository');
		} else {
			const { chartVersion, chartName, version } = originData.filter(
				(item) => item.name === selected
			)[0];
			switch (selected) {
				case 'mysql':
					history.push(
						`/middlewareRepository/mysqlCreate/${chartName}/${chartVersion}`
					);
					break;
				case 'redis':
					history.push(
						`/middlewareRepository/redisCreate/${chartName}/${chartVersion}`
					);
					break;
				case 'elasticsearch':
					history.push(
						`/middlewareRepository/elasticsearchCreate/${chartName}/${chartVersion}`
					);
					break;
				case 'rocketmq':
					history.push(
						`/middlewareRepository/rocketmqCreate/${chartName}/${chartVersion}`
					);
					break;
				default:
					history.push(
						`/middlewareRepository/dynamicForm/${chartName}/${chartVersion}/${version}`
					);
					break;
			}
		}
	};
	const Operation = {
		primary: (
			<Button onClick={createService} type="primary">
				发布服务
			</Button>
		),
		secondary: (
			<Checkbox checked={backupCheck} onChange={handleFilterBackup}>
				灾备服务
			</Checkbox>
		)
	};

	const nameRender = (value: string, index: number, record: serviceProps) => {
		return (
			<div className="display-flex flex-align">
				{record.mysqlDTO ? (
					record.mysqlDTO.openDisasterRecoveryMode &&
					!record.mysqlDTO.isSource ? (
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
	const podNumRender = (
		value: string,
		index: number,
		record: serviceProps
	) => {
		return (
			<div
				className="name-link"
				onClick={() => {
					history.push(
						`/serviceList/highAvailability/${record.name}/${record.type}/${record.chartVersion}`
					);
				}}
			>
				{value}
			</div>
		);
	};
	const associatedRender = (
		value: string,
		index: number,
		record: serviceProps
	) => {
		return (
			<div className="display-flex flex-align">
				{/* 主备标识符 */}
				{record.mysqlDTO.openDisasterRecoveryMode === true ? (
					record.mysqlDTO.isSource ? (
						<div className="gray-circle">备</div>
					) : (
						<div className="blue-circle">源</div>
					)
				) : null}
				{record.mysqlDTO.isSource !== null ? (
					<div>
						<div
							className="name-link"
							onClick={() => toDetail(record)}
						>
							{record.mysqlDTO.relationName}
						</div>
						<div>
							{record.mysqlDTO.relationAliasName ||
								record.mysqlDTO.relationName}
						</div>
					</div>
				) : null}
			</div>
		);
	};
	const actionRender = (
		value: string,
		index: number,
		record: serviceProps
	) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						history.push({
							pathname: '/serviceAvailable',
							state: {
								middlewareName: record.name
							}
						});
					}}
				>
					服务暴露
				</LinkButton>
				<LinkButton>数据监控</LinkButton>
				<LinkButton
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
					日志详情
				</LinkButton>
				<LinkButton>服务控制台</LinkButton>
				<LinkButton>灾备服务</LinkButton>
				<LinkButton
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
					告警规则
				</LinkButton>
				<LinkButton>数据安全</LinkButton>
				<LinkButton>参数设置</LinkButton>
				<LinkButton>版本管理</LinkButton>
				<LinkButton onClick={() => deleteFn(record.name)}>
					删除
				</LinkButton>
			</Actions>
		);
	};
	return (
		<Page>
			<Header
				title="服务列表"
				subTitle="已发布的不同类型中间件服务管理列表"
			/>
			<Content>
				<RapidScreening
					list={list}
					selected={selected}
					changeSelected={(value: string) => setSelected(value)}
				/>
				<Table
					dataSource={showDataSource}
					exact
					fixedBarExpandWidth={[24]}
					affixActionBar
					showColumnSetting
					showRefresh
					onRefresh={getData}
					primaryKey="key"
					operation={Operation}
					search={{
						onSearch: handleSearch,
						placeholder: '请输入搜索内容'
					}}
					onSort={onSort}
					onFilter={onFilter}
				>
					<Table.Column
						title="服务名称/中文别名"
						dataIndex="name"
						resizable
						cell={nameRender}
					/>
					<Table.Column
						title="类型"
						dataIndex="type"
						resizable
						cell={iconTypeRender}
					/>
					<Table.Column
						title="状态"
						dataIndex="status"
						cell={serviceListStatusRender}
						filters={states}
						filterMode="single"
					/>
					<Table.Column
						title="实例数"
						dataIndex="podNum"
						cell={podNumRender}
					/>
					<Table.Column title="备注" dataIndex="annotation" />
					<Table.Column
						title="关联服务名称/中文别名"
						dataIndex="associated"
						cell={associatedRender}
					/>
					<Table.Column
						title="创建时间"
						dataIndex="createTime"
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
}
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps, {})(ServiceList);
