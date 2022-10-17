import React, { useState } from 'react';
import { Space, Table, Input, DatePicker, Tooltip, message } from 'antd';
import type { PaginationProps } from 'antd';
import { IconFont } from '@/components/IconFont';
import { copyValue } from '@/utils/utils';
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
		key: 'sql',
		width: 250,
		render: (text: any) => (
			<div className="flex-space-between">
				<div className="text-overflow-one">{text}</div>
				<Space>
					<Tooltip title="粘贴SQL至上方">
						<IconFont
							style={{
								color: '#226ee7',
								cursor: 'pointer',
								fontSize: 14
							}}
							type="icon-chakan-copy"
						/>
					</Tooltip>
					<Tooltip title="复制">
						<IconFont
							style={{
								color: '#226ee7',
								cursor: 'pointer',
								fontSize: 14
							}}
							type="icon-fuzhi1"
							onClick={() => {
								copyValue(text);
								message.success('复制成功');
							}}
						/>
					</Tooltip>
				</Space>
			</div>
		)
	},
	{
		title: '状态',
		dataIndex: 'status',
		key: 'status',
		filters: [
			{ value: 'success', text: '成功' },
			{ value: 'failed', text: '失败' }
		],
		render: (text: any) => (
			<div
				className={
					text === 'success'
						? 'circle-success-status'
						: 'circle-failed-status'
				}
			>
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				{text === 'success' ? '成功' : '失败'}
			</div>
		)
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
		key: 'timeConsonming',
		sorter: true
	},
	{
		title: '提示',
		dataIndex: 'tips',
		key: 'tips'
	}
];
export default function ExecutionTable(): JSX.Element {
	const [current, setCurrent] = useState<number>(1);
	const [total, setTotal] = useState<number>();
	const [pageSize, setPageSize] = useState<number>(10);
	const [dataSource, setDataSource] = useState([
		{
			id: 1,
			executionTime: '2022-10-11',
			database: 'test',
			sql: 'SELECT * from xxx',
			status: 'failed',
			rows: 5,
			timeConsuming: 23,
			tips: null
		}
	]);
	const showTotal: PaginationProps['showTotal'] = (total) => `共 ${total} 条`;
	const onShowSizeChange: PaginationProps['onShowSizeChange'] = (
		current,
		pageSize
	) => {
		console.log(current, pageSize);
	};
	const onChange: PaginationProps['onChange'] = (page) => {
		console.log(page);
		setCurrent(page);
	};
	return (
		<main>
			<Space className="mb-8">
				<Input.Search placeholder="支持sql语句的模糊搜索" />
				<RangePicker />
			</Space>
			<Table
				rowKey="id"
				size="small"
				dataSource={dataSource}
				columns={columns}
				pagination={{
					size: 'small',
					current: current,
					total: total,
					pageSize: pageSize,
					onShowSizeChange: onShowSizeChange,
					onChange: onChange,
					showTotal: showTotal,
					showSizeChanger: true,
					showQuickJumper: true
				}}
			/>
		</main>
	);
}
