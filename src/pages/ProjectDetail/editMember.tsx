import React, { useEffect, useState } from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Select,
	Message
} from '@alicloud/console-components';
import { getRoleList } from '@/services/role';
import messageConfig from '@/components/messageConfig';
import { updateProjectMember } from '@/services/project';
import storage from '@/utils/storage';
import { EditMemberFieldValues, EditMemberProps } from './projectDetail';
import { formItemLayout618 } from '@/utils/const';
import { roleProps } from '../RoleManage/role';
import { ProjectItem } from '../ProjectManage/project';

const FormItem = Form.Item;
const Option = Select.Option;
export default function EditMember(props: EditMemberProps): JSX.Element {
	const { visible, onCancel, onRefresh, data } = props;
	console.log(data);
	const [roles, setRoles] = useState<roleProps[]>([]);
	const [project] = useState<ProjectItem>(
		JSON.parse(storage.getLocal('project'))
	);
	const field = Field.useField();
	useEffect(() => {
		getRoleList({ key: '' }).then((res) => {
			if (res.success) {
				setRoles(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	}, []);
	useEffect(() => {
		field.setValues({
			userName: data.userName,
			aliasName: data.aliasName,
			roleId: data.roleId
		});
	}, [data]);
	const onOk = () => {
		field.validate((errors) => {
			if (errors) return;
			const values: EditMemberFieldValues = field.getValues();
			const sendData = {
				projectId: project.projectId,
				userName: data.userName,
				aliasName: data.aliasName,
				roleId: values.roleId
			};
			onCancel();
			updateProjectMember(sendData)
				.then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '成员修改成功')
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
			visible={visible}
			onCancel={onCancel}
			onClose={onCancel}
			onOk={onOk}
			title="编辑"
			style={{ width: 550 }}
		>
			<Form {...formItemLayout618} field={field}>
				<FormItem label="登录账户">
					<Input disabled name="userName" />
				</FormItem>
				<FormItem label="用户名">
					<Input disabled name="aliasName" />
				</FormItem>
				<FormItem label="选择角色" required>
					<Select name="roleId" style={{ width: '100%' }}>
						{roles.map((item: roleProps) => {
							if (item.id !== 1) {
								return (
									<Option key={item.id} value={item.id}>
										{item.name}
									</Option>
								);
							}
						})}
					</Select>
				</FormItem>
			</Form>
		</Dialog>
	);
}
