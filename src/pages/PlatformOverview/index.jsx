import './platformOverview.scss';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Page from '@alicloud/console-components-page';
import HomeCard from '@/components/HomeCard';
import ExampleCharts from '@/components/ExampleCharts';
import { connect } from 'react-redux';
import {
	Radio,
	Pagination,
	Icon,
	Select,
	Table,
	Balloon,
	Search
} from '@alicloud/console-components';
import { getPlatformOverview, getEvent } from '@/services/platformOverview';
import { getClusters } from '@/services/common';
import AlarmTimeLine from '@/components/AlarmTimeline';
import {
	setCluster,
	setNamespace,
	setRefreshCluster
} from '@/redux/globalVar/var';
import storage from '@/utils/storage';
import { nullRender } from '@/utils/utils';

const radioList = [
	{
		value: '',
		label: '全部'
	},
	{
		value: 'info',
		label: '提示'
	},
	{
		value: 'warning',
		label: '告警'
	},
	{
		value: 'critical',
		label: '严重'
	}
];
const statusMap = {
	Creating: '创建中',
	Running: '运行中',
	Failed: '运行异常',
	RunningError: '运行错误',
	Error: '错误',
	Updating: '更新中'
};
const statusFilters = [
	{
		label: '创建中',
		value: 'Creating'
	},
	{
		label: '运行中',
		value: 'Running'
	},
	{
		label: '运行异常',
		value: 'Failed'
	},
	{
		label: '运行错误',
		value: 'RunningError'
	},
	{
		label: '错误',
		value: 'Error'
	},
	{
		label: '更新中',
		value: 'Updating'
	}
];
function PlatformOverview(props) {
	// 设置事件数据
	const [eventData, setEventData] = useState(null);
	// 顶部统计数据
	const [totalData, setTotalData] = useState({
		namespace: 0,
		cluster: 0,
		node: 0,
		except: 0
	});
	// 数据类型cup/memory
	const [dataType, setDataType] = useState('cpu');
	// 单选按钮组
	const RadioGroup = Radio.Group;
	// 图表数据
	const [chartData, setChartData] = useState({
		cluster: [],
		namespace: [],
		node: []
	});
	// 存储图表数据
	const [sourceData, setSourceData] = useState({});
	const [clusters, setClusters] = useState([]);
	const [current, setCurrent] = useState(1); // 页码 current
	const [level, setLevel] = useState(''); // level
	const [total, setTotal] = useState(10); // 总数
	const [type, setType] = useState('chart');
	const [tableSource, setTableSource] = useState([]);
	const [clusterFilter, setClusterFilter] = useState([]);
	const [namespaceFilter, setNamespaceFilter] = useState([]);
	const [typeFilter, setTypeFilter] = useState([]);
	const history = useHistory();

	const getClusterList = async () => {
		let res = await getClusters();
		if (res.success) {
			if (res.data.length > 0) {
				setClusters(res.data);
				const list = res.data.map((item) => {
					return {
						label: item.nickname,
						value: item.name
					};
				});
				setClusterFilter(list);
			}
		}
	};

	// 获取设置图表数据
	const getChartData = (type = 'cpu') => {
		const res = [];
		sourceData.clusters &&
			sourceData.clusters.forEach((ele) => {
				const cluster = {
					dataType: 'cluster',
					name: ele.clusterName,
					regNamespaceCount: ele.regNamespaceCount,
					instanceCount: ele.instanceCount,
					itemStyle: {
						color: ele.status ? '#5CCDBB' : '#FFC440'
					}
				};
				cluster.children = ele.namespaces.map((item) => {
					const namespa = {
						dataType: 'namespace',
						name: item.name,
						value: type === 'cpu' ? item.cpu : item.memory,
						itemStyle: {
							color: item.status ? '#5CCDBB' : '#FFC440',
							opacity: 0.85
						},
						cpu: item.cpu,
						memory: item.memory,
						instanceCount: item.instanceCount,
						instanceExceptionCount: item.instanceExceptionCount
					};
					namespa.children = item.middlewares.map((mid) => {
						return {
							dataType: 'node',
							name: mid.name,
							value:
								type === 'cpu' ? mid.totalCpu : mid.totalMemory,
							itemStyle: {
								color: mid.status ? '#5CCDBB' : '#C80000',
								opacity: 0.65
							},
							cluster: ele.clusterId,
							namespace: item.name,
							totalCpu: mid.totalCpu,
							totalMemory: mid.totalMemory,
							status: mid.status,
							nodeCount: mid.nodeCount,
							type: mid.type,
							chartName: mid.chartName,
							chartVersion: mid.chartVersion,
							imagePath: mid.imagePath
						};
					});
					return namespa;
				});
				res.push(cluster);
			});
		// 设置图表数据
		setChartData(res);
	};
	useEffect(() => {
		getClusterList();
	}, []);
	useEffect(() => {
		getPlatformOverview().then((res) => {
			setSourceData(res.data);
		});
	}, [type]);

	useEffect(() => {
		if (sourceData && JSON.stringify(sourceData) !== '{}') {
			if (Object.keys(sourceData).length) {
				setTotalData({
					namespace: sourceData.totalNamespaceCount,
					cluster: sourceData.totalClusterCount,
					node: sourceData.totalInstanceCount,
					except: sourceData.totalExceptionCount
				});
				getChartData();
				setTableSource(sourceData.middlewareDTOList);
				const list = sourceData.middlewareDTOList.map((item) => {
					return {
						label: item.type,
						value: item.type
					};
				});
				setTypeFilter(list);
			}
		}
	}, [sourceData]);

	useEffect(() => {
		// 请求事件数据
		if (!eventData) {
			// 直接请求
			const sendData = {
				current: current,
				size: 10,
				level: level
			};
			getEvent(sendData).then((res) => {
				setEventData(res.data ? res.data.list : []);
				setTotal(res.data?.total);
			});
		}
	}, [eventData]);
	useEffect(() => {
		if (props.globalVar) {
			const list = props.globalVar.namespaceList.map((item) => {
				return {
					label: item.name,
					value: item.name
				};
			});
			setNamespaceFilter(list);
		}
	}, [props]);
	// 选择的数据类型修改
	const dataTypeChange = (checked) => {
		getChartData(checked); // 修改图表数据
		setDataType(checked); // 修改radio绑定数据
	};
	const typeChange = (checked) => {
		setType(checked);
	};
	const getEventsData = ({ current, level }) => {
		const sendData = {
			current: current,
			size: 10,
			level: level
		};
		getEvent(sendData).then((res) => {
			setEventData(res.data ? res.data.list : []);
			setTotal(res.data.total);
		});
	};
	const onNormalChange = (value) => {
		setLevel(value);
		const alertData = {
			current: current,
			level: value
		};
		getEventsData(alertData);
	};
	const paginationChange = (current) => {
		setCurrent(current);
		const alertData = {
			current: current,
			level: level
		};
		getEventsData(alertData);
	};
	const onSort = (dataIndex, order) => {
		const tableList = sourceData.middlewareDTOList.sort(function (a, b) {
			const result = a[dataIndex] - b[dataIndex];
			return order === 'asc'
				? result > 0
					? 1
					: -1
				: result > 0
				? -1
				: 1;
		});
		setTableSource([...tableList]);
	};
	const onFilter = (filterParams) => {
		let ds = sourceData.middlewareDTOList;
		Object.keys(filterParams).forEach((key) => {
			const { selectedKeys } = filterParams[key];
			if (selectedKeys.length) {
				ds = ds.filter((record) => {
					return selectedKeys.some((value) => {
						return record[key].indexOf(value) > -1;
					});
				});
			}
		});
		setTableSource([...ds]);
	};

	const statusRender = (value, index, record) => {
		return (
			<span
				className="name-link"
				style={{
					color:
						value === 'Failed' ||
						value === 'RunningError' ||
						value === 'Error'
							? '#Ef595C'
							: ''
				}}
				onClick={() => toDetail(record)}
			>
				{statusMap[value]}
			</span>
		);
	};
	const nameRender = (value, index, record) => {
		return (
			<span className="name-link" onClick={() => toDetail(record)}>
				{record.source === false ? '(备)' + value : value}
			</span>
		);
	};
	const onSearch = (value) => {
		const ds = sourceData.middlewareDTOList;
		const list = ds.filter((item) => {
			if (item?.name.includes(value)) {
				return item;
			}
		});
		setTableSource(list);
	};
	const nameTitleRender = () => {
		return (
			<div>
				名称
				<Balloon
					trigger={
						<Icon
							type="search"
							size="xs"
							style={{ marginLeft: 8, cursor: 'pointer' }}
						/>
					}
					closable={false}
				>
					<Search onSearch={onSearch} style={{ width: '300px' }} />
				</Balloon>
			</div>
		);
	};
	const toDetail = (record) => {
		const cs = clusters.filter((item) => item.id === record.clusterId);
		setCluster(cs[0]);
		storage.setLocal('cluster', JSON.stringify(cs[0]));
		const ns = props.globalVar.namespaceList.filter(
			(item) => item.name === record.namespace
		);
		setNamespace(ns[0]);
		storage.setLocal('namespace', JSON.stringify(ns[0]));
		setRefreshCluster(true);
		history.push({
			pathname: `/instanceList/detail/${record.name}/${
				record.type || 'mysql'
			}/${record.chartVersion}`,
			state: {
				flag: true
			}
		});
	};
	return (
		<Page>
			<Page.Content style={{ paddingBottom: 0 }}>
				<div className="platform_overview-content">
					<div className="left-content">
						<HomeCard
							title={'资产统计'}
							height={'147px'}
							width={'100%'}
							marginBottom={'16px'}
						>
							<div className="total">
								<div className="part part-border">
									<div
										className="part-icon"
										style={{ backgroundColor: ' #5CCDBB' }}
									>
										<Icon
											className="iconfont icon-jiqun"
											size="large"
											style={{
												color: '#FFFFFF',
												textAlign: 'center',
												lineHeight: '36px'
											}}
										/>
									</div>
									<div className="part-detail">
										<p className="value">
											{totalData.cluster}
											<span
												style={{
													opacity: 0.45,
													fontSize: 14,
													marginLeft: 4
												}}
											>
												个
											</span>
										</p>
										<p className="type">资源池数</p>
									</div>
								</div>
								<div className="part part-border">
									<div
										className="part-icon"
										style={{ backgroundColor: '#A78CF3' }}
									>
										<Icon
											className="iconfont icon-namespace"
											size="large"
											style={{
												color: '#FFFFFF',
												textAlign: 'center',
												lineHeight: '36px'
											}}
										/>
									</div>
									<div className="part-detail">
										<p className="value">
											{totalData.namespace}
											<span
												style={{
													opacity: 0.45,
													fontSize: 14,
													marginLeft: 4
												}}
											>
												个
											</span>
										</p>
										<span className="type">总资源分区</span>
									</div>
								</div>
								<div className="part part-border">
									<div
										className="part-icon"
										style={{ backgroundColor: '#25B3DD' }}
									>
										<Icon
											className="iconfont icon-shili"
											size="large"
											style={{
												color: '#FFFFFF',
												textAlign: 'center',
												lineHeight: '36px'
											}}
										/>
									</div>
									<div className="part-detail">
										<p className="value">
											{totalData.node}
											<span
												style={{
													opacity: 0.45,
													fontSize: 14,
													marginLeft: 4
												}}
											>
												个
											</span>
										</p>
										<span className="type">总服务数</span>
									</div>
								</div>
								<div className="part">
									<div
										className="part-icon"
										style={{ backgroundColor: '#E9737A' }}
									>
										<Icon
											className="iconfont icon-shili"
											size="large"
											style={{
												color: '#FFFFFF',
												textAlign: 'center',
												lineHeight: '36px'
											}}
										/>
									</div>
									<div className="part-detail">
										<p className="value error-color">
											{totalData.except}
											<span
												style={{
													color: '#000000',
													opacity: 0.45,
													fontSize: 14,
													marginLeft: 4
												}}
											>
												个
											</span>
										</p>
										<span className="type">异常服务数</span>
									</div>
								</div>
							</div>
						</HomeCard>
						<HomeCard
							title={'服务情况'}
							height={'calc(100% - 163px)'}
							width={'100%'}
							action={
								<div>
									{type === 'chart' && (
										<Select
											shape="button"
											dataSource={[
												{
													value: 'cpu',
													label: 'cpu配额展示'
												},
												{
													value: 'memory',
													label: '内存配额展示'
												}
											]}
											onChange={dataTypeChange}
											value={dataType}
										/>
									)}
									<RadioGroup
										style={{ marginLeft: 8 }}
										shape="button"
										dataSource={[
											{
												value: 'chart',
												label: '图形模式'
											},
											{
												value: 'table',
												label: '列表模式'
											}
										]}
										onChange={typeChange}
										value={type}
									/>
								</div>
							}
						>
							<div className="chart-content">
								{type === 'chart' && (
									<ExampleCharts
										chartData={chartData}
										clusters={clusters}
									/>
								)}
								{type === 'table' && (
									<div className="instance-table-content">
										<Table
											dataSource={tableSource}
											maxBodyHeight={500}
											fixedHeader
											hasBorder={true}
											onSort={onSort}
											onFilter={onFilter}
										>
											<Table.Column
												title="资源池名称"
												dataIndex="clusterName"
												filters={clusterFilter}
												filterMode="multiple"
											/>
											<Table.ColumnGroup title="资源分区">
												<Table.Column
													title="名称"
													dataIndex="namespace"
													filters={namespaceFilter}
													filterMode="multiple"
												/>
												<Table.Column
													title="CPU(核)"
													dataIndex="namespaceCpu"
													cell={nullRender}
													sortable={true}
												/>
												<Table.Column
													title="内存(G)"
													dataIndex="namespaceMemory"
													cell={nullRender}
													sortable={true}
												/>
											</Table.ColumnGroup>
											<Table.ColumnGroup title="服务">
												<Table.Column
													title="类型"
													dataIndex="type"
													filters={typeFilter}
													filterMode="multiple"
												/>
												<Table.Column
													title={nameTitleRender}
													dataIndex="name"
													cell={nameRender}
												/>
												<Table.Column
													title="CPU(核)"
													dataIndex="cpu"
													sortable={true}
												/>
												<Table.Column
													title="内存(G)"
													dataIndex="memory"
													sortable={true}
												/>
												<Table.Column
													title="状态"
													dataIndex="status"
													filters={statusFilters}
													filterMode="single"
													cell={statusRender}
												/>
											</Table.ColumnGroup>
										</Table>
									</div>
								)}
							</div>
						</HomeCard>
					</div>
					<div className="right-content">
						<HomeCard
							title={'告警事件（全平台）'}
							height={'100%'}
							width={'100%'}
						>
							<RadioGroup
								dataSource={radioList}
								shape="button"
								size="large"
								value={level}
								onChange={onNormalChange}
								style={{ marginTop: 16 }}
							/>
							<AlarmTimeLine
								list={eventData}
								style={{
									marginTop: 16
									// height: '640px'
								}}
								clusters={clusters}
								type="platform"
							/>
							<Pagination
								style={{ float: 'right' }}
								current={current}
								size="small"
								type="simple"
								shape="no-border"
								onChange={paginationChange}
								total={total}
								totalRender={(total) => `总数：${total}`}
							/>
						</HomeCard>
					</div>
				</div>
			</Page.Content>
		</Page>
	);
}
export default connect(({ globalVar }) => ({ globalVar }), {
	setCluster,
	setNamespace,
	setRefreshCluster
})(PlatformOverview);
