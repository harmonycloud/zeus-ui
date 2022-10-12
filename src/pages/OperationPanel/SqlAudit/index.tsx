import React, { useState } from 'react';
import {
	Space,
	Table,
	Input,
	Radio,
	DatePicker,
	Button,
	Pagination
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { PaginationProps, RadioChangeEvent } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const { Search } = Input;
const { RangePicker } = DatePicker;
interface DataType {
	key: string;
	actionTime: string;
	account: string;
	database: string;
	sqlType: string;
	status: string;
	sql: string;
}

const columns: ColumnsType<DataType> = [
	{
		title: '执行时间',
		dataIndex: 'actionTime',
		key: 'actionTime'
	},
	{
		title: '操作用户',
		dataIndex: 'account',
		key: 'account'
	},
	{
		title: '数据库',
		dataIndex: 'database',
		key: 'database'
	},
	{
		title: 'SQL类型',
		dataIndex: 'sqlType',
		key: 'sqlType'
	},
	{
		title: '状态',
		dataIndex: 'status',
		key: 'status',
		filters: [
			{ text: '执行成功', value: 'success' },
			{ text: '执行失败', value: 'failed' },
			{ text: '取消执行', value: 'cancel' }
		]
	},
	{
		title: '执行语句',
		dataIndex: 'sql',
		key: 'sql'
	}
];
export default function SqlAudit(): JSX.Element {
	const [current, setCurrent] = useState<number>(1);
	const [total, setTotal] = useState<number>();
	const [pageSize, setPageSize] = useState<number>(10);
	const [executionTime, setExecutionTime] = useState<string>('');
	const onSearch = (value: string) => console.log(value);
	const onRefresh = () => console.log('refresh');
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
	const handleRadioChange = (e: RadioChangeEvent) => {
		setExecutionTime(e.target.value);
	};
	return (
		<main className="sql-audit-main">
			<Search
				placeholder="请输入sql语句进行模糊查询"
				onSearch={onSearch}
				style={{ width: 400 }}
			/>
			<div className="sql-audit-filter-content">
				<Space align="center">
					<label>执行时间</label>
					<Radio.Group
						onChange={handleRadioChange}
						value={executionTime}
					>
						<Radio.Button value="1day">近1天</Radio.Button>
						<Radio.Button value="3day">近3天</Radio.Button>
						<Radio.Button value="7day">近7天</Radio.Button>
						<Radio.Button value="1month">近1月</Radio.Button>
						<Radio.Button value="custom">自定义</Radio.Button>
					</Radio.Group>
					{executionTime === 'custom' && <RangePicker />}
				</Space>
				<Button
					type="default"
					icon={<ReloadOutlined />}
					onClick={onRefresh}
				/>
			</div>
			<div className="sql-audit-table-content">
				<Table
					size="small"
					columns={columns}
					dataSource={[]}
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
			</div>
		</main>
	);
}
