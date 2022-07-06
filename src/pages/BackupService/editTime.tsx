import * as React from 'react';
import { useState, useEffect } from 'react';
import { Modal, Form, Checkbox, TimePicker } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { list } from '@/utils/const';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import moment from 'moment';

const CheckboxGroup = Checkbox.Group;

interface editTimeProps {
	visible: boolean;
	onCreate: (cron: string) => void;
	onCancel: () => void;
	data: any;
}

function EditTime(props: editTimeProps): JSX.Element {
	const { visible, onCreate, onCancel, data } = props;
	const [form] = Form.useForm();
	const [checks, setChecks] = useState<number[]>();
	const [allChecked, setAllChecked] = useState<boolean>();

	useEffect(() => {
		if (data.cron) {
			const cron =
				data.cron.indexOf('? ?') !== -1
					? data.cron.split(' ? ? ')
					: data.cron.split(' * * ');
			data &&
				setChecks(
					cron[1].split(',').map((item: string) => Number(item))
				);
			data &&
				cron[1]
					.split(',')
					.map((item: string) => Number(item))
					.join(',') === '0,1,2,3,4,5,6' &&
				setAllChecked(true);
			data &&
				form.setFieldsValue({
					cycle: cron[1]
						.split(',')
						.map((item: string) => Number(item)),
					time: moment(
						cron[0]
							.split(' ')
							.reverse()
							.map((item: string) =>
								item.length === 1 ? '0' + item : item
							)
							.join(':'),
						'HH:mm'
					)
				});
		}
	}, []);

	return (
		<Modal
			title={'修改时间'}
			visible={visible}
			onOk={() => {
				const minute = moment(form.getFieldsValue().time).get('minute');
				const hour = moment(form.getFieldsValue().time).get('hour');
				const week = form.getFieldsValue().cycle?.join(',');
				const cron = `${minute} ${hour} ? ? ${week}`;
				onCreate(cron);
			}}
			onCancel={onCancel}
			width={720}
		>
			<Form form={form} style={{ marginTop: '24px' }} labelAlign="left">
				<Form.Item label="备份周期" className="check-form" required>
					<Form.Item>
						<Checkbox
							style={{ marginRight: '12px' }}
							onChange={(value: CheckboxChangeEvent) => {
								value.target.checked
									? setChecks([0, 1, 2, 3, 4, 5, 6])
									: setChecks([]);
								value.target.checked
									? form.setFieldsValue({
											cycle: [0, 1, 2, 3, 4, 5, 6]
									  })
									: form.setFieldsValue({
											cycle: []
									  });
								form.validateFields(['cycle']);
								setAllChecked(value.target.checked);
							}}
							checked={allChecked}
						>
							全选
						</Checkbox>
					</Form.Item>
					<Form.Item
						name="cycle"
						rules={[
							{
								required: true,
								message: '备份周期不能为空！'
							}
						]}
					>
						<CheckboxGroup
							options={list}
							value={checks}
							onChange={(value: CheckboxValueType[]) => {
								setChecks(value as number[]);
								(value as number[])
									.sort((a: number, b: number) => a - b)
									.join(',') === '0,1,2,3,4,5,6'
									? setAllChecked(true)
									: setAllChecked(false);
							}}
						/>
					</Form.Item>
				</Form.Item>
				<Form.Item
					label="备份时间"
					name="time"
					rules={[
						{
							required: true,
							message: '备份时间不能为空'
						}
					]}
				>
					<TimePicker
						showNow={false}
						// minuteStep={30}
						format="HH:mm"
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
}

export default EditTime;
