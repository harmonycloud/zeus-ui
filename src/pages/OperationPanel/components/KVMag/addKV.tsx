import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Popconfirm, Button } from 'antd';
import DataFields from '@/components/DataFields';
import { Item } from '@/components/DataFields/dataFields';
import { EditOutlined } from '@ant-design/icons';
import { formItemLayout410 } from '@/utils/const';

const options = [
	{ label: 'hash', value: 'hash' },
	{ label: 'Zset', value: 'zset' },
	{ label: 'list', value: 'list' },
	{ label: 'set', value: 'set' },
	{ label: 'string', value: 'string' }
];
// TODO 编辑 value单独弹窗编辑
export default function AddKV(props: any): JSX.Element {
	const { onCancel } = props;
	const [form] = Form.useForm();

	return (
		<>
			<div>
				<div className="title-content">
					<div className="blue-line"></div>
					<div className="detail-title mr-8">新增K-V</div>
				</div>
			</div>
			<Form
				style={{ width: '70%' }}
				form={form}
				labelCol={{
					span: 3
				}}
				wrapperCol={{
					span: 16
				}}
				labelAlign="left"
			>
				<Form.Item name="key" label="key">
					<Input placeholder="请输入" />
				</Form.Item>
				<Form.Item name="keyType" label="数据类型">
					<Select options={options} placeholder="请选择数据类型" />
				</Form.Item>
				<Form.Item name="expiration" label="超过时间">
					<InputNumber
						placeholder="请输入"
						style={{ width: '100%' }}
					/>
				</Form.Item>
				<Form.Item name="expiration" label="value">
					{/* <InputNumber
						placeholder="请输入"
						style={{ width: '100%' }}
					/> */}
					<Button>添加value</Button>
				</Form.Item>
			</Form>
			<div>
				<Button type="primary">保存</Button>
				<Button style={{ marginLeft: 8 }} onClick={onCancel}>
					取消
				</Button>
			</div>
		</>
	);
}
