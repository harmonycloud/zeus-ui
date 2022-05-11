import React, { useState } from 'react';
import { Form, Modal, Input, Popover, notification, message } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';

import { updatePassword } from '@/services/middleware';

import { FormProps } from './database';

import styles from '@/layouts/Navbar/User/./user.module.scss';

const formItemLayout = {
	labelCol: {
		span: 10
	},
	wrapperCol: {
		span: 14
	}
};
const FormItem = Form.Item;
export default function PasswordForm(props: FormProps): JSX.Element {
	const {
		visible,
		onCancel,
		onCreate,
		clusterId,
		namespace,
		middlewareName,
		data
	} = props;
	const [checks, setChecks] = useState<boolean[]>([false, false]);
	const [errors, setErrors] = useState<boolean>(false);
	const [form] = Form.useForm();

	const onOk: () => void = () => {
		form.validateFields().then((values) => {
			if (checks.includes(false)) {
				message.warning('密码格式不正确!');
				return;
			}
			if (errors) {
				notification.error({
					message: '失败',
					description: '二次密码不一致'
				});
				return;
			}

			const sendData = {
				clusterId,
				namespace,
				middlewareName,
				id: data.id,
				user: data.user,
				password: values.newPassword,
				confirmPassword: values.confirmPassword
			};
			updatePassword(sendData).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '密码修改成功'
					});
					onCreate();
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		});
	};
	const handleChange = (value: string, type: string) => {
		if (type === 'new') {
			const temp = [...checks];
			if (value.length >= 8 && value.length <= 32) {
				temp[0] = true;
			} else {
				temp[0] = false;
			}
			if (
				/^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)[a-zA-Z0-9\W_]{3,}$/.test(
					value
				)
			) {
				temp[1] = true;
			} else {
				temp[1] = false;
			}
			setChecks(temp);
		} else {
			const newValue = form.getFieldValue('newPassword');
			if (value !== newValue) {
				// field.setError('reNewPassword', '密码二次校验错误');
				setErrors(true);
			} else {
				setErrors(false);
			}
		}
	};
	const defaultTrigger = (
		<FormItem
			{...formItemLayout}
			label="新密码"
			labelAlign="left"
			// asterisk={false}
			name="newPassword"
			rules={[
				{
					required: true,
					message: '请输入新密码'
				}
			]}
			// className="ne-required-ingress"
		>
			<Input.Password
				onChange={(e) => handleChange(e.target.value, 'new')}
			/>
		</FormItem>
	);

	return (
		<Modal
			title="修改密码"
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
		>
			<Form form={form} {...formItemLayout}>
				<Popover
					content={
						<ul>
							<li className={styles['edit-form-icon-style']}>
								{checks[0] ? (
									<CheckCircleFilled
										style={{
											color: '#68B642',
											marginRight: 4
										}}
									/>
								) : (
									<CloseCircleFilled
										style={{
											color: '#Ef595C',
											marginRight: 4
										}}
									/>
								)}
								<span>(长度需要8-32之间)</span>
							</li>
							<li className={styles['edit-form-icon-style']}>
								{checks[1] ? (
									<CheckCircleFilled
										style={{
											color: '#68B642',
											marginRight: 4
										}}
									/>
								) : (
									<CloseCircleFilled
										style={{
											color: '#Ef595C',
											marginRight: 4
										}}
									/>
								)}
								<span>
									至少包含以下字符中的三种：大写字母、小写字母、数字和特殊字符～!@%^*-_=+?,()&
								</span>
							</li>
						</ul>
					}
					placement="right"
				>
					{defaultTrigger}
				</Popover>
				<FormItem
					label="新密码二次确认"
					labelAlign="left"
					// asterisk={false}]
					rules={[
						{
							required: true,
							message: '请输入确认密码'
						}
					]}
					// className="ne-required-ingress"
				>
					<Input.Password
						name="confirmPassword"
						onChange={(e) => handleChange(e.target.value, 'reNew')}
					/>
				</FormItem>
			</Form>
		</Modal>
	);
}
