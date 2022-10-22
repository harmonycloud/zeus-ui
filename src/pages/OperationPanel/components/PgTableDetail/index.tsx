import React, { useState } from 'react';
import { notification, Table, Tabs } from 'antd';
import { useParams } from 'react-router';
import Actions from '@/components/Actions';
import { ParamsProps, PgsqlTableItem, PgTableDetailProps } from '../../index.d';
import { getPgTables } from '@/services/operatorPanel';
import { useEffect } from 'react';
import ColTable from './colTable';

const LinkButton = Actions.LinkButton;

export default function PgTableDetail(props: PgTableDetailProps): JSX.Element {
	const { dbName, schemaName } = props;
	const params: ParamsProps = useParams();
	const [dataSource, setDataSource] = useState<PgsqlTableItem[]>([]);
	useEffect(() => {
		const sendData = {
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name,
			databaseName: dbName,
			schemaName
		};
		getPgTables(sendData).then((res) => {
			console.log(res);
			if (res.success) {
				setDataSource(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, []);
	const columns = [
		{
			title: '表名',
			dataIndex: 'tableName',
			key: 'tableName'
		},
		{
			title: '字符集',
			dataIndex: 'encoding',
			key: 'encoding'
		},
		{
			title: '行数',
			dataIndex: 'rows',
			key: 'rows',
			width: 80
		},
		{
			title: '操作',
			dataIndex: 'action',
			key: 'action',
			width: 250,
			render: () => (
				<Actions>
					<LinkButton>打开</LinkButton>
					<LinkButton>导出建表语句</LinkButton>
					<LinkButton>导出表结构</LinkButton>
				</Actions>
			)
		}
	];

	const expandedRowRender = (record: any) => {
		return (
			<Tabs
				style={{ paddingLeft: '45px' }}
				type="card"
				size="small"
				items={[
					{
						label: '列',
						key: 'col',
						children: (
							<ColTable
								record={record}
								clusterId={params.clusterId}
								namespace={params.namespace}
								middlewareName={params.name}
								dbName={dbName}
							/>
						)
					}
				]}
			/>
		);
	};
	return (
		<Table
			size="small"
			rowKey="tableName"
			expandable={{ expandedRowRender }}
			dataSource={dataSource}
			columns={columns}
		/>
	);
}
