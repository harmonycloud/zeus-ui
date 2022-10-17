import React, { useState } from 'react';
import { Button, Table, Modal } from 'antd';
import { useParams } from 'react-router';
import Actions from '@/components/Actions';
import AddDatabase from './AddDatabase';
import { ParamsProps } from '../index.d';
import AddPgDatabase from './AddPgDatabase';
const LinkButton = Actions.LinkButton;
const { confirm } = Modal;

// * 数据库的定义
export default function DatabaseMag(): JSX.Element {
	const params: ParamsProps = useParams();
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [open, setOpen] = useState<boolean>(false);
	const [pgOpen, setPgOpen] = useState<boolean>(false);
	const columns = [
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
			title: '校验规则',
			dataIndex: 'rules',
			key: 'rules'
		},
		{
			title: '操作',
			key: 'action',
			render: () => (
				<Actions>
					<LinkButton onClick={() => setOpen(true)}>编辑</LinkButton>
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
				rowKey="id"
				dataSource={dataSource}
				columns={params.type === 'mysql' ? columns : pgsqlColumns}
			/>
			{open && (
				<AddDatabase open={open} onCancel={() => setOpen(false)} />
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
