import { Button, Dialog, Message, Balloon } from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import Table from '@/components/MidTable';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import moment from 'moment';
import { roleProps } from './role';
import { Actions, LinkButton } from '@alicloud/console-components-actions';
import RoleForm from './RoleForm';
import RolePermissions from './RolePermissions';
import { getRoleList, deleteRole } from '@/services/role';
import messageConfig from '@/components/messageConfig';
import { getUserInformation } from '@/services/user';
import storage from '@/utils/storage';
import './index.scss';

function RoleManage(): JSX.Element {
	const [dataSource, setDataSource] = useState<roleProps[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [visible, setVisible] = useState<boolean>(false);
	const [permissionVisible, setPermissionVisible] = useState<boolean>(false);
	const [updateData, setUpdateData] = useState<roleProps>();
	const [permissionData, setPermissionData] = useState<roleProps>();
	const [isEdit, setIsEdit] = useState<boolean>(true);
	const [roleId, setRoleId] = useState<string>('');
	const history = useHistory();

	useEffect(() => {
		let mounted = true;
		getUserInfo();
		getRoleList({ key: keyword }).then((res) => {
			if (res.success) {
				if (mounted) {
					setDataSource(res.data);
				}
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
		return () => {
			mounted = false;
		};
	}, []);
	const handleChange: (value: string) => void = (value: string) => {
		setKeyword(value);
	};
	const getUserInfo = async () => {
		const res: { roleId?: string; [propsName: string]: any } =
			await getUserInformation();
		if (res.success) {
			res.data && setRoleId(res.data.roleId);
		} else {
			Message.show(messageConfig('error', '失败', res));
		}
	};
	const handleSearch: (value: string) => void = (value: string) => {
		getRoleList({ key: value }).then((res) => {
			if (res.success) {
				setDataSource(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const onRefresh: () => void = () => {
		getRoleList({ key: keyword }).then((res) => {
			if (res.success) {
				setDataSource(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const edit: (record: roleProps) => void = (record: roleProps) => {
		if (record.id === 1) return;
		setUpdateData(record);
		setVisible(true);
		setIsEdit(true);
	};
	const deleteRoleHandle: (record: roleProps) => void = (
		record: roleProps
	) => {
		if (record.id === 1 || Number(roleId) === record.id) return;

		Dialog.show({
			title: '操作确认',
			content: '删除将无法找回，是否继续?',
			onOk: () => {
				deleteRole({ roleId: record.id }).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '该用户删除成功')
						);
						onRefresh();
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		});
	};
	const permissionEdit: (record: roleProps) => void = (record: roleProps) => {
		if (record.id === 1 || Number(roleId) === record.id) return;
		storage.setSession('rolePower', JSON.stringify(record.power));
		history.push('/systemManagement/roleManagement/allotRole');
		// setPermissionData(record);
		// setPermissionVisible(true);
	};
	const actionRender = (value: string, index: number, record: roleProps) => {
		return (
			<Actions>
				{record.id === 1 ? (
					<Balloon
						trigger={
							<LinkButton
								style={{
									color: record.id === 1 ? '#ddd' : '#0070cc',
									cursor:
										record.id === 1
											? 'not-allowed'
											: 'pointer'
								}}
								onClick={() => edit(record)}
							>
								编辑
							</LinkButton>
						}
						closable={false}
					>
						系统初始化最高权限角色，不可操作
					</Balloon>
				) : (
					<LinkButton
						style={{
							color: record.id === 1 ? '#ddd' : '#0070cc',
							cursor: record.id === 1 ? 'not-allowed' : 'pointer'
						}}
						onClick={() => edit(record)}
					>
						编辑
					</LinkButton>
				)}
				{Number(roleId) === record.id ? (
					<Balloon
						trigger={
							<LinkButton
								style={{
									color:
										record.id === 1 ||
										Number(roleId) === record.id
											? '#ddd'
											: '#0070cc',
									cursor:
										record.id === 1 ||
										Number(roleId) === record.id
											? 'not-allowed'
											: 'pointer'
								}}
								onClick={() => deleteRoleHandle(record)}
							>
								删除
							</LinkButton>
						}
						closable={false}
					>
						{record.id === 1
							? '系统初始化最高权限角色，不可操作'
							: '不能删除自己的角色'}
					</Balloon>
				) : (
					<LinkButton
						style={{
							color:
								record.id === 1 || Number(roleId) === record.id
									? '#ddd'
									: '#0070cc',
							cursor:
								record.id === 1 || Number(roleId) === record.id
									? 'not-allowed'
									: 'pointer'
						}}
						onClick={() => deleteRoleHandle(record)}
					>
						删除
					</LinkButton>
				)}
				{Number(roleId) === record.id ? (
					<Balloon
						trigger={
							<LinkButton
								style={{
									color:
										record.id === 1 ||
										Number(roleId) === record.id ||
										Number(roleId) === record.id
											? '#ddd'
											: '#0070cc',
									cursor:
										record.id === 1 ||
										Number(roleId) === record.id
											? 'not-allowed'
											: 'pointer'
								}}
								onClick={() => permissionEdit(record)}
							>
								分配角色权限
							</LinkButton>
						}
						closable={false}
					>
						{record.id === 1
							? '系统初始化最高权限角色，不可操作'
							: '不能改自己的角色权限'}
					</Balloon>
				) : (
					<LinkButton
						style={{
							color:
								record.id === 1 ||
								Number(roleId) === record.id ||
								Number(roleId) === record.id
									? '#ddd'
									: '#0070cc',
							cursor:
								record.id === 1 || Number(roleId) === record.id
									? 'not-allowed'
									: 'pointer'
						}}
						onClick={() => permissionEdit(record)}
					>
						分配角色权限
					</LinkButton>
				)}
			</Actions>
		);
	};
	const onSort = (dataIndex: string, order: string) => {
		if (dataIndex === 'createTime') {
			const dsTemp = dataSource.sort((a, b) => {
				const result =
					moment(a[dataIndex]).unix() - moment(b[dataIndex]).unix();
				return order === 'asc'
					? result > 0
						? 1
						: -1
					: result > 0
					? -1
					: 1;
			});
			setDataSource([...dsTemp]);
		}
	};
	const createTimeRender = (value: string) => {
		if (!value) return '/';
		return moment(value).format('YYYY-MM-DD HH:mm:ss');
	};
	const Operation = {
		primary: (
			<Button
				type="primary"
				onClick={() => {
					setVisible(true);
					setIsEdit(false);
				}}
			>
				新增
			</Button>
		)
	};
	return (
		<Page className="role-manege">
			<Header
				title="角色管理"
				subTitle="创建具有不同系统权限的平台角色"
			/>
			<Content>
				<Table
					dataSource={dataSource}
					search={{
						value: keyword,
						onChange: handleChange,
						placeholder: '请输入角色名称、描述搜索',
						onSearch: handleSearch
					}}
					showRefresh
					onRefresh={onRefresh}
					operation={Operation}
					onSort={onSort}
				>
					<Table.Column title="角色名称" dataIndex="name" />
					<Table.Column
						title="描述"
						dataIndex="description"
						width="50%"
					/>
					<Table.Column
						title="创建时间"
						dataIndex="createTime"
						sortable
						cell={createTimeRender}
					/>
					<Table.Column
						title="操作"
						dataIndex="action"
						cell={actionRender}
					/>
				</Table>
			</Content>
			{visible && (
				<RoleForm
					visible={visible}
					onCancel={() => setVisible(false)}
					data={isEdit ? updateData : null}
					onCreate={() => {
						setVisible(false);
						onRefresh();
					}}
				/>
			)}
			{permissionVisible && (
				<RolePermissions
					visible={permissionVisible}
					onCancel={() => setPermissionVisible(false)}
					data={permissionData}
					onCreate={() => {
						setPermissionVisible(false);
						onRefresh();
					}}
				/>
			)}
		</Page>
	);
}

export default RoleManage;
