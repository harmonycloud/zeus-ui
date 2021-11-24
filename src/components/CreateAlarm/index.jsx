import React, { useState, useEffect } from 'react';
import { Page, Header, Content } from '@alicloud/console-components-page';
import './index.scss';
import {
	Form,
	Select,
	Input,
	Table,
	Button,
	Grid,
	Icon,
	Checkbox
} from '@alicloud/console-components';
import { getClusters } from '@/services/common.js';
import CustomIcon from '../CustomIcon';
import { createAlarms } from '@/services/middleware';

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

function CreateAlarm(props) {
	const {
		visible,
		onCreate,
		onCancel,
		clusterId,
		namespace,
		middlewareName,
		type
	} = props;
	const [alarms, setAlarms] = useState([
		{
			alert: null,
			description: null
		}
	]);
	const [alarmRules, setAlarmRules] = useState([
		{
			alert: null,
			description: null
		}
	]);
	const [silence, setSilence] = useState(silences[0].value);
	const table = React.createRef();
	const [poolList, setPoolList] = useState([]);

	const onChange = (value, record, type) => {
		console.log(value, record);
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
		console.log(i);
		const list = alarmRules.filter((item) => item.id !== i);
		setAlarmRules(list);
	};

	useEffect(() => {
		getClusters().then((res) => {
			// console.log(res.data);
			if (!res.data) return;
			setPoolList(res.data);
		});
	}, []);

	return (
		<Page className="create-alarm">
			<Header
				title="新建告警规则"
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
				<h2>资源池选择</h2>
				<span className="ne-required" style={{ marginLeft: '10px' }}>
					选择资源池
				</span>
				<Select
					style={{
						width: '380px',
						marginLeft: '50px'
					}}
					// onChange={(value) => setType(value)}
				>
					{poolList.length &&
						poolList.map((item) => {
							return (
								<Select.Option value={item.id} key={item.id}>
									{item.name}
								</Select.Option>
							);
						})}
				</Select>
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
										<Input style={{ width: '57px' }} />
										<span className="info">%</span>
									</Col>
									<Col span={5}>
										<Input style={{ width: '46px' }} />
										<span className="info">分钟内触发</span>
										<Input
											style={{ width: '46px' }}
										></Input>
										<span className="info">次</span>
									</Col>
									<Col span={3}>
										<Select
											onChange={(value) =>
												onChange(value, item, 'symbol')
											}
											style={{ width: 62 }}
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
									</Col>
									<Col span={3}>
										<Select
											onChange={(value) =>
												onChange(value, item, 'symbol')
											}
											style={{ width: 117 }}
											value={item.symbol}
										>
											{times.map((i) => {
												return (
													<Option key={i} value={i}>
														{i}
													</Option>
												);
											})}
										</Select>
									</Col>
									<Col span={4}>
										<Input style={{ width: 188 }} />
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
					<Checkbox label="钉钉" style={{margin: '0 30px 0 20px'}} />
					<Checkbox label="邮箱" />
				</div>
			</Content>
		</Page>
	);
}

export default CreateAlarm;
