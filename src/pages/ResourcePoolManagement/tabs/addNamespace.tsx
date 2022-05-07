import React from 'react';
import { Modal, Form, Input, notification } from 'antd';
import { createNamespace } from '@/services/common';

interface AddNamespaceProps {
	visible: boolean;
	onCancel: () => void;
	clusterId: string;
	onRefresh: () => void;
}
const FormItem = Form.Item;
const formItemLayout = {
	labelCol: {
		span: 10
	},
	wrapperCol: {
		span: 14
	}
};

const AddNamespace = (props: AddNamespaceProps) => {
	const { visible, onCancel, clusterId, onRefresh } = props;
	const [form] = Form.useForm();
	const onOk = () => {
		form.validateFields().then((values) => {
			createNamespace({ clusterId, ...values }).then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '命名空间创建成功'
					});
					onCancel();
					onRefresh();
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			});
		});
	};
	return (
		<Modal
			title="新增命名空间"
			visible={visible}
			onCancel={onCancel}
			onOk={onOk}
			width={450}
			okText="确定"
			cancelText="取消"
		>
			<Form labelAlign="left" form={form} {...formItemLayout}>
				<FormItem
					label="命名空间名称:"
					required
					name="aliasName"
					rules={[
						{ required: true, message: '命名空间名称必填' },
						{
							max: 64,
							message: '请输入名称，且最大长度不超过64个字符'
						}
					]}
				>
					<Input id="aliasName" />
				</FormItem>
				<FormItem
					label="英文简称:"
					required
					name="name"
					rules={[
						{ required: true, message: '英文简称必填' },
						{
							pattern: new RegExp(
								'^[a-z][a-z0-9-]{0,38}[a-z0-9]$'
							),
							message:
								'命名空间是由小写字母数字及“-”组成，且以小写字母开头和结尾，不能以“-”结尾的2-40个字符'
						}
					]}
				>
					<Input id="name" />
				</FormItem>
			</Form>
		</Modal>
	);
};
export default AddNamespace;
