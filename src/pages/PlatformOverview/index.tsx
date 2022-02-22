import React, { useEffect, useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import Page from '@alicloud/console-components-page';
import { connect } from 'react-redux';
import { getClusters } from '@/services/common';
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
import HomeCard from '@/components/HomeCard';
import EChartsReact from 'echarts-for-react';
import { getLineOption, getPieOption } from '@/utils/echartsOption';

import { radioList } from '@/utils/const';
import * as echarts from 'echarts/core';
import moment from 'moment';

import {
	totalDataProps,
	operatorListProps,
	auditListProps,
	alertSummaryProps,
	briefInfoProps
} from './platformOverview';
import { StoreState } from '@/types';
import { poolListItem, evevtDataProps } from '@/types/comment';

import './platformOverview.scss';

const Tooltip = Balloon.Tooltip;

function PlatformOverview(): JSX.Element {
	let x = [];

	// 设置事件数据
	const [eventData, setEventData] = useState<evevtDataProps[]>([]);
	// 顶部统计数据
	const [totalData, setTotalData] = useState<totalDataProps>({
		clusterNum: 0,
		namespaceNum: 0,
		totalCpu: 0,
		usedCpu: 0,
		totalMemory: 0,
		usedMemory: 0,
		cpuUsedPercent: '',
		memoryUsedPercent: ''
	});
	// 服务信息列表
	const [briefInfoList, setBriefInfoList] = useState<briefInfoProps[]>([]);
	// 单选按钮组
	const RadioGroup = Radio.Group;
	const [current, setCurrent] = useState<number>(1); // 页码 current
	const [level, setLevel] = useState<string | number | boolean>(''); // level
	const [total, setTotal] = useState<number>(10); // 总数
	const [poolList, setPoolList] = useState<poolListItem[]>([]);
	const [type, setType] = useState<string>('all');
	const [version, setVersion] = useState<string>();
	const [operatorList, setOperatorList] = useState<operatorListProps[]>([]);
	const [auditList, setAuditList] = useState<auditListProps[]>([]);
	const history = useHistory<unknown>();
	const [lineOption, setLineOption] = useState<any>({});
	const [alertSummary, setAlertSummary] = useState<alertSummaryProps>({});

	useEffect(() => {
		getClusters().then((res) => {
			if (!res.data) return;
			res.data.unshift({ name: '全部', id: 'all' });
			setPoolList(res.data);
		});
	}, []);
	useEffect(() => {
		const clusterId = type === 'all' ? null : type;
		const id = document.getElementById('id');
		const alertData = {
			current: current,
			level: level
		};
		let chart: any = null;
		if (id) chart = echarts.init(id);

		getPlatformOverview({ clusterId }).then((res) => {
			if (!res.data) return;
			const list = res.data.operatorDTO.operatorList.filter(
				(item: operatorListProps) => item.status !== 1
			);
			list.push(
				...res.data.operatorDTO.operatorList.filter(
					(item: operatorListProps) => item.status == 1
				)
			);
			setVersion(res.data.zeusVersion);
			setTotalData(res.data.clusterQuota);
			setOperatorList(list);
			setAuditList(res.data.auditList);
			chart.setOption(getPieOption(res.data.operatorDTO));

			chart.on('legendselectchanged', (obj: any) => {
				if (obj.selected['运行正常'] && !obj.selected['运行异常']) {
					x = res.data.operatorDTO.operatorList.filter(
						(item: operatorListProps) => item.status === 1
					);
				} else if (
					!obj.selected['运行正常'] &&
					obj.selected['运行异常']
				) {
					x = res.data.operatorDTO.operatorList.filter(
						(item: operatorListProps) => item.status !== 1
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
			window.addEventListener('resize', () => chart.resize());
		});
		getServers({ clusterId }).then((res) => {
			res.data && setBriefInfoList(res.data.briefInfoList);
		});
		getEventsData(alertData);
	}, [type]);

	const getEventsData = (data: any) => {
		const sendData = {
			current: data.current || 1,
			size: 10,
			level: data.level
		};
		getEvent(sendData).then((res) => {
			setEventData(res.data ? res.data.alertPageInfo.list : []);
			setTotal(res.data ? res.data.alertPageInfo.total : 0);
			setTotal(res.data ? res.data.alertPageInfo.total : 0);
				setLineOption(
					getLineOption({
						...res.data.alertSummary,
						x: res.data.alertSummary.infoList
					})
				);
				setAlertSummary({
					...res.data.alertSummary,
					x: res.data.alertSummary.infoList
				});
		});
	};
	const onNormalChange = (value: string | number | boolean) => {
		setLevel(value);
		const alertData = {
			current: current,
			level: value
		};
		switch (value) {
			case 'info':
				setLineOption(
					getLineOption({
						infoList: alertSummary.infoList,
						x: alertSummary.x
					})
				);
				break;
			case 'warning':
				setLineOption(
					getLineOption({
						warningList: alertSummary.warningList,
						x: alertSummary.x
					})
				);
				break;
			case 'critical':
				setLineOption(
					getLineOption({
						criticalList: alertSummary.criticalList,
						x: alertSummary.x
					})
				);
				break;
			default:
				setLineOption(getLineOption(alertSummary));
				break;
		}
		getEventsData(alertData);
	};
	const paginationChange = (current: number) => {
		setCurrent(current);
		const alertData = {
			current: current,
			level: level
		};
		getEventsData(alertData);
	};
	const createTimeRender = (value: string) => {
		if (!value) return '/';
		return moment(value).format('YYYY-MM-DD HH:mm:ss');
	};
	const onRefresh = () => {
		const clusterId = type === 'all' ? null : type;
		const alertData = {
			current: current,
			level: level
		};

		getPlatformOverview().then((res) => {
			res.data && setTotalData(res.data.clusterQuota);
		});
		getServers({ clusterId }).then((res) => {
			res.data && setBriefInfoList(res.data.briefInfoList);
		});
		getEventsData(alertData);
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
										poolList.map((item: poolListItem) => {
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
												percent={Number(
													totalData.cpuUsedPercent.replace(
														'%',
														''
													)
												)}
											/>
											<span>
												{totalData.usedCpu.toFixed(0) +
													'/' +
													totalData.totalCpu.toFixed(
														0
													) +
													'核'}
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
												percent={Number(
													totalData.memoryUsedPercent.replace(
														'%',
														''
													)
												)}
											/>
											<span>
												{totalData.usedMemory.toFixed(
													0
												) +
													'/' +
													totalData.totalMemory.toFixed(
														0
													) +
													'GB'}
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
								title="服务信息"
								style={{
									height: '172px',
									width: '100%',
									marginBottom: '16px'
								}}
							>
								<div className="serve-info">
									{briefInfoList?.length ? (
										briefInfoList.map(
											(item: briefInfoProps) => {
												return (
													<Tooltip
														key={item.name}
														trigger={
															<div
																className="info-item"
																onClick={() => {
																	if (
																		type ===
																		'all'
																	)
																		return;
																	history.push(
																		`/serviceList/${
																			item.name
																		}/${
																			item.name
																				.charAt(
																					0
																				)
																				.toUpperCase() +
																			item.name.slice(
																				1
																			)
																		}`
																	);
																}}
															>
																<div className="info-img">
																	<img
																		height={
																			40
																		}
																		width={
																			40
																		}
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
																	<span>
																		服务数{' '}
																	</span>
																	<span
																		className={
																			'total-count'
																		}
																	>
																		{
																			item.serviceNum
																		}
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
											}
										)
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
										title="控制器状态"
										style={{
											height: '300px',
											width: '66%',
											marginBottom: '16px'
										}}
										readMore="更多"
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
														value: string,
														index: number,
														record: operatorListProps
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
													cell={(value: number) => (
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
										style={{
											height: '300px',
											width: '33%',
											marginLeft: '16px',
											marginBottom: '16px'
										}}
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
									title="审计信息"
									style={{ height: '300px', width: '100%' }}
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
											cell={(
												value: string,
												index: number,
												record: auditListProps
											) => (
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
									title="告警事件（全平台）"
									style={{
										height: '450px',
										width: '100%',
										marginBottom: '16px'
									}}
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
									title="系统信息"
									style={{ height: '150px', width: '100%' }}
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
const mapStateToProps = (state: StoreState) => ({
	globalVar: state.globalVar
});
export default connect(mapStateToProps)(PlatformOverview);
