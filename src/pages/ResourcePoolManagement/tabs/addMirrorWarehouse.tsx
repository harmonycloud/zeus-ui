import React, { useState } from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Message,
	Select
} from '@alicloud/console-components';
import { addMirror } from '@/services/common';
import messageConfig from '@/components/messageConfig';

interface AddMirrorWarehouseProps {
	visible: boolean;
	onCancel: () => void;
	clusterId: string;
	onRefresh: () => void;
	namespace: string;
}
const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
	labelCol: {
		span: 6
	},
	wrapperCol: {
		span: 18
	}
};

const address = [
	{
		key: 'https',
		value: 'https'
	},
	{
		key: 'http',
		value: 'http'
	}
];

const AddMirrorWarehouse = (props: AddMirrorWarehouseProps) => {
	const { visible, onCancel, clusterId, onRefresh, namespace } = props;
	const field = Field.useField();
	const onOk = () => {
		field.validate((errors, values) => {
			if (errors) return;
			addMirror({
				clusterId,
				namespace,
				...field.getValues(),
				hostAddress: ''
			}).then((res) => {
				if (res.success) {
					Message.show(
						messageConfig('success', '成功', '镜像仓库创建成功')
					);
					onCancel();
					onRefresh();
				} else {
					field.setError('name', res.errorMsg);
				}
			});
		});
	};
	return (
		<Dialog
			title="新增镜像仓库"
			visible={visible}
			onCancel={onCancel}
			onOk={onOk}
			onClose={onCancel}
		>
			<Form field={field} {...formItemLayout}>
				<div className="display-form">
					<label className="label">镜像仓库地址</label>
					<FormItem required>
						<Select name="protocol">
							{address.map((item: any) => {
								return (
									<Option key={item.key} value={item.value}>
										{item.value}
									</Option>
								);
							})}
						</Select>
					</FormItem>
					<FormItem required style={{ width: '40%' }}>
						<Input
							id="name"
							name="address"
							placeholder="请输入harbor主机地址"
						/>
					</FormItem>
					<FormItem required style={{ width: '20%' }}>
						<Input id="name" name="port" placeholder="端口" />
					</FormItem>
				</div>
				<FormItem label="镜像仓库项目" required>
					<Input
						id="name"
						name="project"
						placeholder="请输入镜像仓库项目"
					/>
				</FormItem>
				<div className="display-form user">
					<label className="label">镜像仓库鉴权</label>
					<FormItem required>
						<Input
							id="name"
							name="username"
							placeholder="请输入用户名"
						/>
					</FormItem>
					<FormItem required>
						<Input.Password
							id="name"
							name="password"
							placeholder="请输入密码"
						/>
					</FormItem>
				</div>
				<FormItem label="描述">
					<Input.TextArea
						id="name"
						name="description"
						maxLength={300}
						placeholder="请输入描述信息，限定300字符串"
					/>
				</FormItem>
			</Form>
		</Dialog>
	);
};
export default AddMirrorWarehouse;
