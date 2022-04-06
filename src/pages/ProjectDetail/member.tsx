import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Button, Message } from '@alicloud/console-components';
import Confirm from '@alicloud/console-components-confirm';
import Table from '@/components/MidTable';
import AddMember from './addMember';
import { getProjectMember, deleteProjectMember } from '@/services/project';
import { DetailParams, UserItem } from './projectDetail';
import { Actions, LinkButton } from '@alicloud/console-components-actions';
import messageConfig from '@/components/messageConfig';
import { nullRender } from '@/utils/utils';
import EditMember from './editMember';
import storage from '@/utils/storage';

export default function Member(): JSX.Element {
	const [dataSource, setDataSource] = useState<UserItem[]>([]);
	const [showDataSource, setShowDataSource] = useState<UserItem[]>([]);
	const [addVisible, setAddVisible] = useState<boolean>(false);
	const [editVisible, setEditVisible] = useState<boolean>(false);
	const [editData, setEditData] = useState<UserItem>();
	const [role] = useState(JSON.parse(storage.getLocal('role')));
	const params: DetailParams = useParams();
	const { id } = params;
	useEffect(() => {
		getData();
	}, []);
	const getData = () => {
		getProjectMember({ projectId: id, allocatable: false }).then((res) => {
			if (res.success) {
				setDataSource(res.data);
				setShowDataSource(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const Operation = {
		primary: (
			<Button type="primary" onClick={() => setAddVisible(true)}>
				新增
			</Button>
		)
	};
	const handleSearch = (value: string) => {
		const list = dataSource.filter((item: UserItem) =>
			item.aliasName.includes(value)
		);
		setShowDataSource(list);
	};
	const actionRender = (value: string, index: number, record: UserItem) => {
		return (
			<Actions>
				<LinkButton
					disabled={record.id === role.id}
					onClick={() => {
						setEditVisible(true);
						setEditData(record);
					}}
				>
					编辑
				</LinkButton>
				<Confirm
					type="error"
					title="确认删除"
					content="确认要删除该项目成员？"
					onConfirm={() => {
						deleteProjectMember({
							projectId: id,
							username: record.userName
						}).then((res) => {
							if (res.success) {
								Message.show(
									messageConfig(
										'success',
										'成功',
										'项目成员删除成功'
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
					<LinkButton disabled={record.id === role.id}>
						删除
					</LinkButton>
				</Confirm>
			</Actions>
		);
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
				<Table.Column title="登陆账户" dataIndex="userName" />
				<Table.Column title="用户名" dataIndex="aliasName" />
				<Table.Column
					title="角色"
					dataIndex="roleName"
					cell={nullRender}
				/>
				<Table.Column
					title="邮箱"
					dataIndex="email"
					cell={nullRender}
				/>
				<Table.Column
					title="操作"
					dataIndex="action"
					cell={actionRender}
				/>
			</Table>
			{addVisible && (
				<AddMember
					visible={addVisible}
					onCancel={() => setAddVisible(false)}
					onRefresh={getData}
				/>
			)}
			{editVisible && editData && (
				<EditMember
					visible={editVisible}
					onCancel={() => setEditVisible(false)}
					onRefresh={getData}
					data={editData}
				/>
			)}
		</div>
	);
}
