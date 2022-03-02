import React, { useState } from 'react';
import {
	Dialog,
	Form,
	Field,
	Input,
	Message
} from '@alicloud/console-components';
import { createNamespace } from '@/services/common';
import messageConfig from '@/components/messageConfig';

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
	const field = Field.useField();
	const onOk = () => {
		field.validate((errors, values) => {
			if (errors) return;
			createNamespace({ clusterId, ...field.getValues() }).then((res) => {
				if (res.success) {
					Message.show(
						messageConfig('success', '成功', '资源分区创建成功')
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
			title="新增资源分区"
			visible={visible}
			onCancel={onCancel}
			onOk={onOk}
			onClose={onCancel}
		>
			<Form field={field} {...formItemLayout}>
				<FormItem label="资源分区英文名:" required pattern={'^[a-z][a-z0-9-]{0,60}[a-z0-9]$'}>
					<Input id="name" name="name" />
				</FormItem>
			</Form>
		</Dialog>
	);
};
export default AddNamespace;
