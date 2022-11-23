import React, { useState } from 'react';
import { Table, Tabs } from 'antd';
import { useParams } from 'react-router';
import Actions from '@/components/Actions';
import { MysqlTableItem, ParamsProps, TableDetailProps } from '../../index.d';
import { getDbTables } from '@/services/operatorPanel';
import { useEffect } from 'react';
import ColTable from './colTable';
import IndexTable from './indexTable';

const LinkButton = Actions.LinkButton;

export default function TableDetail(props: TableDetailProps): JSX.Element {
	const { dbName } = props;
	const params: ParamsProps = useParams();
	const [dataSource, setDataSource] = useState<MysqlTableItem[]>([]);
	useEffect(() => {
		const sendData = {
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name,
			database: dbName
		};
		getDbTables(sendData).then((res) => {
			if (res.success) {
				setDataSource(res.data);
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
			dataIndex: 'charset',
			key: 'charset'
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

	const expandedRowRender = (record: MysqlTableItem) => {
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
					},
					{
						label: '索引',
						key: 'index',
						children: (
							<IndexTable
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
			scroll={{
				y:
					document.getElementsByClassName(
						'ant-tabs-content-holder'
					)[0].clientHeight - 70
			}}
		/>
	);
}