import { Space, Table, Input, DatePicker } from 'antd';
import React from 'react';
const { RangePicker } = DatePicker;
const columns = [
	{
		title: '#',
		dataIndex: 'id',
		key: 'id'
	},
	{
		title: '执行时间',
		dataIndex: 'executionTime',
		key: 'executionTime',
		sorter: true
	},
	{
		title: '数据库',
		dataIndex: 'database',
		key: 'database'
	},
	{
		title: 'SQL',
		dataIndex: 'sql',
		key: 'sql'
	},
	{
		title: '状态',
		dataIndex: 'status',
		key: 'status',
		filters: [
			{ value: 'success', text: '成功' },
			{ value: 'failed', text: '失败' }
		]
	},
	{
		title: '行数',
		dataIndex: 'rows',
		key: 'rows',
		sorter: true
	},
	{
		title: '耗时',
		dataIndex: 'timeConsuming',
		key: 'timeConsuming',
		sorter: true
	},
	{
		title: '提示',
		dataIndex: 'tips',
		key: 'tips'
	}
];
export default function ExecutionTable(): JSX.Element {
	return (
		<main>
			<Space className="mb-8">
				<Input.Search placeholder="支持sql语句的模糊搜索" />
				<RangePicker />
			</Space>
			<Table dataSource={[]} columns={columns}></Table>
		</main>
	);
}
