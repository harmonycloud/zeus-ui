import React, { useState } from 'react';
import {
	Form,
	Dialog,
	Field,
	Input,
	Balloon,
	Icon,
	Message
} from '@alicloud/console-components';

import { updatePassword } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';

import Storage from '@/utils/storage';
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
	const [errors,setErrors] = useState<boolean>(false);
	const field = Field.useField();

	const onOk: () => void = () => {
		field.validate((error, values: any) => {
			if (error) return;
			if (checks.includes(false)) {
				Message.warning('密码格式不正确!');
				return;
			}
			if(errors){
				Message.show(
					messageConfig('error', '失败', '二次密码不一致')
				);
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
					Message.show(
						messageConfig('success', '成功', '密码修改成功')
					);
					onCreate();
				} else {
					Message.show(messageConfig('error', '失败', res.errorMsg));
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
				/^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)[a-zA-Z0-9\W_]{3,32}$/.test(
					value
				)
			) {
				temp[1] = true;
			} else {
				temp[1] = false;
			}
			setChecks(temp);
		} else {
			const newValue = field.getValue('reNewPassword');
			if (value !== newValue) {
				// field.setError('reNewPassword', '密码二次校验错误');
				setErrors(true);
			}else{
				setErrors(false);
			}
		}
	};
	const defaultTrigger = (
		<FormItem
			{...formItemLayout}
			label="新密码"
			labelTextAlign="left"
			asterisk={false}
			required
			requiredMessage="请输入新密码"
			className="ne-required-ingress"
		>
			<Input.Password
				name="newPassword"
				onChange={(value: string) => handleChange(value, 'new')}
			/>
		</FormItem>
	);

	return (
		<Dialog
			title="修改密码"
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
			onClose={onCancel}
			footerAlign="right"
		>
			<Form field={field} {...formItemLayout}>
				<Balloon trigger={defaultTrigger} closable={false} align="r">
					<ul>
						<li className={styles['edit-form-icon-style']}>
							{checks[0] ? (
								<Icon
									type="success-filling1"
									style={{ color: '#68B642', marginRight: 4 }}
									size="xs"
								/>
							) : (
								<Icon
									type="times-circle-fill"
									style={{ color: '#Ef595C', marginRight: 4 }}
									size="xs"
								/>
							)}
							<span>(长度需要8-32之间)</span>
						</li>
						<li className={styles['edit-form-icon-style']}>
							{checks[1] ? (
								<Icon
									type="success-filling1"
									style={{ color: '#68B642', marginRight: 4 }}
									size="xs"
								/>
							) : (
								<Icon
									type="times-circle-fill"
									style={{ color: '#Ef595C', marginRight: 4 }}
									size="xs"
								/>
							)}
							<span>
								至少包含以下字符中的三种：大写字母、小写字母、数字和特殊字符～!@%^*-_=+?,()&
							</span>
						</li>
					</ul>
				</Balloon>
				<FormItem
					label="新密码二次确认"
					labelTextAlign="left"
					asterisk={false}
					required
					requiredMessage="请输入确认密码"
					className="ne-required-ingress"
				>
					<Input.Password
						name="confirmPassword"
						onChange={(value: string) =>
							handleChange(value, 'reNew')
						}
					/>
				</FormItem>
			</Form>
		</Dialog>
	);
}
