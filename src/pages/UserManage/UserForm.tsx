import React, { useEffect } from 'react';
import { Modal, Form, Input, notification, Radio } from 'antd';
import { createUser, updateUser } from '@/services/user';
import { userProps } from './user';
import pattern from '@/utils/pattern';

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
	console.log(data);
	const [form] = Form.useForm();
	useEffect(() => {
		if (data) {
			form.setFieldsValue({
				userName: data.userName,
				aliasName: data.aliasName,
				phone: data.phone,
				email: data.email,
				isAdmin: data.userRoleList?.some((i: any) => i.roleId === 1)
					? true
					: false
			});
		}
	}, [data]);
	const onOk: () => void = () => {
		form.validateFields().then((values) => {
			const sendData: any = {
				...values
			};
			if (data) {
				// * 修改用户
				updateUser(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '用户修改成功'
						});
						onCreate();
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			} else {
				// * 创建用户
				createUser(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '用户创建成功'
						});
						onCreate();
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			}
		});
	};
	return (
		<Modal
			title={!data ? '新增用户' : '编辑用户'}
			visible={visible}
			onOk={onOk}
			onCancel={onCancel}
			okText="确定"
			cancelText="取消"
		>
			<Form labelAlign="left" form={form} {...formItemLayout}>
				<p style={{ color: '#Ef595C', marginBottom: 16 }}>
					默认密码：zeus123.com，
					登录后，请点击【个人头像-&gt;修改密码】重新设置
				</p>
				<FormItem
					label="登录账户名称"
					required
					rules={[
						{ required: true, message: '请输入登录账户名称' },
						{
							pattern: new RegExp(pattern.userName),
							message:
								'登录账户名只允许英文大小写+数字组合，长度不可超过10字符'
						}
					]}
					name="userName"
				>
					<Input
						disabled={data ? true : false}
						placeholder="请输入登录账户名称"
					/>
				</FormItem>
				<FormItem
					label="用户名"
					required
					rules={[
						{ required: true, message: '请输入用户名' },
						{
							pattern: new RegExp(pattern.aliasName),
							message:
								'用户名只允许中文、英文大小写+数字组合，长度不可超过18字符'
						}
					]}
					name="aliasName"
				>
					<Input placeholder="请输入用户名" />
				</FormItem>
				<FormItem
					label="手机号"
					required
					rules={[
						{ required: true, message: '请输入手机号' },
						{
							pattern: new RegExp(pattern.phone),
							message: '请输入正确的手机号'
						}
					]}
					name="phone"
				>
					<Input placeholder="请输入手机号" />
				</FormItem>
				<FormItem
					label="邮箱"
					name="email"
					rules={[
						{
							pattern: new RegExp(pattern.email),
							message: '请输入正确的邮箱地址'
						}
					]}
				>
					<Input placeholder="请输入邮箱" />
				</FormItem>
				<FormItem
					label="超级管理员"
					name="isAdmin"
					initialValue={false}
				>
					<Radio.Group disabled={data?.userName === 'admin'}>
						<Radio value={false}>否</Radio>
						<Radio value={true}>是</Radio>
					</Radio.Group>
				</FormItem>
			</Form>
		</Modal>
	);
}
