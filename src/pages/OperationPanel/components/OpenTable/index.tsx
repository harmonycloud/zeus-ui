import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { getCols } from '@/services/operatorPanel';
import { ParamsProps } from '../../index.d';

interface OpenTableProps {
	dbName: string;
	tableName: string;
}
export default function OpenTable(props: OpenTableProps): JSX.Element {
	const params: ParamsProps = useParams();
	const { dbName, tableName } = props;
	const [columns, setColumns] = useState<ColumnsType<any>>([]);
	useEffect(() => {
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
	}, []);
	return <Table<any> size="small" dataSource={[]} columns={columns} />;
}
