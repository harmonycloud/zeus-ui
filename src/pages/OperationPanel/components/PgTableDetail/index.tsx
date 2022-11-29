import React, { useState } from 'react';
import { notification, Table, Tabs } from 'antd';
import { useParams } from 'react-router';
import Actions from '@/components/Actions';
import { ParamsProps, PgsqlTableItem, PgTableDetailProps } from '../../index.d';
import { getPgsqlTableRows, getPgTables } from '@/services/operatorPanel';
import { useEffect } from 'react';
import PgColTable from './colTable';
import OpenTable from '../OpenTable';

const LinkButton = Actions.LinkButton;
function RowsRender({
	databaseName,
	tableName,
	schemaName,
	clusterId,
	namespace,
	middlewareName
}: {
	databaseName: string;
	tableName: string;
	schemaName: string;
	clusterId: string;
	namespace: string;
	middlewareName: string;
}) {
	const [count, setCount] = useState<number>();
	useEffect(() => {
		getPgsqlTableRows({
			databaseName,
			tableName,
			schemaName,
			clusterId,
			namespace,
			middlewareName
		}).then((res) => {
			if (res.success) {
				setCount(res.data);
			}
		});
	}, []);
	return <span>{count}</span>;
}
export default function PgTableDetail(props: PgTableDetailProps): JSX.Element {
	const { dbName, schemaName, add } = props;
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
			if (res.success) {
				setDataSource(res.data);
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
			render: (text: any, record: any) => (
				<RowsRender
					databaseName={dbName}
					tableName={record.tableName}
					schemaName={schemaName}
					clusterId={params.clusterId}
					namespace={params.namespace}
					middlewareName={params.name}
				/>
			),
			width: 80
		},
		{
			title: '操作',
			dataIndex: 'action',
			key: 'action',
			width: 250,
			render: (text: any, record: PgsqlTableItem, index: number) => (
				<Actions>
					<LinkButton
						onClick={() => {
							add(
								record.tableName,
								<OpenTable
									dbName={record.databaseName}
									tableName={record.tableName}
									schemaName={record.schemaName}
								/>
							);
						}}
					>
						打开
					</LinkButton>
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
							<PgColTable
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
			// scroll={{
			// 	y:
			// 		document.getElementsByClassName(
			// 			'ant-tabs-content-holder'
			// 		)[0].clientHeight - 50
			// }}
		/>
	);
}
