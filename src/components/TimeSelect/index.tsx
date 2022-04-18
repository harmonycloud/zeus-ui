import React, { useState } from 'react';
import { CascaderSelect, Select, Grid } from '@alicloud/console-components';
import { DatePicker } from '@alicloud/console-components';
import moment, { Moment } from 'moment';
import { timeSelectDataSource } from '@/utils/const';
import { TimeSelectProps } from './timeSelect';
import './index.scss';

const { Option } = Select;
const { Row, Col } = Grid;

export default function TimeSelect(props: TimeSelectProps): JSX.Element {
	const { RangePicker } = DatePicker;
	const { timeSelect, source = 'default', style = {} } = props;
	const [isSelect, setIsSelect] = useState<boolean>(false);
	const [startTime, setStartTime] = useState<Moment>(
		moment().subtract(1, 'hours')
	);
	const [endTime, setEndTime] = useState<Moment>(moment());
	const [timeQuantum, setTimeQuantum] = useState<string>('');

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
		const number = value.split('-')[0];
		const unit = value.split('-')[1];
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
							hasBorder={false}
						>
							<Option value={false}>日期选择</Option>
							<Option value={true}>时间段</Option>
						</Select>
						<CascaderSelect
							listStyle={{ width: '50%' }}
							style={{ width: '100%' }}
							dataSource={timeSelectDataSource}
							onChange={handleChange}
							value={timeQuantum}
						/>
					</div>
				) : (
					<div id="timepicker" style={style}>
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
									hasBorder={false}
								>
									<Option value={false}>日期选择</Option>
									<Option value={true}>时间段</Option>
								</Select>
							</Col>
							<Col span={19} style={{ marginLeft: 13 }}>
								<CascaderSelect
									style={{ width: '100%' }}
									dataSource={timeSelectDataSource}
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
									hasBorder={false}
								>
									<Option value={false}>日期选择</Option>
									<Option value={true}>时间段</Option>
								</Select>
							</Col>
							<Col span={19} style={{ marginLeft: 13 }}>
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
