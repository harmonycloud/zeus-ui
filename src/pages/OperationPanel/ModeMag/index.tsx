import React, { useState } from 'react';
import Actions from '@/components/Actions';
import ProTable from '@/components/ProTable';
import { Button, Modal } from 'antd';
import CreateMode from './CreateMode';

const { confirm } = Modal;
const LinkButton = Actions.LinkButton;
export default function ModeMag(): JSX.Element {
	const [open, setOpen] = useState<boolean>(false);
	const operation = {
		primary: (
			<Button type="primary" onClick={() => setOpen(true)}>
				创建模式
			</Button>
		)
	};
	const handleSearch = (value: string) => {
		console.log(value);
	};
	const actionRender = (text: string, record: any) => {
		return (
			<Actions>
				<LinkButton onClick={() => setOpen(true)}>编辑</LinkButton>
				<LinkButton
					onClick={() => {
						confirm({
							title: '操作确认',
							content: '请确认是否删除该模式',
							onOk: () => {
								console.log('click ok');
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
				dataSource={[]}
				rowKey="id"
				onRefresh={() => {
					console.log('refresh');
				}}
				showRefresh
				operation={operation}
				search={{
					placeholder: '请输入模式名进行搜索',
					onSearch: handleSearch
				}}
			>
				<ProTable.Column dataIndex="modeName" title="模式名" />
				<ProTable.Column dataIndex="databaseName" title="模式名" />
				<ProTable.Column dataIndex="owner" title="所有者" />
				<ProTable.Column dataIndex="remark" title="备注" />
				<ProTable.Column
					dataIndex="action"
					title="操作"
					render={actionRender}
				/>
			</ProTable>
			{open && <CreateMode open={open} onCancel={() => setOpen(false)} />}
		</>
	);
}
