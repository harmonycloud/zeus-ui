import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Button, notification, Modal } from 'antd';
// import Confirm from '@alicloud/console-components-confirm';
import ProTable from '@/components/ProTable';
import Actions from '@/components/Actions';
import AddMember from './addMember';
import { getProjectMember, deleteProjectMember } from '@/services/project';
import { DetailParams, UserItem } from './projectDetail';
import { nullRender } from '@/utils/utils';
import EditMember from './editMember';
import storage from '@/utils/storage';

const LinkButton = Actions.LinkButton;
const { confirm } = Modal;
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
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
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
		const list = dataSource.filter(
			(item: UserItem) =>
				item.aliasName.includes(value) || item.userName.includes(value)
		);
		setShowDataSource(list);
	};
	const actionRender = (value: string, record: UserItem, index: number) => {
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
				<LinkButton
					onClick={() =>
						confirm({
							title: '确认删除',
							content: '确认要删除该项目成员？',
							okText: '确定',
							cancelText: '取消',
							onOk() {
								return deleteProjectMember({
									projectId: id,
									username: record.userName
								}).then((res) => {
									if (res.success) {
										notification.success({
											message: '成功',
											description: '项目成员删除成功'
										});
										getData();
									} else {
										notification.error({
											message: '失败',
											description: res.errorMsg
										});
									}
								});
							}
						})
					}
					disabled={record.id === role.id}
				>
					删除
				</LinkButton>
				{/* <Confirm
					type="error"
					title="确认删除"
					content="确认要删除该项目成员？"
					onConfirm={() => {
						deleteProjectMember({
							projectId: id,
							username: record.userName
						}).then((res) => {
							if (res.success) {
								notification.success({
									message: '成功',
									description: '项目成员删除成功'
								});
								getData();
							} else {
								notification.error({
									message: '失败',
									description: res.errorMsg
								});
							}
						});
					}}
				>

				</Confirm> */}
			</Actions>
		);
	};
	return (
		<div className="mt-8">
			<ProTable
				dataSource={showDataSource}
				rowKey="key"
				operation={Operation}
				showRefresh
				onRefresh={getData}
				search={{
					onSearch: handleSearch,
					placeholder: '请输入关键字搜索'
				}}
			>
				<ProTable.Column title="登录账户" dataIndex="userName" />
				<ProTable.Column title="用户名" dataIndex="aliasName" />
				<ProTable.Column
					title="角色"
					dataIndex="roleName"
					render={nullRender}
				/>
				<ProTable.Column
					title="邮箱"
					dataIndex="email"
					render={nullRender}
				/>
				<ProTable.Column
					title="操作"
					dataIndex="action"
					render={actionRender}
				/>
			</ProTable>
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
