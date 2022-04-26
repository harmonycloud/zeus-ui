import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Page from '@alicloud/console-components-page';
import { connect } from 'react-redux';
import { getClusters } from '@/services/common';
import { api } from '@/api.json';
import {
	Radio,
	RadioChangeEvent,
	Pagination,
	Button,
	Select,
	Table,
	Spin,
	Popover,
	Progress
} from 'antd';
import {
	ReloadOutlined,
	CheckCircleOutlined,
	CloseCircleOutlined,
	createFromIconfontCN
} from '@ant-design/icons';
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
import storage from '@/utils/storage';
import { Icon } from '@alicloud/console-components';

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
	const IconFont = createFromIconfontCN({
		scriptUrl: '@/src/assets/iconfont.js'
	});

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
			res.data && setBriefInfoList(res.data);
		});
		getEvent(alertData).then((res) => {
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
			setAlertSummary({
				...res.data.alertSummary,
				x: res.data.alertSummary.infoList
			});
		});
	};
	const onNormalChange = (e: RadioChangeEvent) => {
		setLevel(e.target.value);
		const alertData = {
			current: current,
			level: e.target.value
		};
		switch (e.target.value) {
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

		getPlatformOverview({ clusterId }).then((res) => {
			res.data && setTotalData(res.data.clusterQuota);
		});
		getServers({ clusterId }).then((res) => {
			res.data && setBriefInfoList(res.data);
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
								集群:
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
							<Button
								className="refresh-btn"
								onClick={onRefresh}
								icon={<ReloadOutlined />}
							></Button>
						</div>
						<div className="header-list">
							<div className="part part-border">
								<div className="part-detail">
									<div className="part-circle">
										<IconFont
											type="icon-jiqun1"
											style={{
												color: '#617BFF',
												fontSize: '36px'
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
											集群总数&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
										</p>
									</div>
								</div>
							</div>
							<div className="part part-border">
								<div className="part-detail">
									<div className="part-circle">
										<IconFont
											type="icon-mingmingkongjian"
											style={{
												color: '#9661FF',
												fontSize: '36px'
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
											总命名空间总数
										</span>
									</div>
								</div>
							</div>
							<div className="part part-border">
								<div className="part-detail">
									<div className="part-circle">
										<IconFont
											type="icon-CPU"
											style={{
												color: '#00C1D4',
												fontSize: '60px'
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
												showInfo={false}
											/>
											<span>
												{totalData.usedCpu.toFixed(1) +
													'/' +
													totalData.totalCpu.toFixed(
														1
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
										<IconFont
											type="icon-memory"
											style={{
												color: '#FF9861',
												fontSize: '60px'
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
												showInfo={false}
											/>
											<span>
												{totalData.usedMemory.toFixed(
													1
												) +
													'/' +
													totalData.totalMemory.toFixed(
														1
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
													<div
														className="info-item"
														key={item.name}
														onClick={() => {
															storage.setSession(
																'menuPath',
																`/serviceList/${item.name}/${item.aliasName}`
															);
															history.push(
																`/serviceList/${item.name}/${item.aliasName}`
															);
														}}
													>
														<div className="info-img">
															<img
																height={40}
																width={40}
																src={`${api}/images/middleware/${item.imagePath}`}
															/>
															{item.errServiceNum !==
															0 ? (
																<Popover
																	content={
																		'异常服务数'
																	}
																>
																	<span className="err-count">
																		{
																			item.errServiceNum
																		}
																	</span>
																</Popover>
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
																{
																	item.serviceNum
																}
															</span>
														</p>
													</div>
												);
											}
										)
									) : (
										<Spin
											style={{
												width: '100%',
												height: '70px',
												lineHeight: '70px'
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
												rowKey={(record: any) =>
													record.name
												}
												scroll={{ y: 180 }}
												pagination={false}
												size="small"
												style={{
													width: '55%'
												}}
											>
												<Table.Column
													title="类型"
													dataIndex="name"
													render={(
														value: string,
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
													render={(value: number) => (
														<span>
															{value === 1 ? (
																<CheckCircleOutlined
																	style={{
																		color: '#389E0d',
																		marginRight:
																			'4px'
																	}}
																/>
															) : (
																<CloseCircleOutlined
																	style={{
																		color: '#f5222d',
																		marginRight:
																			'4px'
																	}}
																/>
															)}
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
										rowKey={(record: any) => record.id}
										scroll={{ y: 190 }}
										size="small"
										pagination={false}
										style={{ marginTop: '16px' }}
									>
										<Table.Column
											title="账号"
											dataIndex="account"
										/>
										<Table.Column
											title="模块"
											render={(
												value: string,
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
											render={createTimeRender}
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
										options={radioList}
										onChange={onNormalChange}
										value={level}
										optionType="button"
										size="middle"
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
										onChange={paginationChange}
										total={total}
										showTotal={(total) => `总数：${total}`}
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
