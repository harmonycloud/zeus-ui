import React, { useEffect } from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Message
} from '@alicloud/console-components';
import { createUser, updateUser } from '@/services/user';
import messageConfig from '@/components/messageConfig';
import pattern from '@/utils/pattern';

const FormItem = Form.Item;
const Password = Input.Password;
const TextArea = Input.TextArea;
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
	data: any | undefined | null;
}
export default function UserForm(props: userFormProps): JSX.Element {
	const { visible, onCreate, onCancel, data } = props;
	const field: Field = Field.useField();
	useEffect(() => {
		if (data) {
			field.setValues({
				userName: data.userName,
				aliasName: data.aliasName,
				phone: data.phone,
				email: data.email
			});
		}
	}, [data]);
	const onOk: () => void = () => {
		field.validate((errors, values) => {
			if (errors) return;
			const sendData = {
				...(values as unknown as any)
			};
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
				<FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="数据库账号"
					required
					requiredMessage="请输入数据库账号"
					pattern={pattern.userName}
					patternMessage="登录账户名只允许英文大小写+数字组合，长度不可超过10字符"
				>
					<Input
						name="userName"
						trim={true}
						disabled={data ? true : false}
						placeholder="请输入"
					/>
				</FormItem>
				<FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="数据库密码"
					required
					requiredMessage="请输入数据库密码"
					pattern={pattern.aliasName}
					patternMessage="用户名只允许中文、英文大小写+数字组合，长度不可超过18字符"
				>
					<Password
						name="aliasName"
						trim={true}
						disabled={data ? true : false}
						placeholder="请输入"
					/>
				</FormItem>
                <FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="密码二次输入"
					required
					requiredMessage="请输入二次确认密码"
					pattern={pattern.aliasName}
					patternMessage="用户名只允许中文、英文大小写+数字组合，长度不可超过18字符"
				>
					<Password
						name="aliasName"
						trim={true}
						disabled={data ? true : false}
						placeholder="请输入"
					/>
				</FormItem>
				<FormItem
					labelTextAlign="left"
					asterisk={false}
					label="备注"
					pattern={pattern.email}
					patternMessage="请输入备注"
				>
					<TextArea name="email" trim={true} placeholder="限定200字符串" />
				</FormItem>
			</Form>
		</Dialog>
	);
}
