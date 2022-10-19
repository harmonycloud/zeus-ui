import { formItemLayout618 } from '@/utils/const';
import { Form, Input, Modal, notification, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { getList } from '@/services/serviceList';
import { authLogin } from '@/services/operatorPanel';
import { LoginConsoleProps } from '../index.d';
import {
	serviceListItemProps,
	serviceProps
} from '@/pages/ServiceList/service.list';
const { Option } = Select;
export default function LoginConsole(props: LoginConsoleProps): JSX.Element {
	const {
		open,
		onCancel,
		projectId,
		clusterId,
		namespace,
		middlewareName,
		middlewareType
	} = props;
	const [form] = Form.useForm();
	const [data, setData] = useState<serviceListItemProps>();
	useEffect(() => {
		getList({
			projectId: projectId,
			clusterId: clusterId,
			namespace: namespace,
			type: middlewareType,
			keyword: ''
		}).then((res) => {
			if (res.success) {
				setData(res.data[0]);
			}
		});
	}, []);
	const onOk = () => {
		form.validateFields().then((values) => {
			const sendData = {
				clusterId,
				middlewareName: values.middlewareName,
				type: middlewareType,
				username: values.username,
				password: values.password
			};
			authLogin(sendData).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '登录成功'
					});
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		});
	};
	return (
		<Modal title="登录控制台" open={open} onCancel={onCancel} onOk={onOk}>
			<Form form={form} {...formItemLayout618} labelAlign="left">
				<Form.Item
					required
					label="实例ID"
					name="middlewareName"
					initialValue={middlewareName}
				>
					<Select>
						{data?.serviceList.map((item: serviceProps) => {
							return (
								<Option key={item.name} value={item.name}>
									{item.name}
								</Option>
							);
						})}
					</Select>
				</Form.Item>
				<Form.Item
					label="账号"
					name="username"
					rules={[{ required: true, message: '请输入账号' }]}
				>
					<Input placeholder="请输入" />
				</Form.Item>
				<Form.Item
					label="密码"
					name="password"
					rules={[{ required: true, message: '请输入密码' }]}
				>
					<Input placeholder="请输入" />
				</Form.Item>
			</Form>
		</Modal>
	);
}
