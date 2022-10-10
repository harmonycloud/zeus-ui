import React from 'react';
import { Modal, Form, Input, Checkbox } from 'antd';
import { AddAccountProps } from '../index.d';
import { formItemLayout618 } from '@/utils/const';
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
				<Form.Item label="授权权限" name="auth">
					<Checkbox checked={false} />
				</Form.Item>
			</Form>
		</Modal>
	);
}
