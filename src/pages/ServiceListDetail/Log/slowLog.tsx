import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Row, Col, notification } from 'antd';
import { VerticalAlignBottomOutlined } from '@ant-design/icons';
import ProTable from '@/components/ProTable';

import TimeSelect from '@/components/TimeSelect';
import { getSlowLogs } from '@/services/middleware';
import transTime from '@/utils/transTime';
// import styled from 'styled-components';
import moment, { Moment } from 'moment';
import NumberRange from '@/components/NumberRange';

import { api } from '@/api.json';
import styles from './log.module.scss';
import ComponentsNull from '@/components/ComponentsNull';
import { searchTypes } from '@/utils/const';
import { CommonLogProps } from '../detail';

const { Option } = Select;
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
				if (res.data.length > 0) {
					setDataSource(res.data);
					setTotal(res.count);
				} else {
					notification.error({
						message: '失败',
						description: '根据当前查询条件未查询到任何日志文件。'
					});
					setDataSource([]);
					setTotal(0);
				}
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
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
		const url = `${api}/clusters/${clusterId}/middlewares/mysql/${middlewareName}/slowsql/file?startTime=${transTime.local2gmt2(
			rangeTime[0]
		)}&endTime=${transTime.local2gmt2(
			rangeTime[1]
		)}&searchType=${searchType}&searchWord=${keyword}&namespace=${namespace}`;
		window.open(url);
	};

	const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setKeyword(e.target.value);
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
				notification.error({
					message: '失败',
					description: '执行时长范围设置错误'
				});
				return;
			}
			setFromQueryTime(Number(value[0]));
			setToQueryTime(Number(value[1]));
		}
	};
	if (!logging || !logging.elasticSearch) {
		return (
			<ComponentsNull title="该功能所需要日志采集组件工具支持，您可前往“集群——>平台组件“进行安装" />
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
							style={{ marginRight: 12, padding: '0 9px' }}
							icon={<VerticalAlignBottomOutlined />}
						></Button>
					</>
				</div>
			</div>
			<ProTable dataSource={dataSource}>
				<ProTable.Column
					title="慢日志采集时间"
					dataIndex="timestampMysql"
					render={timeRender}
					width={160}
					// lock
				/>
				<ProTable.Column
					title="SQL语句"
					dataIndex="query"
					width={450}
				/>
				<ProTable.Column
					title="客户端IP"
					dataIndex="clientip"
					width={120}
				/>
				<ProTable.Column
					title="执行时长（秒）"
					dataIndex="queryTime"
					width={120}
				/>
				<ProTable.Column
					title="锁定时长（秒）"
					dataIndex="lockTime"
					width={120}
				/>
				<ProTable.Column
					title="解析行数"
					dataIndex="rowsExamined"
					width={90}
				/>
				<ProTable.Column
					title="返回行数"
					dataIndex="rowsSent"
					width={90}
				/>
			</ProTable>
			{/* <SPagination
				defaultCurrent={1}
				current={current}
				onChange={onChange}
				pageSize={10}
				total={total}
			/> */}
		</div>
	);
}
// const SPagination = styled(Pagination)`
// 	margin-top: 10px;
// 	display: flex;
// 	justify-content: flex-end;
// `;
