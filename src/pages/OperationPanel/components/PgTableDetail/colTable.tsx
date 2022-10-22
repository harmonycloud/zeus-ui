import { Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { MysqlColItem, PgsqlTableItem } from '../../index.d';
import { CheckOutlined } from '@ant-design/icons';
interface ColTableProps {
	record: PgsqlTableItem;
	clusterId: string;
	namespace: string;
	middlewareName: string;
	dbName: string;
}
export default function ColTable(props: ColTableProps): JSX.Element {
	const { record, clusterId, namespace, middlewareName, dbName } = props;
	const [data, setData] = useState<MysqlColItem[]>([]);
	useEffect(() => {
		// TODO pgsql 列数据获取
	}, []);
	const columns = [
		{
			title: '#',
			dataIndex: 'uid',
			key: 'uid',
			width: 50,
			render: (text: any, record: MysqlColItem, index: number) =>
				index + 1
		},
		{ title: '字段名', dataIndex: 'column', key: 'column' },
		{
			title: '类型',
			dataIndex: 'dateType',
			key: 'dateType',
			width: 150,
			ellipsis: true
		},
		{ title: '描述', dataIndex: 'comment', key: 'comment' },
		{
			title: '可空',
			dataIndex: 'nullable',
			key: 'nullable',
			width: 80,
			render: (text: any) => text && <CheckOutlined />
		},
		{
			title: '自增',
			dataIndex: 'autoIncrement',
			key: 'autoIncrement',
			width: 80,
			render: (text: any) => text && <CheckOutlined />
		},
		{ title: '默认值', dataIndex: 'columnDefault', key: 'columnDefault' }
	];
	return (
		<Table
			size="small"
			rowKey="uid"
			columns={columns}
			dataSource={data}
			pagination={false}
		/>
	);
}
