import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Button } from 'antd';
import Actions from '@/components/Actions';
import ProTable from '@/components/ProTable';
import DataFields from '@/components/DataFields';
import { Item } from '@/components/DataFields/dataFields';
import { EditOutlined } from '@ant-design/icons';
import { formItemLayout618 } from '@/utils/const';

const LinkButton = Actions.LinkButton;
const options = [
	{ label: 'hash', value: 'hash' },
	{ label: 'Zset', value: 'zset' },
	{ label: 'list', value: 'list' },
	{ label: 'set', value: 'set' },
	{ label: 'string', value: 'string' }
];
// TODO 编辑 value单独弹窗编辑
export default function KVList(): JSX.Element {
	const [form] = Form.useForm();
	const [isEdit, setIsEdit] = useState<boolean>(false);
	const [items, setItems] = useState<Item[]>([
		{
			dataIndex: '',
			label: ''
		},
		{
			dataIndex: 'key',
			label: 'key'
		},
		{
			dataIndex: 'expiration',
			label: '超过时间'
		},
		{
			dataIndex: 'keyType',
			label: '数据类型'
		},
		{
			dataIndex: 'value',
			label: 'value'
		}
	]);

	const Operation = {
		primary: (
			<div>
				<Button type="primary">头部新增</Button>
				<Button type="primary">尾部新增</Button>
				<Button type="primary">保存</Button>
				<Button>取消</Button>
			</div>
		)
	};

	const actionRender = (value: string, record: any, index: number) => {
		return (
			<Actions>
				<LinkButton>编辑</LinkButton>
				<LinkButton>删除</LinkButton>
			</Actions>
		);
	};

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
			<ProTable
				// dataSource={dataSource}
				showRefresh
				showColumnSetting
				// onRefresh={() => onRefresh(keyword, current)}
				rowKey="userName"
				operation={Operation}
				// pagination={{
				// 	total: total,
				// 	current: current,
				// 	pageSize: pageSize
				// }}
				// onChange={onTableChange}
			>
				<ProTable.Column title="序号" dataIndex="userName" />
				<ProTable.Column title="value" dataIndex="email" />
				<ProTable.Column title="score" dataIndex="aliasName" />
				<ProTable.Column
					title="操作"
					dataIndex="action"
					render={actionRender}
				/>
			</ProTable>
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
