import { notification, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { PgsqlColItem, PgsqlTableItem } from '../../index.d';
import { CheckOutlined } from '@ant-design/icons';
import { getPgCols } from '@/services/operatorPanel';
interface ColTableProps {
	record: PgsqlTableItem;
	clusterId: string;
	namespace: string;
	middlewareName: string;
	dbName: string;
}
export default function PgColTable(props: ColTableProps): JSX.Element {
	const { record, clusterId, namespace, middlewareName, dbName } = props;
	const [data, setData] = useState<PgsqlColItem[]>([]);
	useEffect(() => {
		getPgCols({
			clusterId,
			namespace,
			middlewareName,
			databaseName: dbName,
			schemaName: record.schemaName,
			tableName: record.tableName
		}).then((res) => {
			if (res.success) {
				console.log(res);
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
	const columns = [
		{
			title: '#',
			dataIndex: 'num',
			key: 'num',
			width: 50
		},
		{ title: '字段名', dataIndex: 'columnName', key: 'columnName' },
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
			dataIndex: 'inc',
			key: 'inc',
			width: 80,
			render: (text: any) => text && <CheckOutlined />
		},
		{ title: '默认值', dataIndex: 'defaultValue', key: 'defaultValue' }
	];
	return (
		<Table
			size="small"
			rowKey="columnName"
			columns={columns}
			dataSource={data}
			pagination={false}
			scroll={{ y: 200 }}
		/>
	);
}
