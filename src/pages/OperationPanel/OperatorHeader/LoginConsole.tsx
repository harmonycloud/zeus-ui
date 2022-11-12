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
import { encrypt } from '@/utils/utils';
import storage from '@/utils/storage';
import { getRsaKey } from '@/services/user';
const { Option } = Select;
// TODO 记住密码（cookie）优先级较低
// TODO redis 登录对接 redis需要判断实例中的version，当version为5时，不用填账号，当version为6时，有一个默认账号，具体找后端
// ! 运维面板所有相关存储都存在sessionStorage中
export default function LoginConsole(props: LoginConsoleProps): JSX.Element {
	const {
		open,
		onCancel,
		projectId,
		clusterId,
		namespace,
		middlewareName,
		middlewareType,
		onCreate
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
		getRsaKey().then((res) => {
			if (res.success) {
				const pub = `-----BEGIN PUBLIC KEY-----${res.data}-----END PUBLIC KEY-----`;
				storage.setSession('rsa', pub);
			}
		});
	}, []);
	const onOk = () => {
		form.validateFields().then((values) => {
			console.log(storage.getSession('rsa'));
			const sendData = {
				clusterId,
				middlewareName: values.middlewareName,
				type: middlewareType,
				namespace: namespace,
				username: values.username,
				password:
					encrypt(values.password, storage.getSession('rsa')) ||
					values.password
			};
			console.log(sendData);
			authLogin(sendData).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '登录成功'
					});
					onCreate(res.data);
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
					rules={[{ required: false, message: '请输入账号' }]}
				>
					<Input placeholder="请输入" />
				</Form.Item>
				<Form.Item
					label="密码"
					name="password"
					rules={[{ required: true, message: '请输入密码' }]}
				>
					<Input.Password
						placeholder="请输入"
						onKeyDown={(e) => e.keyCode === 13 && onOk()}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
}
