import React from 'react';
import {
	Dialog,
	Form,
	Field,
	NumberPicker,
	Checkbox,
	TimePicker
} from '@alicloud/console-components';

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
const { Group: CheckboxGroup } = Checkbox;
export default function BackupSetting({ visible, onCreate, onCancel }) {
	const field = Field.useField();

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const onChange = () => {};

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const onCycleChange = () => {};

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	const onTimeChange = () => {};

	const onOk = () => {
		field.validate((error, values) => {
			if (!error) {
				onCreate(values);
			}
		});
	};

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
				>
					<NumberPicker
						type="inline"
						name="count"
						onChange={onChange}
					/>
				</Form.Item>
				<Form.Item
					label="备份周期"
					required
					requiredMessage="备份周期不能为空！"
				>
					<CheckboxGroup
						name="cycle"
						dataSource={list}
						onChange={onCycleChange}
					/>
				</Form.Item>
				<Form.Item
					label="备份时间"
					required
					requiredMessage="备份时间不能为空"
				>
					<TimePicker
						name="time"
						onChange={onTimeChange}
						minuteStep={30}
						format="HH:mm"
					/>
				</Form.Item>
			</Form>
		</Dialog>
	);
}
