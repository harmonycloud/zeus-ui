import { Button, Dialog, Message } from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import Table from '@/components/MidTable';
import * as React from 'react';
import { useState, useEffect } from 'react';
import moment from 'moment';
import { roleProps } from './role';
import { Actions, LinkButton } from '@alicloud/console-components-actions';
import RoleForm from './RoleForm';
import RolePermissions from './RolePermissions';
import { getRoleList, deleteRole } from '@/services/role';
import messageConfig from '@/components/messageConfig';
import './index.scss';

function RoleManage(): JSX.Element {
	const [dataSource, setDataSource] = useState<roleProps[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [visible, setVisible] = useState<boolean>(false);
	const [permissionVisible, setPermissionVisible] = useState<boolean>(false);
	const [updateData, setUpdateData] = useState<roleProps>();
	const [permissionData, setPermissionData] = useState<roleProps>();
	const [isEdit, setIsEdit] = useState(true);

	useEffect(() => {
		let mounted = true;
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
	}, [keyword]);
	const handleSearch: (value: string) => void = (value: string) => {
		setKeyword(value);
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
		setUpdateData(record);
		setVisible(true);
		setIsEdit(true);
	};
	const deleteRoleHandle: (record: roleProps) => void = (
		record: roleProps
	) => {
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
		setPermissionData(record);
		setPermissionVisible(true);
	};
	const actionRander = (value: string, index: number, record: roleProps) => {
		return (
			<Actions>
				<LinkButton onClick={() => edit(record)}>编辑</LinkButton>
				<LinkButton onClick={() => deleteRoleHandle(record)}>
					删除
				</LinkButton>
				<LinkButton onClick={() => permissionEdit(record)}>
					{' '}
					分配角色权限
				</LinkButton>
			</Actions>
		);
	};
	const onSort = (dataIndex: string, order: string) => {
		if (dataIndex === 'createTime') {
			const dsTemp = dataSource.sort((a, b) => {
				const result =
					moment(a[dataIndex]).unix() - moment(b[dataIndex]).unix();
				console.log(result);
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
			<Header></Header>
			<Content>
				<Table
					dataSource={dataSource}
					search={{
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
						cell={actionRander}
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