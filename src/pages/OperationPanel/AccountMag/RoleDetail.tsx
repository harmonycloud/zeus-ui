import { ProContent, ProHeader, ProPage } from '@/components/ProPage';
import React from 'react';
import { Table, Space, Button } from 'antd';
import { useParams } from 'react-router';
import type { ColumnsType } from 'antd/es/table';
import { RoleDetailParamsProps } from '../index.d';

interface DataType {
	id: number;
	database: string;
	role: string;
	openTime: string;
	deadline: string;
	lastActionTime: string;
}
const columns: ColumnsType<DataType> = [
	{
		title: '数据库',
		dataIndex: 'database',
		key: 'database'
	},
	{
		title: '权限类型',
		dataIndex: 'role',
		key: 'role'
	},
	{
		title: '开通时间',
		dataIndex: 'openTime',
		key: 'openTime'
	},
	{
		title: '到期时间',
		dataIndex: 'deadline',
		key: 'deadline'
	},
	{
		title: '上次操作时间',
		dataIndex: 'lastActionTime',
		key: 'lastActionTime'
	}
];
export default function RoleDetail(): JSX.Element {
	const params: RoleDetailParamsProps = useParams();
	return (
		<ProPage>
			<ProHeader
				onBack={() => window.history.back()}
				title={`权限详情${params.userName}`}
			/>
			<ProContent>
				<Space className="mb-8">
					<Button type="primary">延期权限</Button>
					<Button>释放权限</Button>
				</Space>
				<Table dataSource={[]} columns={columns} />
			</ProContent>
		</ProPage>
	);
}
