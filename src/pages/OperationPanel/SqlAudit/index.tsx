import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import {
	Space,
	Table,
	Input,
	Radio,
	DatePicker,
	Button,
	notification
} from 'antd';
import type { PaginationProps, RadioChangeEvent } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { sqlAudit } from '@/services/operatorPanel';
import { ParamsProps, SqlAuditItem, SqlAuditProps } from '../index.d';
import moment, { Moment } from 'moment';
import { RangePickerProps } from 'antd/lib/date-picker';

const { Search } = Input;
const { RangePicker } = DatePicker;

const columns = [
	{
		title: '执行时间',
		dataIndex: 'queryDate',
		key: 'queryDate',
		width: 150
	},
	{
		title: '操作用户',
		dataIndex: 'user',
		key: 'user',
		width: 150
	},
	{
		title: '数据库',
		dataIndex: 'db',
		key: 'db',
		width: 150
	},
	{
		title: '执行语句',
		dataIndex: 'query',
		key: 'query',
		ellipsis: true
	}
];
export default function SqlAudit(props: SqlAuditProps): JSX.Element {
	const { currentUser } = props;
	const params: ParamsProps = useParams();
	const [current, setCurrent] = useState<number>(1);
	const [total, setTotal] = useState<number>();
	const [pageSize, setPageSize] = useState<number>(10);
	const [executionTime, setExecutionTime] = useState<string>('1day');
	const [dataSource, setDataSource] = useState<SqlAuditItem[]>([]);
	const [startTime, setStartTime] = useState<any>();
	const [endTime, setEndTime] = useState<any>();
	const [keywords, setKeywords] = useState<string>('');
	useEffect(() => {
		if (currentUser) {
			getData(
				1,
				pageSize,
				moment().subtract(1, 'days') as unknown as string,
				moment() as unknown as string,
				''
			);
		}
	}, [currentUser]);
	const getData = (
		current: number,
		pageSize: number,
		startTime: string,
		endTime: string,
		searchWord: string
	) => {
		sqlAudit({
			current: current,
			endTime: endTime,
			searchWord: searchWord,
			size: pageSize,
			startTime: startTime,
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name
		}).then((res) => {
			if (res.success) {
				setDataSource(
					res.data?.data.map((item: SqlAuditItem, index: number) => {
						return { ...item, id: index };
					}) || []
				);
				setTotal(res.data?.count || 0);
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
	const onSearch = (value: string) => {
		setKeywords(value);
		getData(current, pageSize, startTime, endTime, value);
	};
	const onRefresh = () => {
		getData(current, pageSize, startTime, endTime, keywords);
	};
	const showTotal: PaginationProps['showTotal'] = (total) => `共 ${total} 条`;
	const onShowSizeChange: PaginationProps['onShowSizeChange'] = (
		current,
		pageSize
	) => {
		setCurrent(current);
		setPageSize(pageSize);
		getData(current, pageSize, startTime, endTime, keywords);
	};
	const onChange: PaginationProps['onChange'] = (page) => {
		setCurrent(page);
		getData(page, pageSize, startTime, endTime, keywords);
	};
	const onDateChange: RangePickerProps['onChange'] = (dates, dateStrings) => {
		if (dates) {
			setStartTime(dates[0]);
			setEndTime(dates[1]);
			getData(
				current,
				pageSize,
				dates[0] as unknown as string,
				dates[1] as unknown as string,
				keywords
			);
		} else {
			setStartTime(undefined);
			setEndTime(undefined);
			getData(current, pageSize, '', '', keywords);
		}
	};
	const handleRadioChange = (e: RadioChangeEvent) => {
		setExecutionTime(e.target.value);
		let startTime: any;
		let endTime: any;
		switch (e.target.value) {
			case '1day':
				startTime = moment().subtract(1, 'days');
				endTime = moment();
				break;
			case '3day':
				startTime = moment().subtract(3, 'days');
				endTime = moment();
				break;
			case '7day':
				startTime = moment().subtract(1, 'week');
				endTime = moment();
				break;
			case '1month':
				startTime = moment().subtract(1, 'month');
				endTime = moment();
				break;
			default:
				break;
		}
		if (e.target.value !== 'custom') {
			setStartTime(startTime);
			setEndTime(endTime);
			getData(current, pageSize, startTime, endTime, keywords);
		}
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
					{executionTime === 'custom' && (
						<RangePicker onChange={onDateChange} showTime />
					)}
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
					rowKey="id"
					columns={columns}
					dataSource={dataSource}
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
