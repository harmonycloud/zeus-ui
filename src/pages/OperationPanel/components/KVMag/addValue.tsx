import React, { useState } from 'react';
import {
	Form,
	Input,
	InputNumber,
	Select,
	Popconfirm,
	Button,
	Modal
} from 'antd';
import DataFields from '@/components/DataFields';
import { Item } from '@/components/DataFields/dataFields';
import { EditOutlined } from '@ant-design/icons';
import { formItemLayout618 } from '@/utils/const';

const options = [
	{ label: 'hash', value: 'hash' },
	{ label: 'Zset', value: 'zset' },
	{ label: 'list', value: 'list' },
	{ label: 'set', value: 'set' },
	{ label: 'string', value: 'string' }
];
export default function AddValue(props: any): JSX.Element {
	const { type, visible, onOk, onCancel, data } = props;
	const [form] = Form.useForm();

	const onCreate = () => {
		form.validateFields().then((value) => {
			onOk(value);
		});
	};

	return (
		<Modal
			title={data ? '编辑value' : '新增value'}
			open={visible}
			onOk={onCreate}
			onCancel={onCancel}
		>
			{console.log(visible)}
			<Form form={form} {...formItemLayout618} labelAlign="left">
				{type === 'hash' ? (
					<Form.Item
						name="field"
						label="Field"
						rules={[
							{
								required: true,
								message: '请输入Field'
							}
						]}
						initialValue={data?.field}
					>
						<Input
							placeholder="请输入"
							disabled={data?.field}
							style={{ width: '100%' }}
						/>
					</Form.Item>
				) : null}
				<Form.Item
					name={type === 'zset' ? 'member' : 'value'}
					label="Value"
					rules={[
						{
							required: true,
							message: '请输入Value'
						}
					]}
					initialValue={
						data?.value || data?.stringValue || data?.member
					}
				>
					<Input.TextArea
						placeholder="请输入"
						style={{ width: '100%' }}
						disabled={
							(!!data && type === 'set') ||
							(data?.member && type === 'zset')
						}
					/>
				</Form.Item>
				{type === 'zset' ? (
					<Form.Item
						name="score"
						label="Score"
						rules={[
							{
								required: true,
								message: '请输入Score'
							}
						]}
						initialValue={data?.score}
					>
						<InputNumber min={0} style={{ width: '100%' }} />
					</Form.Item>
				) : null}
			</Form>
		</Modal>
	);
}
