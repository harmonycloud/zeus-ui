import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, notification } from 'antd';
import { useParams } from 'react-router';
import Actions from '@/components/Actions';
import AddDatabase from './AddDatabase';
import { DatabaseItem, ParamsProps, PgsqslDatabaseItem } from '../index.d';
import AddPgDatabase from './AddPgDatabase';
import { getAllDatabase, deleteAllDatabase } from '@/services/operatorPanel';
const LinkButton = Actions.LinkButton;
const { confirm } = Modal;

// * 数据库的定义
export default function DatabaseMag(): JSX.Element {
	const params: ParamsProps = useParams();
	const [dataSource, setDataSource] = useState<
		DatabaseItem[] | PgsqslDatabaseItem[]
	>([]);
	const [open, setOpen] = useState<boolean>(false);
	const [pgOpen, setPgOpen] = useState<boolean>(false);
	const [mysqlEditData, setMysqlEditData] = useState<DatabaseItem>();
	const [pgsqlEditData, setPgsqlEditData] = useState<PgsqslDatabaseItem>();
	useEffect(() => {
		getAllData();
	}, []);
	const getAllData = () => {
		getAllDatabase({
			middlewareName: params.name,
			clusterId: params.clusterId,
			namespace: params.namespace,
			type: params.type
		}).then((res) => {
			if (res.success) {
				setDataSource(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const columns = [
		{
			title: '数据库名称',
			dataIndex: 'db',
			key: 'db',
			width: '25%'
		},
		{
			title: '字符集',
			dataIndex: 'character',
			key: 'character',
			width: '25%'
		},
		{
			title: '校验规则',
			dataIndex: 'collate',
			key: 'collate',
			width: '25%'
		},
		{
			title: '操作',
			key: 'action',
			width: '25%',
			render: (text: any, record: DatabaseItem | PgsqslDatabaseItem) => (
				<Actions>
					<LinkButton
						onClick={() => {
							setMysqlEditData(record as DatabaseItem);
							setOpen(true);
						}}
					>
						编辑
					</LinkButton>
					<LinkButton
						onClick={() => {
							confirm({
								title: '操作确认',
								content: `请确认是否删除${
									(record as DatabaseItem).db
								}数据库？`,
								onOk: () => {
									const sendData = {
										clusterId: params.clusterId,
										namespace: params.namespace,
										middlewareName: params.name,
										databaseName: (record as DatabaseItem)
											.db,
										type: 'mysql'
									};
									deleteAllDatabase(sendData)
										.then((res) => {
											if (res.success) {
												notification.success({
													message: '成功',
													description:
														'数据库删除成功！'
												});
											} else {
												notification.error({
													message: '失败',
													description: res.errorMsg
												});
											}
										})
										.finally(() => {
											getAllData();
										});
								}
							});
						}}
					>
						删除
					</LinkButton>
				</Actions>
			)
		}
	];
	const pgsqlColumns = [
		{
			title: '数据库名称',
			dataIndex: 'databaseName',
			key: 'databaseName'
		},
		{
			title: '字符集',
			dataIndex: 'encoding',
			key: 'encoding'
		},
		{
			title: '表空间',
			dataIndex: 'tablespace',
			key: 'tablespace'
		},
		{
			title: '所有者',
			dataIndex: 'owner',
			key: 'owner'
		},
		{
			title: '操作',
			dataIndex: 'action',
			key: 'action',
			render: (text: any, record: DatabaseItem | PgsqslDatabaseItem) => (
				<Actions>
					<LinkButton
						onClick={() => {
							setPgsqlEditData(record as PgsqslDatabaseItem);
							setPgOpen(true);
						}}
					>
						编辑
					</LinkButton>
					<LinkButton
						onClick={() => {
							confirm({
								title: '操作确认',
								content: `请确认是否删除${
									(record as PgsqslDatabaseItem).databaseName
								}数据库？`,
								onOk: () => {
									return deleteAllDatabase({
										clusterId: params.clusterId,
										namespace: params.namespace,
										middlewareName: params.name,
										databaseName: (
											record as PgsqslDatabaseItem
										).databaseName,
										type: 'postgresql'
									}).then((res) => {
										if (res.success) {
											notification.success({
												message: '成功',
												description: '数据库删除成功'
											});
										} else {
											notification.error({
												message: '失败',
												description: res.errorMsg
											});
										}
									});
								}
							});
						}}
					>
						删除
					</LinkButton>
				</Actions>
			)
		}
	];
	return (
		<main className="database-mag-main">
			<Button
				type="primary"
				className="mb-8"
				onClick={() => {
					params.type === 'mysql' ? setOpen(true) : setPgOpen(true);
				}}
			>
				新增
			</Button>
			<Table<DatabaseItem | PgsqslDatabaseItem>
				rowKey={params.type === 'mysql' ? 'db' : 'oid'}
				dataSource={dataSource}
				size="small"
				columns={params.type === 'mysql' ? columns : pgsqlColumns}
			/>
			{open && (
				<AddDatabase
					open={open}
					onCancel={() => setOpen(false)}
					clusterId={params.clusterId}
					namespace={params.namespace}
					middlewareName={params.name}
					editData={mysqlEditData}
					onRefresh={getAllData}
				/>
			)}
			{pgOpen && (
				<AddPgDatabase
					open={pgOpen}
					onCancel={() => setPgOpen(false)}
					clusterId={params.clusterId}
					namespace={params.namespace}
					middlewareName={params.name}
					editData={pgsqlEditData}
					onRefresh={getAllData}
				/>
			)}
		</main>
	);
}
