import React, { useEffect, useState } from 'react';
import { Table, Space, Button, notification } from 'antd';
import { useParams } from 'react-router';
import { ProContent, ProHeader, ProPage } from '@/components/ProPage';
import {
	cancelAuthParamsProps,
	getUserAuthParamsProps,
	MysqlUserAuthItem,
	ParamsProps,
	PgsqlUserAuthItem
} from '../index.d';
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
		key: 'authority',
		render: (text: string) => {
			if (text === 'readOnly') return '访问';
			if (text === 'readWrite') return '读写';
			if (text === 'owner') return '拥有者';
		}
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
		const sendData: getUserAuthParamsProps = {
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name,
			type: params.type,
			username:
				params.type === 'mysql'
					? storageUser.user
					: storageUser.username
		};
		if (params.type === 'postgresql') {
			sendData.oid = storageUser.id;
		}
		getUserAuth(sendData).then((res) => {
			if (res.success) {
				if (params.type === 'mysql') {
					setDataSource(res.data as MysqlUserAuthItem[]);
				} else {
					setDataSource(
						res.data.map((item, index) => {
							item.id = index;
							return item;
						}) as PgsqlUserAuthItem[]
					);
				}
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
		const sendData: cancelAuthParamsProps = {
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name,
			type: params.type,
			username:
				params.type === 'mysql'
					? storageUser.user
					: storageUser.username,
			authority: params.type === 'mysql' ? 'privilege' : 'authority'
		};
		if (params.type === 'mysql') {
			sendData.grantOptionDtos = selectedAuths as MysqlUserAuthItem[];
		} else {
			sendData.authorityList = selectedAuths as PgsqlUserAuthItem[];
		}
		cancelAuth(sendData)
			.then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '权限释放成功！'
					});
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
						: storageUser.username
				}`}
			/>
			<ProContent>
				<Space className="mb-8">
					<Button
						onClick={releaseAuth}
						disabled={!selectedAuths.length}
					>
						释放权限
					</Button>
				</Space>
				<Table<PgsqlUserAuthItem | MysqlUserAuthItem>
					dataSource={dataSource}
					rowKey="id"
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
