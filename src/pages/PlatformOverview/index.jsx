import './platformOverview.scss';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Page from '@alicloud/console-components-page';
import HomeCard from '@/components/HomeCard';
import ReactEcharts from 'echarts-for-react';
import ExampleCharts from '@/components/ExampleCharts';
import { connect } from 'react-redux';
import {
	Radio,
	Pagination,
	Button,
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
import EChartsReact from 'echarts-for-react';

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
	const [option, setOption] = useState({
		tooltip: {
			trigger: 'item'
		},
		legend: {
			bottom: '5%',
			left: 'center',
			borderRadius: 8,
			itemWidth: 8,
			itemHeight: 8
		},
		series: [
			{
				name: '控制器状态',
				type: 'pie',
				radius: ['40%', '70%'],
				avoidLabelOverlap: false,
				label: {
					show: false,
					position: 'center'
				},
				emphasis: {
					label: {
						show: true,
						fontSize: '14',
						fontWeight: 'bold'
					}
				},
				labelLine: {
					show: false
				},
				data: [
					{ value: 80, name: '运行正常', color: '#d92026' },
					{ value: 20, name: '运行异常', color: '00a700' }
				]
			}
		]
	});

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
	// const onRefresh = () => {

	// }
	return (
		<Page>
			<Page.Content style={{ paddingBottom: 0 }}>
				<div className="platform_overview-content">
					<div className="header">
						<div className="header-btn">
							<div>
								资源池:
								<Select
									style={{
										width: '226px',
										marginLeft: '10px'
									}}
								>
									<Select.Option value="全部">
										全部
									</Select.Option>
									<Select.Option value="正常">
										正常
									</Select.Option>
									<Select.Option value="异常">
										异常
									</Select.Option>
								</Select>
							</div>
							<Button
								className="refresh-btn"
								// onClick={onRefresh}
							>
								<Icon type="refresh" />
							</Button>
						</div>
						<div className="header-list">
							<div className="part part-border">
								<div className="part-detail">
									<div className="part-circle">
										<span className="iconfont icon-jiqun1"></span>
									</div>
									<div>
										<p className="value">
											<span className="num">
												{totalData.cluster}
											</span>
											<span>个</span>
										</p>
										<p className="type">资源池总数</p>
									</div>
								</div>
							</div>
							<div className="part part-border">
								<div className="part-detail">
									<div className="part-circle">
										<span className="iconfont icon-mingmingkongjian"></span>
									</div>
									<div>
										<p className="value">
											<span className="num">
												{totalData.namespace}
											</span>
											<span>个</span>
										</p>
										<span className="type">
											总资源分区总数
										</span>
									</div>
								</div>
							</div>
							<div className="part part-border">
								<div className="part-detail">
									<div className="part-circle">
										<span className="iconfont icon-CPU"></span>
									</div>
									<div>
										<p className="value">
											<span className="num">
												{totalData.node}
											</span>
											<span>个</span>
										</p>
										<span className="type">
											CPU总量占比
										</span>
									</div>
								</div>
							</div>
							<div className="part">
								<div className="part-detail">
									<div className="part-circle">
										<span className="iconfont icon-memory"></span>
									</div>
									<div>
										<p className="value error-color">
											<span className="num">
												{totalData.except}
											</span>
											<span>个</span>
										</p>
										<span className="type">
											内存总量占比
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="content">
						<div className="left-content">
							<HomeCard
								title={'服务信息'}
								height={'174px'}
								width={'100%'}
								marginBottom={'20px'}
							>
								<div className="serve-info">
									<div className="info-item">
										<img
											height={40}
											width={40}
											src="http://10.1.10.13:31088/api/images/middleware/rocketmq-1.5.11.svg"
										/>
										<p className="info-name"></p>
										<p className="serve-count"></p>
									</div>
									<div className="info-item">
										<img
											height={40}
											width={40}
											src="http://10.1.10.13:31088/api/images/middleware/rocketmq-1.5.11.svg"
										/>
										<p className="info-name"></p>
										<p className="serve-count"></p>
									</div>
									<div className="info-item">
										<img
											height={40}
											width={40}
											src="http://10.1.10.13:31088/api/images/middleware/rocketmq-1.5.11.svg"
										/>
										<p className="info-name"></p>
										<p className="serve-count"></p>
									</div>
									<div className="info-item">
										<img
											height={40}
											width={40}
											src="http://10.1.10.13:31088/api/images/middleware/rocketmq-1.5.11.svg"
										/>
										<p className="info-name"></p>
										<p className="serve-count"></p>
									</div>
									<div className="info-item">
										<img
											height={40}
											width={40}
											src="http://10.1.10.13:31088/api/images/middleware/rocketmq-1.5.11.svg"
										/>
										<p className="info-name"></p>
										<p className="serve-count"></p>
									</div>
								</div>
							</HomeCard>
							<HomeCard
								title={'控制器状态'}
								height={'289px'}
								width={'60%'}
								marginBottom={'20px'}
								actio={<div>更多</div>}
							>
								<EChartsReact
									option={option}
									style={{ height: '100%', width: '132px' }}
								/>
							</HomeCard>
							<HomeCard
								title={'异常告警'}
								height={'289px'}
								width={'38%'}
								marginLeft={'2%'}
								marginBottom={'20px'}
							></HomeCard>
							<HomeCard
								title={'审计信息'}
								height={'331px'}
								width={'100%'}
							></HomeCard>
						</div>
						<div className="right-content">
							<HomeCard
								title={'告警事件（全平台）'}
								height={'649px'}
								width={'100%'}
								marginBottom={'20px'}
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
										marginTop: 16,
										height: 'calc(100% - 110px)'
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
							<HomeCard
								title={'系统信息'}
								height={'166px'}
								width={'100%'}
							></HomeCard>
						</div>
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
