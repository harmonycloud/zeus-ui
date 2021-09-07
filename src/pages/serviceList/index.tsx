import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
	Button,
	Message,
	Dialog,
	Checkbox,
	Balloon,
	Icon
} from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import moment from 'moment';
import Table from '@/components/MidTable';
import RapidScreening from '@/components/RapidScreening';
import { getList } from '@/services/serviceList';
import messageConfig from '@/components/messageConfig';
import { serviceListStatusRender } from '@/utils/utils';
import { states } from '@/utils/const';
import { StoreState } from '@/types/index';

const list = [
	{ name: '全部服务', count: 1000 },
	{ name: 'mysql', count: 100 },
	{ name: 'raocketmq', count: 100 },
	{ name: 'redis', count: 100 }
];
interface serviceListProps {
	globalVar: any;
}
function ServiceList(props: serviceListProps): JSX.Element {
	console.log(props);
	const { cluster, namespace } = props.globalVar;
	const history = useHistory();
	const [originData, setOriginData] = useState([]);
	const [dataSource, setDataSource] = useState([]);
	const [backupCheck, setBackupCheck] = useState<boolean>(false);
	const [keyword, setKeyword] = useState<string>('');
	const [selected, setSelected] = useState<string>('全部服务');

	// useEffect(() => {
	// 	let mounted = false;
	// 	getList({
	// 		clusterId: cluster.id,
	// 		namespace: namespace.name
	// 	}).then((res) => {
	// 		console.log(res);
	// 		setOriginData([]);
	// 		if (res.success) {
	// 			if (mounted) {
	// 				// todo 在这里进行set操作
	// 			}
	// 		}
	// 	});
	// 	return () => {
	// 		mounted = false;
	// 	};
	// }, []);
	const getData: (clusterId: string, namespace: string) => void = (
		clusterId: string,
		namespace: string
	) => {
		const sendData = {
			clusterId: clusterId,
			namespace: namespace
		};
		getList(sendData).then((res) => {
			console.log(res);
		});
	};
	const refreshFn: () => void = () => {
		console.log('refresh table');
	};
	const handleFilterBackup = (checked: boolean) => {
		setBackupCheck(checked);
		// todo 表格数据刷新问题
		// if (checked) {
		// 	const list = originData.filter(
		// 		(item) => item?.mysqlDTO?.openDisasterRecoveryMode === true
		// 	);
		// 	setDataSource(list);
		// } else {
		// 	setDataSource(originData);
		// }
	};
	const handleSearch = (value: string) => {
		setKeyword(value);
		// todo 表格数据刷新问题
		// getData(globalCluster.id, globalNamespace.name, value);
	};
	const onSort = (dataIndex: string, order: string) => {
		if (dataIndex === 'createTime') {
			const tempDataSource = originData.sort((a, b) => {
				const result = a['createTimeNum'] - b['createTimeNum'];
				return order === 'asc'
					? result > 0
						? 1
						: -1
					: result > 0
					? -1
					: 1;
			});
			setDataSource([...tempDataSource]);
		}
	};
	const onFilter = (filterParams: any) => {
		console.log(filterParams);
		// let {
		// 	status: { selectedKeys }
		// } = filterParams;
		// if (selectedKeys.length === 0) {
		// 	setDataSource(originData);
		// } else {
		// 	let tempData = null;
		// 	if (selectedKeys[0] !== 'Other') {
		// 		tempData = originData.filter((item) => {
		// 			return item.status === selectedKeys[0];
		// 		});
		// 	} else if (selectedKeys[0] === 'Other') {
		// 		tempData = originData.filter((item) => {
		// 			return (
		// 				item.status !== 'Running' && item.status !== 'Creating'
		// 			);
		// 		});
		// 	}
		// 	setDataSource(tempData);
		// }
	};
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
		console.log(name);
		// Dialog.show({
		// 	title: '提示',
		// 	content: '确定删除该Mysql服务？',
		// 	onOk: async () => {
		// 		let res = await deleteMiddleware({
		// 			clusterId: globalCluster.id,
		// 			namespace: globalNamespace.name,
		// 			middlewareName: name,
		// 			type: 'mysql'
		// 		});
		// 		if (res.success) {
		// 			Message.show({
		// 				type: 'success',
		// 				title: <div>成功</div>,
		// 				content: (
		// 					<div className="message-box">
		// 						<p>删除中, 3s 后获取数据</p>
		// 					</div>
		// 				),
		// 				duration: 3000,
		// 				align: 'tr tr',
		// 				closeable: true,
		// 				offset: [-24, 62]
		// 			});
		// 			setTimer(
		// 				timerClass.countdownTimer(() => {
		// 					refreshFn();
		// 				}, 3)
		// 			);
		// 		} else {
		// 			Message.show(messageConfig('error', '失败', res));
		// 		}
		// 	}
		// });
	};

	const Operation = {
		primary: (
			<Button
				onClick={() => console.log('不同情况下的页面跳转')}
				type="primary"
			>
				发布服务
			</Button>
		),
		secondary: (
			<Checkbox checked={backupCheck} onChange={handleFilterBackup}>
				灾备服务
			</Checkbox>
		)
	};

	const nameRender = (value: string, index: number, record: any) => {
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
						onClick={
							() => console.log('前往详情')
							// history.push(
							// 	`/instanceList/detail/${record.name}/${record.type}/${instance.chartVersion}`
							// )
						}
					>
						{record.name}
					</div>
					<div>{record.aliasName}</div>
				</div>
			</div>
		);
	};
	const associatedRender = (value: string, index: number, record: any) => {
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
	const actionRender = (value: string, index: number, record: any) => {
		return (
			<Actions>
				<LinkButton
					onClick={
						() => console.log('前往监控')
						// history.push({
						// 	pathname: `/instanceList/detail/${record.name}/${record.type}/${instance.chartVersion}`,
						// 	query: { key: 'monitor' }
						// })
					}
				>
					监控
				</LinkButton>
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
					dataSource={dataSource}
					exact
					fixedBarExpandWidth={[24]}
					affixActionBar
					showColumnSetting
					showRefresh
					onRefresh={refreshFn}
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
						title="服务名称/显示名称"
						dataIndex="name"
						resizable
						cell={nameRender}
					/>
					<Table.Column
						title="状态"
						dataIndex="status"
						cell={serviceListStatusRender}
						filters={states}
						filterMode="single"
					/>
					<Table.Column title="备注" dataIndex="annotation" />
					<Table.Column
						title="关联服务"
						dataIndex="associated"
						cell={associatedRender}
					/>
					<Table.Column
						title="创建时间"
						dataIndex="createTime"
						sortable={true}
					/>
					<Table.Column
						title="操作"
						dataIndex="action"
						cell={actionRender}
						width={188}
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
