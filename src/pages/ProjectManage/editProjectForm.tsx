import React from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Select
} from '@alicloud/console-components';
import { EditProjectFormProps } from './project';
import { formItemLayout614 } from '@/utils/const';
import pattern from '@/utils/pattern';

const FormItem = Form.Item;
const Option = Select.Option;
export default function EditProjectform(
	props: EditProjectFormProps
): JSX.Element {
	const { projectId, onCancel, visible, onCreate } = props;
	const field = Field.useField();
	const onOk = () => {
		console.log('ok');
	};
	return (
		<Dialog
			visible={visible}
			title={projectId ? '编辑项目' : '创建项目'}
			onCancel={onCancel}
			onClose={onCancel}
			onOk={onOk}
		>
			<Form {...formItemLayout614} field={field}>
				<FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="英文简称"
					required
					requiredMessage="请输入登录账户名称"
					pattern={pattern.userName}
					patternMessage="登录账户名只允许英文大小写+数字组合，长度不可超过10字符"
				>
					<Input name="name" />
				</FormItem>
				<FormItem label="项目名称">
					<Input name="aliasName" />
				</FormItem>
				<FormItem label="备注">
					<Input name="description" />
				</FormItem>
				<FormItem label="绑定项目管理员">
					<Select></Select>
				</FormItem>
			</Form>
		</Dialog>
	);
}
