import React, { useState } from 'react';
import { Button, Table, Modal } from 'antd';
import Actions from '@/components/Actions';
import AddDatabase from './AddDatabase';
const LinkButton = Actions.LinkButton;
const { confirm } = Modal;

// * 数据库的定义
export default function DatabaseMag(): JSX.Element {
	const [dataSource, setDataSource] = useState<any[]>([
		{ id: 1, name: 'test', characterSet: 'utf8', rules: 'sss' }
	]);
	const [open, setOpen] = useState<boolean>(false);
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
			title: 'Action',
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
	return (
		<main className="database-mag-main">
			<Button
				type="primary"
				className="mb-8"
				onClick={() => setOpen(true)}
			>
				新增
			</Button>
			<Table rowKey="id" dataSource={dataSource} columns={columns} />
			{open && (
				<AddDatabase open={open} onCancel={() => setOpen(false)} />
			)}
		</main>
	);
}
