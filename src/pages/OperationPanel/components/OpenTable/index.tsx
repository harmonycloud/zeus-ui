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
import { ParamsProps, PgsqlColItem } from '../../index.d';

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
			fixed: 'left',
			render: (text: any, record: any, index: number) => index + 1
		}
	]);
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [current, setCurrent] = useState<number>(1);
	const [pageSize, setPageSize] = useState<number>(10);
	const [total, setTotal] = useState<number>();
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
					// TODO
					console.log(res);
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
						return result;
					});
					setColumns([...columns, ...list]);
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
					setTotal(res.data.length);
					setDataSource(res.data);
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
					setTotal(res.data.length);
					setDataSource(res.data.data);
				}
			});
		}
	}, []);
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
	return (
		<div style={{ width: '100%' }}>
			<Table<any>
				size="small"
				dataSource={dataSource}
				columns={columns}
				rowKey="columnName"
				scroll={{ x: 150 * columns.length + 180 }}
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
	);
}
