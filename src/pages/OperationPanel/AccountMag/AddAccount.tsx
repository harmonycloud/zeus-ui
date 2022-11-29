import React from 'react';
import { Modal, Form, Input, Checkbox, notification } from 'antd';
import {
	AddAccountProps,
	mysqlCreateUserParamsProps,
	pgsqlCreateUserParamsProps
} from '../index.d';
import { formItemLayout618 } from '@/utils/const';
import { createUsers } from '@/services/operatorPanel';
// TODO 账号名和密码的正则校验确认
export default function AddAccount(props: AddAccountProps): JSX.Element {
	const {
		open,
		onCancel,
		clusterId,
		namespace,
		middlewareName,
		type,
		onRefresh
	} = props;
	const [form] = Form.useForm();
	const onOk = () => {
		form.validateFields().then((values) => {
			console.log(values);
			const mysqlSendData: mysqlCreateUserParamsProps = {
				clusterId,
				namespace,
				middlewareName,
				type,
				...values
			};
			const pgsqlSendData: pgsqlCreateUserParamsProps = {
				clusterId,
				namespace,
				middlewareName,
				type,
				username: values.user,
				password: values.password,
				inherit: values.grantAble
			};
			const sendData = type === 'mysql' ? mysqlSendData : pgsqlSendData;
			onCancel();
			createUsers(sendData)
				.then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '用户创建成功!'
						});
					} else {
						notification.error({
							message: '失败',
							description: (
								<>
									<p>{res.errorMsg}</p>
									<p>{res.errorDetail}</p>
								</>
							)
						});
					}
				})
				.finally(() => {
					onRefresh();
				});
		});
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
					name="user"
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
					label="授权权限"
					name="grantAble"
					initialValue={true}
					valuePropName="checked"
				>
					<Checkbox />
				</Form.Item>
			</Form>
		</Modal>
	);
}
