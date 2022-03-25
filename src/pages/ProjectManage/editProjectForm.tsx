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
					requiredMessage="请输入英文名称"
					pattern={pattern.projectName}
					patternMessage="由小写字母数字及“-”组成，且必须以小写字母开头及不能以“-”结尾的2-40个字符"
				>
					<Input name="name" />
				</FormItem>
				<FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="项目名称"
					required
					requiredMessage="请输入英文名称"
					pattern={pattern.projectAliasName}
					patternMessage="请输入名称，且最大长度不超过80个字符"
				>
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
