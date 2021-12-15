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
import { getClusters } from '@/services/common.js';
import CustomIcon from '@/components/CustomIcon';
import { Transfer } from '@alicloud/console-components';
import {
	createAlarms,
	getCanUseAlarms,
	createAlarm,
	updateAlarm,
	updateAlarms
} from '@/services/middleware';
import { getUsers, sendInsertUser, insertDing } from '@/services/user';
import { getMailInfo, getDing } from '@/services/alrem';
import storage from '@/utils/storage';
import './index.scss';

const { Row, Col } = Grid;
const { Option } = Select;
const { Tooltip } = Balloon;
const symbols = ['>=', '>', '==', '<', '<=', '!='];
const silences = [
	{ value: '5m', label: '5分钟' },
	{ value: '10m', label: '10分钟' },
	{ value: '15m', label: '15分钟' },
	{ value: '30m', label: '30分钟' },
	{ value: '1h', label: '1小时' },
	{ value: '2h', label: '2小时' },
	{ value: '3h', label: '3小时' },
	{ value: '6h', label: '6小时' },
	{ value: '12h', label: '12小时' },
	{ value: '24h', label: '24小时' }
];
const alarmWarn = [
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

function CreateAlarm(props) {
	const { clusterId, namespace, middlewareName, type, alarmType, record } =
		storage.getSession('alarm');
	const [alarms, setAlarms] = useState([
		{
			alert: null,
			description: null
		}
	]);
	const [alarmRules, setAlarmRules] = useState([]);
	const [poolList, setPoolList] = useState([]);
	const [systemId, setSystemId] = useState();
	const [users, setUsers] = useState([]);
	const [insertUser, setInsertUser] = useState();
	const [selectUser, setSelectUser] = useState([]);
	const [mailChecked, setMailChecked] = useState(false);
	const [dingChecked, setDingChecked] = useState(false);
	const [copyIndex, setCopyIndex] = useState();
	const [isRule, setIsRule] = useState();
	const [dingDisabled, setDingDisabled] = useState(false);
	const [mailDisabled, setMailDisabled] = useState(false);
	const [isReady, setIsReady] = useState(false);

	const getCanUse = (clusterId, namespace, middlewareName, type) => {
		const sendData = {
			clusterId,
			namespace,
			middlewareName,
			type
		};
		getCanUseAlarms(sendData).then((res) => {
			if (res.success) {
				setAlarms(JSON.parse(JSON.stringify(res.data)));
				setAlarmRules([{}]);
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

	const onChange = (value, record, type) => {
		if (type === 'alert') {
			const listTemp = alarms;
			const filterItem = listTemp.filter((item) => item.alert === value);
			const list = alarmRules.map((item) => {
				if (item.id === record.id) {
					item.alert = value;
					item.annotations = filterItem[0].annotations;
					item.description = filterItem[0].description;
					item.expr = filterItem[0].expr;
					item.labels = filterItem[0].labels;
					item.name = filterItem[0].name;
					item.status = filterItem[0].status;
					item.time = filterItem[0].time;
					item.type = filterItem[0].type;
					item.unit = filterItem[0].unit;
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
		} else if (type === 'severity') {
			const list = alarmRules.map((item) => {
				if (item.id === record.id) {
					item.severity = value;
					return item;
				} else {
					return item;
				}
			});
			setAlarmRules(list);
		} else if (type === 'content') {
			const list = alarmRules.map((item) => {
				if (item.id === record.id) {
					item.content = value;
					return item;
				} else {
					return item;
				}
			});
			setAlarmRules(list);
		} else if (type === 'symbol') {
			const list = alarmRules.map((item) => {
				if (item.id === record.id) {
					item.symbol = value;
					return item;
				} else {
					return item;
				}
			});
			setAlarmRules(list);
		} else if (type === 'threshold') {
			const list = alarmRules.map((item) => {
				if (item.id === record.id) {
					item.threshold = value;
					return item;
				} else {
					return item;
				}
			});
			setAlarmRules(list);
		} else if (type === 'silence') {
			const list = alarmRules.map((item) => {
				if (item.id === record.id) {
					item.silence = value;
					return item;
				} else {
					return item;
				}
			});
			setAlarmRules(list);
		}
	};

	const addAlarm = () => {
		if (alarms && alarms.length > 0) {
			const addItem = alarmRules[copyIndex];
			if (typeof copyIndex === 'undefined') {
				setAlarmRules([...alarmRules, { id: Math.random() * 100 }]);
			} else {
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
		}
	};
	const delAlarm = (i) => {
		const list = alarmRules.filter((item) => item.id !== i);
		setAlarmRules(list);
	};

	useEffect(() => {
		if (record) {
			setAlarmRules([{ ...record, severity: record.labels.severity }]);
			record.ding ? setDingChecked(true) : setDingChecked(false);
			record.mail ? setMailChecked(true) : setMailChecked(false);
		} else {
			if (alarmType === 'system') {
				setAlarms([
					{
						alert: 'memoryUsingRate',
						description: '内存使用率'
					},
					{
						alert: 'CPUUsingRate',
						description: 'CPU使用率'
					}
				]);
				setAlarmRules([{}]);
			} else {
				getCanUse(clusterId, namespace, middlewareName, type);
			}
		}
		getClusters().then((res) => {
			// console.log(res.data);
			if (!res.data) return;
			setPoolList(res.data);
			setSystemId(res.data[0].id);
		});
		getUsers().then((res) => {
			// console.log(res);
			if (!res.data) return;
			const user = [];
			res.data.userBy &&
				res.data.userBy.length &&
				res.data.userBy.find((item) => item.email) &&
				setSelectUser(
					res.data.userBy
						.filter((item) => item.email)
						.map((item) => item.userId)
				);
			res.data.userBy &&
				res.data.userBy.length &&
				res.data.users.map((item) => {
					res.data.userBy.map((arr) => {
						arr.email &&
							item.userId === arr.userId &&
							user.push(item);
					});
				});
			setIsReady(true);
			setInsertUser(user);
			setUsers(
				res.data.users.map((item, index) => {
					return {
						...item,
						value: item.userId,
						key: item.userId,
						disabled: !item.email,
						label:
							item.email +
							item.phone +
							item.userName +
							item.aliasName
					};
				})
			);
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

	const handleChange = (value, data, extra) => {
		// console.log(value, data, extra);
		setInsertUser(data);
	};

	const transferRender = (item) => {
		return item.email ? (
			<span
				key={item.id}
				style={{ width: '445px', overflowX: 'auto' }}
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
			</span>
		) : (
			<Tooltip
				trigger={
					<span
						key={item.id}
						style={{ width: '445px', overflowX: 'auto' }}
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
					</span>
				}
				align="t"
			>
				用户邮箱为空，不可选择
			</Tooltip>
		);
	};

	useEffect(() => {
		return () => storage.removeSession('alarm');
	}, []);

	const onCreate = (value) => {
		if (alarmType === 'system') {
			const sendData = {
				url: {
					clusterId: systemId
				},
				data: value
			};
			if (record) {
				updateAlarm(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '告警规则修改成功')
						);
						window.history.back();
						storage.setLocal(
							'backKey',
							alarmType === 'system'
								? 'highAvailability'
								: 'alarm'
						);
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
						storage.setLocal(
							'backKey',
							alarmType === 'system'
								? 'highAvailability'
								: 'alarm'
						);
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		} else {
			const sendData = {
				url: {
					clusterId: clusterId,
					middlewareName: middlewareName,
					namespace: namespace
				},
				data: value
			};
			if (record) {
				updateAlarms(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '告警规则修改成功')
						);
						window.history.back();
						storage.setLocal(
							'backKey',
							alarmType === 'system'
								? 'highAvailability'
								: 'alarm'
						);
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
						storage.setLocal(
							'backKey',
							alarmType === 'system'
								? 'highAvailability'
								: 'alarm'
						);
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		}
		if (dingChecked && !mailChecked) {
			insertDing([]).then((res) => {
				if (!res.success) return;
			});
		} else if (dingChecked && mailChecked) {
			insertDing(insertUser).then((res) => {
				if (!res.success) return;
			});
		} else {
			sendInsertUser(insertUser).then((res) => {
				if (!res.success) return;
			});
		}
	};

	const onOk = () => {
		const flag = alarmRules.map((item) => {
			if (
				item.alert &&
				item.alertTimes &&
				item.alertTime &&
				item.symbol &&
				item.threshold &&
				item.severity &&
				item.silence &&
				item.content
			) {
				return true;
			} else {
				return false;
			}
		});
		if (isRule) {
			Message.show(messageConfig('error', '失败', '监控项不符合规则'));
			return;
		}
		if (alarmType === 'system') {
			const data = alarmRules.map((item) => {
				item.labels = { ...item.labels, severity: item.severity };
				if (record) {
					item.annotations = {
						...record.annotations,
						message: item.content
					};
				} else {
					item.annotations = {
						message: item.content
					};
				}
				item.lay = 'system';
				record ? (item.enable = record.enable) : (item.enable = 0);
				dingChecked ? (item.ding = 'ding') : (item.ding = '');
				mailChecked ? (item.mail = 'mail') : (item.mail = '');
				return item;
			});
			if (systemId) {
				if (flag[0]) {
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
				item.labels = { ...item.labels, severity: item.severity };
				item.lay = 'service';
				item.enable = 0;
				dingChecked ? (item.ding = 'ding') : (item.ding = '');
				mailChecked ? (item.mail = 'mail') : (item.mail = '');
				return item;
			});
			if (flag[0]) {
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
					record
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
							storage.setLocal(
								'backKey',
								alarmType === 'system'
									? 'highAvailability'
									: 'alarm'
							);
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
							disabled={record}
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
												placeholder="CPU使用率"
												style={{
													marginRight: 8,
													width: '100%'
												}}
												value={item.alert}
											>
												{alarms &&
													alarms.map((i) => {
														return (
															<Option
																key={i.alert}
																value={i.alert}
															>
																{i.description}
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
															key={i}
															value={i}
														>
															{i}
														</Option>
													);
												})}
											</Select>
											<Input
												style={{ width: '30%' }}
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
												state={
													(Number(item.alertTime) >
														1440 ||
														Number(item.alertTime) <
															1) &&
													'error'
												}
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
												state={
													(Number(item.alertTimes) >
														1000 ||
														Number(
															item.alertTimes
														) < 1) &&
													'error'
												}
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
											<Button>
												<CustomIcon
													type="icon-fuzhi1"
													size={12}
													style={{ color: '#0064C8' }}
													onClick={() =>
														setCopyIndex(index)
													}
												/>
											</Button>
											<Button
												disabled={record}
												onClick={() => addAlarm()}
											>
												<Icon
													type="plus"
													style={{ color: '#0064C8' }}
												/>
											</Button>
											{index !== 0 && (
												<Button
													onClick={() =>
														delAlarm(item.id)
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
					<Checkbox
						label="邮箱"
						style={{ margin: '0 30px 0 20px' }}
						checked={mailChecked}
						onChange={(checked) => setMailChecked(checked)}
						disabled={mailDisabled}
					/>
					<Checkbox
						label="钉钉"
						checked={dingChecked}
						onChange={(checked) => setDingChecked(checked)}
						disabled={dingDisabled}
					/>
				</div>
				{mailChecked && isReady && (
					<div className="transfer">
						<div className="transfer-header">
							<p className="transfer-title left">用户管理</p>
							<p className="transfer-title">用户管理</p>
						</div>
						{console.log(selectUser)}
						<Transfer
							showSearch
							searchPlaceholder="请输入登录用户、用户名、邮箱、手机号搜索"
							defaultValue={selectUser}
							mode="simple"
							titles={[
								<div key="left">
									<span key="account">登陆账户</span>
									<span key="username">用户名</span>
									<span key="email">邮箱</span>
									<span key="tel">手机号</span>
								</div>,
								<div key="right">
									<span key="account">登陆账户</span>
									<span key="username">用户名</span>
									<span key="email">邮箱</span>
									<span key="tel">手机号</span>
								</div>
							]}
							dataSource={users}
							itemRender={transferRender}
							onChange={handleChange}
						/>
					</div>
				)}
				<div style={{ padding: '16px 9px' }}>
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
							storage.setLocal(
								'backKey',
								alarmType === 'system'
									? 'highAvailability'
									: 'alarm'
							);
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
