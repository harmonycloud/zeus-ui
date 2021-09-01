import React, { useEffect, useState } from 'react';
import { CascaderSelect, Select, Grid } from '@alicloud/console-components';
import { DatePicker } from '@alicloud/console-components';
import moment from 'moment';
const { Option } = Select;
const { Row, Col } = Grid;

export default function TimeSelect(props) {
	const { RangePicker } = DatePicker;
	const {
		timeSelect,
		align = 'right',
		onRefresh = () => {},
		source = 'default',
		style = {}
	} = props;
	const [isSelect, setIsSelect] = useState(false);
	const [startTime, setStartTime] = useState(moment().subtract(1, 'hours'));
	const [endTime, setEndTime] = useState(moment());
	const [timeQuantum, setTimeQuantum] = useState('');
	const onChange = (value) => {
		setStartTime(value[0]);
		setEndTime(value[1]);
	};
	const onRangeOk = (value) => {
		setStartTime(value[0]);
		setEndTime(value[1]);
		timeSelect(value);
	};

	const dataSource = [
		{
			value: '1',
			label: '1',
			children: [
				{ value: '1-minutes', label: '分钟' },
				{ value: '1-hours', label: '小时' },
				{ value: '1-days', label: '天' }
			]
		},

		{
			value: '3',
			label: '3',
			children: [
				{ value: '3-minutes', label: '分钟' },
				{ value: '3-hours', label: '小时' },
				{ value: '3-days', label: '天' }
			]
		},
		{
			value: '5',
			label: '5',
			children: [
				{ value: '5-minutes', label: '分钟' },
				{ value: '5-hours', label: '小时' },
				{ value: '5-days', label: '天' }
			]
		},
		{
			value: '7',
			label: '7',
			children: [
				{ value: '7-minutes', label: '分钟' },
				{ value: '7-hours', label: '小时' },
				{ value: '7-days', label: '天' }
			]
		},
		{
			value: '15',
			label: '15',
			children: [
				{ value: '15-minutes', label: '分钟' },
				{ value: '15-hours', label: '小时' },
				{ value: '15-days', label: '天' }
			]
		},
		{
			value: '30',
			label: '30',
			children: [
				{ value: '30-minutes', label: '分钟' },
				{ value: '30-hours', label: '小时' },
				{ value: '30-days', label: '天' }
			]
		}
	];
	const handleChange = (value) => {
		setTimeQuantum(value);
		const number = value.split('-')[0];
		const unit = value.split('-')[1];
		setStartTime(moment().subtract(number, unit));
		setEndTime(moment());
		timeSelect([moment().subtract(number, unit), moment()]);
	};
	const onTypeChange = (value) => {
		console.log(value);
		setIsSelect(value);
		if (value === false) {
			onRefresh();
		}
		setTimeQuantum('');
		setStartTime(moment().subtract(1, 'hours'));
		setEndTime(moment());
	};
	useEffect(() => {}, []);
	if (source === 'default') {
		return (
			<>
				{isSelect === true ? (
					<div id="timepicker" align={align} style={style}>
						<Select
							onChange={onTypeChange}
							defaultValue={isSelect}
							hasBorder={false}
						>
							<Option value={false}>日期选择</Option>
							<Option value={true}>时间段</Option>
						</Select>
						<CascaderSelect
							style={{ width: 332 }}
							dataSource={dataSource}
							onChange={handleChange}
							value={timeQuantum}
						/>
					</div>
				) : (
					<div id="timepicker" align={align} style={style}>
						<Select
							onChange={onTypeChange}
							defaultValue={isSelect}
							hasBorder={false}
						>
							<Option value={false}>日期选择</Option>
							<Option value={true}>时间段</Option>
						</Select>
						<RangePicker
							showTime
							onChange={onChange}
							onOk={onRangeOk}
							style={{ width: 332 }}
							value={[startTime, endTime]}
						/>
					</div>
				)}
			</>
		);
	} else {
		return (
			<>
				{isSelect ? (
					<div id="timepicker" className="timepicker-filter-item">
						<Row>
							<Col span={6} style={{ marginLeft: -13 }}>
								<Select
									onChange={onTypeChange}
									defaultValue={isSelect}
									hasBorder={false}
								>
									<Option value={false}>日期选择</Option>
									<Option value={true}>时间段</Option>
								</Select>
							</Col>
							<Col span={16} style={{ marginLeft: 13 }}>
								<CascaderSelect
									style={{ width: '100%' }}
									dataSource={dataSource}
									onChange={handleChange}
									value={timeQuantum}
								/>
							</Col>
						</Row>
					</div>
				) : (
					<div id="timepicker" className="timepicker-filter-item">
						<Row>
							<Col span={6} style={{ marginLeft: -13 }}>
								<Select
									onChange={onTypeChange}
									defaultValue={isSelect}
									hasBorder={false}
								>
									<Option value={false}>日期选择</Option>
									<Option value={true}>时间段</Option>
								</Select>
							</Col>
							<Col span={16} style={{ marginLeft: 13 }}>
								<RangePicker
									showTime
									onChange={onChange}
									onOk={onRangeOk}
									style={{ width: '100%' }}
									value={[startTime, endTime]}
								/>
							</Col>
						</Row>
					</div>
				)}
			</>
		);
	}
}
