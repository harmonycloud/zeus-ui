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
	const [startTime, setStartTime] = useState<string | null>(null);
	const [endTime, setEndTime] = useState<string | null>(null);
	const [ascExecDateOrder, setAscExecDateOrder] = useState<boolean | null>(
		null
	);
	const [ascExecTimeOrder, setAscExecTimeOrder] = useState<boolean | null>(
		null
	);
	const [ascLineOrder, setAscLineOrder] = useState<boolean | null>(null);
	const [status, setStauts] = useState<boolean | null>(null);
	useEffect(() => {
		getData(1, 10, '', '', '', false, false, false, false);
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
			filterMultiple: false,
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
	const onTableChange = (pagination: any, filters: any, sorter: any) => {
		console.log(pagination);
		console.log(filters);
		console.log(sorter);
		let execDateTemp = null;
		let lineTemp = null;
		let execTimeTemp = null;
		let statusTemp = null;
		if (JSON.stringify(sorter) !== '{}') {
			switch (sorter.field) {
				case 'execDate':
					execDateTemp = sorter.order === 'ascend' ? true : false;
					break;
				case 'line':
					lineTemp = sorter.order === 'ascend' ? true : false;
					break;
				case 'execTime':
					execTimeTemp = sorter.order === 'ascend' ? true : false;
					break;
				default:
					break;
			}
		}
		if (filters.status) {
			statusTemp = JSON.parse(filters.status[0]);
		}
		setCurrent(pagination.current);
		setPageSize(pagination.pageSize);
		setStauts(statusTemp);
		setAscExecDateOrder(execDateTemp);
		setAscExecTimeOrder(execTimeTemp);
		setAscLineOrder(lineTemp);
		getData(
			pagination.current,
			pagination.pageSize,
			keyword,
			startTime,
			endTime,
			execDateTemp,
			execTimeTemp,
			lineTemp,
			statusTemp
		);
	};
	const handleSearch = (value: string) => {
		getData(
			current,
			pageSize,
			value,
			startTime,
			endTime,
			ascExecDateOrder,
			ascExecTimeOrder,
			ascLineOrder,
			status
		);
	};
	const handleRangeChange = (values: any, formatString: any) => {
		setStartTime(formatString[0]);
		setEndTime(formatString[1]);
		getData(
			current,
			pageSize,
			keyword,
			formatString[0],
			formatString[1],
			false,
			false,
			false,
			false
		);
	};
	const getData = (
		pageNum: number,
		size: number,
		searchKeyword: string,
		startTime: string | null,
		endTime: string | null,
		ascExecDateOrder: boolean | null,
		ascExecTimeOrder: boolean | null,
		ascLineOrder: boolean | null,
		status: boolean | null
	) => {
		getExecuteHistory({
			database,
			endTime: endTime,
			keyword: searchKeyword,
			startTime: startTime,
			size: size,
			pageNum: pageNum,
			clusterId,
			namespace,
			middlewareName,
			ascExecDateOrder: ascExecDateOrder,
			ascExecTimeOrder: ascExecTimeOrder,
			ascLineOrder: ascLineOrder,
			status: status
		}).then((res) => {
			if (res.success) {
				setDataSource(res.data.list);
				setTotal(res.data.total);
			} else {
				notification.error({
					message: '失败',
					description: `${res.errorMsg}${
						res.errorDetail ? ':' + res.errorDetail : ''
					}`
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
				<RangePicker onChange={handleRangeChange} />
			</Space>
			<Table
				rowKey="id"
				size="small"
				dataSource={dataSource}
				columns={columns}
				onChange={onTableChange}
				pagination={{
					size: 'small',
					current: current,
					total: total,
					pageSize: pageSize,
					showTotal: showTotal,
					showSizeChanger: true,
					showQuickJumper: true
				}}
			/>
		</main>
	);
}
