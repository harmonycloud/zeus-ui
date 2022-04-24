import React, { useEffect } from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Message,
	Radio
} from '@alicloud/console-components';
import { createUser, updateUser } from '@/services/user';
import { sendDataParams, userProps } from './user';
import messageConfig from '@/components/messageConfig';
import pattern from '@/utils/pattern';
import storage from '@/utils/storage';

const { Group: RadioGroup } = Radio;
const FormItem = Form.Item;
const formItemLayout = {
	labelCol: {
		span: 6
	},
	wrapperCol: {
		span: 18
	}
};
interface userFormProps {
	visible: boolean;
	onCreate: () => void;
	onCancel: () => void;
	data: userProps | undefined | null;
}

export default function UserForm(props: userFormProps): JSX.Element {
	const { visible, onCreate, onCancel, data } = props;
	const field: Field = Field.useField();
	const jsonRole = JSON.parse(storage.getLocal('role'));
	useEffect(() => {
		if (data) {
			if (data?.userRoleList?.some((item: any) => item.roleId === 1)) {
				field.setValues({
					isAdmin: true
				});
			} else {
				field.setValues({
					isAdmin: false
				});
			}
			field.setValues({
				userName: data.userName,
				aliasName: data.aliasName,
				phone: data.phone,
				email: data.email
			});
		}
	}, [data]);
	const onOk: () => void = () => {
		field.validate((errors) => {
			if (errors) return;
			const values: sendDataParams = field.getValues();
			const sendData: sendDataParams = {
				userName: values.userName,
				aliasName: values.aliasName,
				phone: values.phone,
				email: values.email,
				isAdmin: values.isAdmin
			};
			console.log(sendData);
			if (data) {
				// * 修改用户
				updateUser(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '用户修改成功')
						);
						onCreate();
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			} else {
				// * 创建用户
				createUser(sendData).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '用户创建成功')
						);
						onCreate();
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		});
	};
	return (
		<Dialog
			title={!data ? '新增用户' : '编辑用户'}
			visible={visible}
			footerAlign="right"
			onOk={onOk}
			onCancel={onCancel}
			onClose={onCancel}
		>
			<Form field={field} {...formItemLayout} style={{ paddingLeft: 12 }}>
				<p style={{ color: '#Ef595C', marginBottom: 16 }}>
					默认密码：zeus123.com，
					登录后，请点击【个人头像-&gt;修改密码】重新设置
				</p>
				<FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="登录账户名称"
					required
					requiredMessage="请输入登录账户名称"
					pattern={pattern.userName}
					patternMessage="登录账户名只允许英文大小写+数字组合，长度不可超过25字符"
				>
					<Input
						name="userName"
						trim={true}
						disabled={data ? true : false}
						placeholder="请输入登录账户名称"
					/>
				</FormItem>
				<FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="用户名"
					required
					requiredMessage="请输入用户名"
					pattern={pattern.aliasName}
					patternMessage="用户名只允许中文、英文大小写+数字组合，长度不可超过18字符"
				>
					<Input
						name="aliasName"
						trim={true}
						placeholder="请输入用户名"
					/>
				</FormItem>
				<FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="手机号"
					required
					requiredMessage="请输入手机号"
					pattern={pattern.phone}
					patternMessage="请输入正确的手机号"
				>
					<Input
						name="phone"
						trim={true}
						placeholder="请输入手机号"
					/>
				</FormItem>
				<FormItem
					labelTextAlign="left"
					asterisk={false}
					label="邮箱"
					pattern={pattern.email}
					patternMessage="请输入正确的邮箱地址"
				>
					<Input name="email" trim={true} placeholder="请输入邮箱" />
				</FormItem>
				<FormItem
					labelTextAlign="left"
					asterisk={false}
					label="是否为超级管理员"
				>
					<RadioGroup
						title={
							jsonRole.userName !== 'admin'
								? '请通过admin账号设置超级管理员'
								: undefined
						}
						disabled={jsonRole.userName === 'admin' ? false : true}
						name="isAdmin"
						defaultValue={false}
					>
						<Radio value={false}>否</Radio>
						<Radio value={true}>是</Radio>
					</RadioGroup>
				</FormItem>
			</Form>
		</Dialog>
	);
}
