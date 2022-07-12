import * as React from 'react';
import { useState, useEffect } from 'react';
import { Checkbox, Form, Modal, Select, notification } from 'antd';
import {
	getUserList,
	deleteUser,
	resetPassword,
	getLDAP
} from '@/services/user';
import { userProps } from '@/pages/UserManage/user';

function AlarmSet(props: any): JSX.Element {
	const { visible, onOk, onCancel } = props;
	const [form] = Form.useForm();
	const [users, setUsers] = useState<userProps[]>([]);
	const options = [
		{ label: '邮箱', value: 'mail' },
		{ label: '钉钉', value: 'ding' }
	];

	useEffect(() => {
		getUserList({ keyword: '' }).then((res) => {
			if (res.success) {
				setUsers(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, []);

	return (
		<Modal
			title="告警通知设置"
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
			getContainer={false}
		>
			<h2>告警通知</h2>
			<Form labelCol={{ span: 4 }} labelAlign="left" form={form}>
				<Form.Item label="通知方式" name="x">
					<Checkbox.Group options={options} />
				</Form.Item>
				<Form.Item label="告警联系人" name="y">
					<Select mode="multiple">
						{users.map((item) => {
							return (
								<Select.Option
									key={item.id}
									value={item.userName}
								>
									{item.userName}
								</Select.Option>
							);
						})}
					</Select>
				</Form.Item>
			</Form>
		</Modal>
	);
}

export default AlarmSet;
