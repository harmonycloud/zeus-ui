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
						messageConfig('success', '成功', '命名空间创建成功')
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
			title="新增命名空间"
			visible={visible}
			onCancel={onCancel}
			onOk={onOk}
			onClose={onCancel}
			style={{ width: '450px' }}
		>
			<Form field={field} {...formItemLayout}>
				<FormItem
					label="命名空间名称:"
					required
					requiredMessage="命名空间名称必填"
					maxLength={64}
					minmaxLengthMessage="请输入名称，且最大长度不超过64个字符"
				>
					<Input id="aliasName" name="aliasName" />
				</FormItem>
				<FormItem
					label="英文简称:"
					required
					requiredMessage="英文简称必填"
					pattern={'^[a-z][a-z0-9-]{0,61}[a-z0-9]$'}
					patternMessage={
						'命名空间是由小写字母数字及“-”组成，且以小写字母开头和结尾，不能以“-”结尾的2-63个字符'
					}
				>
					<Input id="name" name="name" />
				</FormItem>
			</Form>
		</Dialog>
	);
};
export default AddNamespace;
