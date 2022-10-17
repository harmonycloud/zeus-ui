import { formItemLayout618 } from '@/utils/const';
import pattern from '@/utils/pattern';
import { Form, Input, Modal, Select } from 'antd';
import React from 'react';

interface CreateModeProps {
	open: boolean;
	onCancel: () => void;
}
export default function CreateMode(props: CreateModeProps): JSX.Element {
	const { open, onCancel } = props;
	const [form] = Form.useForm();
	const onOk = () => {
		console.log('click');
	};
	return (
		<Modal
			title="创建模式"
			width={600}
			open={open}
			onCancel={onCancel}
			onOk={onOk}
		>
			<Form form={form} labelAlign="left" {...formItemLayout618}>
				<Form.Item
					label="模式名"
					name="modeName"
					rules={[
						{ required: true, message: '请输入模式名' },
						{
							pattern: new RegExp(pattern.modeName),
							message:
								'模式名存储由中文、大写字母、小写字母、数字以及“_.-”组成，长度不超过64个字符'
						}
					]}
				>
					<Input placeholder="请输入模式名" />
				</Form.Item>
				<Form.Item label="所有者" name="owner">
					<Select options={[]} />
				</Form.Item>
				<Form.Item label="备注" name="remark">
					<Input.TextArea rows={3} />
				</Form.Item>
			</Form>
		</Modal>
	);
}
