import { Table } from 'antd';
import React, { useState } from 'react';
import { MysqlTableItem } from '../../index.d';

interface IndexTableProps {
	record: MysqlTableItem;
	clusterId: string;
	namespace: string;
	middlewareName: string;
	dbName: string;
}
export default function IndexTable(props: IndexTableProps): JSX.Element {
	const [data, setData] = useState([]);
	const columns = [
		{ title: '#', dataIndex: 'uid', key: 'uid' },
		{ title: '索引名', dataIndex: 'indexName', key: 'indexName' },
		{ title: '索引类型', dataIndex: 'indexType', key: 'indexType' },
		{ title: '包含列', dataIndex: 'includeCol', key: 'includeCol' },
		{ title: '备注', dataIndex: 'remark', key: 'remark' }
	];
	return (
		<Table
			dataSource={[]}
			rowKey="uid"
			columns={columns}
			pagination={false}
		/>
	);
}
