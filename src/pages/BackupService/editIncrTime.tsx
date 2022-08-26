import * as React from 'react';
import { useState, useEffect } from 'react';
import { Modal, Form, Checkbox, TimePicker, Select, InputNumber } from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { list } from '@/utils/const';
import { CheckboxValueType } from 'antd/lib/checkbox/Group';
import moment from 'moment';

const CheckboxGroup = Checkbox.Group;

interface editTimeProps {
	visible: boolean;
	onCreate: (cron: any) => void;
	onCancel: () => void;
	data: any;
	type: string;
}

function EditIncrTime(props: editTimeProps): JSX.Element {
	const { visible, onCreate, onCancel, data, type } = props;
	const [form] = Form.useForm();

	return (
		<Modal
			title={data.increment ? '开启增量备份' : '修改增量备份间隔时间'}
			visible={visible}
			onOk={onCreate}
			forceRender
			onCancel={onCancel}
		>
			<Form form={form} style={{ marginTop: '24px' }} labelAlign="left">
				<Form.Item
					label="增量备份间隔时间"
					name="pause"
					rules={[
						{
							required: true,
							message: '请选择增量备份间隔时间'
						}
					]}
					extra="分/次"
					className="pause-extra"
				>
					<Select
						style={{
							width: 150,
							marginRight: 8
						}}
					>
						<Select.Option key="10" value={'10'}>
							10
						</Select.Option>
						分/次
					</Select>
				</Form.Item>
			</Form>
		</Modal>
	);
}

export default EditIncrTime;
