import React, { useEffect, useState } from 'react';
import { Dialog, Message, Select } from '@alicloud/console-components';
import MidTable from '@/components/MidTable';
import messageConfig from '@/components/messageConfig';

import { getUserList } from '@/services/user';
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
	const [key, setKey] = useState<string>('');
	const [primaryKeys, setPrimaryKeys] = useState<string[]>([]);
	const [roles, setRoles] = useState<roleProps[]>([]);
	const [project] = useState<ProjectItem>(
		JSON.parse(storage.getLocal('project'))
	);
	useEffect(() => {
		getUserList({ keyword: '' }).then((res) => {
			if (res.success) {
				setDataSource(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
		getRoleList({ key: '' }).then((res) => {
			if (res.success) {
				setRoles(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	}, []);
	const handleChange = (value: string) => {
		console.log(value);
	};
	const handleSearch = (value: string) => {
		console.log(value);
	};
	const onChange = (selectedRowKeys: any) => {
		setPrimaryKeys(selectedRowKeys);
	};
	const roleChange = (value: number, record: userProps) => {
		record.roleId = value;
	};
	const onOk = () => {
		if (primaryKeys.length === 0) {
			Message.show(messageConfig('error', '失败', '请选择新增的成员'));
			return;
		}
		const list: userProps[] = [];
		primaryKeys.forEach((item: any) => {
			dataSource.forEach((i: userProps) => {
				if (i.id === item) {
					list.push(i);
				}
			});
		});
		console.log(list);
		if (list.some((item: userProps) => item.roleId === null)) {
			Message.show(
				messageConfig('error', '失败', '请选择成员的角色权限')
			);
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
					Message.show(
						messageConfig('success', '成功', '成员新增成功')
					);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			})
			.finally(() => {
				onRefresh();
			});
	};
	const roleRender = (value: string, index: number, record: userProps) => {
		return (
			<Select
				onChange={(value: any) => roleChange(value, record)}
				style={{ width: '100%' }}
			>
				{roles.map((item: roleProps) => {
					return (
						<Option key={item.id} value={item.id}>
							{item.name}
						</Option>
					);
				})}
			</Select>
		);
	};
	return (
		<Dialog
			title="新增"
			visible={visible}
			onCancel={onCancel}
			onClose={onCancel}
			onOk={onOk}
			style={{ width: 840 }}
		>
			<MidTable
				dataSource={dataSource}
				exact
				search={{
					value: key,
					onChange: handleChange,
					onSearch: handleSearch,
					placeholder: '请输入关键字搜索'
				}}
				rowSelection={{
					onChange,
					selectedRowKeys: primaryKeys
				}}
				showJump={false}
			>
				<MidTable.Column title="登陆账号" dataIndex="userName" />
				<MidTable.Column title="用户名" dataIndex="aliasName" />
				<MidTable.Column
					title="邮箱"
					dataIndex="email"
					cell={nullRender}
				/>
				<MidTable.Column
					title="创建时间"
					dataIndex="createTime"
					cell={nullRender}
				/>
				<MidTable.Column
					title="角色"
					dataIndex="role"
					cell={roleRender}
				/>
			</MidTable>
		</Dialog>
	);
}
