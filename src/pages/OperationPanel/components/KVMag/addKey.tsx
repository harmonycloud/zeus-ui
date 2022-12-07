import React, { useState } from 'react';
import {
	Form,
	Input,
	InputNumber,
	Select,
	Popconfirm,
	Button,
	notification
} from 'antd';
import DataFields from '@/components/DataFields';
import { Item } from '@/components/DataFields/dataFields';
import { EditOutlined } from '@ant-design/icons';
import { formItemLayout410 } from '@/utils/const';
import { saveRedisKeys } from '@/services/operatorPanel';
import { ParamsProps, RedisKeyItem as RedisKeyItemParams } from '../../index.d';
import { useParams } from 'react-router';

const options = [
	{ label: 'Hash', value: 'hash' },
	{ label: 'Zset', value: 'zset' },
	{ label: 'List', value: 'list' },
	{ label: 'Set', value: 'set' },
	{ label: 'String', value: 'string' }
];
export default function AddKV(props: any): JSX.Element {
	const { onCancel, onRefresh, database } = props;
	const params: ParamsProps = useParams();
	const [form] = Form.useForm();
	const [type, setType] = useState<string>();

	const onCreate = () => {
		form.validateFields().then((values) => {
			const sendData = {
				database,
				clusterId: params.clusterId,
				namespace: params.namespace,
				middlewareName: params.name,
				...values
			};
			if (values.keyType === 'hash') {
				sendData.hashValue = {
					field: values.field,
					value: values.value
				};
			}
			if (values.keyType === 'list') {
				sendData.listValue = {
					index: '0',
					value: values.value
				};
			}
			if (values.keyType === 'zset') {
				sendData.zsetValue = {
					member: values.member,
					score: values.score
				};
			}
			saveRedisKeys(sendData).then((res) => {
				if (res.success) {
					onCancel();
					onRefresh();
					notification.success({
						message: '成功',
						description: '新增成功'
					});
				} else {
					notification.error({
						message: '失败',
						description: (
							<>
								<p>{res.errorMsg}</p>
								<p>{res.errorDetail}</p>
							</>
						)
					});
				}
			});
		});
	};

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
				<Form.Item
					name="key"
					label="key"
					rules={[
						{
							required: true,
							message: '请输入key'
						}
					]}
				>
					<Input placeholder="请输入" />
				</Form.Item>
				<Form.Item
					name="keyType"
					label="数据类型"
					rules={[
						{
							required: true,
							message: '请选择数据类型'
						}
					]}
				>
					<Select
						options={options}
						placeholder="请选择数据类型"
						value={type}
						onChange={(value) => setType(value)}
					/>
				</Form.Item>
				<Form.Item name="expiration" label="超过时间">
					<InputNumber
						placeholder="请输入"
						style={{ width: '100%' }}
					/>
				</Form.Item>
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
					>
						<Input placeholder="请输入" style={{ width: '100%' }} />
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
				>
					<Input.TextArea
						placeholder="请输入"
						style={{ width: '100%' }}
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
					>
						<InputNumber min={0} style={{ width: '100%' }} />
					</Form.Item>
				) : null}
				{/* <Form.Item name="expiration" label="value">
					<Button>添加value</Button>
				</Form.Item> */}
			</Form>
			<div>
				<Button type="primary" onClick={onCreate}>
					保存
				</Button>
				<Button style={{ marginLeft: 8 }} onClick={onCancel}>
					取消
				</Button>
			</div>
		</>
	);
}