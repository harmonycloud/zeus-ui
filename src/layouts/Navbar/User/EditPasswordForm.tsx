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
import Storage from '@/utils/storage';
import styles from './user.module.scss';
import { encrypt } from '@/utils/utils';
import { updatePassword } from '@/services/user';
import messageConfig from '@/components/messageConfig';
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
		span: 10
	},
	wrapperCol: {
		span: 14
	}
};
const FormItem = Form.Item;
export default function EditPasswordForm(props: editProps): JSX.Element {
	const { visible, onCancel, userName } = props;
	const [checks, setChecks] = useState<boolean[]>([
		false,
		false,
		false,
		false
	]);
	const [publicKey] = useState<string>(Storage.getSession('rsa'));
	const field = Field.useField();

	const onOk: () => void = () => {
		field.validate((error) => {
			if (error) return;
			const v: sendDataProps = field.getValues();
			const rsaPass = encrypt(v.password, publicKey);
			console.log(rsaPass);
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
					Message.show(
						messageConfig('success', '成功', '密码修改成功')
					);
					onCancel();
				} else {
					Message.show(messageConfig('error', '失败', res));
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
			if (value.length >= 8 || value.length <= 16) {
				temp[3] = true;
			} else {
				temp[3] = false;
			}
			setChecks(temp);
		} else {
			const newValue = field.getValue('newPassword');
			if (value !== newValue) {
				field.setError('reNewPassword', '密码二次校验错误');
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
				<FormItem
					label="原密码"
					labelTextAlign="left"
					asterisk={false}
					required
					requiredMessage="请输入原密码"
					className="ne-required-ingress"
				>
					<Input.Password name="password" />
				</FormItem>
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
							<span>英文大写或小写</span>
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
							<span>数字</span>
						</li>
						<li className={styles['edit-form-icon-style']}>
							{checks[2] ? (
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
								&quot;.&quot;或&quot;@&quot;或&quot;-&quot;
							</span>
						</li>
						<li className={styles['edit-form-icon-style']}>
							{checks[3] ? (
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
								目前长度为
								{
									(
										(field.getValue(
											'newPassword'
										) as string) || ''
									).length
								}
							</span>
						</li>
					</ul>
					要求：需要英文大小写+数字+&quot;.&quot;+&quot;@&quot;+&quot;-&quot;中任意3种类型及以上字符组合，长度需要≥8字符且≤16字符
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
						name="reNewPassword"
						onChange={(value: string) =>
							handleChange(value, 'reNew')
						}
					/>
				</FormItem>
			</Form>
		</Dialog>
	);
}
