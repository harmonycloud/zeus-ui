import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
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
import { connect } from 'react-redux';
import { setRefreshFlag } from '@/redux/execute/execute';
import { StoreState } from '@/types';
const { RangePicker } = DatePicker;

function ExecutionTable(props: ExecutionTableProps): JSX.Element {
	const {
		clusterId,
		namespace,
		middlewareName,
		database,
		changeSql,
		setRefreshFlag,
		execute
	} = props;
	console.log(execute);
	const params: any = useParams();
	const [current, setCurrent] = useState<number>(1);
	const [total, setTotal] = useState<number>();
	const [pageSize, setPageSize] = useState<number>(10);
	const [dataSource, setDataSource] = useState<ExecuteItem[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [startTime, setStartTime] = useState<string | null>(null);
	const [endTime, setEndTime] = useState<string | null>(null);
	const [ascExecDateOrder, setAscExecDateOrder] = useState<boolean | null>(
		false
	);
	const [ascExecTimeOrder, setAscExecTimeOrder] = useState<boolean | null>(
		null
	);
	const [status, setStauts] = useState<boolean | null>(null);
	useEffect(() => {
		getData(1, 10, '', null, null, false, null, null);
	}, []);
	useEffect(() => {
		if (execute.refreshFlag) {
			getData(1, 10, '', null, null, false, null, null);
			setRefreshFlag(false);
		}
	}, [execute]);
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
			render: (val: string) =>
				params.type === 'redis' ? 'DB-' + val : val,
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
			dataIndex: 'execStatus',
			key: 'execStatus',
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
			title: '耗时',
			dataIndex: 'execTime',
			key: 'execTime',
			width: 80,
			render: (val: string) => val + ' ms',
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
		let execDateTemp = null;
		let execTimeTemp = null;
		let statusTemp = null;
		if (JSON.stringify(sorter) !== '{}') {
			switch (sorter.field) {
				case 'execDate':
					execDateTemp = sorter.order === 'ascend' ? true : false;
					break;
				case 'execTime':
					execTimeTemp = sorter.order === 'ascend' ? true : false;
					break;
				default:
					break;
			}
		}
		if (filters.execStatus) {
			statusTemp = JSON.parse(filters.execStatus[0]);
		}
		setCurrent(pagination.current);
		setPageSize(pagination.pageSize);
		setStauts(statusTemp);
		setAscExecDateOrder(execDateTemp);
		setAscExecTimeOrder(execTimeTemp);
		getData(
			pagination.current,
			pagination.pageSize,
			keyword,
			startTime,
			endTime,
			execDateTemp,
			execTimeTemp,
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
			ascExecDateOrder,
			ascExecTimeOrder,
			status
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
			execStatus: status
		}).then((res) => {
			if (res.success) {
				setDataSource(res.data.list);
				setTotal(res.data.total);
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
				scroll={{ x: 1140 }}
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
const mapStateToProps = (state: StoreState) => ({
	execute: state.execute
});
export default connect(mapStateToProps, {
	setRefreshFlag
})(ExecutionTable);
