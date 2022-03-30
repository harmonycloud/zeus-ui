import React, { useState, useEffect } from 'react';
import { Button, Message } from '@alicloud/console-components';
import Confirm from '@alicloud/console-components-confirm';
import { useParams } from 'react-router';
import Table from '@/components/MidTable';
import { getProjectNamespace } from '@/services/project';
import { DetailParams, NamespaceItem } from './projectDetail';
import AddNamespace from './addNamespace';
import messageConfig from '@/components/messageConfig';
import { Actions, LinkButton } from '@alicloud/console-components-actions';
import { deleteNamespace } from '@/services/common';

export default function Namespace(): JSX.Element {
	const [dataSource, setDataSource] = useState<NamespaceItem[]>([]);
	const [showDataSource, setShowDataSource] = useState<NamespaceItem[]>([]);
	const params: DetailParams = useParams();
	const { id } = params;
	const [visible, setVisible] = useState<boolean>(false);
	useEffect(() => {
		let mounted = true;
		getProjectNamespace({ projectId: id }).then((res) => {
			if (mounted) {
				if (res.success) {
					setDataSource(res.data);
					setShowDataSource(res.data);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			}
		});
		return () => {
			mounted = false;
		};
	}, [id]);
	const getData = () => {
		getProjectNamespace({ projectId: id }).then((res) => {
			if (res.success) {
				setShowDataSource(res.data);
				setDataSource(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const actionRender = (
		value: string,
		index: number,
		record: NamespaceItem
	) => {
		return (
			<Actions>
				<Confirm
					type="error"
					title="确认删除"
					content="确认要删除该命名空间？"
					onConfirm={() => {
						deleteNamespace({
							clusterId: id,
							name: record.name
						}).then((res) => {
							if (res.success) {
								Message.show(
									messageConfig(
										'success',
										'成功',
										'命名空间删除成功'
									)
								);
								getData();
							} else {
								Message.show(
									messageConfig('error', '失败', res)
								);
							}
						});
					}}
				>
					<LinkButton>删除</LinkButton>
				</Confirm>
			</Actions>
		);
	};
	const Operation = {
		primary: (
			<Button type="primary" onClick={() => setVisible(true)}>
				新建/接入
			</Button>
		)
	};
	const handleSearch = (value: string) => {
		const list = dataSource.filter((item: NamespaceItem) =>
			item.aliasName.includes(value)
		);
		setShowDataSource(list);
	};
	return (
		<div className="mt-8">
			<Table
				dataSource={showDataSource}
				exact
				primaryKey="key"
				operation={Operation}
				fixedHeader={true}
				showRefresh
				onRefresh={getData}
				search={{
					onSearch: handleSearch,
					placeholder: '请输入关键字搜索'
				}}
			>
				<Table.Column title="命名空间名称" dataIndex="aliasName" />
				<Table.Column title="所属集群" dataIndex="clusterAliasName" />
				<Table.Column
					title="操作"
					dataIndex="action"
					cell={actionRender}
				/>
			</Table>
			{visible && (
				<AddNamespace
					visible={visible}
					onCancel={() => setVisible(false)}
					onRefresh={getData}
				/>
			)}
		</div>
	);
}
