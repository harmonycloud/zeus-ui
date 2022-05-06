import React, { useEffect, useState } from 'react';
// import {
// 	Dialog,
// 	Field,
// 	Form,
// 	Input,
// 	Message
// } from '@alicloud/console-components';
import { Input, Modal, Form, notification } from 'antd';
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
	// const [initialValues, setInitialValues] =
	// 	useState<UpdateProjectValuesFields>();
	const [form] = Form.useForm();
	// const field = Field.useField();
	useEffect(() => {
		if (project) {
			// setInitialValues({
			// });
			form.setFieldsValue({
				aliasName: project.aliasName,
				name: project.name,
				description: project.description
			});
			// field.setValues({
			// 	aliasName: project.aliasName,
			// 	name: project.name,
			// 	description: project.description
			// });
		}
	}, [project]);
	const onOk = () => {
		form.validateFields().then((values) => {
			onCancel();
			const sendData = {
				projectId: project.projectId,
				name: values.name,
				aliasName: values.aliasName,
				description: values.description
			};
			updateProject(sendData)
				.then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '项目修改成功'
						});
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				})
				.catch((info) => {
					console.log('Validate Failed:', info);
				})
				.finally(() => {
					onRefresh();
				});
		});
		// 	field.validate((errors) => {
		// 		if (errors) return;
		// 		const values: UpdateProjectValuesFields = field.getValues();
		// 		onCancel();
		// 	});
	};
	return (
		<Modal
			title="编辑"
			visible={visible}
			onCancel={onCancel}
			onOk={onOk}
			okText="确定"
			cancelText="取消"
			width={470}
		>
			<Form
				form={form}
				{...formItemLayout618}
				labelAlign="left"
				// initialValues={initialValues}
			>
				<FormItem
					// className="ne-required-ingress"
					// asterisk={false}
					label="项目名称"
					rules={[
						{ required: true, message: '请输入项目名称' },
						{
							max: 80,
							message: '输入名称，且最大长度不超过80个字符'
						},
						{
							pattern: new RegExp(pattern.projectAliasName),
							message: '请输入名称，且最大长度不超过80个字符'
						}
					]}
					required
					name="aliasName"
					// requiredMessage="请输入项目名称"
					// maxLength={80}
					// minmaxLengthMessage="输入名称，且最大长度不超过80个字符"
					// pattern={pattern.projectAliasName}
					// patternMessage="请输入名称，且最大长度不超过80个字符"
				>
					<Input />
				</FormItem>
				<FormItem
					label="英文简称"
					required
					name="name"
					// className="ne-required-ingress"
					// labelAlign="left"
					// asterisk={false}
				>
					<Input disabled />
				</FormItem>
				<FormItem label="备注" name="description">
					<Input />
				</FormItem>
			</Form>
		</Modal>
	);
}
const mapStateToProps = (state: StoreState) => ({
	project: state.globalVar.project
});
export default connect(mapStateToProps)(EditProjectForm);
