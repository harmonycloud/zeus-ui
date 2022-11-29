import { getIndexs } from '@/services/operatorPanel';
import { notification, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { IndexItem, MysqlTableItem } from '../../index.d';

interface IndexTableProps {
	record: MysqlTableItem;
	clusterId: string;
	namespace: string;
	middlewareName: string;
	dbName: string;
}
export default function IndexTable(props: IndexTableProps): JSX.Element {
	const { clusterId, namespace, middlewareName, dbName, record } = props;
	const [data, setData] = useState<IndexItem[]>([]);
	const columns = [
		{
			title: '序号',
			dataIndex: 'uid',
			key: 'uid',
			render: (text: any, record: any, index: number) => index + 1
		},
		{ title: '索引名', dataIndex: 'index', key: 'index' },
		{ title: '索引类型', dataIndex: 'type', key: 'type' },
		{ title: '包含列', dataIndex: 'includeCol', key: 'includeCol' },
		{ title: '备注', dataIndex: 'comment', key: 'comment' }
	];
	useEffect(() => {
		getIndexs({
			clusterId,
			namespace,
			middlewareName,
			database: dbName,
			table: record.tableName
		}).then((res) => {
			if (res.success) {
				setData(res.data);
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
	}, []);
	return (
		<Table
			dataSource={data}
			rowKey="index"
			columns={columns}
			pagination={false}
			scroll={{ y: 200 }}
		/>
	);
}
