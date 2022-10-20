import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, notification } from 'antd';
import { useParams } from 'react-router';
import Actions from '@/components/Actions';
import AddDatabase from './AddDatabase';
import { DatabaseItem, ParamsProps } from '../index.d';
import AddPgDatabase from './AddPgDatabase';
import { getDatabases, deleteDatabase } from '@/services/operatorPanel';
const LinkButton = Actions.LinkButton;
const { confirm } = Modal;

// * 数据库的定义
export default function DatabaseMag(): JSX.Element {
	const params: ParamsProps = useParams();
	const [mysqlDataSource, setMysqlDataSource] = useState<DatabaseItem[]>([]);
	const [open, setOpen] = useState<boolean>(false);
	const [pgOpen, setPgOpen] = useState<boolean>(false);
	const [mysqlEditData, setMysqlEditData] = useState<DatabaseItem>();
	useEffect(() => {
		if (params.type === 'mysql') {
			getMysqlData();
		}
	}, []);
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
			render: (text: any, record: DatabaseItem) => (
				<Actions>
					<LinkButton
						onClick={() => {
							setMysqlEditData(record);
							setOpen(true);
						}}
					>
						编辑
					</LinkButton>
					<LinkButton
						onClick={() => {
							confirm({
								title: '操作确认',
								content: '请确认是否删除该数据库？',
								onOk: () => {
									const sendData = {
										clusterId: params.clusterId,
										namespace: params.namespace,
										middlewareName: params.name,
										database: record.db
									};
									deleteDatabase(sendData)
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
											getMysqlData();
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
			dataIndex: 'name',
			key: 'name'
		},
		{
			title: '字符集',
			dataIndex: 'characterSet',
			key: 'characterSet'
		},
		{
			title: '表空间',
			dataIndex: 'tableSpace',
			key: 'tableSpace'
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
			render: () => (
				<Actions>
					<LinkButton>编辑</LinkButton>
					<LinkButton
						onClick={() => {
							confirm({
								title: '操作确认',
								content: '请确认是否删除该数据库？',
								onOk: () => {
									console.log('click ok');
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
	const getMysqlData = () => {
		getDatabases({
			middlewareName: params.name,
			clusterId: params.clusterId,
			namespace: params.namespace
		}).then((res) => {
			if (res.success) {
				setMysqlDataSource(res.data);
			}
		});
	};
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
			<Table
				rowKey="db"
				dataSource={mysqlDataSource}
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
					onRefresh={getMysqlData}
				/>
			)}
			{pgOpen && (
				<AddPgDatabase
					open={pgOpen}
					onCancel={() => setPgOpen(false)}
				/>
			)}
		</main>
	);
}
