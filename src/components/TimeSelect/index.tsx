import React, { useState } from 'react';
import { Cascader, Select, Row, Col, DatePicker } from 'antd';
import moment from 'moment';
import { timeSelectDataSource } from '@/utils/const';
import { TimeSelectProps } from './timeSelect';
import './index.scss';

const { Option } = Select;

export default function TimeSelect(props: TimeSelectProps): JSX.Element {
	const { RangePicker } = DatePicker;
	const { timeSelect, source = 'default', style = {} } = props;
	const [isSelect, setIsSelect] = useState<boolean>(false);
	const [startTime, setStartTime] = useState<any>(
		moment().subtract(1, 'hours')
	);
	const [endTime, setEndTime] = useState<any>(moment());
	const [timeQuantum, setTimeQuantum] = useState<any>();

	const onChange = (value: any) => {
		setStartTime(value[0]);
		setEndTime(value[1]);
	};
	const onRangeOk = (value: any[]) => {
		setStartTime(value[0]);
		setEndTime(value[1]);
		timeSelect(value);
	};

	const handleChange = (value: any) => {
		setTimeQuantum(value);
		const number = value[1].split('-')[0];
		const unit = value[1].split('-')[1];
		setStartTime(moment().subtract(number, unit));
		setEndTime(moment());
		timeSelect([moment().subtract(number, unit), moment()]);
	};
	const onTypeChange = (value: boolean) => {
		setIsSelect(value);
		setTimeQuantum('');
		setStartTime(moment().subtract(1, 'hours'));
		setEndTime(moment());
	};
	if (source === 'default') {
		return (
			<>
				{isSelect === true ? (
					<div id="timepicker" style={style}>
						<Select
							onChange={onTypeChange}
							defaultValue={isSelect}
							bordered={false}
						>
							<Option value={false}>日期选择</Option>
							<Option value={true}>时间段</Option>
						</Select>
						<Cascader
							style={{ width: '100%' }}
							options={timeSelectDataSource}
							onChange={handleChange}
							value={timeQuantum}
						/>
					</div>
				) : (
					<div id="timepicker" style={style}>
						<Select
							onChange={onTypeChange}
							defaultValue={isSelect}
							bordered={false}
						>
							<Option value={false}>日期选择</Option>
							<Option value={true}>时间段</Option>
						</Select>
						<RangePicker
							showTime
							onChange={onChange}
							style={{ width: '100%' }}
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
							<Col span={5} style={{ marginLeft: -13 }}>
								<Select
									onChange={onTypeChange}
									defaultValue={isSelect}
									bordered={false}
								>
									<Option value={false}>日期选择</Option>
									<Option value={true}>时间段</Option>
								</Select>
							</Col>
							<Col span={19} style={{ marginLeft: 13 }}>
								<Cascader
									style={{ width: '100%' }}
									options={timeSelectDataSource}
									onChange={handleChange}
									value={timeQuantum}
								/>
							</Col>
						</Row>
					</div>
				) : (
					<div id="timepicker" className="timepicker-filter-item">
						<Row>
							<Col span={5} style={{ marginLeft: -13 }}>
								<Select
									onChange={onTypeChange}
									defaultValue={isSelect}
									bordered={false}
								>
									<Option value={false}>日期选择</Option>
									<Option value={true}>时间段</Option>
								</Select>
							</Col>
							<Col span={19} style={{ marginLeft: 13 }}>
								<RangePicker
									showTime
									onChange={onChange}
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
