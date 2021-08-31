/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
	Table,
	Button,
	Icon,
	Pagination,
	Input,
	Message,
	Grid,
	Select
} from '@alicloud/console-components';
import TimeSelect from '@/components/TimeSelect';
import { getSlowLogs } from '@/services/middleware';
import transTime from '@/utils/transTime';
import styled from 'styled-components';
import moment from 'moment';
import messageConfig from '@/components/messageConfig';
import NumberRange from '@/components/NumberRange';
import { api } from '@/api.json';
import styles from './log.module.scss';

const searchTypes = [
	{ label: '分词搜索', value: 'match' },
	{ label: '精确搜索', value: 'matchPhrase' },
	{ label: '模糊搜索', value: 'wildcard' },
	{ label: '正则表达式搜索', value: 'regexp' }
];
const { Option } = Select;
const { Row, Col } = Grid;
export default function SlowLog(props) {
	const { clusterId, middlewareName, namespace } = props.data;
	const defaultStart = moment().subtract({ hours: 1 });
	const [rangeTime, setRangeTime] = useState([defaultStart, moment()]);
	const [dataSource, setDataSource] = useState([]);
	const [current, setCurrent] = useState(1);
	const [total, setTotal] = useState(10);
	const [fromQueryTime, setFromQueryTime] = useState();
	const [toQueryTime, setToQueryTime] = useState('');
	const [searchType, setSearchType] = useState('');
	const [keyword, setKeyword] = useState('');

	useEffect(() => {
		getData(
			1,
			10,
			transTime.local2gmt2(rangeTime[0]),
			transTime.local2gmt2(rangeTime[1])
		);
	}, []);

	const getData = (
		current,
		size,
		startTime,
		endTime,
		fromQueryTime = '',
		toQueryTime = '',
		searchType = '',
		keyword = ''
	) => {
		const sendData = {
			clusterId: clusterId,
			namespace: namespace,
			middlewareName: middlewareName,
			startTime: startTime,
			endTime: endTime,
			current: current,
			size: size,
			fromQueryTime: fromQueryTime,
			toQueryTime: toQueryTime,
			searchType: searchType,
			searchWord: keyword
		};
		getSlowLogs(sendData).then((res) => {
			if (res.success) {
				setDataSource(res.data);
				setTotal(res.count);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};

	const onTimeChange = (rangeTime) => {
		const [start, end] = rangeTime;
		setRangeTime(rangeTime);
	};

	const timeRender = (value) => {
		return transTime.gmt2local(value);
	};

	const onChange = function (value) {
		setCurrent(value);
		getData(
			value,
			10,
			transTime.local2gmt2(rangeTime[0]),
			transTime.local2gmt2(rangeTime[1]),
			fromQueryTime,
			toQueryTime,
			searchType,
			keyword
		);
	};

	const slowLogDownload = () => {
		const url = `${api}/clusters/${clusterId}/namespaces/${namespace}/middlewares/${middlewareName}/slowsql/file?startTime=${transTime.local2gmt2(
			rangeTime[0]
		)}&endTime=${transTime.local2gmt2(
			rangeTime[1]
		)}&searchType=${searchType}&searchWord=${keyword}`;
		console.log(url);
		window.open(url);
	};

	const onSearchChange = (value) => {
		setKeyword(value);
		// console.log(value);
	};

	const onFilterChange = (value) => {
		setSearchType(value);
	};

	const handleClick = () => {
		setCurrent(1);
		getData(
			1,
			10,
			transTime.local2gmt2(rangeTime[0]),
			transTime.local2gmt2(rangeTime[1]),
			fromQueryTime,
			toQueryTime,
			searchType,
			keyword
		);
	};
	const numberRange = (value) => {
		if (value[0] !== '' && value[1] !== '') {
			if (Number(value[0]) > Number(value[1])) {
				Message.show(
					messageConfig('error', '错误', '执行时长范围设置错误')
				);
				return;
			}
			setFromQueryTime(Number(value[0]));
			setToQueryTime(Number(value[1]));
		}
	};

	return (
		<div>
			<div className={`display-flex ${styles['filter-wrapper']}`}>
				<div className={styles['filter-item']}>
					<Row>
						<Col span={6}>
							<label>搜索类型</label>
						</Col>
						<Col span={16}>
							<Select
								placeholder="请选择搜索类型"
								value={searchType}
								onChange={onFilterChange}
								style={{ width: '100%' }}
							>
								{searchTypes.map((item) => (
									<Option key={item.value} value={item.value}>
										{item.label}
									</Option>
								))}
							</Select>
						</Col>
					</Row>
				</div>
				<div className={styles['filter-item']}>
					<Row>
						<Col span={6}>
							<label>关键字</label>
						</Col>
						<Col span={16}>
							<Input
								style={{ width: '100%' }}
								value={keyword}
								onChange={onSearchChange}
							/>
						</Col>
					</Row>
				</div>
				<div className={styles['filter-item']}>
					<Row>
						<TimeSelect source="log" timeSelect={onTimeChange} />
					</Row>
				</div>
				<div className={styles['filter-item']}>
					<Row>
						<Col span={6}>
							<label>执行时长</label>
						</Col>
						<Col span={16}>
							<NumberRange unit="秒" numberRange={numberRange} />
						</Col>
					</Row>
				</div>
				<div className={styles['filter-item-search']}>
					<Row>
						<Col offset={20}>
							<Button
								onClick={slowLogDownload}
								type="normal"
								style={{ marginRight: 12 }}
							>
								<Icon type="arrow-to-bottom" />
							</Button>
							<Button type="primary" onClick={handleClick}>
								搜索
							</Button>
						</Col>
					</Row>
				</div>
			</div>
			<Table dataSource={dataSource}>
				<Table.Column
					title="慢日志采集时间"
					dataIndex="timestampMysql"
					cell={timeRender}
					width={160}
					lock
				/>
				<Table.Column title="SQL语句" dataIndex="query" width={500} />
				<Table.Column
					title="客户端IP"
					dataIndex="clientip"
					width={120}
				/>
				<Table.Column
					title="执行时长（秒）"
					dataIndex="queryTime"
					width={100}
				/>
				<Table.Column
					title="锁定时长（秒）"
					dataIndex="lockTime"
					width={100}
				/>
				<Table.Column
					title="解析行数"
					dataIndex="rowsExamined"
					width={70}
				/>
				<Table.Column
					title="返回行数"
					dataIndex="rowsSent"
					width={70}
				/>
			</Table>
			<SPagination
				defaultCurrent={1}
				current={current}
				onChange={onChange}
				pageSize={10}
				total={total}
			/>
		</div>
	);
}
const SPagination = styled(Pagination)`
	margin-top: 10px;
	display: flex;
	justify-content: flex-end;
`;
