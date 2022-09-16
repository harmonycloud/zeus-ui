import React, { useState, useEffect } from 'react';
import {
	Button,
	notification,
	Popover,
	Modal,
	TablePaginationConfig
} from 'antd';
import moment from 'moment';
import { ProPage, ProHeader, ProContent } from '@/components/ProPage';
import Actions from '@/components/Actions';
import ProTable from '@/components/ProTable';
import {
	getUserList,
	deleteUser,
	resetPassword,
	getLDAP
} from '@/services/user';
import { getIsAccessGYT } from '@/services/common';
import { userProps } from './user';
import { nullRender } from '@/utils/utils';
import UserForm from './UserForm';
import storage from '@/utils/storage';
import '../RoleManage/index.scss';
import { MoreOutlined } from '@ant-design/icons';

const LinkButton = Actions.LinkButton;
const { confirm } = Modal;
function UserManage(): JSX.Element {
	const [dataSource, setDataSource] = useState<userProps[]>([]);
	const [total, setTotal] = useState<number>();
	const [current, setCurrent] = useState<number>(1);
	const [pageSize, setPageSize] = useState<number>(10);
	const [keyword, setKeyword] = useState<string>('');
	const [visible, setVisible] = useState<boolean>(false);
	const [updateData, setUpdateData] = useState<userProps>();
	const [isEdit, setIsEdit] = useState(true);
	const [isLDAP, setIsLDAP] = useState<boolean>(false);
	const [isAccess, setIsAccess] = useState<boolean>(false);
	useEffect(() => {
		getLDAP().then((res) => {
			res.success && setIsLDAP(res.data.isOn);
		});
		getIsAccessGYT().then((res) => {
			if (res.success) {
				setIsAccess(res.data);
			}
		});
	}, []);
	useEffect(() => {
		let mounted = true;
		getUserList({ keyword: keyword, current: current, size: 10 }).then(
			(res) => {
				if (res.success) {
					if (mounted) {
						setTotal(res.data.total);
						setCurrent(1);
						setDataSource(res.data.list);
					}
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			}
		);
		return () => {
			mounted = false;
		};
	}, []);
	const onRefresh: (value: string, current: number) => void = (value) => {
		getUserList({ keyword: value, current: current, size: 10 }).then(
			(res) => {
				if (res.success) {
					setTotal(res.data.total);
					setDataSource(res.data.list);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			}
		);
	};
	const handleSearch: (value: string) => void = (value: string) => {
		setKeyword(value);
		onRefresh(value, current);
	};
	const edit: (record: userProps) => void = (record: userProps) => {
		setUpdateData(record);
		setVisible(true);
	};
	const deleteUserHandle: (record: userProps) => void = (
		record: userProps
	) => {
		confirm({
			title: '操作确认',
			content: '删除将无法找回，是否继续?',
			okText: '确定',
			cancelText: '取消',
			onOk: () => {
				if (record.userName === 'admin') {
					notification.error({
						message: '失败',
						description: 'admin用户无法删除'
					});
					return;
				}
				deleteUser({ userName: record.userName }).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '该用户删除成功'
						});
						onRefresh(keyword, current);
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
	const resetPasswordHandle: (record: userProps) => void = (
		record: userProps
	) => {
		confirm({
			title: '操作确认',
			content: '该账户的密码已重置为：zeus123.com',
			okText: '确定',
			cancelText: '取消',
			onOk: () => {
				return resetPassword({ userName: record.userName }).then(
					(res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '该用户密码重置成功'
							});
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
						}
					}
				);
			}
		});
	};
	const actionRender = (value: string, record: userProps, index: number) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						edit(record);
						setIsEdit(true);
					}}
					disabled={isLDAP || isAccess}
					title={
						isLDAP
							? '请联系LDAP管理员'
							: isAccess
							? '平台已接入观云台，请联系观云台管理员'
							: ''
					}
				>
					编辑
				</LinkButton>
				{record.userName !== storage.getLocal('userName') && (
					<LinkButton
						disabled={isLDAP || isAccess}
						onClick={() => deleteUserHandle(record)}
						title={
							isLDAP
								? '请联系LDAP管理员'
								: isAccess
								? '平台已接入观云台，请联系观云台管理员'
								: ''
						}
					>
						删除
					</LinkButton>
				)}
				<LinkButton
					onClick={() => resetPasswordHandle(record)}
					disabled={isLDAP || isAccess}
					title={
						isLDAP
							? '请联系LDAP管理员修改密码'
							: isAccess
							? '平台已接入观云台，请联系观云台管理员修改密码'
							: ''
					}
				>
					密码重置
				</LinkButton>
			</Actions>
		);
	};
	const createTimeRender = (value: string) => {
		if (!value) return '--';
		return moment(value).format('YYYY-MM-DD HH:mm:ss');
	};
	const roleNameRender = (
		value: string,
		record: userProps,
		index: number
	) => {
		if (!record.userRoleList) return '/';
		if (record.userRoleList?.some((i: any) => i.roleId === 1)) {
			return <div className="red-tip">超级管理员</div>;
		}
		const list = record.userRoleList?.filter((i: any) => i.roleId !== 1);
		if (list.length === 1) {
			return list.map((i: any) => {
				return (
					<div
						key={i.projectId}
						className="blue-tip"
						title={`${i.projectName}:${i.roleName}`}
					>
						{i.projectName}:{i.roleName}
					</div>
				);
			});
		} else if (list.length > 0) {
			return (
				<div className="display-flex flex-align">
					<div className="blue-tip">
						{list?.[0].projectName}:{list?.[0].roleName}
					</div>
					<Popover
						content={list.map((i: any) => {
							return (
								<div
									style={{ marginBottom: 4 }}
									key={i.projectId}
									title={`${i.projectName}:${i.roleName}`}
								>
									<div className="blue-tip">
										{i.projectName}:{i.roleName}
									</div>
								</div>
							);
						})}
					>
						<span className="role-tips-more">
							<MoreOutlined />
						</span>
					</Popover>
				</div>
			);
		} else {
			return '/';
		}
	};
	const Operation = {
		primary: (
			<Button
				type="primary"
				onClick={() => {
					setVisible(true);
					setIsEdit(false);
				}}
				disabled={isLDAP || isAccess}
				title={
					isLDAP
						? '请联系LDAP管理员'
						: isAccess
						? '平台已接入观云台，请联系观云台管理员'
						: ''
				}
			>
				新增
			</Button>
		)
	};
	const onTableChange = (
		pagination: TablePaginationConfig,
		filters: any,
		sorter: any
	) => {
		setCurrent(pagination.current || 1);
		setTotal(pagination.total);
		getUserList({
			keyword: keyword,
			current: pagination.current || 1,
			size: 10,
			order: sorter.order
		}).then((res) => {
			if (res.success) {
				setTotal(res.data.total);
				setDataSource(res.data.list);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	};
	return (
		<ProPage>
			<ProHeader
				title="用户管理"
				subTitle="创建用于登录平台的用户账号，并赋予角色平台权限"
			/>
			<ProContent>
				<ProTable
					dataSource={dataSource}
					showRefresh
					showColumnSetting
					onRefresh={() => onRefresh(keyword, current)}
					rowKey="userName"
					search={{
						placeholder:
							'请输入登录账户、用户名、手机号、角色进行搜索',
						onSearch: handleSearch,
						style: { width: '360px' }
					}}
					operation={Operation}
					pagination={{
						total: total,
						current: current,
						pageSize: pageSize
					}}
					onChange={onTableChange}
				>
					<ProTable.Column title="登录账户" dataIndex="userName" />
					<ProTable.Column title="用户名" dataIndex="aliasName" />
					<ProTable.Column
						title="邮箱"
						dataIndex="email"
						render={nullRender}
					/>
					<ProTable.Column
						title="手机"
						dataIndex="phone"
						render={nullRender}
					/>
					<ProTable.Column
						title="创建时间"
						dataIndex="createTime"
						render={createTimeRender}
						sorter={true}
					/>
					<ProTable.Column
						title="关联角色"
						dataIndex="roleName"
						render={roleNameRender}
					/>
					<ProTable.Column
						title="操作"
						dataIndex="action"
						render={actionRender}
					/>
				</ProTable>
			</ProContent>
			{visible && (
				<UserForm
					visible={visible}
					onCreate={() => {
						setVisible(false);
						onRefresh(keyword, current);
					}}
					onCancel={() => setVisible(false)}
					data={isEdit ? updateData : null}
				/>
			)}
		</ProPage>
	);
}

export default UserManage;
