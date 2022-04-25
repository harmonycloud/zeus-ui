import React, { useState } from 'react';
import { Popover, Input, message, Modal, Form, notification } from 'antd';
import { CloseCircleFilled, CheckCircleFilled } from '@ant-design/icons';

import { encrypt } from '@/utils/utils';
import { updatePassword } from '@/services/user';

import Storage from '@/utils/storage';

import styles from './user.module.scss';

interface sendDataProps {
	password: string;
	newPassword: string;
	reNewPassword: string;
}
interface editProps {
	visible: boolean;
	onCancel: () => void;
	userName: string;
}
const formItemLayout = {
	labelCol: {
		span: 8
	},
	wrapperCol: {
		span: 16
	}
};
export default function EditPasswordForm(props: editProps): JSX.Element {
	const { visible, onCancel, userName } = props;
	const [checks, setChecks] = useState<boolean[]>([
		false,
		false,
		false,
		false
	]);
	const [publicKey] = useState<string>(Storage.getSession('rsa'));
	const [form] = Form.useForm();

	const onOk: () => void = () => {
		form.validateFields().then((values) => {
			if (checks.includes(false)) {
				message.warning('密码格式不正确!');
				return;
			}
			const v: sendDataProps = values;
			const rsaPass = encrypt(v.password, publicKey);
			// console.log(rsaPass);
			const newRsaPass = encrypt(v.newPassword, publicKey);
			const reNewRsaPass = encrypt(v.reNewPassword, publicKey);
			const sendData = {
				userName,
				password: rsaPass,
				newPassword: newRsaPass,
				reNewPassword: reNewRsaPass
			};
			updatePassword(sendData).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '密码修改成功'
					});
					onCancel();
				} else {
					notification.error({
						message: '失败',
						description: res
					});
				}
			});
		});
	};
	const handleChange = (value: string, type: string) => {
		if (type === 'new') {
			const temp = [...checks];
			if (/[A-Za-z]/.test(value)) {
				temp[0] = true;
			} else {
				temp[0] = false;
			}
			if (/\d/.test(value)) {
				temp[1] = true;
			} else {
				temp[1] = false;
			}
			if (
				value.includes('.') ||
				value.includes('@') ||
				value.includes('-')
			) {
				temp[2] = true;
			} else {
				temp[2] = false;
			}
			if (value.length >= 8 && value.length <= 16) {
				temp[3] = true;
			} else {
				temp[3] = false;
			}
			setChecks(temp);
		} else {
			const newValue = form.getFieldValue('newPassword');
		}
	};
	const defaultTrigger = (
		<Form.Item
			label="新密码"
			labelAlign="left"
			name="newPassword"
			// asterisk={false}
			rules={[{ required: true, message: '请输新入密码' }]}
			// requiredMessage="请输入新密码"
			// className="ne-required-ingress"
		>
			<Input.Password
				onChange={(e) => handleChange(e.target.value, 'new')}
			/>
		</Form.Item>
	);

	return (
		<Modal
			title="修改密码"
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
			okText="确认"
			cancelText="取消"
			forceRender
		>
			<Form {...formItemLayout} form={form}>
				<Form.Item
					label="原密码"
					labelAlign="left"
					name="password"
					// asterisk={false}
					rules={[{ required: true, message: '请输入原密码' }]}
					// className="ne-required-ingress"
				>
					<Input.Password />
				</Form.Item>
				<Popover
					content={
						<div>
							<ul>
								<li className={styles['edit-form-icon-style']}>
									{checks[0] ? (
										<CheckCircleFilled
											style={{
												color: '#68B642',
												marginRight: 4,
												lineHeight: '20px'
											}}
										/>
									) : (
										<CloseCircleFilled
											style={{
												color: '#Ef595C',
												marginRight: 4,
												lineHeight: '20px'
											}}
										/>
									)}
									<span>英文大写或小写</span>
								</li>
								<li className={styles['edit-form-icon-style']}>
									{checks[1] ? (
										<CheckCircleFilled
											style={{
												color: '#68B642',
												marginRight: 4,
												lineHeight: '20px'
											}}
										/>
									) : (
										<CloseCircleFilled
											style={{
												color: '#Ef595C',
												marginRight: 4,
												lineHeight: '20px'
											}}
										/>
									)}
									<span>数字</span>
								</li>
								<li className={styles['edit-form-icon-style']}>
									{checks[2] ? (
										<CheckCircleFilled
											style={{
												color: '#68B642',
												marginRight: 4,
												lineHeight: '20px'
											}}
										/>
									) : (
										<CloseCircleFilled
											style={{
												color: '#Ef595C',
												marginRight: 4,
												lineHeight: '20px'
											}}
										/>
									)}
									<span>
										&quot;.&quot;或&quot;@&quot;或&quot;-&quot;
									</span>
								</li>
								<li className={styles['edit-form-icon-style']}>
									{checks[3] ? (
										<CheckCircleFilled
											style={{
												color: '#68B642',
												marginRight: 4,
												lineHeight: '20px'
											}}
										/>
									) : (
										<CloseCircleFilled
											style={{
												color: '#Ef595C',
												marginRight: 4,
												lineHeight: '20px'
											}}
										/>
									)}
									<span>
										目前长度为
										{
											(
												(form.getFieldValue(
													'newPassword'
												) as string) || ''
											).length
										}
										(长度需要8-16之间)
									</span>
								</li>
							</ul>
							要求：密码需要满足以上四个条件
						</div>
					}
					placement="right"
				>
					{defaultTrigger}
				</Popover>
				<Form.Item
					label="新密码二次确认"
					labelAlign="left"
					name="reNewPassword"
					// asterisk={false}
					rules={[
						{ required: true, message: '请输入新密码二次确认' }
					]}
					// requiredMessage="请输入确认密码"
					// className="ne-required-ingress"
				>
					<Input.Password
						onChange={(e) => handleChange(e.target.value, 'reNew')}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
}
