import { formItemLayout618 } from '@/utils/const';
import { Form, Input, InputNumber, Select } from 'antd';
import React from 'react';

export default function PgsqlTableInfo(): JSX.Element {
	const [form] = Form.useForm();

	return (
		<Form
			style={{ width: '60%' }}
			form={form}
			labelAlign="left"
			{...formItemLayout618}
		>
			<Form.Item label="表名" name="tableName">
				<Input placeholder="请输入表名" />
			</Form.Item>
			<Form.Item label="所有者" name="owner">
				<Select placeholder="请选择所有者" options={[]} />
			</Form.Item>
			<Form.Item label="模式" name="mode">
				<Select placeholder="请选择模式" options={[]} />
			</Form.Item>
			<Form.Item label="表空间" name="tableSpace">
				<Select placeholder="请选择表空间" options={[]} />
			</Form.Item>
			<Form.Item label="填充率" name="fillingRate" initialValue={100}>
				<InputNumber style={{ width: '100%' }} />
			</Form.Item>
			<Form.Item label="备注" name="remark">
				<Input.TextArea placeholder="请输入" rows={3} />
			</Form.Item>
		</Form>
	);
}
