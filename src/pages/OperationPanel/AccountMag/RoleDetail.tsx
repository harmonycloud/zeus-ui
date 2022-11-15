import React, { useEffect, useState } from 'react';
import { Table, Space, Button, notification } from 'antd';
import { useParams } from 'react-router';
import { ProContent, ProHeader, ProPage } from '@/components/ProPage';
import { MysqlUserAuthItem, ParamsProps, PgsqlUserAuthItem } from '../index.d';
import { getUserAuth, cancelAuth } from '@/services/operatorPanel';
import storage from '@/utils/storage';

const columns = [
	{
		title: '数据库',
		dataIndex: 'database',
		key: 'database'
	},
	{
		title: '模式',
		dataIndex: 'schema',
		key: 'schema'
	},
	{
		title: '数据表',
		dataIndex: 'table',
		key: 'table'
	},
	{
		title: '权限类型',
		dataIndex: 'authority',
		key: 'authority'
	}
];
const mysqlColumns = [
	{
		title: '数据库',
		dataIndex: 'db',
		key: 'db'
	},
	{
		title: '数据表',
		dataIndex: 'table',
		key: 'table'
	},
	{
		title: '权限类型',
		dataIndex: 'privilegeType',
		key: 'privilegeType',
		render: (text: any) => {
			switch (text) {
				case 1:
					return '只读';
				case 2:
					return '管理';
				case 3:
					return '读写';
				default:
					return '-';
			}
		}
	}
];
export default function RoleDetail(): JSX.Element {
	const params: ParamsProps = useParams();
	const [dataSource, setDataSource] = useState<
		PgsqlUserAuthItem[] | MysqlUserAuthItem[]
	>([]);
	const [selectedAuths, setSelectedAuths] = useState<
		PgsqlUserAuthItem[] | MysqlUserAuthItem[]
	>([]);
	const storageUser = storage.getSession('operatorUser');
	useEffect(() => {
		getData();
	}, []);
	const getData = () => {
		getUserAuth({
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name,
			type: params.type,
			username:
				params.type === 'mysql'
					? storageUser.user
					: storageUser.userName
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
	const rowSelection = {
		onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
			setSelectedAuths(selectedRows);
		}
	};
	const releaseAuth = () => {
		cancelAuth({
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name,
			type: params.type,
			username:
				params.type === 'mysql'
					? storageUser.user
					: storageUser.userName,
			authorityList: selectedAuths
		})
			.then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '权限释放成功！'
					});
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			})
			.finally(() => {
				getData();
			});
	};
	return (
		<ProPage>
			<ProHeader
				onBack={() => window.history.back()}
				title={`权限详情${
					params.type === 'mysql'
						? storageUser.user
						: storageUser.userName
				}`}
			/>
			<ProContent>
				<Space className="mb-8">
					<Button onClick={releaseAuth}>释放权限</Button>
				</Space>
				<Table<PgsqlUserAuthItem | MysqlUserAuthItem>
					dataSource={dataSource}
					columns={params.type === 'mysql' ? mysqlColumns : columns}
					rowSelection={{
						type: 'checkbox',
						...rowSelection
					}}
				/>
			</ProContent>
		</ProPage>
	);
}
