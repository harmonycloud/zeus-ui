import React, { useState, useEffect } from 'react';
import { notification } from 'antd';
import ProTable from '@/components/ProTable';

import moment from 'moment';
import { queryAuditSql } from '@/services/middleware';
import { nullRender } from '@/utils/utils';
import { ManageProps } from './database';

function SqlAudit(props: ManageProps): JSX.Element {
	const { clusterId, namespace, middlewareName } = props;

	const [dataSource, setDataSource] = useState<any[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [current, setCurrent] = useState<number>(1); // * 页码
	const [pageSize, setPageSize] = useState<number>(); // * 每页条数
	const [total, setTotal] = useState<number | undefined>(10); // * 总数

	useEffect(() => {
		queryAuditSql({
			searchWord: keyword,
			clusterId,
			namespace,
			middlewareName,
			current: 1,
			size: pageSize || 10
		}).then((res) => {
			if (res.success) {
				res.data && setDataSource(res.data.data);
				res.data && setTotal(res.data.count);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, [keyword]);

	const onRefresh: () => void = () => {
		queryAuditSql({
			searchWord: keyword,
			clusterId,
			namespace,
			middlewareName,
			current,
			size: pageSize || 10
		}).then((res) => {
			if (res.success) {
				res.data && setDataSource(res.data.data);
				res.data && setTotal(res.data.count);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
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
			size: pageSize || 10
		}).then((res) => {
			if (res.success) {
				res.data && setDataSource(res.data.data);
				res.data && setTotal(res.data.count);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	return (
		<>
			{/* <div className="audit-table-header-layout">
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
			<div id="filter-cas"></div> */}
			<ProTable
				dataSource={dataSource}
				rowKey="key"
				// bordered={false}
				// pagination={{
				// 	total: total,
				// 	current: current,
				// 	pageSize: pageSize
				// }}
				showRefresh
				search={{
					onSearch: handleChange,
					placeholder: '请输入内容',
					style: { width: '360px' }
				}}
				onRefresh={onRefresh}
				// onSort={onSort}
			>
				<ProTable.Column title="操作ip" dataIndex="ip" width={100} />
				<ProTable.Column
					title="操作账户"
					dataIndex="user"
					width={100}
					render={nullRender}
				/>
				<ProTable.Column
					title="数据库名称"
					dataIndex="db"
					render={nullRender}
					width={100}
				/>
				<ProTable.Column
					title="执行语句"
					dataIndex="query"
					render={nullRender}
				/>
				<ProTable.Column
					title="执行时间"
					dataIndex="queryDate"
					render={createTimeRender}
					width={160}
					// sortable
				/>
			</ProTable>
		</>
	);
}

export default SqlAudit;
