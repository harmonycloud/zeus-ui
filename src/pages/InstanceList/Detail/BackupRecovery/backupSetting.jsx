import React, { useEffect } from 'react';
import {
	Dialog,
	Form,
	Field,
	NumberPicker,
	Checkbox,
	TimePicker
} from '@alicloud/console-components';
import moment from 'moment';

const formItemLayout = {
	labelCol: {
		span: 6
	},
	wrapperCol: {
		span: 14
	}
};
const list = [
	{ value: 1, label: '星期一' },
	{ value: 2, label: '星期二' },
	{ value: 3, label: '星期三' },
	{ value: 4, label: '星期四' },
	{ value: 5, label: '星期五' },
	{ value: 6, label: '星期六' },
	{ value: 0, label: '星期日' }
];
const listMap = {
	星期一: 1,
	星期二: 2,
	星期三: 3,
	星期四: 4,
	星期五: 5,
	星期六: 6,
	星期日: 0
};
const { Group: CheckboxGroup } = Checkbox;
export default function BackupSetting({ visible, onCreate, onCancel, data }) {
	const field = Field.useField();
	console.log(data);
	const onOk = () => {
		field.validate((error, values) => {
			if (!error) {
				onCreate(values);
			}
		});
	};
	useEffect(() => {
		if (data.pause === 'off') {
			const arr = data.time.split(':');
			const obj = {
				hour: arr[0],
				minute: arr[1]
			};
			field.setValues({
				count: data.limitRecord,
				cycle: data.cycle.split(',').map((item) => listMap[item]),
				time: moment(obj)
			});
		}
	}, [data]);

	return (
		<Dialog
			title="备份设置"
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
			onClose={onCancel}
			footerAlign="right"
		>
			<Form {...formItemLayout} field={field} labelAlign="top">
				<Form.Item
					label="备份保留个数"
					required
					requiredMessage="备份保留个数不能为空"
					min={1}
					minmaxLengthMessage="备份保留个数最小值为1"
				>
					<NumberPicker
						min={1}
						defaultValue={1}
						type="inline"
						name="count"
					/>
				</Form.Item>
				<Form.Item
					label="备份周期"
					required
					requiredMessage="备份周期不能为空！"
				>
					<CheckboxGroup name="cycle" dataSource={list} />
				</Form.Item>
				<Form.Item
					label="备份时间"
					required
					requiredMessage="备份时间不能为空"
				>
					<TimePicker name="time" minuteStep={30} format="HH:mm" />
				</Form.Item>
			</Form>
		</Dialog>
	);
}
