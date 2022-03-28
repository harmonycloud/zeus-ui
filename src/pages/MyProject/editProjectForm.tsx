import React from 'react';
import { Dialog, Field, Form, Input } from '@alicloud/console-components';
import { formItemLayout618 } from '@/utils/const';
import pattern from '@/utils/pattern';

interface EditProjectFormProps {
	visible: boolean;
	onCancel: () => void;
}
const FormItem = Form.Item;
export default function EditProjectForm(
	props: EditProjectFormProps
): JSX.Element {
	const { visible, onCancel } = props;
	const field = Field.useField();
	const onOk = () => {
		console.log('onok');
	};
	return (
		<Dialog
			title="编辑"
			visible={visible}
			onCancel={onCancel}
			onOk={onOk}
			onClose={onCancel}
			style={{ width: '470px' }}
		>
			<Form {...formItemLayout618} field={field}>
				<FormItem
					label="英文简称"
					required
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
				>
					<Input disabled />
				</FormItem>
				<FormItem
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
					label="项目名称"
					required
					requiredMessage="请输入项目名称"
					pattern={pattern.projectAliasName}
					patternMessage="请输入名称，且最大长度不超过80个字符"
				>
					<Input name="aliasName" />
				</FormItem>
				<FormItem label="备注">
					<Input name="description" />
				</FormItem>
			</Form>
		</Dialog>
	);
}
