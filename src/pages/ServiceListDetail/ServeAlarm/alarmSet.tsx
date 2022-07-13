import * as React from 'react';
import { useState, useEffect } from 'react';
import { Checkbox, Form, Modal, Select, notification } from 'antd';
import {
	getAlarmSetting,
	getSystemAlarmSetting,
	postAlarmSetting,
	postSystemAlarmSetting
} from '@/services/alarm';
import { getUserList } from '@/services/user';

import { userProps } from '@/pages/UserManage/user';

function AlarmSet(props: any): JSX.Element {
	const {
		visible,
		onOk,
		onCancel,
		alarmType,
		clusterId,
		middlewareName,
		namespace
	} = props;
	const [form] = Form.useForm();
	const [users, setUsers] = useState<userProps[]>([]);
	const options = [
		{ label: '邮箱', value: 'enableMailAlert' },
		{ label: '钉钉', value: 'enableDingAlert' }
	];

	useEffect(() => {
		getUserList({ keyword: '' }).then((res) => {
			setUsers(res.data);
		});
	}, []);

	useEffect(() => {
		if (alarmType === 'system') {
			getSystemAlarmSetting().then((res) => {
				let way: string[] = [];
				res.data.enableMailAlert
					? (way = [...way, 'enableMailAlert'])
					: (way = [...way]);
				res.data.enableDingAlert
					? (way = [...way, 'enableDingAlert'])
					: (way = [...way]);
				form.setFieldsValue({
					way,
					userIds: res.data?.userList.map((item: any) => item.id)
				});
			});
		} else {
			getAlarmSetting({
				clusterId,
				middlewareName,
				namespace
			}).then((res) => {
				let way: string[] = [];
				res.data.enableMailAlert
					? (way = [...way, 'enableMailAlert'])
					: (way = [...way]);
				res.data.enableDingAlert
					? (way = [...way, 'enableDingAlert'])
					: (way = [...way]);
				form.setFieldsValue({
					way,
					userIds: res.data?.userList.map((item: any) => item.id)
				});
			});
		}
	}, [visible]);

	const onCreate = () => {
		form.validateFields().then((values) => {
			if (alarmType === 'system') {
				postSystemAlarmSetting({
					enableMailAlert:
						values.way &&
						values.way.find(
							(item: string) => item === 'enableMailAlert'
						)
							? true
							: false,
					enableDingAlert:
						values.way &&
						values.way.find(
							(item: string) => item === 'enableDingAlert'
						)
							? true
							: false,
					userIds: values.userIds
				}).then((res) => {
					onOk();
				});
			} else {
				postAlarmSetting({
					clusterId,
					middlewareName,
					namespace,
					enableMailAlert:
						values.way &&
						values.way.find(
							(item: string) => item === 'enableMailAlert'
						)
							? true
							: false,
					enableDingAlert:
						values.way &&
						values.way.find(
							(item: string) => item === 'enableDingAlert'
						)
							? true
							: false,
					userIds: values.userIds
				}).then((res) => {
					onOk();
				});
			}
		});
	};

	return (
		<Modal
			title="告警通知设置"
			visible={visible}
			onOk={onCreate}
			onCancel={onCancel}
			getContainer={false}
		>
			<h2>告警通知</h2>
			<Form labelCol={{ span: 4 }} labelAlign="left" form={form}>
				<Form.Item
					label="通知方式"
					name="way"
					rules={[{ required: true, message: '请选择通知方式' }]}
				>
					<Checkbox.Group options={options} />
				</Form.Item>
				<Form.Item
					label="告警联系人"
					name="userIds"
					rules={[{ required: true, message: '请选择告警联系人' }]}
				>
					<Select mode="multiple">
						{users.map((item) => {
							return (
								<Select.Option key={item.id} value={item.id}>
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
