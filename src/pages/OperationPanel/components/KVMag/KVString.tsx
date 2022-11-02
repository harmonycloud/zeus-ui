import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Popconfirm, Button } from 'antd';
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
// TODO 编辑 value单独弹窗编辑
export default function KVString(): JSX.Element {
	const [form] = Form.useForm();
	const [isEdit, setIsEdit] = useState<boolean>(false);
	const [items, setItems] = useState<Item[]>([
		{
			dataIndex: '',
			label: ''
		},
		{
			dataIndex: 'key',
			label: 'key',
			render: (val: string) => {
				return (
					<div className="display-flex flex-align">
						<div className="text-overflow-one" title={val}>
							{val}
						</div>
						<Popconfirm
							title={
								<Form form={form}>
									<Form.Item name="description">
										<Input
											placeholder="请输入"
											defaultValue={val}
										/>
									</Form.Item>
								</Form>
							}
							icon={null}
							// onConfirm={() =>
							// 	editDescription(form.getFieldsValue())
							// }
						>
							<EditOutlined
								style={{
									marginLeft: 8,
									cursor: 'pointer',
									fontSize: 14,
									color: '#226ee7',
									verticalAlign: 'middle'
								}}
							/>
						</Popconfirm>
					</div>
				);
			}
		},
		{
			dataIndex: 'expiration',
			label: '超过时间',
			render: (val: string) => {
				return (
					<div className="display-flex flex-align">
						<div className="text-overflow-one" title={val}>
							{val}
						</div>
						<Popconfirm
							title={
								<Form form={form}>
									<Form.Item name="description">
										<Input
											placeholder="请输入"
											defaultValue={val}
										/>
									</Form.Item>
								</Form>
							}
							icon={null}
							// onConfirm={() =>
							// 	editDescription(form.getFieldsValue())
							// }
						>
							<EditOutlined
								style={{
									marginLeft: 8,
									cursor: 'pointer',
									fontSize: 14,
									color: '#226ee7',
									verticalAlign: 'middle'
								}}
							/>
						</Popconfirm>
					</div>
				);
			}
		},
		{
			dataIndex: 'keyType',
			label: '数据类型'
		},
		{
			dataIndex: 'value',
			label: 'value',
			render: (value) => {
				return (
					<div>
						{value} <Button type="link">编辑</Button>
					</div>
				);
			}
		}
	]);

	return (
		<>
			<div>
				<div className="title-content">
					<div className="blue-line"></div>
					<div className="detail-title mr-8">基本信息</div>
					{/* <EditOutlined
						onClick={() => setIsEdit(!isEdit)}
						style={{
							cursor: 'pointer',
							color: '#226ee7',
							fontSize: 14
						}}
					/> */}
				</div>
			</div>
			<DataFields dataSource={{}} items={items} />
			{/* {!isEdit && <DataFields dataSource={{}} items={items} />}
			{isEdit && (
				<Form
					style={{ width: '70%' }}
					form={form}
					{...formItemLayout618}
					labelAlign="left"
				>
					<Form.Item name="key" label="key">
						<Input placeholder="请输入" />
					</Form.Item>
					<Form.Item name="keyType" label="数据类型">
						<Select options={options} />
					</Form.Item>
					<Form.Item name="expiration" label="超过时间">
						<InputNumber
							placeholder="请输入"
							style={{ width: '100%' }}
						/>
					</Form.Item>
				</Form>
			)} */}
		</>
	);
}
