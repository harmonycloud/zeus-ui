import React, { useEffect, useState } from 'react';
import { Space, Table, Input, Button, Switch, notification, Modal } from 'antd';
import { useHistory, useParams } from 'react-router';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import AddAccount from './AddAccount';
import {
	AccountMagProps,
	MysqlUserItem,
	ParamsProps,
	PgsqlUserItem
} from '../index.d';
import Actions from '@/components/Actions';
import AuthorizationForm from './AuthorizatioinForm';
import {
	getUsers,
	deleteUsers,
	resetMysqlPassword,
	resetPgsqlPassword,
	enableMysqlUser,
	enablePgsqlUser
} from '@/services/operatorPanel';
import storage from '@/utils/storage';
const LinkButton = Actions.LinkButton;
const { Search } = Input;
const { confirm } = Modal;
export default function AccountMag(props: AccountMagProps): JSX.Element {
	const { currentUser } = props;
	const history = useHistory();
	const params: ParamsProps = useParams();
	const [addOpen, setAddOpen] = useState<boolean>(false);
	const [authOpen, setAuthOpen] = useState<boolean>(false);
	const [dataSource, setDataSource] = useState<MysqlUserItem[]>();
	const [pgsqlDataSource, setPgsqlDataSource] = useState<PgsqlUserItem[]>();
	const [userData, setUserData] = useState<MysqlUserItem | PgsqlUserItem>();
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>();
	useEffect(() => {
		if (currentUser) {
			getData();
		}
	}, [currentUser]);
	const handleDelete = (record: MysqlUserItem | PgsqlUserItem) => {
		const username =
			params.type === 'mysql'
				? (record as MysqlUserItem).user
				: (record as PgsqlUserItem).username;
		confirm({
			title: '操作确认',
			content: '请确认是否删除该用户？',
			onOk: () => {
				return deleteUsers({
					clusterId: params.clusterId,
					namespace: params.namespace,
					middlewareName: params.name,
					type: params.type,
					username: username
				})
					.then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '用户删除成功'
							});
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
						}
					})
					.finally(() => {
						getData();
					});
			}
		});
	};
	const handleReset = (record: MysqlUserItem | PgsqlUserItem) => {
		confirm({
			title: '操作确认',
			content: '您的密码将被重置为zeus123.com，是否确认重置密码？',
			onOk: () => {
				if (params.type === 'mysql') {
					return resetMysqlPassword({
						clusterId: params.clusterId,
						namespace: params.namespace,
						middlewareName: params.name,
						username: (record as MysqlUserItem).user
					}).then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '用户密码重置成功'
							});
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
						}
					});
				} else {
					return resetPgsqlPassword({
						clusterId: params.clusterId,
						namespace: params.namespace,
						middlewareName: params.name,
						username: (record as PgsqlUserItem).username
					}).then((res) => {
						if (res.success) {
							notification.success({
								message: '成功',
								description: '用户密码重置成功'
							});
						} else {
							notification.error({
								message: '失败',
								description: res.errorMsg
							});
						}
					});
				}
			}
		});
	};
	const handleChange = (
		checked: boolean,
		record: MysqlUserItem | PgsqlUserItem
	) => {
		if (params.type === 'mysql') {
			enableMysqlUser({
				clusterId: params.clusterId,
				namespace: params.namespace,
				middlewareName: params.name,
				username: (record as MysqlUserItem).user,
				lock: checked ? 'unlock' : 'lock'
			})
				.then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: `用户${checked ? '启用' : '启用'}成功`
						});
					} else {
						notification.error({
							message: '失败',
							description: `${res.errorMsg}${
								res.errorDetail ? ':' + res.errorDetail : ''
							}`
						});
					}
				})
				.finally(() => {
					getData();
				});
		} else {
			enablePgsqlUser({
				clusterId: params.clusterId,
				namespace: params.namespace,
				middlewareName: params.name,
				username: (record as PgsqlUserItem).username,
				enable: checked
			})
				.then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: `用户${checked ? '启用' : '禁用'}成功`
						});
					} else {
						notification.error({
							message: '失败',
							description: res.errorMsg
						});
					}
				})
				.finally(() => {
					getData();
				});
		}
	};
	const columns = [
		{
			title: '账号名',
			dataIndex: params.type === 'mysql' ? 'user' : 'username',
			key: params.type === 'mysql' ? 'user' : 'username'
		},
		{
			title: '权限',
			dataIndex: 'auth',
			key: 'auth',
			render: (text: any, record: MysqlUserItem | PgsqlUserItem) => (
				<span
					className="name-link"
					onClick={() => {
						storage.setSession('operatorUser', record);
						history.push(
							`/operationalPanel/roleDetail/${params.projectId}/${params.clusterId}/${params.namespace}/${params.type}/${params.name}/${params.version}/${params.mode}`
						);
					}}
				>
					查看详情
				</span>
			)
		},
		{
			title: '能否授权',
			dataIndex: params.type === 'mysql' ? 'grantAble' : 'inherit',
			key: params.type === 'mysql' ? 'grantAble' : 'inherit',
			render: (text: any) => {
				if (text) return <CheckOutlined />;
				return <CloseOutlined />;
			}
		},
		{
			title: '启/禁用',
			dataIndex: 'usable',
			key: 'usable',
			render: (text: any, record: MysqlUserItem | PgsqlUserItem) => (
				<Switch
					checked={text}
					onChange={(checked: boolean) =>
						handleChange(checked, record)
					}
				/>
			)
		},
		{
			title: '操作',
			dataIndex: 'action',
			key: 'action',
			render: (text: any, record: MysqlUserItem | PgsqlUserItem) => (
				<Actions>
					<LinkButton onClick={() => handleReset(record)}>
						重置密码
					</LinkButton>
					<LinkButton onClick={() => handleDelete(record)}>
						删除
					</LinkButton>
				</Actions>
			)
		}
	];
	const getData = (keyword?: string) => {
		getUsers({
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name,
			type: params.type,
			keyword: keyword || ''
		}).then((res) => {
			if (res.success) {
				if (params.type === 'mysql') {
					setDataSource(res.data as MysqlUserItem[]);
				} else {
					setPgsqlDataSource(res.data as PgsqlUserItem[]);
				}
			} else {
				notification.error({
					message: '失败',
					description: `${res.errorMsg}${
						res.errorDetail ? ':' + res.errorDetail : ''
					}`
				});
			}
		});
	};
	const onSearch = (value: string) => getData(value);
	const rowSelection = {
		onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
			if (selectedRowKeys.length > 1) {
				if (params.type === 'mysql') {
					const data = selectedRows.filter(
						(item) => item.user !== (userData as MysqlUserItem).user
					);
					setSelectedRowKeys([data[0].user]);
					setUserData(data[0]);
				} else {
					const data = selectedRows.filter(
						(item) =>
							item.username !==
							(userData as PgsqlUserItem).username
					);
					setSelectedRowKeys([data[0].username]);
					setUserData(data[0]);
				}
			} else {
				setUserData(selectedRows[0]);
				setSelectedRowKeys(selectedRowKeys);
			}
		}
	};
	return (
		<main className="account-mag-main">
			<div className="account-mag-action-content">
				<Space>
					<Button type="primary" onClick={() => setAddOpen(true)}>
						新增
					</Button>
					<Button
						disabled={userData ? false : true}
						type="default"
						onClick={() => setAuthOpen(true)}
					>
						授权
					</Button>
				</Space>
			</div>
			<Search
				placeholder="请输入账号名进行搜索"
				onSearch={onSearch}
				style={{ width: 400 }}
			/>
			<div className="account-mag-table-content">
				<Table<MysqlUserItem | PgsqlUserItem>
					rowKey={params.type === 'mysql' ? 'user' : 'username'}
					size="small"
					columns={columns}
					dataSource={
						params.type === 'mysql' ? dataSource : pgsqlDataSource
					}
					rowSelection={{
						selectedRowKeys: selectedRowKeys,
						hideSelectAll: true,
						...rowSelection
					}}
				/>
			</div>
			{addOpen && (
				<AddAccount
					clusterId={params.clusterId}
					namespace={params.namespace}
					middlewareName={params.name}
					type={params.type}
					open={addOpen}
					onCancel={() => setAddOpen(false)}
					onRefresh={getData}
				/>
			)}
			{authOpen && (
				<AuthorizationForm
					open={authOpen}
					onCancel={() => setAuthOpen(false)}
					type={params.type}
					clusterId={params.clusterId}
					namespace={params.namespace}
					middlewareName={params.name}
					user={userData}
					onRefresh={getData}
				/>
			)}
		</main>
	);
}
