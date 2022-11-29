import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import Actions from '@/components/Actions';
import ProTable from '@/components/ProTable';
import { Button, Modal, notification } from 'antd';
import CreateMode from './CreateMode';
import { ModeMagProps, ParamsProps, SchemaItem } from '../index.d';
import { getSchemas, deleteSchemas } from '@/services/operatorPanel';

const { confirm } = Modal;
const LinkButton = Actions.LinkButton;
export default function ModeMag(props: ModeMagProps): JSX.Element {
	const { dbName, onRefresh } = props;
	const params: ParamsProps = useParams();
	const [open, setOpen] = useState<boolean>(false);
	const [dataSource, setDataSource] = useState<SchemaItem[]>([]);
	const [showDataSource, setShowDataSource] = useState<SchemaItem[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [editData, setEditData] = useState<SchemaItem>();
	useEffect(() => {
		getData();
	}, []);
	const getData = () => {
		setKeyword('');
		getSchemas({
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name,
			databaseName: dbName
		}).then((res) => {
			if (res.success) {
				setDataSource(res.data);
				setShowDataSource(res.data);
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
	};
	const operation = {
		primary: (
			<Button type="primary" onClick={() => setOpen(true)}>
				创建模式
			</Button>
		)
	};
	const handleSearch = (value: string) => {
		setKeyword(value);
		setShowDataSource(
			dataSource.filter((item: SchemaItem) =>
				item.schemaName.includes(value)
			)
		);
	};
	const handleChange = (e: any) => {
		setKeyword(e.target.value);
	};
	const actionRender = (text: string, record: SchemaItem) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						setEditData(record);
						setOpen(true);
					}}
				>
					编辑
				</LinkButton>
				<LinkButton
					onClick={() => {
						confirm({
							title: '操作确认',
							content: `请确认是否删除${record.schemaName}模式`,
							onOk: () => {
								return deleteSchemas({
									clusterId: params.clusterId,
									namespace: params.namespace,
									middlewareName: params.name,
									databaseName: dbName,
									schemaName: record.schemaName
								}).then((res) => {
									if (res.success) {
										notification.success({
											message: '成功',
											description: '模式删除成功！'
										});
										getData();
										onRefresh();
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
							}
						});
					}}
				>
					删除
				</LinkButton>
			</Actions>
		);
	};
	return (
		<>
			<ProTable
				dataSource={showDataSource}
				rowKey="oid"
				onRefresh={getData}
				showRefresh
				operation={operation}
				size="small"
				search={{
					placeholder: '请输入模式名进行搜索',
					onSearch: handleSearch,
					value: keyword,
					onChange: handleChange
				}}
			>
				<ProTable.Column dataIndex="schemaName" title="模式名" />
				<ProTable.Column dataIndex="databaseName" title="数据库名" />
				<ProTable.Column dataIndex="owner" title="所有者" />
				<ProTable.Column dataIndex="comment" title="备注" />
				<ProTable.Column
					dataIndex="action"
					title="操作"
					render={actionRender}
					width={100}
				/>
			</ProTable>
			{open && (
				<CreateMode
					open={open}
					onCancel={() => setOpen(false)}
					clusterId={params.clusterId}
					namespace={params.namespace}
					middlewareName={params.name}
					databaseName={dbName}
					onRefresh={getData}
					onPgsqlTreeRefresh={onRefresh}
					editData={editData}
				/>
			)}
		</>
	);
}
