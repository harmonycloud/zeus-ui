import * as React from 'react';
import { useState, useEffect } from 'react';
import { Checkbox, Form, Modal, Select, notification, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
	getAlarmSetting,
	getSystemAlarmSetting,
	postAlarmSetting,
	postSystemAlarmSetting
} from '@/services/alarm';
import { getUserList } from '@/services/user';
import { getMailInfo, getDing } from '@/services/alarm';

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
	const [dingDisabled, setDingDisabled] = useState<boolean>(false);
	const [mailDisabled, setMailDisabled] = useState<boolean>(false);
	const options = [
		{ label: '邮箱', value: 'enableMailAlert', disabled: mailDisabled },
		{ label: '钉钉', value: 'enableDingAlert', disabled: dingDisabled }
	];

	useEffect(() => {
		getUserList({ keyword: '' }).then((res) => {
			setUsers(res.data);
		});
		getMailInfo().then((res) => {
			if (res.success) {
				res.data ? setMailDisabled(false) : setMailDisabled(true);
			}
		});
		getDing().then((res) => {
			if (res.success) {
				res.data && res.data.length
					? setDingDisabled(false)
					: setDingDisabled(true);
			}
		});
	}, []);

	useEffect(() => {
		if (alarmType === 'system') {
			getSystemAlarmSetting().then((res) => {
				let way: string[] = [];
				res.data?.enableMailAlert
					? (way = [...way, 'enableMailAlert'])
					: (way = [...way]);
				res.data?.enableDingAlert
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
				res.data?.enableMailAlert
					? (way = [...way, 'enableMailAlert'])
					: (way = [...way]);
				res.data?.enableDingAlert
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
			<Form labelCol={{ span: 5 }} labelAlign="left" form={form}>
				<Form.Item
					label={
						<span>
							<span>通知方式</span>
							<Tooltip title="在告警设置页面填写对应的告警方式的信息后方可勾选">
								<QuestionCircleOutlined
									style={{ marginLeft: 4 }}
								/>
							</Tooltip>
						</span>
					}
					name="way"
					// rules={[
					// 	{
					// 		required: !mailDisabled && !dingDisabled,
					// 		message: '请选择通知方式'
					// 	}
					// ]}
				>
					<Checkbox.Group options={options} />
				</Form.Item>
				<Form.Item
					label="告警联系人"
					name="userIds"
					// rules={[
					// 	{ required: !mailDisabled, message: '请选择告警联系人' }
					// ]}
				>
					<Select mode="multiple" disabled={mailDisabled}>
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
