import * as React from 'react';
import { useState, useEffect } from 'react';
import {
	Dialog,
	Form,
	Input,
	Field,
	Message
} from '@alicloud/console-components';
import { createRole, updateRole } from '@/services/role';
import { roleProps } from './role';
import messageConfig from '@/components/messageConfig';
import pattern from '@/utils/pattern';
import { initMenu } from '@/utils/const';

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
	const field: Field = Field.useField();
	useEffect(() => {
		if (data) {
			field.setValues({
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
		field.validate((errors, values) => {
			if (errors) return;
			const sendData = {
				...(values as unknown as roleProps)
			};
			if (data) {
				// * 修改用户
				delete sendData.createTime;
				updateRole(sendData).then((res) => {
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
				sendData.menu = initMenu;
				createRole(sendData).then((res) => {
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
			title={!data ? '新增角色' : '编辑角色'}
			visible={visible}
			onCancel={onCancel}
			onClose={onCancel}
			onOk={onOk}
			style={{ width: '540px' }}
		>
			<Form field={field} {...formItemLayout}>
				<FormItem
					label="输入角色名称"
					required
					requiredMessage="请输入角色名称"
					pattern={pattern.roleName}
					patternMessage="角色名称长度不可超过10字符"
				>
					<Input placeholder="请输入角色名称" name="name" />
				</FormItem>
				<FormItem
					label="输入角色描述"
					required
					requiredMessage="请输入角色描述"
					pattern={pattern.roleDescription}
					patternMessage="角色描述长度不可超过100字符"
				>
					<TextArea
						placeholder="请输入角色描述"
						name="description"
						maxLength={100}
						hasLimitHint
					/>
				</FormItem>
			</Form>
		</Dialog>
	);
}

export default RoleForm;
