import React from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { AddAccountProps } from '../index.d';
import { formItemLayout618 } from '@/utils/const';

const { Option } = Select;
// TODO 新增和编辑表单复用
// TODO 账号名和密码的正则校验确认
// TODO 新增成功后的列表刷新
export default function AddAccount(props: AddAccountProps): JSX.Element {
	const { open, onCancel } = props;
	const [form] = Form.useForm();
	const onOk = () => {
		console.log('click ok');
	};
	return (
		<Modal
			open={open}
			onCancel={onCancel}
			onOk={onOk}
			title="新增"
			width={500}
		>
			<Form form={form} labelAlign="left" {...formItemLayout618}>
				<Form.Item
					label="账号名"
					name="account"
					rules={[{ required: true, message: '请填写账号名' }]}
				>
					<Input />
				</Form.Item>
				<Form.Item
					label="密码"
					name="password"
					rules={[{ required: true, message: '请填写密码' }]}
				>
					<Input.Password />
				</Form.Item>
				<Form.Item
					label="角色选择"
					name="role"
					rules={[{ required: true, message: '请选择角色' }]}
				>
					<Select>
						<Option value="admin">管理员</Option>
						<Option value="dba">DBA</Option>
						<Option value="operator">运维人员</Option>
						<Option value="normal">普通人员</Option>
					</Select>
				</Form.Item>
			</Form>
		</Modal>
	);
}
