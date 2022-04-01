import React, { useState, useEffect } from 'react';
import {
	Button,
	Dialog,
	Message,
	Icon,
	Balloon
} from '@alicloud/console-components';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import moment from 'moment';
import Table from '@/components/MidTable';
import { listUser, deleteUser } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import { nullRender } from '@/utils/utils';
import UserForm from './userForm';
import PasswordForm from './passwordForm';
import { authorityList } from '@/utils/const';

const Tooltip = Balloon.Tooltip;

function UserManage(props: any): JSX.Element {
	const { clusterId, namespace, middlewareName } = props;
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [showDataSource, setShowDataSource] = useState<any[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [visible, setVisible] = useState<boolean>(false);
	const [passwordFormVisible, setPasswordFormVisible] =
		useState<boolean>(false);
	const [updateData, setUpdateData] = useState<any>();
	const [isEdit, setIsEdit] = useState(true);

	useEffect(() => {
		listUser({ clusterId, namespace, middlewareName, keyword }).then(
			(res) => {
				if (res.success) {
					const data = res.data
						.filter((item: any) => item.user === 'root')
						.concat(
							res.data.filter((item: any) => item.user !== 'root')
						)
						.map((item: any) => {
							return { ...item, passwordVisible: false };
						});
					res.data ? setDataSource(data) : setDataSource([]);
					setShowDataSource(data);
				} else {
					Message.show(messageConfig('error', '失败', res));
				}
			}
		);
	}, [keyword]);
	const onRefresh: () => void = () => {
		listUser({ clusterId, namespace, middlewareName }).then((res) => {
			if (res.success) {
				const data = res.data
					.filter((item: any) => item.user === 'root')
					.concat(
						res.data.filter((item: any) => item.user !== 'root')
					)
					.map((item: any) => {
						return { ...item, passwordVisible: false };
					});
				res.data ? setDataSource(data) : setDataSource([]);
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
				deleteUser({
					clusterId,
					namespace,
					middlewareName,
					user: record.user
				}).then((res) => {
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
			const dsTemp = dataSource
				.sort((a, b) => {
					const result =
						moment(a[dataIndex]).unix() -
						moment(b[dataIndex]).unix();
					return order === 'asc'
						? result > 0
							? 1
							: -1
						: result > 0
						? -1
						: 1;
				})
				.map((item: any) => {
					return { ...item, passwordVisible: false };
				});
			setDataSource([...dsTemp]);
		}
	};

	const actionRender = (value: string, index: number, record: any) => {
		return (
			<Actions>
				{record.user !== 'root' && (
					<LinkButton
						onClick={() => {
							edit(record);
							setIsEdit(true);
						}}
					>
						编辑
					</LinkButton>
				)}
				<LinkButton
					onClick={() => {
						setIsEdit(true);
						setUpdateData(record);
						setPasswordFormVisible(true);
					}}
				>
					修改密码
				</LinkButton>
				{record.user !== 'root' && (
					<LinkButton onClick={() => deleteUserHandle(record)}>
						删除
					</LinkButton>
				)}
			</Actions>
		);
	};
	const absRender = (value: any, index: number, record: any) => {
		return value.length > 1 ? (
			<Tooltip
				trigger={
					<div
						style={{
							cursor: 'pointer'
						}}
					>
						<span>{value[0].db}</span>[
						{
							authorityList.find(
								(item) => item.authority === value[0].authority
							)?.value
						}
						]...
					</div>
				}
				align="t"
			>
				{value.map((item: any) => {
					return (
						<div
							key={item.db}
							style={{
								display: 'flex',
								justifyContent: 'space-between'
							}}
						>
							<span style={{ marginRight: '8px' }}>
								{item.db}
							</span>
							[
							{
								authorityList.find(
									(i) => i.authority === item.authority
								)?.value
							}
							]
						</div>
					);
				})}
			</Tooltip>
		) : record.user === 'root' ? (
			<Tooltip
				trigger={
					<div
						style={{
							cursor: 'pointer'
						}}
					>
						<span>所有</span>[最高权限]
					</div>
				}
				align="t"
			>
				<div
					style={{
						cursor: 'pointer'
					}}
				>
					<span>所有</span>[最高权限]
				</div>
			</Tooltip>
		) : (
			<Tooltip
				trigger={
					<div
						style={{
							cursor: 'pointer'
						}}
					>
						<span>{value.length ? value[0].db : '/'}</span>
						{value.length
							? '[' +
							  authorityList.find(
									(item) =>
										item.authority === value[0].authority
							  )?.value +
							  ']'
							: ''}
					</div>
				}
				align="t"
			>
				<div
					style={{
						cursor: 'pointer'
					}}
				>
					<span>{value.length ? value[0].db : '/'}</span>
					{value.length
						? '[' +
						  authorityList.find(
								(item) => item.authority === value[0].authority
						  )?.value +
						  ']'
						: ''}
				</div>
			</Tooltip>
		);
	};
	const passwordRender = (value: string, index: number, record: any) => {
		return (
			<div>
				<Icon
					type={record.passwordVisible ? 'eye' : 'eye-slash'}
					style={{ cursor: 'pointer', marginRight: '8px' }}
					onClick={() => {
						const data = dataSource.map((item: any) => {
							if (item.id === record.id) {
								item.passwordVisible = !item.passwordVisible;
							}
							return item;
						});
						setDataSource([...data]);
					}}
				/>
				{record.passwordVisible && <span>{value}</span>}
			</div>
		);
	};
	const passwordCheckRender = (value: boolean) => {
		return (
			<Tooltip
				trigger={
					value ? (
						<Icon
							type="check"
							style={{ cursor: 'pointer', color: '#0070cc' }}
						/>
					) : (
						<Icon
							type="close"
							style={{ cursor: 'pointer', color: '#Ef595C' }}
						/>
					)
				}
				align="t"
			>
				{value
					? '该账户经系统监测，平台数据库和mysql数据库密码一致，可正常登陆数据库'
					: '经系统监测，平台数据库和mysql数据库密码不一致，使用平台展示密码可能无法登陆数据库'}
			</Tooltip>
		);
	};
	const userRender = (value: string, index: number, record: any) => {
		return (
			<span
				title={value}
				style={{
					overflow: 'hidden',
					textOverflow: 'ellipsis',
					wordBreak: 'break-all'
				}}
			>
				{record.user === 'root' && (
					<Tooltip
						trigger={
							<Icon
								type="user-fill"
								style={{
									marginRight: '8px',
									color: '#0070cc',
									cursor: 'pointer'
								}}
								size="small"
							/>
						}
						align="t"
					>
						初始化用户最高权限账户
					</Tooltip>
				)}
				{value}
			</span>
		);
	};
	const onFilter = (filterParams: any) => {
		const keys = Object.keys(filterParams);
		if (filterParams[keys[0]].selectedKeys.length > 0) {
			const list = showDataSource
				.filter(
					(item) =>
						String(item[keys[0]]) ===
						filterParams[keys[0]].selectedKeys[0]
				)
				.map((item: any) => {
					return { ...item, passwordVisible: false };
				});
			setDataSource(list);
		} else {
			setDataSource(showDataSource);
		}
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
					placeholder: '请输入账户名称、已授权数据库名称检索',
					onSearch: handleSearch,
					onChange: handleChange,
					value: keyword
				}}
				searchStyle={{
					width: '360px'
				}}
				operation={Operation}
				onFilter={onFilter}
				onSort={onSort}
			>
				<Table.Column
					title="账户"
					dataIndex="user"
					width={100}
					cell={userRender}
				/>
				<Table.Column
					title="授权数据库"
					dataIndex="dbs"
					cell={absRender}
				/>
				<Table.Column
					title="密码"
					dataIndex="password"
					cell={passwordRender}
				/>
				{console.log(dataSource)}
				<Table.Column
					title="备注"
					dataIndex="description"
					cell={nullRender}
				/>
				<Table.Column
					title="创建时间"
					dataIndex="createTime"
					cell={createTimeRender}
					width={160}
					sortable
				/>
				<Table.Column
					title="密码校验"
					dataIndex="passwordCheck"
					cell={passwordCheckRender}
					filters={[
						{ label: '密码一致', value: true },
						{ label: '密码不一致', value: false }
					]}
					filterMode="single"
					width={110}
				/>
				<Table.Column
					title="操作"
					dataIndex="action"
					cell={actionRender}
					width={160}
				/>
			</Table>
			{visible && (
				<UserForm
					visible={visible}
					onCreate={() => {
						setVisible(false);
						onRefresh();
					}}
					clusterId={clusterId}
					namespace={namespace}
					middlewareName={middlewareName}
					onCancel={() => setVisible(false)}
					data={isEdit ? updateData : null}
				/>
			)}
			{passwordFormVisible && (
				<PasswordForm
					visible={passwordFormVisible}
					onCreate={() => {
						setPasswordFormVisible(false);
						onRefresh();
					}}
					clusterId={clusterId}
					namespace={namespace}
					middlewareName={middlewareName}
					onCancel={() => setPasswordFormVisible(false)}
					data={isEdit ? updateData : null}
				/>
			)}
		</>
	);
}

export default UserManage;
