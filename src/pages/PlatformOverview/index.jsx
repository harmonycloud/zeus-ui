import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Page from '@alicloud/console-components-page';
import HomeCard from '@/components/HomeCard';
import { connect } from 'react-redux';
import { getClusters } from '@/services/common.js';
import { api } from '@/api.json';
import {
	Radio,
	Pagination,
	Button,
	Icon,
	Select,
	Table,
	Progress,
	Loading,
	Balloon
} from '@alicloud/console-components';
import CustomIcon from '@/components/CustomIcon';
import {
	getPlatformOverview,
	getEvent,
	getServers
} from '@/services/platformOverview';
import AlarmTimeLine from '@/components/AlarmTimeline';
import {
	setCluster,
	setNamespace,
	setRefreshCluster
} from '@/redux/globalVar/var';
import EChartsReact from 'echarts-for-react';
import { getLineOption, getPieOption } from '@/utils/echartsOption';
import * as echarts from 'echarts/core';
import moment from 'moment';
import './platformOverview.scss';

const radioList = [
	{
		value: '',
		label: '全部'
	},
	{
		value: 'info',
		label: '一般'
	},
	{
		value: 'warning',
		label: '重要'
	},
	{
		value: 'critical',
		label: '严重'
	}
];
const Tooltip = Balloon.Tooltip;

