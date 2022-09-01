import * as React from 'react';
import { useState, useEffect } from 'react';
import { Modal, Form, Select } from 'antd';
import { minutes } from '@/utils/const';

interface editTimeProps {
	visible: boolean;
	onCreate: (time: string) => void;
	onCancel: () => void;
	data: any;
	type: string;
}

function EditIncrTime(props: editTimeProps): JSX.Element {
	const { visible, onCreate, onCancel, data, type } = props;
	const [form] = Form.useForm();

	useEffect(() => {
		form.setFieldsValue({
			time: data.time.substring(0, data.time.length - 1)
		});
	}, []);

	return (
		<Modal
			title={type === 'add' ? '开启增量备份' : '修改增量备份间隔时间'}
			visible={visible}
			onOk={() =>
				form.validateFields().then((values) => {
					const sendData: any = {
						cron: data.cron,
						dateUnit: data.dateUnit,
						increment: data.increment,
						retentionTime: data.retentionTime[0],
						time: values.time + 'm'
					};
					onCreate(sendData);
				})
			}
			forceRender
			onCancel={onCancel}
		>
			<Form form={form} style={{ marginTop: '24px' }} labelAlign="left">
				<Form.Item
					label="增量备份间隔时间"
					name="time"
					rules={[
						{
							required: true,
							message: '请选择增量备份间隔时间'
						}
					]}
					extra="分/次"
					initialValue={data.time}
					className="pause-extra"
				>
					<Select
						style={{
							width: 150,
							marginRight: 8
						}}
					>
						{minutes.map((item) => {
							return (
								<Select.Option key={item} value={item}>
									{item}
								</Select.Option>
							);
						})}
						分/次
					</Select>
				</Form.Item>
			</Form>
		</Modal>
	);
}

export default EditIncrTime;
