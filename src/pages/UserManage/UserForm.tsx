import React, { useEffect, useState } from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Select,
	Message
} from '@alicloud/console-components';
import { getRoles, createUser, updateUser } from '@/services/user';
import { userProps, roleProps } from './user';
import messageConfig from '@/components/messageConfig';
import pattern from '@/utils/pattern';

const FormItem = Form.Item;
const Option = Select.Option;
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
	// const [roles, setRoles] = useState<roleProps[]>([]);
	const field: Field = Field.useField();
	// useEffect(() => {
	// 	getRoles().then((res) => {
	// 		if (res.success) {
	// 			setRoles(res.data);
	// 		} else {
	// 			Message.show(messageConfig('error', '失败', res));
	// 		}
	// 	});
	// }, []);
	useEffect(() => {
		if (data) {
			field.setValues({
				userName: data.userName,
				aliasName: data.aliasName,
				phone: data.phone,
				email: data.email
				// roleId: data.roleId
			});
		}
	}, [data]);
	const onOk: () => void = () => {
		field.validate((errors, values) => {
			if (errors) return;
			const sendData = {
				...(values as unknown as userProps)
			};
			if (data) {
				// * 修改用户
				updateUser(sendData).then((res) => {
					console.log(res);
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
					console.log(res);
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
					默认密码：Ab123456!，
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
					patternMessage="用户名长度不可超过10字符"
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
					patternMessage="用户名长度不可超过10字符"
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
					// className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="邮箱"
					// required
					// requiredMessage="请输入邮箱"
					pattern={pattern.email}
					patternMessage="请输入正确的邮箱地址"
				>
					<Input name="email" trim={true} placeholder="请输入邮箱" />
				</FormItem>
				{/* <FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="角色"
					required
					requiredMessage="请选择角色"
				>
					<Select name="roleId" style={{ width: '100%' }}>
						{roles.map((item: roleProps) => (
							<Option key={item.id} value={item.id}>
								{item.name}
							</Option>
						))}
					</Select>
				</FormItem> */}
			</Form>
		</Dialog>
	);
}
