import React, { useEffect, useState } from 'react';
import { Modal, Select, notification } from 'antd';
import ProTable from '@/components/ProTable';
import { getProjectMember } from '@/services/project';
import { getRoleList } from '@/services/role';
import { bindProjectMember } from '@/services/project';
import { nullRender } from '@/utils/utils';
import storage from '@/utils/storage';

import { roleProps } from '../RoleManage/role';
import { userProps } from '../UserManage/user';
import { AddMemberProps } from './projectDetail';
import { ProjectItem } from '../ProjectManage/project';

const Option = Select.Option;
export default function AddMember(props: AddMemberProps): JSX.Element {
	const { visible, onCancel, onRefresh } = props;
	const [dataSource, setDataSource] = useState<userProps[]>([]);
	const [showDataSource, setShowDataSource] = useState<userProps[]>([]);
	const [key, setKey] = useState<string>('');
	const [primaryKeys, setPrimaryKeys] = useState<string[]>([]);
	const [roles, setRoles] = useState<roleProps[]>([]);
	const [project] = useState<ProjectItem>(
		JSON.parse(storage.getLocal('project'))
	);
	useEffect(() => {
		getData();
		getRoleList({ key: '' }).then((res) => {
			if (res.success) {
				setRoles(res.data);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, []);
	const getData = () => {
		getProjectMember({
			projectId: project.projectId,
			allocatable: true
		}).then((res) => {
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
	const handleSearch = (value: string) => {
		const list = dataSource.filter((item: userProps) =>
			item.userName.includes(value)
		);
		setShowDataSource(list);
	};
	const onChange = (selectedRowKeys: any) => {
		console.log(selectedRowKeys);
		setPrimaryKeys(selectedRowKeys);
	};
	const roleChange = (value: number, record: userProps) => {
		record.roleId = value;
	};
	const onOk = () => {
		if (primaryKeys.length === 0) {
			notification.error({
				message: '失败',
				description: '请选择新增的成员'
			});
			return;
		}
		console.log(primaryKeys);
		const list: userProps[] = [];
		primaryKeys.forEach((item: any) => {
			dataSource.forEach((i: userProps) => {
				if (i.id === item) {
					list.push(i);
				}
			});
		});
		if (list.some((item: userProps) => item.roleId === null)) {
			notification.error({
				message: '失败',
				description: '请选择成员的角色权限'
			});
			return;
		}
		const sendData = {
			projectId: project.projectId,
			userDtoList: list
		};
		onCancel();
		bindProjectMember(sendData)
			.then((res) => {
				if (res.success) {
					notification.success({
						message: '成功',
						description: '成员新增成功'
					});
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			})
			.finally(() => {
				onRefresh();
			});
	};
	const roleRender = (value: string, record: userProps, index: number) => {
		return (
			<Select
				onChange={(value: any) => roleChange(value, record)}
				style={{ width: '100%' }}
			>
				{roles.map((item: roleProps) => {
					if (item.id !== 1) {
						return (
							<Option key={item.id} value={item.id}>
								{item.name}
							</Option>
						);
					}
				})}
			</Select>
		);
	};
	return (
		<Modal
			title="新增"
			visible={visible}
			onCancel={onCancel}
			onOk={onOk}
			width={840}
			okText="确定"
			cancelText="取消"
		>
			<ProTable
				dataSource={showDataSource}
				search={{
					onSearch: handleSearch,
					placeholder: '请输入关键字搜索'
				}}
				rowSelection={{
					onChange,
					selectedRowKeys: primaryKeys
				}}
				rowKey="id"
			>
				<ProTable.Column
					title="登录账户"
					dataIndex="userName"
					ellipsis={true}
				/>
				<ProTable.Column
					title="用户名"
					dataIndex="aliasName"
					ellipsis={true}
				/>
				<ProTable.Column
					title="邮箱"
					dataIndex="email"
					render={nullRender}
					ellipsis={true}
				/>
				<ProTable.Column
					title="创建时间"
					dataIndex="createTime"
					render={nullRender}
				/>
				<ProTable.Column
					title="角色"
					dataIndex="role"
					width={200}
					render={roleRender}
				/>
			</ProTable>
		</Modal>
	);
}
