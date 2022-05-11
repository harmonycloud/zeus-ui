import React, { useEffect } from 'react';
import { Input, Modal, Form, notification } from 'antd';
import { connect } from 'react-redux';
import { formItemLayout618 } from '@/utils/const';
import pattern from '@/utils/pattern';
import { StoreState } from '@/types';
import { updateProject } from '@/services/project';
import { ProjectItem } from '../ProjectManage/project';

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
	const [form] = Form.useForm();
	useEffect(() => {
		if (project) {
			form.setFieldsValue({
				aliasName: project.aliasName,
				name: project.name,
				description: project.description
			});
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
			<Form form={form} {...formItemLayout618} labelAlign="left">
				<FormItem
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
				>
					<Input />
				</FormItem>
				<FormItem label="英文简称" required name="name">
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
