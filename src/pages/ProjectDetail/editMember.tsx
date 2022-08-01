import React, { useEffect, useState } from 'react';
import { Modal, Input, Select, Form, notification } from 'antd';
import { getRoleList } from '@/services/role';
import { updateProjectMember } from '@/services/project';
import { EditMemberProps } from './projectDetail';
import { formItemLayout618 } from '@/utils/const';
import { roleProps } from '../RoleManage/role';

const FormItem = Form.Item;
const Option = Select.Option;
export default function EditMember(props: EditMemberProps): JSX.Element {
	const { visible, onCancel, onRefresh, data, projectId, isAccess } = props;
	const [form] = Form.useForm();
	const [roles, setRoles] = useState<roleProps[]>([]);
	useEffect(() => {
		getRoleList({ key: '' }).then((res) => {
			if (res.success) {
				setRoles(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, []);
	useEffect(() => {
		form.setFieldsValue({
			userName: data.userName,
			aliasName: data.aliasName,
			roleId: data.roleId
		});
	}, [data]);
	const onOk = () => {
		form.validateFields().then((values) => {
			const sendData = {
				projectId: projectId,
				userName: data.userName,
				aliasName: data.aliasName,
				roleId: values.roleId
			};
			onCancel();
			updateProjectMember(sendData)
				.then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '成员修改成功'
						});
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				})
				.finally(() => {
					onRefresh();
				});
		});
	};
	return (
		<Modal
			visible={visible}
			onCancel={onCancel}
			onOk={onOk}
			title="编辑"
			width={550}
			okText="确定"
			cancelText="取消"
		>
			<Form {...formItemLayout618} form={form} labelAlign="left">
				<FormItem label="登录账户" name="userName">
					<Input disabled />
				</FormItem>
				<FormItem label="用户名" name="aliasName">
					<Input disabled />
				</FormItem>
				<FormItem name="roleId" label="选择角色" required>
					<Select style={{ width: '100%' }}>
						{roles.map((item: roleProps) => {
							if (item.id !== 1) {
								if (item.id === 2) {
									return (
										!isAccess && (
											<Option
												key={item.id}
												value={item.id}
											>
												{item.name}
											</Option>
										)
									);
								}
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
		</Modal>
	);
}
