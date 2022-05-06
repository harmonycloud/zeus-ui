import * as React from 'react';
import { useEffect } from 'react';
import { Modal, Form, Input, notification } from 'antd';
import { createRole, updateRole } from '@/services/role';
import { roleProps } from './role';
import pattern from '@/utils/pattern';

const FormItem = Form.Item;
const TextArea = Input.TextArea;
const formItemLayout = {
	labelCol: {
		span: 6
	},
	wrapperCol: {
		span: 18
	}
};

interface RoleFormProps {
	visible: true;
	onCreate: () => void;
	onCancel: () => void;
	data: roleProps | null | undefined;
}

function RoleForm(props: RoleFormProps): JSX.Element {
	const { visible, onCancel, onCreate, data } = props;
	const [form] = Form.useForm();
	useEffect(() => {
		if (data) {
			form.setFieldsValue({
				name: data.name,
				description: data.description,
				createTime: data.createTime,
				roleId: data.id,
				menu: data.menu,
				clusterList: data.clusterList
			});
		}
	}, [data]);
	const onOk: () => void = () => {
		form.validateFields().then((values) => {
			const sendData = {
				...(values as unknown as roleProps)
			};
			if (data) {
				// * 修改用户
				delete sendData.createTime;
				updateRole(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '用户修改成功'
						});
						onCreate();
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			} else {
				// * 创建用户
				// sendData.menu = initMenu;
				createRole(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '用户创建成功'
						});
						onCreate();
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			}
		});
	};

	return (
		<Modal
			title={!data ? '新增角色' : '编辑角色'}
			visible={visible}
			onCancel={onCancel}
			onOk={onOk}
			width={540}
			okText="确定"
			cancelText="取消"
		>
			<Form labelAlign="left" form={form} {...formItemLayout}>
				<FormItem
					label="角色名称"
					required
					rules={[
						{ required: true, message: '请输入角色名称' },
						{
							pattern: new RegExp(pattern.roleName),
							message: '角色名称长度不可超过10字符'
						}
					]}
					name="name"
				>
					<Input placeholder="请输入角色名称" />
				</FormItem>
				<FormItem
					label="角色描述"
					required
					name="description"
					rules={[
						{ required: true, message: '请输入角色描述' },
						{
							max: 100,
							message: '角色描述长度不可超过100字符'
						}
					]}
				>
					<TextArea
						placeholder="请输入角色描述"
						maxLength={100}
						showCount
					/>
				</FormItem>
			</Form>
		</Modal>
	);
}

export default RoleForm;
