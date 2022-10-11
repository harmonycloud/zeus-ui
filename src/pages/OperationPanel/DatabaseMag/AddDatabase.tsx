import { formItemLayout618 } from '@/utils/const';
import { Modal, Form, Input, Select } from 'antd';
import React from 'react';
import { AddDatabaseProps } from '../index.d';

export default function AddDatabase(props: AddDatabaseProps): JSX.Element {
	const { open, onCancel } = props;
	const [form] = Form.useForm();
	const onOk = () => {
		console.log('click ok');
	};
	return (
		<Modal
			open={open}
			title="新增"
			onCancel={onCancel}
			onOk={onOk}
			width={500}
		>
			<Form form={form} labelAlign="left" {...formItemLayout618}>
				<Form.Item required label="数据库名" name="name">
					<Input placeholder="请输入数据库名称" />
				</Form.Item>
				<Form.Item required label="字符集" name="characterSet">
					<Select options={[]} placeholder="请选择字符集" />
				</Form.Item>
				<Form.Item required label="校验规则" name="rules">
					<Select options={[]} placeholder="请选择校验规则" />
				</Form.Item>
			</Form>
		</Modal>
	);
}
