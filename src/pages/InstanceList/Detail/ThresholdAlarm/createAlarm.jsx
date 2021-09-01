import React, { useState, useEffect } from 'react';
import {
	Dialog,
	Icon,
	Input,
	Message,
	Select
} from '@alicloud/console-components';
import { getCanUseAlarms } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';

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
export default function CreateAlarm(props) {
	const {
		visible,
		onCreate,
		onCancel,
		clusterId,
		namespace,
		middlewareName,
		type
	} = props;
	const [alarms, setAlarms] = useState([]);
	const [alarmRules, setAlarmRules] = useState([]);
	const [silence, setSilence] = useState(silences[0].value);

	useEffect(() => {
		getCanUse(clusterId, namespace, middlewareName, type);
	}, [props]);

	const getCanUse = (clusterId, namespace, middlewareName, type) => {
		const sendData = {
			clusterId,
			namespace,
			middlewareName,
			type
		};
		getCanUseAlarms(sendData).then((res) => {
			console.log(res);
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
					item.symbol = filterItem[0].symbol;
					item.threshold = filterItem[0].threshold;
					item.time = filterItem[0].time;
					item.type = filterItem[0].type;
					item.unit = filterItem[0].unit;
					return item;
				} else {
					return item;
				}
			});
			setAlarmRules(list);
		} else if (type === 'time') {
			const list = alarmRules.map((item) => {
				if (item.id === record.id) {
					item.time = value;
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
			setSilence(value);
		}
	};

	const onOk = () => {
		const list = alarmRules.map((item) => {
			item.silence = silence;
			return item;
		});
		const flag = alarmRules.every((item) => {
			if (item.threshold !== null) {
				return true;
			} else {
				return false;
			}
		});
		if (flag) {
			console.log(list);
			onCreate(list);
		} else {
			Message.show(
				messageConfig('error', '失败', '存在监控项缺少阈值！')
			);
		}
	};

	const addAlarm = () => {
		if (alarms && alarms.length > 0) {
			const addItem = alarms[0];
			setAlarmRules([
				...alarmRules,
				{ ...addItem, id: Math.random() * 100 }
			]);
		}
	};
	const delAlarm = (i) => {
		console.log(i);
		const list = alarmRules.filter((item) => item.id !== i);
		setAlarmRules(list);
	};

	return (
		<Dialog
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
			onClose={onCancel}
			title="创建报警规则"
			style={{ width: 880 }}
			footerAlign="right"
			shouldUpdatePosition={true}
		>
			{alarmRules &&
				alarmRules.map((item, index) => {
					return (
						<div key={item.id}>
							<div className="create-alarm-form-layout">
								<label className="ne-required">规则描述</label>
								<Select
									onChange={(value) =>
										onChange(value, item, 'alert')
									}
									style={{ width: 300, marginRight: 8 }}
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
								<Select
									onChange={(value) =>
										onChange(value, item, 'time')
									}
									style={{ width: 150, marginRight: 8 }}
									value={item.time}
								>
									{times.map((i) => {
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
								<Select
									onChange={(value) =>
										onChange(value, item, 'symbol')
									}
									style={{ width: 62, marginRight: 8 }}
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
									onChange={(value) =>
										onChange(value, item, 'threshold')
									}
									style={{ width: 71, marginRight: 8 }}
								/>
								{item.unit}
								{index !== 0 && (
									<div
										className="name-link create-alarm-form-del"
										onClick={() => delAlarm(item.id)}
									>
										删除
									</div>
								)}
							</div>
							<hr className="create-alarm-form-hr" />
						</div>
					);
				})}
			<div className="create-alarm-content" onClick={addAlarm}>
				<Icon type="add" size="small" style={{ color: '#0064C8' }} />
				<div className="create-alarm-text">添加报警规则</div>
			</div>
			<div className="create-alarm-form-layout">
				<label>通道沉默周期:</label>
				<Select
					style={{ width: 155 }}
					value={silence}
					onChange={(value) => onChange(value, {}, 'silence')}
				>
					{silences.map((item) => {
						return (
							<Option key={item.value} value={item.value}>
								{item.label}
							</Option>
						);
					})}
					<Option value="10m">10分钟</Option>
				</Select>
			</div>
		</Dialog>
	);
}
