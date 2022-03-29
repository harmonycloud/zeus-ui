import React, { useState, useEffect } from 'react';
import { Page, Header, Content } from '@alicloud/console-components-page';
import {
	Select,
	Input,
	Button,
	Grid,
	Icon,
	Checkbox,
	Balloon
} from '@alicloud/console-components';
import { Message } from '@alicloud/console-components';
import messageConfig from '@/components/messageConfig';
import { getClusters } from '@/services/common';
import CustomIcon from '@/components/CustomIcon';
import { Transfer } from '@alicloud/console-components';
import {
	createAlarms,
	getCanUseAlarms,
	createAlarm,
	updateAlarm,
	updateAlarms,
	getAlarmDetail
} from '@/services/middleware';
import { getUsers } from '@/services/user';
import { getMailInfo, getDing } from '@/services/alarm';
import storage from '@/utils/storage';
import { symbols, alarmWarn, silences } from '@/utils/const';
import { useParams } from 'react-router';

import './index.scss';
import {
	AlarmItem,
	AlarmSendData,
	CreateServeAlarmProps,
	LabelItem,
	ServiceRuleItem
} from '../detail';

const { Row, Col } = Grid;
const { Option } = Select;
const { Tooltip } = Balloon;

function CreateAlarm(): JSX.Element {
	const params: CreateServeAlarmProps = useParams();
	const { clusterId, namespace, middlewareName, type, alarmType, ruleId } =
		params;
	const [alarms, setAlarms] = useState<AlarmItem[]>([
		{
			alert: null,
			description: null
		}
	]);
	const [alarmRules, setAlarmRules] = useState<ServiceRuleItem[]>([]);
	const [poolList, setPoolList] = useState([]);
	const [systemId, setSystemId] = useState<string>('');
	const [users, setUsers] = useState<any[]>([]);
	const [insertUser, setInsertUser] = useState<any[]>([]);
	const [selectUser, setSelectUser] = useState<any[]>([]);
	const [mailChecked, setMailChecked] = useState<boolean>(false);
	const [dingChecked, setDingChecked] = useState<boolean>(false);
	const [isRule, setIsRule] = useState<boolean>();
	const [dingDisabled, setDingDisabled] = useState<boolean>(false);
	const [mailDisabled, setMailDisabled] = useState<boolean>(false);
	const [isReady, setIsReady] = useState<boolean>(false);
	const [detail, setDetail] = useState<ServiceRuleItem>();

	const getCanUse = (
		clusterId: string,
		namespace: string,
		middlewareName: string,
		type: string
	) => {
		const sendData = {
			clusterId,
			namespace,
			middlewareName,
			type
		};
		getCanUseAlarms(sendData).then((res) => {
			if (res.success) {
				setAlarms(JSON.parse(JSON.stringify(res.data)));
				if (ruleId) {
					getAlarmDetail({ alertRuleId: ruleId }).then((res: any) => {
						setAlarmRules([
							{ ...res.data, severity: res.data.labels.severity }
						]);
						res.data.ding
							? setDingChecked(true)
							: setDingChecked(false);
						res.data.mail
							? setMailChecked(true)
							: setMailChecked(false);
						setSystemId(res.data.clusterId);
						getUserList({ alertRuleId: ruleId });
						setDetail(res.data);
					});
				} else {
					getUserList();
					setAlarmRules([{}]);
				}
				if (res.data.length < 0) {
					Message.show(
						messageConfig(
							'error',
							'错误',
							'当前中间件没有可以设置规则的监控项！'
						)
					);
				}
			}
		});
	};

	const onChange = (value: string, record: ServiceRuleItem, type: string) => {
		if (type === 'alert') {
			const listTemp = alarms;
			const filterItem: AlarmItem[] = listTemp.filter(
				(item) => item.alert === value
			);
			const list = alarmRules.map((item: ServiceRuleItem) => {
				if (item.id === record.id) {
					item.alert = value;
					item.annotations = filterItem[0].annotations;
					item.description = filterItem[0].description as string;
					item.expr = filterItem[0].expr as string;
					item.labels = filterItem[0].labels as LabelItem;
					item.name = filterItem[0].name as string;
					item.status = filterItem[0].status as string;
					item.time = filterItem[0].time as string;
					item.type = filterItem[0].type as string;
					item.unit = filterItem[0].unit as string;
					return item;
				} else {
					return item;
				}
			});
			setAlarmRules(list);
		} else if (type === 'alertTime') {
			const list = alarmRules.map((item) => {
				if (item.id === record.id) {
					item.alertTime = value;
					if (
						Number(item.alertTime) > 1440 ||
						Number(item.alertTime) < 1
					) {
						setIsRule(true);
					} else {
						setIsRule(false);
					}
					return item;
				} else {
					return item;
				}
			});
			setAlarmRules(list);
		} else if (type === 'alertTimes') {
			const list = alarmRules.map((item) => {
				if (item.id === record.id) {
					item.alertTimes = value;
					if (
						Number(item.alertTimes) > 1000 ||
						Number(item.alertTimes) < 1
					) {
						setIsRule(true);
					} else {
						setIsRule(false);
					}
					return item;
				} else {
					return item;
				}
			});
			setAlarmRules(list);
		} else {
			const list = alarmRules.map((item) => {
				if (item.id === record.id) {
					item[type] = value;
					return item;
				} else {
					return item;
				}
			});
			setAlarmRules(list);
		}
	};

	const addAlarm = () => {
		setAlarmRules([...alarmRules, { id: Math.random() * 100 }]);
	};
	const copyAlarm = (index: number) => {
		if (alarms && alarms.length > 0) {
			const addItem = alarmRules[index];
			setAlarmRules([
				...alarmRules,
				{
					...addItem,
					id: Math.random() * 100,
					alert: '',
					content: ''
				}
			]);
		}
	};
	const delAlarm = (i: number) => {
		const list = alarmRules.filter((item) => item.id !== i);
		setAlarmRules(list);
	};

	useEffect(() => {
		if (alarmType === 'system') {
			setAlarms([
				{
					alert: 'memoryUsingRate',
					description: '内存使用率'
				},
				{
					alert: 'CPUUsingRate',
					description: 'CPU使用率'
				},
				{
					alert: 'PVCUsingRate',
					description: 'lvm使用率'
				}
			]);
			if (ruleId) {
				getAlarmDetail({ alertRuleId: ruleId }).then((res: any) => {
					setAlarmRules([
						{ ...res.data, severity: res.data.labels.severity }
					]);
					res.data.ding
						? setDingChecked(true)
						: setDingChecked(false);
					res.data.mail
						? setMailChecked(true)
						: setMailChecked(false);
					setSystemId(res.data.clusterId);
					getUserList({ alertRuleId: ruleId });
					setDetail(res.data);
				});
			} else {
				getUserList();
				setAlarmRules([{}]);
			}
		} else {
			getCanUse(clusterId, namespace, middlewareName, type);
		}
		getClusters().then((res) => {
			if (!res.data) return;
			setPoolList(res.data);
		});

		getMailInfo().then((res) => {
			if (res.success) {
				res.data ? setMailDisabled(false) : setMailDisabled(true);
			}
		});
		getDing().then((res) => {
			if (res.success) {
				res.data && res.data.length
					? setDingDisabled(false)
					: setDingDisabled(true);
			}
		});
	}, []);

	const handleChange = (value: any, data: any, extra: any) => {
		setInsertUser(data);
	};

	const getUserList = (sendData?: any) => {
		getUsers(sendData).then((res) => {
			if (!res.data) return;
			const user: any[] = [];
			res.data.userBy &&
				res.data.userBy.length &&
				res.data.userBy.find((item: any) => item.email) &&
				setSelectUser(
					res.data.userBy
						.filter((item: any) => item.email)
						.map((item: any) => item.id)
				);
			res.data.userBy &&
				res.data.userBy.length &&
				res.data.users.map((item: any) => {
					res.data.userBy.map((arr: any) => {
						arr.email && item.id === arr.id && user.push(item);
					});
				});
			setIsReady(true);
			setInsertUser(user);
			setUsers(
				res.data.users.map((item: any) => {
					return {
						...item,
						value: item.id,
						key: item.id,
						disabled: !item.email,
						label:
							item.email +
							item.phone +
							item.userName +
							item.aliasName +
							item.roleName
					};
				})
			);
		});
	};

	const transferRender = (item: any) => {
		return item.email ? (
			<span
				key={item.id}
				style={{ width: '100%', overflowX: 'auto' }}
				className={item.email ? '' : 'disabled'}
			>
				<Checkbox
					style={{ marginRight: '5px' }}
					disabled={!item.email}
				/>
				<Icon
					className="label"
					type="ashbin1"
					size="xs"
					style={{ color: '#0070CC', marginRight: '10px' }}
				/>
				<span className="item-content">{item.userName}</span>
				<span className="item-content">{item.aliasName}</span>
				<span className="item-content">
					{item.email ? item.email : '/'}
				</span>
				<span className="item-content">{item.phone}</span>
				<span className="item-content">
					{item.createTime ? item.createTime : '/'}
				</span>
				<span className="item-content">
					{item.roleName ? item.roleName : '/'}
				</span>
			</span>
		) : (
			<Tooltip
				trigger={
					<span
						key={item.id}
						style={{ width: '100%', overflowX: 'auto' }}
						className={item.email ? '' : 'disabled'}
					>
						<Checkbox
							style={{ marginRight: '5px' }}
							disabled={!item.email}
						/>
						<Icon
							className="label"
							type="ashbin1"
							size="xs"
							style={{ color: '#0070CC', marginRight: '10px' }}
						/>
						<span className="item-content">{item.userName}</span>
						<span className="item-content">{item.aliasName}</span>
						<span className="item-content">
							{item.email ? item.email : '/'}
						</span>
						<span className="item-content">{item.phone}</span>
						<span className="item-content">
							{item.createTime ? item.createTime : '/'}
						</span>
						<span className="item-content">
							{item.roleName ? item.roleName : '/'}
						</span>
					</span>
				}
				align="t"
			>
				用户邮箱为空，不可选择
			</Tooltip>
		);
	};

	useEffect(() => {
		return () => {
			storage.removeSession('alarm');
			storage.removeLocal('systemTab');
		};
	}, []);

	const onCreate = (value: any) => {
		if (alarmType === 'system') {
			const sendData: AlarmSendData = {
				url: {
					clusterId: systemId
				},
				ding: dingChecked ? 'ding' : '',
				data: {
					middlewareAlertsDTOList: value,
					users: insertUser
				}
			};
			if (ruleId) {
				sendData.alertRuleId = ruleId;
				sendData.data = {
					middlewareAlertsDTO: value[0],
					users: insertUser
				};
				updateAlarm(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '告警规则修改成功')
						);
						window.history.back();
						storage.setLocal('systemTab', 'alarm');
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			} else {
				createAlarm(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '告警规则设置成功')
						);
						window.history.back();
						storage.setLocal('systemTab', 'alarm');
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		} else {
			const sendData: AlarmSendData = {
				url: {
					clusterId: clusterId,
					middlewareName: middlewareName,
					namespace: namespace
				},
				ding: dingChecked ? 'ding' : '',
				data: {
					middlewareAlertsDTOList: value,
					users: insertUser
				}
			};
			if (ruleId) {
				sendData.alertRuleId = ruleId;
				sendData.data = {
					middlewareAlertsDTO: value[0],
					users: insertUser
				};
				updateAlarms(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '告警规则修改成功')
						);
						window.history.back();
						storage.setLocal('systemTab', 'alarm');
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			} else {
				createAlarms(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '告警规则设置成功')
						);
						window.history.back();
						storage.setLocal('systemTab', 'alarm');
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		}
	};

	const onOk = () => {
		const flag = alarmRules.every(
			(item) =>
				item.alert &&
				item.alertTimes &&
				item.alertTime &&
				item.symbol &&
				item.threshold &&
				item.severity &&
				item.silence &&
				item.content
		);
		if (isRule) {
			Message.show(messageConfig('error', '失败', '监控项不符合规则'));
			return;
		}
		if (alarmType === 'system') {
			const data = alarmRules.map((item) => {
				item.labels = { ...item.labels, severity: item.severity };
				if (detail) {
					item.annotations = {
						...detail.annotations,
						message: item.content
					};
				} else {
					item.annotations = {
						message: item.content as string
					};
				}
				item.lay = 'system';
				item.ip = window.location.host;
				detail ? (item.enable = detail.enable) : (item.enable = 0);
				dingChecked ? (item.ding = 'ding') : (item.ding = '');
				mailChecked ? (item.mail = 'mail') : (item.mail = '');
				return item;
			});
			if (systemId) {
				if (flag) {
					if (mailChecked) {
						if (insertUser && insertUser.length) {
							onCreate(data);
						} else {
							Message.show(
								messageConfig(
									'error',
									'失败',
									'请选择邮箱通知用户'
								)
							);
						}
					} else {
						onCreate(data);
					}
				} else {
					Message.show(messageConfig('error', '失败', '缺少监控项'));
				}
			} else {
				Message.show(messageConfig('error', '失败', '请选择资源池'));
			}
		} else {
			const list = alarmRules.map((item) => {
				item.labels = {
					...item.labels,
					severity: item.severity as string
				};
				item.lay = 'service';
				detail ? (item.enable = detail.enable) : (item.enable = 0);
				dingChecked ? (item.ding = 'ding') : (item.ding = '');
				mailChecked ? (item.mail = 'mail') : (item.mail = '');
				item.ip = window.location.host;
				return item;
			});
			if (flag) {
				if (mailChecked) {
					if (insertUser && insertUser.length) {
						onCreate(list);
					} else {
						Message.show(
							messageConfig('error', '失败', '请选择邮箱通知用户')
						);
					}
				} else {
					onCreate(list);
				}
			} else {
				Message.show(
					messageConfig('error', '失败', '存在监控项缺少阈值')
				);
			}
		}
	};

	return (
		<Page className="create-alarm">
			<Header
				title={
					ruleId
						? '修改告警规则'
						: `新建告警规则${
								middlewareName ? '(' + middlewareName + ')' : ''
						  }`
				}
				hasBackArrow
				renderBackArrow={(elem) => (
					<span
						className="details-go-back"
						onClick={() => {
							window.history.back();
							storage.setLocal('systemTab', 'alarm');
						}}
					>
						{elem}
					</span>
				)}
			/>
			<Content>
				{alarmType === 'system' && (
					<>
						<h2>资源池选择</h2>
						<span
							className="ne-required"
							style={{ marginLeft: '10px' }}
						>
							选择资源池
						</span>
						<Select
							style={{
								width: '380px',
								marginLeft: '50px'
							}}
							value={systemId}
							onChange={(value) => setSystemId(value)}
							placeholder="请选择资源池"
							disabled={ruleId as unknown as boolean}
						>
							{poolList.length &&
								poolList.map((item: any) => {
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
					</>
				)}
				<h2>告警规则</h2>
				<Row className="table-header">
					<Col span={3}>
						<span>告警指标</span>
					</Col>
					<Col span={4}>
						<span>告警阈值</span>
					</Col>
					<Col span={5}>
						<span>触发规则</span>
						<Tooltip
							trigger={
								<Icon
									type="question-circle"
									size="xs"
									style={{
										marginLeft: '5px',
										color: '#33',
										cursor: 'pointer'
									}}
								/>
							}
							align="t"
						>
							特定时间≥设定的触发次数，则预警一次
						</Tooltip>
					</Col>
					<Col span={3}>
						<span>告警等级</span>
					</Col>
					<Col span={3}>
						<span>告警间隔</span>
						<Tooltip
							trigger={
								<Icon
									type="question-circle"
									size="xs"
									style={{
										marginLeft: '5px',
										color: '#333',
										cursor: 'pointer'
									}}
								/>
							}
							align="t"
						>
							预警一次过后，间隔多久后再次执行预警监测，防止预警信息爆炸
						</Tooltip>
					</Col>
					<Col span={4}>
						<span>告警内容描述</span>
						<Tooltip
							trigger={
								<Icon
									type="question-circle"
									size="xs"
									style={{
										marginLeft: '5px',
										color: '#333',
										cursor: 'pointer'
									}}
								/>
							}
							align="t"
						>
							对已经设定的监控对象进行自定义描述，发生告警时可作为一种信息提醒
						</Tooltip>
					</Col>
					<Col span={2}>
						<span>告警操作</span>
					</Col>
				</Row>
				<div style={{ maxHeight: '470px', overflowY: 'auto' }}>
					{alarmRules &&
						alarmRules.map((item, index) => {
							return (
								<div key={item.id}>
									<Row>
										<Col span={3}>
											<span className="ne-required"></span>
											<Select
												onChange={(value) =>
													onChange(
														value,
														item,
														'alert'
													)
												}
												style={{
													marginRight: 8,
													width: '100%'
												}}
												autoWidth={false}
												value={alarmType === 'system' ? item.alert?.split('-')[0] : item.alert}
											>
												{alarms &&
													alarms.map((i) => {
														return (
															<Option
																key={i.alert}
																value={i.alert}
															>
																{alarmType ===
																	'service' &&
																type ===
																	'zookeeper'
																	? i.alert
																	: i.description}
															</Option>
														);
													})}
											</Select>
										</Col>
										<Col span={4}>
											<Select
												onChange={(value) =>
													onChange(
														value,
														item,
														'symbol'
													)
												}
												style={{
													width: '60%',
													minWidth: 'auto'
												}}
												autoWidth={true}
												value={item.symbol}
											>
												{symbols.map((i) => {
													return (
														<Option
															key={i.value}
															value={i.value}
														>
															{i.label}
														</Option>
													);
												})}
											</Select>
											<Input
												style={{
													width: '30%',
													borderLeft: 0
												}}
												value={item.threshold}
												onChange={(value) => {
													onChange(
														value,
														item,
														'threshold'
													);
												}}
											/>
											<span className="info">%</span>
										</Col>
										<Col span={5}>
											<Input
												style={{ width: '25%' }}
												value={item.alertTime}
												onChange={(value) => {
													onChange(
														value,
														item,
														'alertTime'
													);
												}}
											/>
											<span className="info">
												分钟内触发
											</span>
											<Input
												style={{ width: '25%' }}
												value={item.alertTimes}
												onChange={(value) => {
													onChange(
														value,
														item,
														'alertTimes'
													);
												}}
											></Input>
											<span className="info">次</span>
										</Col>
										<Col span={3}>
											<Select
												onChange={(value) =>
													onChange(
														value,
														item,
														'severity'
													)
												}
												style={{ width: '100%' }}
												value={item.severity}
											>
												{alarmWarn.map((i) => {
													return (
														<Option
															key={i.label}
															value={i.value}
														>
															{i.label}
														</Option>
													);
												})}
											</Select>
										</Col>
										<Col span={3}>
											<Select
												onChange={(value) =>
													onChange(
														value,
														item,
														'silence'
													)
												}
												style={{ width: '100%' }}
												value={item.silence}
											>
												{silences.map((i) => {
													return (
														<Option
															key={i.value}
															value={i.value}
														>
															{i.label}
														</Option>
													);
												})}
											</Select>
										</Col>
										<Col span={4}>
											<Input
												style={{ width: '100%' }}
												onChange={(value) =>
													onChange(
														value,
														item,
														'content'
													)
												}
												value={item.content}
												maxLength={100}
											/>
										</Col>
										<Col span={2}>
											<Button
												disabled={
													ruleId as unknown as boolean
												}
												style={{ marginRight: '8px' }}
												onClick={() => copyAlarm(index)}
											>
												<CustomIcon
													type="icon-fuzhi1"
													size={12}
													style={{ color: '#0064C8' }}
												/>
											</Button>
											<Button
												disabled={
													ruleId as unknown as boolean
												}
												onClick={() => addAlarm()}
												style={{ marginRight: '8px' }}
											>
												<Icon
													type="plus"
													style={{ color: '#0064C8' }}
												/>
											</Button>
											{index !== 0 && (
												<Button
													onClick={() =>
														delAlarm(
															item.id as number
														)
													}
												>
													<Icon
														type="wind-minus"
														style={{
															color: '#0064C8'
														}}
													/>
												</Button>
											)}
										</Col>
									</Row>
									{(Number(item.alertTime) > 1440 ||
										Number(item.alertTime) < 1 ||
										Number(item.alertTimes) > 1000 ||
										Number(item.alertTimes) < 1) && (
										<Row>
											<Col className="error-info">
												{(Number(item.alertTime) >
													1440 ||
													Number(item.alertTime) <
														1) && (
													<span>
														分钟数的范围是1-1440
													</span>
												)}
												{(Number(item.alertTimes) >
													1000 ||
													Number(item.alertTimes) <
														1) && (
													<span
														style={{
															marginLeft: '16px'
														}}
													>
														次数数的范围是1-1000
													</span>
												)}
											</Col>
										</Row>
									)}
								</div>
							);
						})}
				</div>
				<h2>告警通知</h2>
				<div className="users">
					<span style={{ marginLeft: '10px' }}>通知方式</span>
					{mailDisabled ? (
						<Tooltip
							trigger={
								<Checkbox
									label="邮箱"
									style={{ margin: '0 30px 0 20px' }}
									checked={mailChecked}
									onChange={(checked) =>
										setMailChecked(checked)
									}
									disabled={mailDisabled}
								/>
							}
							align="t"
						>
							请前往系统管理--系统告警设置
						</Tooltip>
					) : (
						<Checkbox
							label="邮箱"
							style={{ margin: '0 30px 0 20px' }}
							checked={mailChecked}
							onChange={(checked) => setMailChecked(checked)}
							disabled={mailDisabled}
						/>
					)}
					{dingDisabled ? (
						<Tooltip
							trigger={
								<Checkbox
									label="钉钉"
									checked={dingChecked}
									onChange={(checked) =>
										setDingChecked(checked)
									}
									disabled={dingDisabled}
								/>
							}
							align="t"
						>
							请前往系统管理--系统告警设置
						</Tooltip>
					) : (
						<Checkbox
							label="钉钉"
							checked={dingChecked}
							onChange={(checked) => setDingChecked(checked)}
							disabled={dingDisabled}
						/>
					)}
				</div>
				{mailChecked && isReady && (
					<div className="transfer">
						<div className="ne-required">邮箱通知</div>
						<div className="transfer-container">
							<div className="transfer-header">
								<p className="transfer-title left">用户通知</p>
								<p className="transfer-title">用户通知</p>
							</div>
							<Transfer
								showSearch
								searchPlaceholder="请输入登录账户、用户名、邮箱、手机号、关联角色搜索"
								defaultValue={selectUser}
								mode="simple"
								titles={[
									<div key="left">
										<span key="account">登录账户</span>
										<span key="username">用户名</span>
										<span key="email">邮箱</span>
										<span key="tel">手机号</span>
										<span key="time">创建时间</span>
										<span key="role">关联角色</span>
									</div>,
									<div key="right">
										<span key="account">登录账户</span>
										<span key="username">用户名</span>
										<span key="email">邮箱</span>
										<span key="tel">手机号</span>
										<span key="time">创建时间</span>
										<span key="role">关联角色</span>
									</div>
								]}
								dataSource={users}
								itemRender={transferRender}
								onChange={handleChange}
							/>
						</div>
					</div>
				)}
				<div className="alarm-bottom">
					<Button
						onClick={onOk}
						type="primary"
						style={{ marginRight: '9px' }}
					>
						确认
					</Button>
					<Button
						onClick={() => {
							window.history.back();
							storage.setLocal('systemTab', 'alarm');
						}}
					>
						取消
					</Button>
				</div>
			</Content>
		</Page>
	);
}

export default CreateAlarm;
