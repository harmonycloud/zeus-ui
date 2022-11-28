import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { PaginationProps, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
	getCols,
	getPgCols,
	getPgsqlData,
	getMysqlData
} from '@/services/operatorPanel';
import {
	MysqlColItem,
	OrderDtoItem,
	ParamsProps,
	PgsqlColItem
} from '../../index.d';

interface OpenTableProps {
	dbName: string;
	tableName: string;
	schemaName?: string;
}
export default function OpenTable(props: OpenTableProps): JSX.Element {
	const params: ParamsProps = useParams();
	const { dbName, tableName, schemaName } = props;
	const [columns, setColumns] = useState<ColumnsType<any>>([
		{
			title: '序号',
			dataIndex: 'indexInTable',
			key: 'indexInTable',
			width: 80,
			fixed: 'left'
		}
	]);
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [current, setCurrent] = useState<number>(1);
	const [pageSize, setPageSize] = useState<number>(10);
	const [total, setTotal] = useState<number>();
	const [orderDtoList, setOrderDtoList] = useState<OrderDtoItem[]>([]);
	useEffect(() => {
		if (params.type === 'mysql') {
			getCols({
				clusterId: params.clusterId,
				namespace: params.namespace,
				middlewareName: params.name,
				database: dbName,
				table: tableName
			}).then((res) => {
				if (res.success) {
					const list = res.data.map((item: MysqlColItem) => {
						const result: any = {};
						result.title = item.column;
						result.dataIndex = item.column;
						result.key = item.column;
						result.width = 150;
						result.sorter = true;
						return result;
					});
					setColumns([...columns, ...list]);
					const orderTemps = res.data.map((item: MysqlColItem) => {
						const result: any = {};
						result.column = item.column;
						result.order = '';
						return result;
					});
					setOrderDtoList(orderTemps);
				}
			});
		} else {
			getPgCols({
				clusterId: params.clusterId,
				namespace: params.namespace,
				middlewareName: params.name,
				databaseName: dbName,
				schemaName: schemaName || '',
				tableName: tableName
			}).then((res) => {
				if (res.success) {
					const list = res.data.map((item: PgsqlColItem) => {
						const result: any = {};
						result.title = item.column;
						result.dataIndex = item.column;
						result.key = item.column;
						result.width = 150;
						result.sorter = true;
						result.ellipsis = true;
						return result;
					});
					setColumns([...columns, ...list]);
					const orderTemps = res.data.map((item: PgsqlColItem) => {
						const result: any = {};
						result.column = item.column;
						result.order = '';
						return result;
					});
					setOrderDtoList(orderTemps);
				}
			});
		}
	}, []);
	useEffect(() => {
		if (params.type === 'mysql') {
			getMysqlData({
				clusterId: params.clusterId,
				database: dbName,
				middlewareName: params.name,
				namespace: params.namespace,
				table: tableName,
				index: 1,
				pageSize: 10,
				orderDtoList: []
			}).then((res) => {
				if (res.success) {
					let list = [];
					list = res.data.list.map(
						(item: MysqlColItem, index: number) => {
							const result: any = item;
							result.indexInTable = index + 1;
							return result;
						}
					);
					setTotal(res.data.total);
					setDataSource(list);
				}
			});
		} else {
			getPgsqlData({
				clusterId: params.clusterId,
				databaseName: dbName,
				middlewareName: params.name,
				namespace: params.namespace,
				tableName: tableName,
				schemaName: schemaName,
				index: 1,
				pageSize: 10,
				orderDtoList: []
			}).then((res) => {
				if (res.success) {
					let list = [];
					list = res.data.list.map(
						(item: PgsqlColItem, index: number) => {
							const result: any = item;
							result.indexInTable = index + 1;
							return result;
						}
					);
					setTotal(res.data.total);
					setDataSource(list);
				}
			});
		}
	}, []);
	const showTotal: PaginationProps['showTotal'] = (total) => `共 ${total} 条`;
	const handleTableChange = (
		pagination: any,
		filters: any,
		sorter: any,
		extra: any
	) => {
		const list = [...orderDtoList].map((item: OrderDtoItem) => {
			console.log(sorter);
			if (item.column === sorter.columnKey) {
				item.order =
					sorter.order?.substring(0, sorter.order.length - 3) || '';
			}
			return item;
		});
		setOrderDtoList(list);
		setCurrent(pagination.current);
		setPageSize(pagination.pageSize);
		getData(pagination.current, pagination.pageSize, list);
	};
	const getData = (
		index: number,
		pageSize: number,
		orderList: OrderDtoItem[]
	) => {
		if (params.type === 'mysql') {
			getMysqlData({
				clusterId: params.clusterId,
				database: dbName,
				middlewareName: params.name,
				namespace: params.namespace,
				table: tableName,
				index: index,
				pageSize: pageSize,
				orderDtoList: orderList
			}).then((res) => {
				if (res.success) {
					let list = [];
					list = res.data.list.map(
						(item: MysqlColItem, index: number) => {
							const result: any = item;
							result.indexInTable = index + 1;
							return result;
						}
					);
					setTotal(res.data.total);
					setDataSource(list);
				}
			});
		} else {
			getPgsqlData({
				clusterId: params.clusterId,
				databaseName: dbName,
				middlewareName: params.name,
				namespace: params.namespace,
				tableName: tableName,
				schemaName: schemaName,
				index: current,
				pageSize: pageSize,
				orderDtoList: orderList
			}).then((res) => {
				if (res.success) {
					let list = [];
					list = res.data.list.map(
						(item: PgsqlColItem, index: number) => {
							const result: any = item;
							result.indexInTable = index + 1;
							return result;
						}
					);
					setTotal(res.data.total);
					setDataSource(list);
				}
			});
		}
	};
	return (
		<div style={{ width: '100%' }}>
			<Table<any>
				size="small"
				dataSource={dataSource}
				columns={columns}
				rowKey="indexInTable"
				scroll={{ x: 150 * columns.length + 180 }}
				onChange={handleTableChange}
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
		</div>
	);
}
