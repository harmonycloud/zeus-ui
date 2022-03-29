import React, { useState, useEffect } from 'react';
import { Button, Dialog, Message, Radio } from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import moment from 'moment';
import Table from '@/components/MidTable';
import {
	getUserList,
	deleteUser,
} from '@/services/user';
import messageConfig from '@/components/messageConfig';
import { nullRender } from '@/utils/utils';
import DatabaseForm from './databaseForm';

function UserManage(): JSX.Element {
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [visible, setVisible] = useState<boolean>(false);
	const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
	const [updateData, setUpdateData] = useState<any>();
	const [isEdit, setIsEdit] = useState(true);
	const [roleVisible, setRoleVisible] = useState(false);
	const [role, setRole] = useState<any>();
	const [record, setRecord] = useState<any>();
	const [isLDAP, setIsLDAP] = useState<boolean>(false);

	useEffect(() => {}, []);
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
	}, []);
	const onRefresh: () => void = () => {
		getUserList({ keyword: keyword }).then((res) => {
			if (res.success) {
				setDataSource(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res));
			}
		});
	};
	const handleChange: (value: string) => void = (value: string) => {
		setKeyword(value);
	};
	const handleSearch: (value: string) => void = (value: string) => {
		onRefresh();
	};
	const edit: (record: any) => void = (record: any) => {
		setUpdateData(record);
		setVisible(true);
	};
	const deleteUserHandle: (record: any) => void = (record: any) => {
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

	const actionRender = (value: string, index: number, record: any) => {
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
				<LinkButton onClick={() => deleteUserHandle(record)}>
					删除
				</LinkButton>
			</Actions>
		);
	};
	const createTimeRender = (value: string) => {
		if (!value) return '--';
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
		<>
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
					placeholder: '请输入',
					onSearch: handleSearch,
					onChange: handleChange,
					value: keyword
				}}
				searchStyle={{
					width: '360px'
				}}
				operation={Operation}
				onSort={onSort}
			>
				<Table.Column title="授权数据库" dataIndex="aliasName" />
				<Table.Column
					title="字符集"
					dataIndex="email"
					cell={nullRender}
				/>
                <Table.Column
					title="关联账户"
					dataIndex="roleName"
					cell={nullRender}
				/>
				<Table.Column
					title="备注"
					dataIndex="phone"
					cell={nullRender}
				/>
				<Table.Column
					title="创建时间"
					dataIndex="createTime"
					cell={createTimeRender}
					sortable
				/>
				<Table.Column
					title="操作"
					dataIndex="action"
					cell={actionRender}
				/>
			</Table>
			{visible && (
				<DatabaseForm
					visible={visible}
					onCreate={() => {
						setVisible(false);
						onRefresh();
					}}
					onCancel={() => setVisible(false)}
					data={isEdit ? updateData : null}
				/>
			)}
		</>
	);
}

export default UserManage;
