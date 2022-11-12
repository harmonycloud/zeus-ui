import React, { useEffect, useState } from 'react';
import {
	Space,
	Table,
	Input,
	DatePicker,
	Tooltip,
	message,
	Badge,
	notification
} from 'antd';
import type { PaginationProps } from 'antd';
import { IconFont } from '@/components/IconFont';
import { getExecuteHistory } from '@/services/operatorPanel';
import { copyValue } from '@/utils/utils';
import { ExecuteItem, ExecutionTableProps } from '../../index.d';
const { RangePicker } = DatePicker;

export default function ExecutionTable(
	props: ExecutionTableProps
): JSX.Element {
	const { clusterId, namespace, middlewareName, database, changeSql } = props;
	const [current, setCurrent] = useState<number>(1);
	const [total, setTotal] = useState<number>();
	const [pageSize, setPageSize] = useState<number>(10);
	const [dataSource, setDataSource] = useState<ExecuteItem[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [start, setStart] = useState<string | null>(null);
	const [end, setEnd] = useState<string | null>(null);
	useEffect(() => {
		getData(1, 10, '', null, null);
	}, []);
	const columns = [
		{
			title: 'id',
			dataIndex: 'id',
			key: 'id',
			width: 50
		},
		{
			title: '执行时间',
			dataIndex: 'execDate',
			key: 'execDate',
			width: 150,
			sorter: true
		},
		{
			title: '数据库',
			dataIndex: 'targetDatabase',
			key: 'targetDatabase',
			width: 130,
			ellipsis: true
		},
		{
			title: 'SQL',
			dataIndex: 'sqlStr',
			key: 'sqlStr',
			width: 300,
			render: (text: any) => (
				<div className="flex-space-between">
					<div className="text-overflow-one" title={text}>
						{text}
					</div>
					<Space>
						<Tooltip title="粘贴SQL至上方">
							<IconFont
								style={{
									color: '#226ee7',
									cursor: 'pointer',
									fontSize: 14
								}}
								type="icon-chakan-copy"
								onClick={() => {
									changeSql(text);
								}}
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
				{ value: 'true', text: '成功' },
				{ value: 'false', text: '失败' }
			],
			width: 100,
			render: (text: any) => {
				if (text === 'true') return <Badge color="green" text="成功" />;
				return <Badge color="red" text="失败" />;
			}
		},
		{
			title: '行数',
			dataIndex: 'line',
			key: 'line',
			width: 80,
			sorter: true
		},
		{
			title: '耗时',
			dataIndex: 'execTime',
			key: 'execTime',
			width: 80,
			sorter: true
		},
		{
			title: '提示',
			dataIndex: 'message',
			key: 'message',
			width: 250,
			ellipsis: true
		}
	];
	const showTotal: PaginationProps['showTotal'] = (total) => `共 ${total} 条`;
	const onShowSizeChange: PaginationProps['onShowSizeChange'] = (
		current,
		pageSize
	) => {
		console.log(current, pageSize);
	};
	const onChange: PaginationProps['onChange'] = (page) => {
		setCurrent(page);
	};
	const handleSearch = (value: string) => {
		getData(current, pageSize, value, start, end);
	};
	const getData = (
		pageNum: number,
		size: number,
		searchKeyword: string,
		start: string | null,
		end: string | null
	) => {
		getExecuteHistory({
			database,
			end: end,
			keyword: searchKeyword,
			start: start,
			size: size,
			pageNum: pageNum,
			clusterId,
			namespace,
			middlewareName
		}).then((res) => {
			if (res.success) {
				setDataSource(res.data.list);
				setTotal(res.data.total);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	return (
		<main>
			<Space className="mb-8">
				<Input.Search
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
					onSearch={handleSearch}
					placeholder="支持sql语句的模糊搜索"
				/>
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