function PlatformOverview(props) {
	let x = [];

	// 设置事件数据
	const [eventData, setEventData] = useState(null);
	// 顶部统计数据
	const [totalData, setTotalData] = useState({
		clusterNum: 0,
		namespaceNum: 0,
		totalCpu: 0,
		usedCpu: 0,
		totalMemory: 0,
		usedMemory: 0,
		cpuUsedPercent: '0%',
		memoryUsedPercent: '0%'
	});
	// 服务信息列表
	const [briefInfoList, setBriefInfoList] = useState([]);
	// 单选按钮组
	const RadioGroup = Radio.Group;
	const [clusters, setClusters] = useState([]);
	const [current, setCurrent] = useState(1); // 页码 current
	const [level, setLevel] = useState(''); // level
	const [total, setTotal] = useState(10); // 总数
	const [poolList, setPoolList] = useState([]);
	const [type, setType] = useState('all');
	const [version, setVersion] = useState();
	const [operatorData, setOperatorData] = useState();
	const [operatorList, setOperatorList] = useState([]);
	const [auditList, setAuditList] = useState([]);
	const history = useHistory();
	const [pieOption, setPieOption] = useState({});
	const [lineOption, setLineOption] = useState({});
	const [alertSummary, setAlertSummary] = useState();
	// 资源迟选中项

	useEffect(() => {
		getClusters().then((res) => {
			// console.log(res.data);
			if (!res.data) return;
			res.data.unshift({ name: '全部', id: 'all' });
			setPoolList(res.data);
		});
	}, []);
	useEffect(() => {
		let clusterId = type === 'all' ? null : type;
		const chart = echarts.init(document.getElementById('id'));
		getPlatformOverview({ clusterId }).then((res) => {
			if (!res.data) return;
			let list = res.data.operatorDTO.operatorList.filter(
				(item) => item.status !== 1
			);
			list.push(
				...res.data.operatorDTO.operatorList.filter(
					(item) => item.status == 1
				)
			);
			setVersion(res.data.zeusVersion);
			setTotalData(res.data.clusterQuota);
			setOperatorData(res.data.operatorDTO);
			setOperatorList(list);
			setAuditList(res.data.auditList);
			setPieOption(getPieOption(res.data.operatorDTO));
			setLineOption(getLineOption({ ...res.data.alertSummary, x: res.data.alertSummary.infoList }));
			setAlertSummary({ ...res.data.alertSummary, x: res.data.alertSummary.infoList });
			chart.setOption(getPieOption(res.data.operatorDTO));

			chart.on('legendselectchanged', (obj) => {
				if (obj.selected['运行正常'] && !obj.selected['运行异常']) {
					x = res.data.operatorDTO.operatorList.filter(
						(item) => item.status === 1
					);
				} else if (
					!obj.selected['运行正常'] &&
					obj.selected['运行异常']
				) {
					x = res.data.operatorDTO.operatorList.filter(
						(item) => item.status !== 1
					);
				} else if (
					obj.selected['运行正常'] &&
					obj.selected['运行异常']
				) {
					x = res.data.operatorDTO.operatorList;
				} else {
					x = [];
				}
				setOperatorList(x);
			});
			window.onresize = chart.resize;
		});
		getServers({ clusterId }).then((res) => {
			res.data && setBriefInfoList(res.data.briefInfoList);
		});
	}, [type]);

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
				setTotal(res.data ? res.data.total : 0);
			});
		}
	}, [eventData]);

	const getEventsData = ({ current, level }) => {
		const sendData = {
			current: current,
			size: 10,
			level: level
		};
		getEvent(sendData).then((res) => {
			setEventData(res.data ? res.data.list : []);
			setTotal(res.data ? res.data.total : 0);
		});
	};
	const onNormalChange = (value) => {
		setLevel(value);
		const alertData = {
			current: current,
			level: value
		};
		switch (value) {
			case 'info':
				setLineOption(getLineOption({ infoList: alertSummary.infoList, x: alertSummary.x }));
				break;
			case 'warning':
				setLineOption(getLineOption({ warningList: alertSummary.warningList, x: alertSummary.x }));
				break;
			case 'critical':
				setLineOption(getLineOption({ criticalList: alertSummary.criticalList, x: alertSummary.x }));
				break;
			default:
				setLineOption(getLineOption(alertSummary));
				break;
		}
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
	const createTimeRender = (value) => {
		if (!value) return '/';
		return moment(value).format('YYYY-MM-DD HH:mm:ss');
	};
	const onRefresh = () => {
		let clusterId = type === 'all' ? null : type;

		getPlatformOverview().then((res) => {
			res.data && setTotalData(res.data.clusterQuota);
		});
		getServers({ clusterId }).then((res) => {
			res.data && setBriefInfoList(res.data.briefInfoList);
		});
	};

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
									onChange={(value) => setType(value)}
									defaultValue="全部"
								>
									{poolList.length &&
										poolList.map((item) => {
											return (
												<Select.Option
													value={item.id}
													key={item.id}
												>
													{item.name}
												</Select.Option>
											);
										})}
								</Select>
							</div>
							<Button className="refresh-btn" onClick={onRefresh}>
								<Icon type="refresh" />
							</Button>
						</div>
						<div className="header-list">
							<div className="part part-border">
								<div className="part-detail">
									<div className="part-circle">
										<CustomIcon
											type="icon-jiqun1"
											size={36}
											style={{
												color: '#617BFF',
												marginTop: '12px'
											}}
										/>
									</div>
									<div>
										<p className="value">
											<span className="num">
												{totalData.clusterNum}
											</span>
											<span>个</span>
										</p>
										<p className="type">
											资源池总数&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
										</p>
									</div>
								</div>
							</div>
							<div className="part part-border">
								<div className="part-detail">
									<div className="part-circle">
										<CustomIcon
											type="icon-mingmingkongjian"
											size={36}
											style={{
												color: '#9661FF',
												marginTop: '12px'
											}}
										/>
									</div>
									<div>
										<p className="value">
											<span className="num">
												{totalData.namespaceNum}
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
										<CustomIcon
											type="icon-CPU"
											size={60}
											style={{
												color: '#00C1D4',
												marginTop: '-10px',
												marginLeft: '2px'
											}}
										/>
									</div>
									<div>
										<div className="value percent">
											<span>
												{totalData.cpuUsedPercent}
											</span>
											<Progress
												percent={Number(totalData.cpuUsedPercent.replace('%',''))}
											/>
											<span>
												{totalData.usedCpu.toFixed(0) + '/' + totalData.totalCpu.toFixed(0) +'核'}
											</span>
										</div>
										<span className="type">
											CPU总量占比
										</span>
									</div>
								</div>
							</div>
							<div className="part">
								<div className="part-detail">
									<div className="part-circle">
										<CustomIcon
											type="icon-memory"
											size={60}
											style={{
												color: '#FF9861',
												marginTop: '-10px'
											}}
										/>
									</div>
									<div>
										<div className="value percent">
											<span>
												{totalData.memoryUsedPercent}
											</span>
											<Progress
												percent={Number(totalData.memoryUsedPercent.replace('%',''))}
											/>
											<span>
												{totalData.usedMemory.toFixed(0) + '/' +totalData.totalMemory.toFixed(0) + 'GB'}
											</span>
										</div>
										<span className="type">
											内存总量占比
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="content">
						<div className="top-content">
							<HomeCard
								title={'服务信息'}
								height={'172px'}
								width={'100%'}
								marginBottom={'16px'}
							>
								<div className="serve-info">
									{briefInfoList?.length ? (
										briefInfoList.map((item) => {
											return (
												<Tooltip
													key={item.name}
													trigger={
														<div
															className="info-item"
															onClick={() => {
																if (type === 'all') return;
																history.push(
																	`/serviceList/${item.name}/${item.name.charAt(0).toUpperCase() + item.name.slice(1)}`
																)
															}

															}
														>
															<div className="info-img">
																<img
																	height={40}
																	width={40}
																	src={`${api}/images/middleware/${item.imagePath}`}
																/>
																{item.errServiceNum !==
																	0 ? (
																	<Tooltip
																		trigger={
																			<span className="err-count">
																				{
																					item.errServiceNum
																				}
																			</span>
																		}
																		align="t"
																	>
																		异常服务数
																	</Tooltip>
																) : null}
															</div>
															<p className="info-name">
																{item.name}
															</p>
															<p className="info-count">
																<span>服务数 </span>
																<span
																	className={
																		'total-count'
																	}
																>
																	{item.serviceNum}
																</span>
															</p>
														</div>
													}
													align="t"
													triggerType="click"
												>
													请选择资源池后跳转
												</Tooltip>
											);
										})
									) : (
										<Loading
											tip="loading..."
											size="medium"
											style={{
												width: '100%',
												height: '70px'
											}}
										/>
									)}
								</div>
							</HomeCard>
						</div>
						<div className="center-content">
							<div className="left-content">
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between'
									}}
								>
									<HomeCard
										title={'控制器状态'}
										height={'300px'}
										width={'66%'}
										marginBottom={'16px'}
										readMore={'更多'}
										readMoreFn={() =>
											history.push(
												'/middlewareRepository'
											)
										}
									>
										<div className="control-container">
											<div
												id="id"
												style={{
													height: '100%',
													width: '40%'
												}}
											></div>
											<div className="dashed"></div>
											<Table
												dataSource={operatorList}
												primaryKey="key"
												hasBorder={false}
												fixedHeader={true}
												maxBodyHeight="180px"
												style={{
													width: '55%'
												}}
											>
												<Table.Column
													title="类型"
													dataIndex="name"
													cell={(
														value,
														obj,
														record
													) => (
														<span>
															{record.name +
																'(' +
																record.clusterName +
																')'}
														</span>
													)}
												/>
												<Table.Column
													title="状态"
													dataIndex="status"
													cell={(value) => (
														<span>
															<Icon
																size="xs"
																style={{
																	color:
																		value ===
																			1
																			? '#00A700'
																			: '#C80000',
																	marginRight:
																		'5px'
																}}
																type={
																	value === 1
																		? 'success'
																		: 'warning'
																}
															/>
															{value === 1
																? '运行正常'
																: '运行异常'}
														</span>
													)}
												/>
											</Table>
										</div>
									</HomeCard>
									<HomeCard
										title={'异常告警'}
										height={'300px'}
										width={'33%'}
										marginLeft={'16px'}
										marginBottom={'16px'}
									>
										<EChartsReact
											option={lineOption}
											style={{
												height: 'calc(100% - 22px)',
												width: '100%'
											}}
										/>
									</HomeCard>
								</div>
								<HomeCard
									title={'审计信息'}
									height={'300px'}
									width={'100%'}
									readMore={'更多'}
									readMoreFn={() =>
										history.push(
											'/systemManagement/operationAudit'
										)
									}
								>
									<Table
										dataSource={auditList}
										primaryKey="key"
										hasBorder={false}
										fixedHeader={true}
										maxBodyHeight="190px"
										style={{ marginTop: '16px' }}
									>
										<Table.Column
											title="账号"
											dataIndex="account"
										/>
										<Table.Column
											title="模块"
											cell={(value, index, record) => (
												<span>
													{record.moduleChDesc +
														'/' +
														record.childModuleChDesc}
												</span>
											)}
										/>
										<Table.Column
											title="行为"
											dataIndex="actionChDesc"
										/>
										<Table.Column
											title="操作时间"
											dataIndex="beginTime"
											cell={createTimeRender}
										/>
									</Table>
								</HomeCard>
							</div>
							<div className="right-content">
								<HomeCard
									title={'告警事件（全平台）'}
									height={'450px'}
									width={'100%'}
									marginBottom={'16px'}
								>
									<RadioGroup
										dataSource={radioList}
										shape="button"
										size="medium"
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
										totalRender={(total) =>
											`总数：${total}`
										}
									/>
								</HomeCard>
								<HomeCard
									title={'系统信息'}
									height={'150px'}
									width={'100%'}
								>
									<div className="system-info">
										<div className="version">
											Zeus {version}
										</div>
										<div>当前系统版本</div>
										<div>Powered by zeus</div>
									</div>
								</HomeCard>
							</div>
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
