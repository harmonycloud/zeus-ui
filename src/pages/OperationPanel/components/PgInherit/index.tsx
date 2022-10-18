import React from 'react';
import { Form, Select } from 'antd';
import { formItemLayout618 } from '@/utils/const';
export default function PgInherit(): JSX.Element {
	const [form] = Form.useForm();
	return (
		<Form
			style={{ width: '60%' }}
			form={form}
			labelAlign="left"
			{...formItemLayout618}
		>
			<Form.Item label="模式" name="mode">
				<Select options={[]} />
			</Form.Item>
			<Form.Item label="表明（多选）">
				<Select options={[]} mode="multiple" />
			</Form.Item>
		</Form>
	);
}
