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
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import Table from '@/components/MidTable';
import styles from './list.module.scss';
import {
	setCluster,
	setNamespace,
	setRefreshCluster
} from '@/redux/globalVar/var';
import { getMiddlewareList, deleteMiddleware } from '@/services/middleware';
import transTime from '@/utils/transTime';
import messageConfig from '@/components/messageConfig';
import timerClass from '@/utils/timerClass';
import storage from '@/utils/storage';
function MysqlList(props) {
	const {
		cluster: globalCluster,
		namespace: globalNamespace,
		clusterList: globalClusterList,
		namespaceList: globalNamespaceList
	} = props.globalVar;
	const { instance, updateList } = props;
	const history = useHistory();
	const [dataSource, setDataSource] = useState([]);
	const [originData, setOriginData] = useState([]);
	const [keyword, setKeyword] = useState('');
	let [timer, setTimer] = useState(null);
	const [backupCheck, setBackupCheck] = useState(false);

	const states = [
		{ value: 'Creating', label: '启动中' },
		{ value: 'Running', label: '运行正常' },
		{ value: 'Other', label: '运行异常' }
	];

	// 全局分区更新
	useEffect(() => {
		if (JSON.stringify(globalNamespace) !== '{}' && instance) {
			getData(globalCluster.id, globalNamespace.name, keyword);
		}
	}, [globalNamespace, instance]);

	useEffect(() => {
		return () => clearInterval(timer);
	}, []);

	const getData = async (clusterId, namespace, keyword) => {
		let res = await getMiddlewareList({
			clusterId,
			namespace,
			type: 'mysql',
			keyword
		});
		if (res.success) {
			let tempArray = res.data.map((item) => ({
				...item,
				createTimeNum: new Date(item.createTime).getTime(),
				createTime: transTime.gmt2local(item.createTime)
			}));
			setDataSource(tempArray);
			setOriginData(tempArray);
		}
	};

	const refreshFn = () => {
		updateList();
		getData(globalCluster.id, globalNamespace.name, keyword);
	};

	const deleteFn = (name) => {
		Dialog.show({
			title: '提示',
			content: '确定删除该Mysql服务？',
			onOk: async () => {
				let res = await deleteMiddleware({
					clusterId: globalCluster.id,
					namespace: globalNamespace.name,
					middlewareName: name,
					type: 'mysql'
				});
				if (res.success) {
					Message.show({
						type: 'success',
						title: <div>成功</div>,
						content: (
							<div className="message-box">
								<p>删除中, 3s 后获取数据</p>
							</div>
						),
						duration: 3000,
						align: 'tr tr',
						closeable: true,
						offset: [-24, 62]
					});
					setTimer(
						timerClass.countdownTimer(() => {
							refreshFn();
						}, 3)
					);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			}
		});
	};

	const statusRender = (value, index, record) => {
		switch (value) {
			case 'Creating':
				return (
					<>
						<Icon
							type="sync-alt"
							size="xs"
							style={{ color: '#0091FF' }}
						/>{' '}
						启动中
					</>
				);
			case 'Running':
				return (
					<>
						<Icon
							type="success1"
							size="xs"
							style={{ color: '#00A700' }}
						/>{' '}
						运行正常
					</>
				);
			case 'Failed':
				return (
					<Balloon
						trigger={
							<span style={{ cursor: 'pointer' }}>
								<Icon
									type="warning1"
									size="xs"
									style={{ color: '#C80000' }}
								/>{' '}
								运行异常
							</span>
						}
						closable={false}
					>
						中间件状态异常原因 <br />
						<span style={{ lineHeight: '18px', color: '#FA6400' }}>
							{record.reason}
						</span>
					</Balloon>
				);
			case 'RunningError':
				return (
					<Balloon
						trigger={
							<span style={{ cursor: 'pointer' }}>
								<Icon
									type="warning1"
									size="xs"
									style={{ color: '#C80000' }}
								/>{' '}
								运行异常
							</span>
						}
						closable={false}
					>
						中间件状态异常原因 <br />
						<span style={{ lineHeight: '18px', color: '#FA6400' }}>
							{record.reason}
						</span>
					</Balloon>
				);
			case '':
				return <></>;
			default:
				return (
					<Balloon
						trigger={
							<span style={{ cursor: 'pointer' }}>
								<Icon
									type="warning1"
									size="xs"
									style={{ color: '#C80000' }}
								/>{' '}
								运行异常
							</span>
						}
						closable={false}
					>
						中间件状态异常原因 <br />
						<span style={{ lineHeight: '18px', color: '#FA6400' }}>
							{record.reason}
						</span>
					</Balloon>
				);
		}
	};

	const handleFilterBackup = (checked) => {
		setBackupCheck(checked);
		if (checked) {
			const list = originData.filter(
				(item) => item?.mysqlDTO?.openDisasterRecoveryMode === true
			);
			setDataSource(list);
		} else {
			setDataSource(originData);
		}
	};

	const Operation = {
		primary: (
			<Button
				onClick={() =>
					history.push(
						`/serviceCatalog/mysqlCreate/${instance.chartName}/${instance.chartVersion}`
					)
				}
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

	const handleSearch = (value) => {
		setKeyword(value);
		getData(globalCluster.id, globalNamespace.name, value);
	};

	const onFilter = (filterParams) => {
		let {
			status: { selectedKeys }
		} = filterParams;
		if (selectedKeys.length === 0) {
			setDataSource(originData);
		} else {
			let tempData = null;
			if (selectedKeys[0] !== 'Other') {
				tempData = originData.filter((item) => {
					return item.status === selectedKeys[0];
				});
			} else if (selectedKeys[0] === 'Other') {
				tempData = originData.filter((item) => {
					return (
						item.status !== 'Running' && item.status !== 'Creating'
					);
				});
			}
			setDataSource(tempData);
		}
	};

	const onSort = (dataIndex, order) => {
		if (dataIndex === 'createTime') {
			let tempDataSource = originData.sort((a, b) => {
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

	const nameRender = (value, index, record) => {
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
						onClick={() =>
							history.push(
								`/instanceList/detail/${record.name}/${record.type}/${instance.chartVersion}`
							)
						}
					>
						{record.name}
					</div>
					<div>{record.aliasName}</div>
				</div>
			</div>
		);
	};
	const toDetail = (record) => {
		console.log(record);
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
			pathname: `/instanceList/detail/${record.mysqlDTO.relationName}/${
				record.mysqlDTO.type || 'mysql'
			}/${instance.chartVersion}`,
			state: {
				flag: true
			}
		});
	};
	const associatedRender = (value, index, record) => {
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
				{/* {record.mysqlDTO.isSource !== null ? (
					record.mysqlDTO.openDisasterRecoveryMode &&
					record.mysqlDTO.isSource ? (
						<div className="gray-circle">备</div>
					) : (
						<div className="blue-circle">源</div>
					)
				) : null} */}
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
	const actionRender = (value, index, record) => {
		return (
			<Actions>
				<LinkButton
					onClick={() =>
						history.push(
							`/instanceList/detail/${record.name}/${record.type}/${instance.chartVersion}`
						)
					}
				>
					管理
				</LinkButton>
				<LinkButton
					onClick={() =>
						history.push({
							pathname: `/instanceList/detail/${record.name}/${record.type}/${instance.chartVersion}`,
							query: { key: 'monitor' }
						})
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
		<>
			<div className={styles['header-tips']}>
				高可用MySQL使用说明
				<br />
				<span style={{ fontWeight: 400 }}>
					当前Mysql中间件是基于日志构建的主从复制的高可用Mysql 资源池,
					提供了故障自愈，手动/自动主从切换，备份恢复，监控告警等能力，版本支持：v5.7.21；详细参见
				</span>
				<span
					className="name-link"
					onClick={() =>
						window.open(
							'https://www.yuque.com/nq4era/chqywm/eauqfw',
							'_blank'
						)
					}
				>
					《高可用MySQL使用说明》
				</span>
			</div>
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
					cell={statusRender}
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
		</>
	);
}

export default connect(({ globalVar }) => ({ globalVar }), {
	setCluster,
	setNamespace,
	setRefreshCluster
})(MysqlList);
