import React, { useState, useEffect } from 'react';
import { ProPage, ProContent, ProHeader } from '@/components/ProPage';
import {
	Button,
	Select,
	Row,
	Col,
	Input,
	Checkbox,
	Popover,
	notification
} from 'antd';
import {
	DeleteOutlined,
	QuestionCircleOutlined,
	PlusOutlined,
	MinusOutlined,
	SwapOutlined,
	SearchOutlined
} from '@ant-design/icons';
import { IconFont } from '@/components/IconFont';

import { getClusters } from '@/services/common';
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

const { Option } = Select;

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
	const [systemId, setSystemId] = useState<string | undefined>();
	const [users, setUsers] = useState<any[]>([]);
	const [leftUsers, setLeftUsers] = useState<any[]>([]);
	const [rightUsers, setRightUsers] = useState<any[]>([]);
	const [selectUser, setSelectUser] = useState<any[]>([]);
	const [leftSearch, setLeftSearch] = useState<string>('');
	const [rightSearch, setRightSearch] = useState<string>('');
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
					notification.error({
						message: '??????',
						description: '??????????????????????????????????????????????????????'
					});
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
					description: '???????????????'
				},
				{
					alert: 'CPUUsingRate',
					description: 'CPU?????????'
				},
				{
					alert: 'PVCUsingRate',
					description: 'lvm?????????'
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

	// const handleChange = (value: any, data: any, extra: any) => {
	// 	setInsertUser(data);
	// };

	const getUserList = (sendData?: any) => {
		getUsers(sendData).then((res) => {
			if (!res.data) return;
			setIsReady(true);
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
			setLeftUsers(
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
			setSelectUser(
				res.data.userBy.map((item: any) => {
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
			setRightUsers(
				res.data.userBy.map((item: any) => {
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

	const transferRender = (item: any, type: string) => {
		return item.email ? (
			<li
				key={item.id}
				className={item.email ? '' : 'disabled'}
				onClick={() => {
					if (type === 'left') {
						setUsers(users.filter((i) => i.id !== item.id));
						setLeftUsers(leftUsers.filter((i) => i.id !== item.id));
						setSelectUser([
							...selectUser,
							users.find((i) => i.id === item.id)
						]);
						setRightUsers([
							...selectUser,
							leftUsers.find((i) => i.id === item.id)
						]);
					} else {
						setSelectUser(
							selectUser.filter((i) => i.id !== item.id)
						);
						setRightUsers(
							rightUsers.filter((i) => i.id !== item.id)
						);
						setUsers([
							...users,
							selectUser.find((i) => i.id === item.id)
						]);
						setLeftUsers([
							...users,
							rightUsers.find((i) => i.id === item.id)
						]);
					}
				}}
			>
				{type === 'left' && (
					<Checkbox
						style={{ marginRight: '16px' }}
						disabled={!item.email}
					/>
				)}
				{type === 'right' && (
					<DeleteOutlined
						className="label"
						style={{ color: '#0070CC', marginRight: '4px' }}
					/>
				)}
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
			</li>
		) : (
			<Popover content={'?????????????????????????????????'}>
				<li key={item.id} className={item.email ? '' : 'disabled'}>
					{type === 'left' && (
						<Checkbox
							style={{ marginRight: '16px' }}
							disabled={!item.email}
						/>
					)}
					{type === 'right' && (
						<DeleteOutlined
							className="label"
							style={{ color: '#0070CC', marginRight: '4px' }}
						/>
					)}
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
				</li>
			</Popover>
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
					// users: insertUser
					users: selectUser
				}
			};
			if (ruleId) {
				sendData.alertRuleId = ruleId;
				sendData.data = {
					middlewareAlertsDTO: value[0],
					// users: insertUser
					users: selectUser
				};
				updateAlarm(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '??????',
							description: '????????????????????????'
						});

						window.history.back();
						storage.setLocal('systemTab', 'alarm');
					} else {
						notification.error({
							message: '??????',
							description: res.errorMsg
						});
					}
				});
			} else {
				createAlarm(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '??????',
							description: '????????????????????????'
						});
						window.history.back();
						storage.setLocal('systemTab', 'alarm');
					} else {
						notification.error({
							message: '??????',
							description: res.errorMsg
						});
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
					// users: insertUser
					users: selectUser
				}
			};
			if (ruleId) {
				sendData.alertRuleId = ruleId;
				sendData.data = {
					middlewareAlertsDTO: value[0],
					// users: insertUser
					users: selectUser
				};
				updateAlarms(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '??????',
							description: '????????????????????????'
						});
						window.history.back();
						storage.setLocal('systemTab', 'alarm');
					} else {
						notification.error({
							message: '??????',
							description: res.errorMsg
						});
					}
				});
			} else {
				createAlarms(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '??????',
							description: '????????????????????????'
						});
						window.history.back();
						storage.setLocal('systemTab', 'alarm');
					} else {
						notification.error({
							message: '??????',
							description: res.errorMsg
						});
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
				String(item.threshold) &&
				item.severity &&
				item.silence &&
				item.content
		);
		if (isRule) {
			notification.error({
				message: '??????',
				description: '????????????????????????'
			});
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
						// if (insertUser && insertUser.length) {
						if (selectUser && selectUser.length) {
							onCreate(data);
						} else {
							notification.error({
								message: '??????',
								description: '???????????????????????????'
							});
						}
					} else {
						onCreate(data);
					}
				} else {
					notification.error({
						message: '??????',
						description: '???????????????'
					});
				}
			} else {
				notification.error({
					message: '??????',
					description: '???????????????'
				});
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
					// if (insertUser && insertUser.length) {
					if (selectUser && selectUser.length) {
						onCreate(list);
					} else {
						notification.error({
							message: '??????',
							description: '???????????????????????????'
						});
					}
				} else {
					onCreate(list);
				}
			} else {
				notification.error({
					message: '??????',
					description: '???????????????????????????'
				});
			}
		}
	};

	return (
		<ProPage className="create-alarm">
			<ProHeader
				title={
					ruleId
						? '??????????????????'
						: `??????????????????${
								middlewareName ? '(' + middlewareName + ')' : ''
						  }`
				}
				onBack={() => {
					window.history.back();
					storage.setLocal('systemTab', 'alarm');
				}}
			/>
			<ProContent>
				{alarmType === 'system' && (
					<>
						<h2>????????????</h2>
						<span
							className="ne-required"
							style={{ marginLeft: '10px' }}
						>
							????????????
						</span>
						<Select
							placeholder="???????????????"
							style={{
								width: '380px',
								marginLeft: '50px'
							}}
							value={systemId}
							onChange={(value) => setSystemId(value)}
							disabled={ruleId as unknown as boolean}
						>
							{poolList.length &&
								poolList.map((item: any) => {
									return (
										<Select.Option
											value={item.id}
											key={item.id}
										>
											{item.nickname || item.name}
										</Select.Option>
									);
								})}
						</Select>
					</>
				)}
				<h2>????????????</h2>
				<Row className="table-header">
					<Col span={3}>
						<span>????????????</span>
					</Col>
					<Col span={4}>
						<span>????????????</span>
					</Col>
					<Col span={5}>
						<span>????????????</span>
						<Popover
							content={'??????????????????????????????????????????????????????'}
						>
							<QuestionCircleOutlined
								style={{
									marginLeft: '5px',
									color: '#33',
									cursor: 'pointer'
								}}
							/>
						</Popover>
					</Col>
					<Col span={3}>
						<span>????????????</span>
					</Col>
					<Col span={3}>
						<span>????????????</span>
						<Popover
							content={
								'???????????????????????????????????????????????????????????????????????????????????????'
							}
						>
							<QuestionCircleOutlined
								style={{
									marginLeft: '5px',
									color: '#33',
									cursor: 'pointer'
								}}
							/>
						</Popover>
					</Col>
					<Col span={4}>
						<span>??????????????????</span>
						<Popover
							content={
								'????????????????????????????????????????????????????????????????????????????????????????????????'
							}
						>
							<QuestionCircleOutlined
								style={{
									marginLeft: '5px',
									color: '#33',
									cursor: 'pointer'
								}}
							/>
						</Popover>
					</Col>
					<Col span={2}>
						<span>????????????</span>
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
												placeholder="?????????"
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
												dropdownMatchSelectWidth={false}
												value={
													alarmType === 'system'
														? item.alert?.split(
																'-'
														  )[0]
														: item.alert
												}
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
												placeholder="?????????"
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
												// autoWidth={true}
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
												type="number"
												onChange={(e) => {
													onChange(
														e.target.value,
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
												type="number"
												onChange={(e) => {
													onChange(
														e.target.value,
														item,
														'alertTime'
													);
												}}
											/>
											<span className="info">
												???????????????
											</span>
											<Input
												style={{ width: '25%' }}
												value={item.alertTimes}
												type="number"
												onChange={(e) => {
													onChange(
														e.target.value,
														item,
														'alertTimes'
													);
												}}
											></Input>
											<span className="info">???</span>
										</Col>
										<Col span={3}>
											<Select
												placeholder="?????????"
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
															key={i.text}
															value={i.value}
														>
															{i.text}
														</Option>
													);
												})}
											</Select>
										</Col>
										<Col span={3}>
											<Select
												placeholder="?????????"
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
															{i.text}
														</Option>
													);
												})}
											</Select>
										</Col>
										<Col span={4}>
											<Input
												style={{ width: '100%' }}
												onChange={(e) =>
													onChange(
														e.target.value,
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
												icon={
													<IconFont
														type="icon-fuzhi1"
														size={12}
														style={{
															color: '#0064C8'
														}}
													/>
												}
											></Button>
											<Button
												disabled={
													ruleId as unknown as boolean
												}
												onClick={() => addAlarm()}
												style={{ marginRight: '8px' }}
												icon={
													<PlusOutlined
														style={{
															color: '#0064C8'
														}}
													/>
												}
											></Button>
											{index !== 0 && (
												<Button
													onClick={() =>
														delAlarm(
															item.id as number
														)
													}
													icon={
														<MinusOutlined
															style={{
																color: '#0064C8'
															}}
														/>
													}
												></Button>
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
														?????????????????????1-1440
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
														?????????????????????1-1000
													</span>
												)}
											</Col>
										</Row>
									)}
								</div>
							);
						})}
				</div>
				<h2>????????????</h2>
				<div className="users">
					<span style={{ marginLeft: '10px' }}>????????????</span>
					{mailDisabled ? (
						<Popover content={'?????????????????????--??????????????????'}>
							<Checkbox
								style={{ margin: '0 30px 0 20px' }}
								checked={mailChecked}
								onChange={(e) =>
									setMailChecked(e.target.checked)
								}
								disabled={mailDisabled}
							>
								??????
							</Checkbox>
						</Popover>
					) : (
						<Checkbox
							style={{ margin: '0 30px 0 20px' }}
							checked={mailChecked}
							onChange={(e) => setMailChecked(e.target.checked)}
							disabled={mailDisabled}
						>
							??????
						</Checkbox>
					)}
					{dingDisabled ? (
						<Popover content={'?????????????????????--??????????????????'}>
							<Checkbox
								checked={dingChecked}
								onChange={(e) =>
									setDingChecked(e.target.checked)
								}
								disabled={dingDisabled}
							>
								??????
							</Checkbox>
						</Popover>
					) : (
						<Checkbox
							checked={dingChecked}
							onChange={(e) => setDingChecked(e.target.checked)}
							disabled={dingDisabled}
						>
							??????
						</Checkbox>
					)}
				</div>
				{mailChecked && isReady && (
					// <div className="transfer">
					// 	<div className="ne-required">????????????</div>
					// 	<div className="transfer-container">
					// 		<div className="transfer-header">
					// 			<p className="transfer-title left">????????????</p>
					// 			<p className="transfer-title">????????????</p>
					// 		</div>
					// 		<Transfer
					// 			showSearch
					// 			searchPlaceholder="???????????????????????????????????????????????????????????????????????????"
					// 			defaultValue={selectUser}
					// 			mode="simple"
					// 			titles={[
					// 				<div key="left">
					// 					<span key="account">????????????</span>
					// 					<span key="username">?????????</span>
					// 					<span key="email">??????</span>
					// 					<span key="tel">?????????</span>
					// 					<span key="time">????????????</span>
					// 					<span key="role">????????????</span>
					// 				</div>,
					// 				<div key="right">
					// 					<span key="account">????????????</span>
					// 					<span key="username">?????????</span>
					// 					<span key="email">??????</span>
					// 					<span key="tel">?????????</span>
					// 					<span key="time">????????????</span>
					// 					<span key="role">????????????</span>
					// 				</div>
					// 			]}
					// 			dataSource={users}
					// 			itemRender={transferRender}
					// 			onChange={handleChange}
					// 		/>
					// 	</div>
					// </div>
					<div className="email">
						<div className="ne-required">????????????</div>
						<div className="transfer">
							<div className="transfer-box">
								<div className="transfer-title">????????????</div>
								<div style={{ overflowX: 'auto' }}>
									<div className="transfer-header">
										<Input
											style={{ width: '100%' }}
											addonBefore={<SearchOutlined />}
											placeholder="???????????????????????????????????????????????????????????????????????????"
											value={leftSearch}
											onChange={(e) => {
												setLeftSearch(e.target.value);
												e.target.value
													? setUsers(
															leftUsers.filter(
																(item: any) =>
																	item.label.indexOf(
																		e.target
																			.value
																	) !== -1
															)
													  )
													: setUsers(leftUsers);
											}}
										/>
									</div>
									<div className="transfer-content">
										<div className="titles">
											<p>
												<span key="account">
													????????????
												</span>
												<span key="username">
													?????????
												</span>
												<span key="email">??????</span>
												<span key="tel">?????????</span>
												<span key="time">????????????</span>
												<span key="role">????????????</span>
											</p>
										</div>
										<ul>
											{users.map((item, index) => {
												return transferRender(
													item,
													'left'
												);
												// <li
												// 	key={item.db}
												// 	onClick={() => {
												// 		setUsers(
												// 			users.filter(
												// 				(i) =>
												// 					i.db !== item.db
												// 			)
												// 		);
												// 		setLeftUsers(
												// 			leftUsers.filter(
												// 				(i) =>
												// 					i.db !== item.db
												// 			)
												// 		);
												// 		setSelectUser([
												// 			...selectUser,
												// 			users.find(
												// 				(i) =>
												// 					i.db === item.db
												// 			)
												// 		]);
												// 		setRightUsers([
												// 			...selectUser,
												// 			leftUsers.find(
												// 				(i) =>
												// 					i.db === item.db
												// 			)
												// 		]);
												// 	}}
												// >
												// 	<Checkbox
												// 		style={{
												// 			width: 20,
												// 			marginRight: 10
												// 		}}
												// 		checked={false}
												// 	/>
												// 	<span
												// 		className="db-name"
												// 		title={item.db}
												// 	>
												// 		{item.db}
												// 	</span>
												// 	<span
												// 		style={{
												// 			width: 50
												// 		}}
												// 	>
												// 		{item.charset}
												// 	</span>
												// </li>
											})}
										</ul>
									</div>

									<div className="transfer-footer">
										<span
											onClick={() => {
												setUsers(
													leftUsers.filter(
														(item) => !item.email
													)
												);
												setLeftUsers(
													leftUsers.filter(
														(item) => !item.email
													)
												);
												setSelectUser(
													leftUsers.filter(
														(item) => item.email
													)
												);
												setRightUsers(
													leftUsers.filter(
														(item) => item.email
													)
												);
											}}
										>
											????????????
										</span>
									</div>
								</div>
							</div>
							<div>
								<SwapOutlined />
							</div>
							<div className="transfer-box">
								<div className="transfer-title">????????????</div>
								<div style={{ overflowX: 'auto' }}>
									<div className="transfer-header">
										<Input
											style={{ width: '100%' }}
											addonBefore={<SearchOutlined />}
											placeholder="???????????????????????????????????????????????????????????????????????????"
											value={rightSearch}
											onChange={(e) => {
												setRightSearch(e.target.value);
												e.target.value
													? setSelectUser(
															rightUsers.filter(
																(item: any) =>
																	item.label.indexOf(
																		e.target
																			.value
																	) !== -1
															)
													  )
													: setSelectUser(rightUsers);
											}}
										/>
									</div>
									<div className="transfer-content">
										<div className="titles">
											<p>
												<span key="account">
													????????????
												</span>
												<span key="username">
													?????????
												</span>
												<span key="email">??????</span>
												<span key="tel">?????????</span>
												<span key="time">????????????</span>
												<span key="role">????????????</span>
											</p>
										</div>
										<ul>
											{selectUser.map((item) => {
												return transferRender(
													item,
													'right'
												);
												// <li key={item.db}>
												// 	<span
												// 		style={{
												// 			width: 20,
												// 			height: 28,
												// 			marginRight: 10
												// 		}}
												// 		onClick={() => {
												// 			setSelectUser(
												// 				selectUser.filter(
												// 					(i) =>
												// 						i.db !==
												// 						item.db
												// 				)
												// 			);
												// 			setRightUsers(
												// 				rightUsers.filter(
												// 					(i) =>
												// 						i.db !==
												// 						item.db
												// 				)
												// 			);
												// 			setUsers([
												// 				...users,
												// 				selectUser.find(
												// 					(i) =>
												// 						i.db ===
												// 						item.db
												// 				)
												// 			]);
												// 			setLeftUsers([
												// 				...users,
												// 				rightUsers.find(
												// 					(i) =>
												// 						i.db ===
												// 						item.db
												// 				)
												// 			]);
												// 		}}
												// 	>
												// 		<DeleteOutlined
												// 			style={{
												// 				color: 'rgb(1,112,204)',
												// 				marginTop: 8
												// 			}}
												// 		/>
												// 	</span>
												// 	<span
												// 		className="db-name"
												// 		title={item.db}
												// 	>
												// 		{item.db}
												// 	</span>
												// 	<Radio.Group
												// 		style={{
												// 			width: 365
												// 		}}
												// 		value={String(
												// 			item.authority
												// 		)}
												// 		onChange={(e) => {
												// 			item.authority = Number(
												// 				e.target.value
												// 			);
												// 			const index =
												// 				selectUser.findIndex(
												// 					(i) =>
												// 						i.db ===
												// 						item.db
												// 				);
												// 			selectUser.splice(
												// 				index,
												// 				1,
												// 				item
												// 			);
												// 			setSelectUser([
												// 				...selectUser
												// 			]);
												// 		}}
												// 	>
												// 		<Radio
												// 			id={Math.random() + ''}
												// 			value="1"
												// 		>
												// 			??????
												// 		</Radio>
												// 		<Radio
												// 			id={Math.random() + ''}
												// 			value="2"
												// 		>
												// 			?????????DDL+DML???
												// 		</Radio>
												// 		<Radio
												// 			id={Math.random() + ''}
												// 			value="3"
												// 		>
												// 			???DDL
												// 		</Radio>
												// 		<Radio
												// 			id={Math.random() + ''}
												// 			value="4"
												// 		>
												// 			???DML
												// 		</Radio>
												// 	</Radio.Group>
												// </li>
											})}
										</ul>
									</div>
									<div className="transfer-footer">
										<span
											onClick={() => {
												setUsers([
													...leftUsers,
													...rightUsers
												]);
												setLeftUsers([
													...leftUsers,
													...rightUsers
												]);
												setSelectUser([]);
												setRightUsers([]);
											}}
										>
											????????????
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
				<div className="alarm-bottom">
					<Button
						onClick={onOk}
						type="primary"
						style={{ marginRight: '9px' }}
					>
						??????
					</Button>
					<Button
						onClick={() => {
							window.history.back();
							storage.setLocal('systemTab', 'alarm');
						}}
					>
						??????
					</Button>
				</div>
			</ProContent>
		</ProPage>
	);
}

export default CreateAlarm;
