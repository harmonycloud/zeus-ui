import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import Page from '@alicloud/console-components-page';
import {
	Select,
	Message,
	Radio,
	Pagination
} from '@alicloud/console-components';
import HomeCard from '@/components/HomeCard';
import ResourceProcess from '@/components/ResourceProcess';
import TimeSelect from '@/components/TimeSelect';
import ResourceCharts from '@/components/ResourceCharts';
import HomeMidIcon from '@/components/HomeMIdIcon';
import AlarmTimeLine from '@/components/AlarmTimeline';
import ComponentsLoading from '@/components/componentsLoading';
import styles from './home.module.scss';
import {
	getInstanceStatus,
	getResources,
	getResourceQuota,
	getEvents
} from '@/services/home.js';
import messageConfig from '@/components/messageConfig';
import { getMiddlewares } from '@/services/middleware.js';

const RadioGroup = Radio.Group;
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

function Home(props) {
	const { globalVar } = props;
	const [events, setEvents] = useState([]);
	const [allCpu, setAllCpu] = useState(0);
	const [allMemory, setAllMemory] = useState(0);
	const [useCpu, setUseCpu] = useState(0);
	const [useMemory, setUseMemory] = useState(0);
	const defaultStart = moment().subtract({ hours: 1 });
	const [rangeTime, setRangeTime] = useState([defaultStart, moment()]);
	const [instanceList, setInstanceList] = useState([]);
	const [selectedInstance, setSelectedInstance] = useState({
		value: '',
		label: '',
		type: ''
	});
	const [cpus, setCpus] = useState([]);
	const [memorys, setMemorys] = useState([]);
	const [middlewareCounts, setMiddlewareCount] = useState({});
	const [chartData, setChartData] = useState(); // 图表数据
	const [current, setCurrent] = useState(1); // 页码 current
	const [level, setLevel] = useState(''); // level
	const [total, setTotal] = useState(10); // 总数

	useEffect(() => {
		if (
			JSON.stringify(globalVar.cluster) !== '{}' &&
			JSON.stringify(globalVar.namespace) !== '{}'
		) {
			const sendData = {
				clusterId: globalVar.cluster.id,
				namespace: globalVar.namespace.name
			};
			const alertData = {
				clusterId: globalVar.cluster.id,
				namespace: globalVar.namespace.name,
				current: 1,
				level: ''
			};
			getQuota(sendData);
			getEventsData(alertData);
			middlewareList(globalVar.cluster.id, globalVar.namespace.name);
		}
	}, [globalVar]);

	/*
		获取告警事件
	*/
	const getEventsData = ({ clusterId, namespace, current, level }) => {
		const sendData = {
			clusterId: clusterId,
			namespace: namespace,
			current: current,
			size: 10,
			level: level
		};
		getEvents(sendData).then((res) => {
			if (res.success) {
				setEvents(res.data.list ? res.data.list : []);
				setTotal(res.data.total);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};

	const getQuota = (sendData) => {
		const [start, end] = rangeTime;
		const param = {
			startTime: start && start.format('YYYY-MM-DDTHH:mm:ss[Z]'),
			endTime: start && end.format('YYYY-MM-DDTHH:mm:ss[Z]')
		};
		getResourceQuota(sendData).then((res) => {
			if (res.success) {
				if (JSON.stringify(res.data) !== '{}') {
					setAllCpu(Number(res.data.cpu[1]));
					setAllMemory(Number(res.data.memory[1]));
					getInstanceData(
						sendData,
						param.startTime,
						param.endTime,
						true
					);
				} else {
					getInstanceData(
						sendData,
						param.startTime,
						param.endTime,
						false
					);
				}
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	// 获取服务情况
	const getInstanceData = (sendData, startTime, endTime, type) => {
		getInstanceStatus(sendData).then((res) => {
			if (res.success) {
				const usedCpu =
					(res.data &&
						res.data.reduce(
							(sum, item) => (sum += parseFloat(item.totalCpu)),
							0
						)) ||
					0;
				const usedMemory =
					(res.data &&
						res.data.reduce(
							(sum, item) =>
								(sum += parseFloat(item.totalMemory)),
							0
						)) ||
					0;
				setUseCpu(usedCpu);
				setUseMemory(usedMemory);
				if (!type) {
					setAllCpu(usedCpu);
					setAllMemory(usedMemory);
				}
				const cpuTemp = [];
				const memoryTemp = [];
				const instanceTemp = [];
				res.data &&
					res.data.map((item) => {
						item.middlewareList &&
							item.middlewareList.map((middleware) => {
								const result = {};
								result.name = middleware.name;
								result.cpu = parseFloat(
									middleware.quota[middleware.type].cpu
								);
								result.memory = parseFloat(
									middleware.quota[middleware.type].memory
								);
								result.instance = parseFloat(
									middleware.quota[middleware.type].num
								);
								result.type = item.type;
								result.num = parseFloat(
									middleware.quota[middleware.type].cpu
								);
								result.imagePath = item.imagePath;
								cpuTemp.push(result);
								const memoryResult = {};
								memoryResult.name = middleware.name;
								memoryResult.cpu = parseFloat(
									middleware.quota[middleware.type].cpu
								);
								memoryResult.memory = parseFloat(
									middleware.quota[middleware.type].memory
								);
								memoryResult.instance = parseFloat(
									middleware.quota[middleware.type].num
								);
								memoryResult.type = item.type;
								memoryResult.num = parseFloat(
									middleware.quota[middleware.type].memory
								);
								memoryResult.imagePath = item.imagePath;
								memoryTemp.push(memoryResult);
								const selectResult = {};
								selectResult.label = middleware.name;
								selectResult.value = middleware.name;
								selectResult.type = middleware.type;
								instanceTemp.push(selectResult);
							});
					});
				setCpus(cpuTemp);
				setMemorys(memoryTemp);
				setInstanceList(instanceTemp);
				if (instanceTemp.length === 0) {
					setSelectedInstance({});
					setChartData([
						{
							name: 'CPU',
							type: 'line',
							showSymbol: false,
							hoverAnimation: false,
							smooth: true,
							data: []
						},
						{
							name: '内存',
							type: 'line',
							showSymbol: false,
							hoverAnimation: false,
							smooth: true,
							data: []
						},
						{
							name: '存储',
							type: 'line',
							showSymbol: false,
							hoverAnimation: false,
							smooth: true,
							data: []
						}
					]);
				} else {
					setSelectedInstance(instanceTemp[0] || selectedInstance);
					instanceTemp[0] &&
						globalVar.cluster.monitor !== null &&
						getResourceMonitor(
							instanceTemp[0].value,
							instanceTemp[0].type,
							startTime,
							endTime
						);
				}
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	// 获取资源实时用量
	const getResourceMonitor = (name, type, startTime, endTime) => {
		const sendData = {
			clusterId: globalVar.cluster.id,
			namespace: globalVar.namespace.name,
			name: name,
			type: type,
			startTime: startTime,
			endTime: endTime
		};
		getResources(sendData).then((res) => {
			if (res.success) {
				// * 实时监控的数据格式化处理
				const cpuData = [];
				const memoryData = [];
				const storageData = [];
				res.data &&
					res.data.map((item) => {
						const cpuResult = {};
						cpuResult.value = [
							item.time.split(' ').join('\n'),
							Number(item.cpuRate)
						];
						cpuResult.time = item.time.split(' ').join('\n');
						cpuResult.data = {
							cpu: !item.cpu ? '0' : item.cpu,
							memory: !item.memory ? '0' : item.memory,
							storage: !item.storage ? '0' : item.storage
						};
						cpuData.push(cpuResult);
						const memoryResult = {};
						memoryResult.value = [
							item.time.split(' ').join('\n'),
							Number(item.memoryRate)
						];
						memoryData.time = item.time.split(' ').join('\n');
						memoryResult.data = {
							cpu: !item.cpu ? '0' : item.cpu,
							memory: !item.memory ? '0' : item.memory,
							storage: !item.storage ? '0' : item.storage
						};
						memoryData.push(memoryResult);
						const storageResult = {};
						storageResult.value = [
							item.time.split(' ').join('\n'),
							Number(item.storageRate)
						];
						storageResult.time = item.time.split(' ').join('\n');
						storageResult.data = {
							cpu: !item.cpu ? '0' : item.cpu,
							memory: !item.memory ? '0' : item.memory,
							storage: !item.storage ? '0' : item.storage
						};
						storageData.push(storageResult);
					});
				const data = [
					{
						name: 'CPU',
						type: 'line',
						showSymbol: false,
						hoverAnimation: false,
						smooth: true,
						data: cpuData
					},
					{
						name: '内存',
						type: 'line',
						showSymbol: false,
						hoverAnimation: false,
						smooth: true,
						data: memoryData
					},
					{
						name: '存储',
						type: 'line',
						showSymbol: false,
						hoverAnimation: false,
						smooth: true,
						data: storageData
					}
				];
				setChartData(data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};

	const handleChange = (value) => {
		const data = instanceList.filter((item) => item.value === value);
		setSelectedInstance(data[0]);
		const [start, end] = rangeTime;
		// * 由后端做了本地时间->格林尼治时间的转换
		const startTime = start && start.format('YYYY-MM-DDTHH:mm:ss[Z]');
		const endTime = start && end.format('YYYY-MM-DDTHH:mm:ss[Z]');
		getResourceMonitor(value, data[0].type, startTime, endTime);
	};

	const onTimeChange = (rangeTime) => {
		const [start, end] = rangeTime;
		setRangeTime(rangeTime);
		// * 由后端做了本地时间->格林尼治时间的转换
		const startTime = start && start.format('YYYY-MM-DDTHH:mm:ss[Z]');
		const endTime = start && end.format('YYYY-MM-DDTHH:mm:ss[Z]');
		getResourceMonitor(
			selectedInstance.value,
			selectedInstance.type,
			startTime,
			endTime
		);
	};

	// * 获取服务情况
	async function middlewareList(clusterId, namespace) {
		let res = await getMiddlewares({ clusterId, namespace });
		if (res.success) {
			let obj = {};
			res.data &&
				res.data.map((item) => {
					obj[`${item.chartName}-${item.chartVersion}`] = [
						item.replicas,
						item.replicasStatus,
						item.imagePath,
						item.chartName
					];
				});
			setMiddlewareCount(obj);
		}
	}

	const midIconRender = (values) => {
		const list = [];
		for (let props in values) {
			list.push(
				<HomeMidIcon
					key={props}
					type={values[props][3]}
					count={values[props][0]}
					flag={values[props][1]}
					imagePath={values[props][2]}
				/>
			);
		}
		list.sort((a, b) => {
			return b.props.count - a.props.count;
		});
		list.sort((a, b) => {
			if (!a.props.flag && b.props.flag) {
				return -1;
			} else if (
				!a.props.flag &&
				!b.props.flag &&
				b.props.count < a.props.count
			) {
				return -2;
			}
			return 0;
		});
		return list;
	};

	const onNormalChange = (value) => {
		setLevel(value);
		const alertData = {
			clusterId: globalVar.cluster.id,
			namespace: globalVar.namespace.name,
			current: current,
			level: value
		};
		getEventsData(alertData);
	};
	const paginationChange = (current) => {
		setCurrent(current);
		const alertData = {
			clusterId: globalVar.cluster.id,
			namespace: globalVar.namespace.name,
			current: current,
			level: level
		};
		getEventsData(alertData);
	};
	return (
		<Page>
			<Page.Content>
				<div className={styles['overview-content']}>
					<div className={styles['left-content']}>
						<HomeCard
							height={150}
							width={'100%'}
							title={'服务情况（当前命名空间）'}
							marginBottom={16}
						>
							<div className={styles['node-content']}>
								{midIconRender(middlewareCounts)}
							</div>
						</HomeCard>
						<HomeCard
							height={174}
							width={'100%'}
							title={'资源分配情况（当前命名空间）'}
							marginBottom={16}
						>
							<div className={styles['resource-content']}>
								<ResourceProcess
									list={cpus}
									label="CPU"
									type="cpu"
									total={allCpu}
									useTotal={useCpu}
								/>
								<ResourceProcess
									list={memorys}
									label="内存"
									type="memory"
									style={{ marginTop: 28 }}
									total={allMemory}
									useTotal={useMemory}
								/>
							</div>
						</HomeCard>
						<HomeCard
							height={'calc(100% - 356px)'}
							width={'100%'}
							title={'资源实时用量（按服务查看）'}
							action={
								<div className={styles['action-content']}>
									{globalVar.cluster.monitor ===
									null ? null : (
										<>
											<Select
												style={{
													width: 130,
													marginRight: 24
												}}
												value={selectedInstance.value}
												onChange={handleChange}
												dataSource={instanceList}
											/>
											<TimeSelect
												onRefresh={() =>
													getResourceMonitor(
														selectedInstance.value,
														selectedInstance.type,
														rangeTime[0].format(
															'YYYY-MM-DDTHH:mm:ss[Z]'
														),
														rangeTime[1].format(
															'YYYY-MM-DDTHH:mm:ss[Z]'
														)
													)
												}
												timeSelect={onTimeChange}
											/>
										</>
									)}
								</div>
							}
						>
							<div>
								{globalVar.cluster.monitor === null ? (
									<ComponentsLoading
										type="monitor"
										clusterId={globalVar.cluster.id}
									/>
								) : (
									<ResourceCharts data={chartData} />
								)}
							</div>
						</HomeCard>
					</div>
					<div className={styles['right-content']}>
						<HomeCard
							height={'100%'}
							width={'100%'}
							title={'告警事件（当前命名空间）'}
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
								list={events}
								style={{ marginTop: 25 }}
								type="default"
							/>
							<Pagination
								style={{ float: 'right' }}
								current={current}
								type="simple"
								shape="no-border"
								size="small"
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
export default connect(
	({ globalVar }) => ({
		globalVar
	}),
	null
)(Home);
