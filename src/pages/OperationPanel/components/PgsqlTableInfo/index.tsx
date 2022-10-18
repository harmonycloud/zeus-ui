import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Select } from 'antd';
import { formItemLayout618 } from '@/utils/const';
import { PgsqlTableInfoProps } from '../../index.d';

export default function PgsqlTableInfo(
	props: PgsqlTableInfoProps
): JSX.Element {
	const { isEdit, handleChange } = props;
	const [form] = Form.useForm();
	useEffect(() => {
		if (isEdit) {
			// TODO 编辑回显
		}
	}, [isEdit]);
	const onValuesChange = (changedValues: any, allValues: any) => {
		handleChange(allValues);
	};
	return (
		<Form
			style={{ width: '60%' }}
			form={form}
			labelAlign="left"
			onValuesChange={onValuesChange}
			{...formItemLayout618}
		>
			<Form.Item
				label="表名"
				name="tableName"
				rules={[
					{ required: true, message: '请输入表名' },
					{ max: 100, type: 'string', message: '表名长度不超过100' }
				]}
			>
				<Input placeholder="请输入表名" />
			</Form.Item>
			<Form.Item
				label="所有者"
				name="owner"
				rules={[{ required: true, message: '请选择所有者' }]}
			>
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
