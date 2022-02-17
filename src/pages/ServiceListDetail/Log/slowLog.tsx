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
import moment, { Moment } from 'moment';
import messageConfig from '@/components/messageConfig';
import NumberRange from '@/components/NumberRange';
import { api } from '@/api.json';
import styles from './log.module.scss';
import ComponentsNull from '@/components/ComponentsNull';
import { searchTypes } from '@/utils/const';
import { CommonLogProps } from '../detail';

const { Option } = Select;
const { Row, Col } = Grid;
// * 慢日志表格后端分页

export default function SlowLog(props: CommonLogProps): JSX.Element {
	const { logging } = props;
	const { clusterId, middlewareName, namespace } = props.data;
	const defaultStart = moment().subtract({ hours: 1 });
	const [rangeTime, setRangeTime] = useState<Moment[]>([
		defaultStart,
		moment()
	]);
	const [dataSource, setDataSource] = useState([]);
	const [current, setCurrent] = useState(1);
	const [total, setTotal] = useState(10);
	const [fromQueryTime, setFromQueryTime] = useState<number | string>();
	const [toQueryTime, setToQueryTime] = useState<number | string>();
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
		current: number,
		size: number,
		startTime: string,
		endTime: string,
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

	const onTimeChange = (rangeTime: Moment[]) => {
		setRangeTime(rangeTime);
	};

	const timeRender = (value: string) => {
		return transTime.gmt2local(value);
	};

	const onChange = function (value: number) {
		setCurrent(value);
		getData(
			value,
			10,
			transTime.local2gmt2(rangeTime[0]),
			transTime.local2gmt2(rangeTime[1]),
			fromQueryTime as string,
			toQueryTime as string,
			searchType,
			keyword
		);
	};

	const slowLogDownload = () => {
		const url = `${api}/clusters/${clusterId}/${namespace}/middlewares/mysql/${middlewareName}/slowsql/file?startTime=${transTime.local2gmt2(
			rangeTime[0]
		)}&endTime=${transTime.local2gmt2(
			rangeTime[1]
		)}&searchType=${searchType}&searchWord=${keyword}`;
		window.open(url);
	};

	const onSearchChange = (value: string) => {
		setKeyword(value);
	};

	const onFilterChange = (value: string) => {
		setSearchType(value);
	};

	const handleClick = () => {
		setCurrent(1);
		getData(
			1,
			10,
			transTime.local2gmt2(rangeTime[0]),
			transTime.local2gmt2(rangeTime[1]),
			fromQueryTime as string,
			toQueryTime as string,
			searchType,
			keyword
		);
	};
	const numberRange = (value: string[]) => {
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
	if (!logging || !logging.elasticSearch) {
		return (
			<ComponentsNull title="该功能所需要日志采集组件工具支持，您可前往“资源池——>平台组件“进行安装" />
		);
	}
	return (
		<div>
			<div className={`display-flex ${styles['filter-wrapper']}`}>
				<div className={styles['filter-item-slowlog']}>
					<Row>
						<Col span={5}>
							<label>搜索类型</label>
						</Col>
						<Col span={19}>
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
				<div className={styles['filter-item-slowlog']}>
					<Row>
						<Col offset={2} span={3}>
							<label>关键字</label>
						</Col>
						<Col span={19}>
							<Input
								style={{ width: '100%' }}
								value={keyword}
								onChange={onSearchChange}
							/>
						</Col>
					</Row>
				</div>
				<div className={styles['filter-item-slowlog']}>
					<Row>
						<TimeSelect source="log" timeSelect={onTimeChange} />
					</Row>
				</div>
				<div className={styles['filter-item-slowlog']}>
					<Row>
						<Col offset={2} span={3}>
							<label>执行时长</label>
						</Col>
						<Col span={19}>
							<NumberRange unit="秒" numberRange={numberRange} />
						</Col>
					</Row>
				</div>
				<div className={styles['filter-item-search']}>
					<>
						<Button type="primary" onClick={handleClick}>
							搜索
						</Button>
						<Button
							onClick={slowLogDownload}
							type="normal"
							style={{ marginRight: 12, padding: '0 9px' }}
						>
							<Icon type="arrow-to-bottom" />
						</Button>
					</>
				</div>
			</div>
			<Table dataSource={dataSource} hasBorder={false}>
				<Table.Column
					title="慢日志采集时间"
					dataIndex="timestampMysql"
					cell={timeRender}
					width={160}
					lock
				/>
				<Table.Column title="SQL语句" dataIndex="query" width={450} />
				<Table.Column
					title="客户端IP"
					dataIndex="clientip"
					width={120}
				/>
				<Table.Column
					title="执行时长（秒）"
					dataIndex="queryTime"
					width={120}
				/>
				<Table.Column
					title="锁定时长（秒）"
					dataIndex="lockTime"
					width={120}
				/>
				<Table.Column
					title="解析行数"
					dataIndex="rowsExamined"
					width={90}
				/>
				<Table.Column
					title="返回行数"
					dataIndex="rowsSent"
					width={90}
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
