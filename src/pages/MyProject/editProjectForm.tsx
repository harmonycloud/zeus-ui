import React, { useEffect } from 'react';
import {
	Dialog,
	Field,
	Form,
	Input,
	Message
} from '@alicloud/console-components';
import { connect } from 'react-redux';
import { formItemLayout618 } from '@/utils/const';
import pattern from '@/utils/pattern';
import { StoreState } from '@/types';
import { updateProject } from '@/services/project';
import { ProjectItem } from '../ProjectManage/project';
import messageConfig from '@/components/messageConfig';

interface EditProjectFormProps {
	visible: boolean;
	onCancel: () => void;
	project: ProjectItem;
	onRefresh: () => void;
}
interface UpdateProjectValuesFields {
	name: string;
	aliasName: string;
	description: string;
}
const FormItem = Form.Item;
function EditProjectForm(props: EditProjectFormProps): JSX.Element {
	const { visible, onCancel, project, onRefresh } = props;
	const field = Field.useField();
	useEffect(() => {
		if (project) {
			field.setValues({
				aliasName: project.aliasName,
				name: project.name,
				description: project.description
			});
		}
	}, [project]);
	const onOk = () => {
		field.validate((errors) => {
			if (errors) return;
			const values: UpdateProjectValuesFields = field.getValues();
			const sendData = {
				projectId: project.projectId,
				name: values.name,
				aliasName: values.aliasName,
				description: values.description
			};
			onCancel();
			updateProject(sendData)
				.then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '项目修改成功')
						);
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				})
				.finally(() => {
					onRefresh();
				});
		});
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
				<FormItem
					label="英文简称"
					required
					className="ne-required-ingress"
					labelTextAlign="left"
					asterisk={false}
				>
					<Input disabled name="name" />
				</FormItem>
				<FormItem label="备注">
					<Input name="description" />
				</FormItem>
			</Form>
		</Dialog>
	);
}
const mapStateToProps = (state: StoreState) => ({
	project: state.globalVar.project
});
export default connect(mapStateToProps)(EditProjectForm);
