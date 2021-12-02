import React, { useState, useEffect } from 'react';
import { Page, Header, Content } from '@alicloud/console-components-page';
import {
	Select,
	Input,
	Button,
	Grid,
	Icon,
	Checkbox
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
import storage from '@/utils/storage';
import './index.scss';

const { Row, Col } = Grid;
const { Option } = Select;
const times = [
	{ label: '实时触发', value: '0s' },
	{ label: '持续30秒', value: '30s' },
	{ label: '持续1分钟', value: '1m' },
	{ label: '持续2分钟', value: '2m' },
	{ label: '持续5分钟', value: '5m' },
	{ label: '持续15分钟', value: '15m' },
	{ label: '持续30分钟', value: '30m' }
];
const symbols = ['>=', '>', '==', '<', '<=', '!='];
const silences = [
	{ value: '1m', label: '1分钟' },
	{ value: '5m', label: '5分钟' },
	{ value: '10m', label: '10分钟' },
	{ value: '30m', label: '30分钟' },
	{ value: '1h', label: '1小时' },
	{ value: '6h', label: '6小时' },
	{ value: '12h', label: '12小时' },
	{ value: '1d', label: '1天' },
	{ value: '3d', label: '3天' },
	{ value: '5d', label: '5天' },
	{ value: '1w', label: '1周' }
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
	const [silence, setSilence] = useState(silences[0].value);
	const [poolList, setPoolList] = useState([]);
	const [systemId, setSystemId] = useState();
	const [users, setUsers] = useState([]);
	const [insertUser, setInsertUser] = useState();
	const [selectUser, setSelectUser] = useState();
	const [mailChecked, setMailChecked] = useState(false);
	const [dingChecked, setDingChecked] = useState(false);

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
				if (res.data.length > 0) {
					const firstItem = res.data[0];
					firstItem.id = Math.random() * 100;
					setAlarmRules([firstItem]);
				} else {
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
			console.log(filterItem);
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

    const addAlarm = (index) => {
        if (alarms && alarms.length > 0) {
            const addItem = alarmRules[index];
            setAlarmRules([
                ...alarmRules,
                { ...addItem, id: Math.random() * 100 }
            ]);
        }
    };
    const delAlarm = (i) => {
        const list = alarmRules.filter((item) => item.id !== i);
        setAlarmRules(list);
    };

	useEffect(() => {
		if (record) {
			setAlarmRules([{ ...record, severity: record.labels.severity }]);
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
				setAlarmRules([
					{
						alert: 'CPUUsingRate',
						description: 'CPU使用率'
					}
				]);
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
		getUsers().then(async (res) => {
			// console.log(res);
			if (!res.data) return;
			setSelectUser(res.data.userBy.map((item) => item.id));
			setUsers(
				res.data.users.map((item, index) => {
					return {
						...item,
						value: item.id,
						key: item.id
					};
				})
			);
		});
	}, []);

	const handleChange = (value, data, extra) => {
		// console.log(value, data, extra)
		setInsertUser(data);
	};

	const transferRender = (item) => {
		return (
			<span>
				<span className="item-content">{item.userName}</span>
				<span className="item-content">{item.aliasName}</span>
				<span className="item-content">{item.email}</span>
				<span className="item-content">{item.phone}</span>
			</span>
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
                    } else {
                        Message.show(messageConfig('error', '失败', res));
                    }
                });
            }else{
                createAlarms(sendData).then((res) => {
                    if (res.success) {
                        Message.show(
                            messageConfig('success', '成功', '告警规则设置成功')
                        );
                    } else {
                        Message.show(messageConfig('error', '失败', res));
                    }
                });
            }
        }
        if (dingChecked && !mailChecked) {
            insertDing([]).then(res => {
                if (!res.success) return;
            })
        } else if (dingChecked && mailChecked) {
            insertDing(insertUser).then(res => {
                if (!res.success) return;
            })
        } else {
            sendInsertUser(insertUser).then(res => {
                if (!res.success) return;
            })
        }
    };

    const onOk = () => {
        const flag = alarmRules.every((item) => {
            if (item.threshold !== null) {
                return true;
            } else {
                return false;
            }
        });
        if (alarmType === 'system') {
            const data = alarmRules.map((item) => {
                item.labels = { ...item.labels, severity: item.severity };
                item.annotations = {
                    message: item.content
                }
                item.lay = 'system';
                item.enable = 0;
                delete item.severity;
                return item;
            });
            if (systemId) {
                if (flag) {
                    if (!mailChecked && !dingChecked) {
                        Message.show(
                            messageConfig('error', '失败', '请选择告警方式')
                        );
                    } else if ((mailChecked && dingChecked) || (mailChecked && !dingChecked)) {
                        if (insertUser) {
                            onCreate(data);
                        } else {
                            Message.show(
                                messageConfig('error', '失败', '请选择邮箱通知用户')
                            );
                        }
                    } else if (dingChecked) {
                        onCreate(data);
                    }
                } else {
                    Message.show(
                        messageConfig('error', '失败', '存在监控项缺少阈值')
                    );
                }
            } else {
                Message.show(
                    messageConfig('error', '失败', '请选择资源池')
                );
            }
        } else {
            const list = alarmRules.map((item) => {
                item.labels = { ...item.labels, severity: item.severity };
                item.lay = 'service';
                item.enable = 0;
                delete item.severity;
                return item;
            });
            if (flag) {
                if (!mailChecked && !dingChecked) {
                    Message.show(
                        messageConfig('error', '失败', '请选择告警方式')
                    );
                } else if ((mailChecked && dingChecked) || (mailChecked && !dingChecked)) {
                    if (insertUser) {
                        onCreate(list);
                    } else {
                        Message.show(
                            messageConfig('error', '失败', '请选择邮箱通知用户')
                        );
                    }
                } else if (dingChecked) {
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
				title={record ? "修改告警规则" : "新建告警规则"}
				hasBackArrow
				renderBackArrow={(elem) => (
					<span
						className="details-go-back"
						onClick={() => window.history.back()}
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
					</Col>
					<Col span={3}>
						<span>告警等级</span>
					</Col>
					<Col span={3}>
						<span>告警间隔</span>
					</Col>
					<Col span={4}>
						<span>告警内容描述</span>
					</Col>
					<Col span={2}>
						<span>告警操作</span>
					</Col>
				</Row>
				{alarmRules &&
					alarmRules.map((item, index) => {
						return (
							<div key={item.id}>
								<Row>
									<Col span={3}>
										<span className="ne-required"></span>
										<Select
											onChange={(value) =>
												onChange(value, item, 'alert')
											}
											placeholder="CPU使用率"
											style={{ marginRight: 8 }}
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
												onChange(value, item, 'symbol')
											}
											style={{
												width: 83,
												minWidth: 'auto'
											}}
											placeholder=">="
											autoWidth={true}
											value={item.symbol}
										>
											{symbols.map((i) => {
												return (
													<Option key={i} value={i}>
														{i}
													</Option>
												);
											})}
										</Select>
										<Input
											style={{ width: '57px' }}
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
											style={{ width: '46px' }}
											value={item.alertTime}
											onChange={(value) => {
												onChange(
													value,
													item,
													'alertTime'
												);
											}}
										/>
										<span className="info">分钟内触发</span>
										<Input
											style={{ width: '46px' }}
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
											style={{ width: 62 }}
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
												onChange(value, item, 'silence')
											}
											style={{ width: 117 }}
											value={item.silence}
										>
											{times.map((i) => {
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
									<Col span={4}>
										<Input
											style={{ width: 188 }}
											onChange={(value) =>
												onChange(value, item, 'content')
											}
											value={item.content}
										/>
									</Col>
									<Col span={2}>
										<Button>
											<CustomIcon
												type="icon-fuzhi1"
												size={12}
												style={{ color: '#0064C8' }}
											/>
										</Button>
										<Button onClick={() => addAlarm(index)}>
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
													style={{ color: '#0064C8' }}
												/>
											</Button>
										)}
									</Col>
								</Row>
							</div>
						);
					})}
				<h2>告警通知</h2>
				<div className="users">
					<span
						className="ne-required"
						style={{ marginLeft: '10px' }}
					>
						通知方式
					</span>
					<Checkbox
						label="钉钉"
						style={{ margin: '0 30px 0 20px' }}
						onChange={(checked) => setDingChecked(checked)}
					/>
					<Checkbox
						label="邮箱"
						onChange={(checked) => setMailChecked(checked)}
					/>
				</div>
				{mailChecked && (
					<div className="transfer">
						<div className="transfer-header">
							<p className="transfer-title left">用户管理</p>
							<p className="transfer-title">用户管理</p>
						</div>
						<Transfer
							showSearch
							// defaultValue={selectUser}
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
							// defaultLeftChecked={selectUser}
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
					<Button>取消</Button>
				</div>
			</Content>
		</Page>
	);
}

export default CreateAlarm;