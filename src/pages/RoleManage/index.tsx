import * as React from 'react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import moment from 'moment';
import { Button, Modal, notification } from 'antd';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import ProTable from '@/components/ProTable';
import Actions from '@/components/Actions';
import RoleForm from './RoleForm';
import { getRoleList, deleteRole } from '@/services/role';
import { getUserInformation } from '@/services/user';
import storage from '@/utils/storage';
import { roleProps } from './role';
import './index.scss';

const { confirm } = Modal;
const LinkButton = Actions.LinkButton;
function RoleManage(): JSX.Element {
	const [dataSource, setDataSource] = useState<roleProps[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [visible, setVisible] = useState<boolean>(false);
	const [updateData, setUpdateData] = useState<roleProps>();
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
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
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
			notification.error({
				message: '失败',
				description: res.errorMsg
			});
		}
	};
	const handleSearch: (value: string) => void = (value: string) => {
		getRoleList({ key: value }).then((res) => {
			if (res.success) {
				setDataSource(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	const onRefresh: () => void = () => {
		getRoleList({ key: keyword }).then((res) => {
			if (res.success) {
				setDataSource(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
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
		confirm({
			title: '操作确认',
			content: '删除将无法找回，是否继续?',
			okText: '确定',
			cancelText: '取消',
			onOk: () => {
				return deleteRole({ roleId: record.id }).then((res) => {
					if (res.success) {
						notification.error({
							message: '成功',
							description: '该用户删除成功'
						});
						onRefresh();
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				});
			}
		});
	};
	const permissionEdit: (record: roleProps) => void = (record: roleProps) => {
		storage.setSession('rolePower', JSON.stringify(record));
		history.push('/systemManagement/roleManagement/allotRole');
	};
	const actionRender = (value: string, record: roleProps, index: number) => {
		return (
			<Actions>
				<LinkButton
					disabled={
						record.id === 1 ||
						record.id === 2 ||
						record.id === 3 ||
						record.id === 4 ||
						Number(roleId) === record.id
					}
					onClick={() => edit(record)}
				>
					<span
						title={
							record.id === 1
								? '系统初始化最高权限角色，不可操作'
								: Number(roleId) === record.id
								? '不能操作自己的角色'
								: '当前角色暂时不可进行操作'
						}
					>
						编辑
					</span>
				</LinkButton>
				<LinkButton
					disabled={
						record.id === 1 ||
						record.id === 2 ||
						record.id === 3 ||
						record.id === 4 ||
						Number(roleId) === record.id
					}
					onClick={() => deleteRoleHandle(record)}
				>
					<span
						title={
							record.id === 1
								? '系统初始化最高权限角色，不可操作'
								: Number(roleId) === record.id
								? '不能操作自己的角色'
								: '当前角色暂时不可进行操作'
						}
					>
						删除
					</span>
				</LinkButton>
				<LinkButton
					disabled={
						record.id === 1 ||
						record.id === 2 ||
						record.id === 3 ||
						record.id === 4 ||
						Number(roleId) === record.id
					}
					onClick={() => permissionEdit(record)}
				>
					<span
						title={
							record.id === 1
								? '系统初始化最高权限角色，不可操作'
								: Number(roleId) === record.id
								? '不能操作自己的角色'
								: '当前角色暂时不可进行操作'
						}
					>
						分配角色权限
					</span>
				</LinkButton>
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
		<ProPage className="role-manege">
			<ProHeader
				title="角色管理"
				subTitle="创建具有不同系统权限的平台角色"
			/>
			<ProContent>
				<ProTable
					dataSource={dataSource}
					search={{
						placeholder: '请输入角色名称、描述搜索',
						onSearch: handleSearch,
						style: { width: '220px' }
					}}
					rowKey="id"
					showRefresh
					onRefresh={onRefresh}
					operation={Operation}
				>
					<ProTable.Column title="角色名称" dataIndex="name" />
					<ProTable.Column
						title="描述"
						dataIndex="description"
						width="50%"
					/>
					<ProTable.Column
						title="创建时间"
						dataIndex="createTime"
						sorter={(a: roleProps, b: roleProps) =>
							moment(a.createTime).unix() -
							moment(b.createTime).unix()
						}
						render={createTimeRender}
					/>
					<ProTable.Column
						title="操作"
						dataIndex="action"
						render={actionRender}
					/>
				</ProTable>
			</ProContent>
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
		</ProPage>
	);
}

export default RoleManage;
