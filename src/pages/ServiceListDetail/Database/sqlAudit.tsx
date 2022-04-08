import React, { useState, useEffect } from 'react';
import {
	Button,
	Message,
	Table,
	Search,
	Icon,
	Pagination
} from '@alicloud/console-components';
import moment from 'moment';
import { queryAuditSql } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import { nullRender } from '@/utils/utils';
import { ManageProps } from './database';
import styled from 'styled-components';

function SqlAudit(props: ManageProps): JSX.Element {
	const { clusterId, namespace, middlewareName } = props;

	const [dataSource, setDataSource] = useState<any[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [current, setCurrent] = useState<number>(1); // * 页码
	const [total, setTotal] = useState<number | undefined>(10); // * 总数

	useEffect(() => {
		queryAuditSql({
			searchWord: keyword,
			clusterId,
			namespace,
			middlewareName,
			current: 1,
			size: 10
		}).then((res) => {
			if (res.success) {
				res.data && setDataSource(res.data.data);
				res.data && setTotal(res.data.count);
			} else {
				Message.show(messageConfig('error', '失败', res.errorMsg));
			}
		});
	}, []);

	const onRefresh: () => void = () => {
		queryAuditSql({
			searchWord: keyword,
			clusterId,
			namespace,
			middlewareName,
			current,
			size: 10
		}).then((res) => {
			if (res.success) {
				res.data && setDataSource(res.data.data);
				res.data && setTotal(res.data.count);
			} else {
				Message.show(messageConfig('error', '失败', res.errorMsg));
			}
		});
	};
	const handleChange: (value: string) => void = (value: string) => {
		setKeyword(value);
	};
	const handleSearch: (value: string) => void = (value: string) => {
		onRefresh();
	};
	const onSort = (dataIndex: string, order: string) => {
		if (dataIndex === 'queryDate') {
			const dsTemp = dataSource.sort((a, b) => {
				const result =
					moment(a[dataIndex]).unix() - moment(b[dataIndex]).unix();
				return order === 'asc'
					? result > 0
						? 1
						: -1
					: result > 0
					? -1
					: 1;
			});
			setDataSource([...dsTemp]);
		}
	};

	const createTimeRender = (value: string) => {
		if (!value) return '--';
		return moment(value).format('YYYY-MM-DD HH:mm:ss');
	};

	const pageChange = (current: number) => {
		setCurrent(current);
		queryAuditSql({
			searchWord: keyword,
			clusterId,
			namespace,
			middlewareName,
			current: current,
			size: 10
		}).then((res) => {
			if (res.success) {
				res.data && setDataSource(res.data.data);
				res.data && setTotal(res.data.count);
			} else {
				Message.show(messageConfig('error', '失败', res.errorMsg));
			}
		});
	};
	return (
		<>
			<div className="audit-table-header-layout">
				<Search
					onSearch={handleSearch}
					onChange={handleChange}
					placeholder="请输入内容"
					style={{
						width: '360px'
					}}
					hasClear={true}
				/>
				<div>
					<Button onClick={onRefresh} style={{ padding: '0 9px' }}>
						<Icon type="refresh" />
					</Button>
				</div>
			</div>
			<div id="filter-cas"></div>
			<Table
				dataSource={dataSource}
				primaryKey="key"
				hasBorder={false}
				onSort={onSort}
			>
				<Table.Column title="操作ip" dataIndex="ip" width={100} />
				<Table.Column
					title="操作账户"
					dataIndex="user"
					width={100}
					cell={nullRender}
				/>
				<Table.Column
					title="数据库名称"
					dataIndex="db"
					cell={nullRender}
					width={100}
				/>
				<Table.Column
					title="执行语句"
					dataIndex="query"
					cell={nullRender}
				/>
				<Table.Column
					title="执行时间"
					dataIndex="queryDate"
					cell={createTimeRender}
					width={160}
					sortable
				/>
			</Table>
			<SPagination
				onChange={pageChange}
				total={total}
				current={current}
				pageSizeSelector={false}
			/>
		</>
	);
}
const SPagination = styled(Pagination)`
	margin-top: 10px;
	float: right;
`;

export default SqlAudit;
