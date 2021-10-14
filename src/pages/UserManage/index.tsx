import React, { useState, useEffect } from 'react';
import { Button, Dialog, Message, Radio } from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import moment from 'moment';
import Table from '@/components/MidTable';
import {
	getUserList,
	deleteUser,
	resetPassword,
	getRoles,
	updateUser
} from '@/services/user';
import messageConfig from '@/components/messageConfig';
import { userProps, roleProps } from './user';
import { nullRender } from '@/utils/utils';
import UserForm from './UserForm';
import storage from '@/utils/storage';
import '../RoleManage/index.scss';

const RadioGroup = Radio.Group;

function UserManage(): JSX.Element {
	const [dataSource, setDataSource] = useState<userProps[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [visible, setVisible] = useState<boolean>(false);
	const [updateData, setUpdateData] = useState<userProps>();
	const [isEdit, setIsEdit] = useState(true);
	const [roleVisible, setRoleVisible] = useState(false);
	const [roles, setRoles] = useState<roleProps[]>([]);
	const [role, setRole] = useState<any>();
	const [record, setRecord] = useState<userProps>();

	useEffect(() => {
		getRoles().then((res) => {
			if (res.success) {
				const obj: any = res.data.map((item) => {
					return {
						label: item.name,
						value: item.id
					};
				});
				setRoles(obj);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	}, []);
	useEffect(() => {
		let mounted = true;
		getUserList({ keyword: keyword }).then((res) => {
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
	const onRefresh: () => void = () => {
		getUserList({ keyword: keyword }).then((res) => {
			if (res.success) {
				setDataSource(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const handleSearch: (value: string) => void = (value: string) => {
		setKeyword(value);
	};
	const edit: (record: userProps) => void = (record: userProps) => {
		setUpdateData(record);
		setVisible(true);
	};
	const deleteUserHandle: (record: userProps) => void = (
		record: userProps
	) => {
		Dialog.show({
			title: '操作确认',
			content: '删除将无法找回，是否继续?',
			onOk: () => {
				if (record.userName === 'admin') {
					Message.show(
						messageConfig('error', '失败', 'admin用户无法删除')
					);
					return;
				}
				deleteUser({ userName: record.userName }).then((res) => {
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
	const resetPasswordHandle: (record: userProps) => void = (
		record: userProps
	) => {
		Dialog.show({
			title: '操作确认',
			content: '该账户的密码已重置为：zeus123.com',
			onOk: () => {
				resetPassword({ userName: record.userName }).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig(
								'success',
								'成功',
								'该用户密码重置成功'
							)
						);
					} else {
						Message.show(messageConfig('error', '失败', res));
					}
				});
			}
		});
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
	const editRole = (record: userProps) => {
		// console.log(record.roleName);
		const role = roles.find((item) => item.label === record.roleName);
		setRole(role ? role.value : 0);
		setRecord(record);
		setRoleVisible(true);
	};
	const roleChange = (value: any) => {
		const obj = {
			roleId: value,
			userName: record ? record.userName : '',
			aliasName: record ? record.aliasName : null,
			phone: record ? record.phone : null,
			email: record ? record.email : null
		};
		setRecord(obj);
		setRole(value);
	};
	const submitRole = () => {
		if (!role) {
			Message.show(messageConfig('warning', '请选择关联角色!'));
			return;
		}
		const sendData = {
			...(record as unknown as userProps)
		};
		updateUser(sendData).then((res) => {
			// console.log(res);
			if (res.success) {
				Message.show(messageConfig('success', '成功', '用户修改成功'));
				setRoleVisible(false);
				onRefresh();
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const actionRender = (value: string, index: number, record: userProps) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						edit(record);
						setIsEdit(true);
					}}
				>
					编辑
				</LinkButton>
				{record.userName !== storage.getLocal('userName') ? (
					<LinkButton onClick={() => deleteUserHandle(record)}>
						删除
					</LinkButton>
				) : null}
				<LinkButton onClick={() => editRole(record)}>
					关联角色
				</LinkButton>
				<LinkButton onClick={() => resetPasswordHandle(record)}>
					密码重置
				</LinkButton>
			</Actions>
		);
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
		<Page>
			<Header
				title="用户管理"
				subTitle="创建用于登录平台的用户账号，并赋予角色平台权限"
			/>
			<Content>
				<Table
					dataSource={dataSource}
					exact
					fixedBarExpandWidth={[24]}
					affixActionBar
					showRefresh
					showColumnSetting
					onRefresh={onRefresh}
					primaryKey="key"
					search={{
						placeholder:
							'请输入登录账户、用户名、手机号、角色进行搜索',
						onSearch: handleSearch
					}}
					searchStyle={{
						width: '360px'
					}}
					operation={Operation}
					onSort={onSort}
				>
					<Table.Column title="登录账户" dataIndex="userName" />
					<Table.Column title="用户名" dataIndex="aliasName" />
					<Table.Column
						title="邮箱"
						dataIndex="email"
						cell={nullRender}
					/>
					<Table.Column
						title="手机"
						dataIndex="phone"
						cell={nullRender}
					/>
					<Table.Column
						title="创建时间"
						dataIndex="createTime"
						cell={createTimeRender}
						sortable
					/>
					<Table.Column title="关联角色" dataIndex="roleName" />
					<Table.Column
						title="操作"
						dataIndex="action"
						cell={actionRender}
					/>
				</Table>
			</Content>
			{visible && (
				<UserForm
					visible={visible}
					onCreate={() => {
						setVisible(false);
						onRefresh();
					}}
					onCancel={() => setVisible(false)}
					data={isEdit ? updateData : null}
				/>
			)}
			{roleVisible && (
				<Dialog
					title="关联角色"
					visible={roleVisible}
					onOk={submitRole}
					onCancel={() => setRoleVisible(false)}
					onClose={() => setRoleVisible(false)}
					className="role-modal"
				>
					<RadioGroup
						itemDirection={'ver'}
						dataSource={roles}
						value={role}
						onChange={roleChange}
					/>
				</Dialog>
			)}
		</Page>
	);
}

export default UserManage;
