import React, { useEffect, useState } from 'react';
import { Space, Table, Input, Button, Switch, notification, Modal } from 'antd';
import { useHistory, useParams } from 'react-router';
import type { PaginationProps } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import AddAccount from './AddAccount';
import { MysqlUserItem, ParamsProps, PgsqlUserItem } from '../index.d';
import Actions from '@/components/Actions';
import AuthorizationForm from './AuthorizatioinForm';
import { getUsers, deleteUsers } from '@/services/operatorPanel';
const LinkButton = Actions.LinkButton;
const { Search } = Input;
const { confirm } = Modal;
export default function AccountMag(): JSX.Element {
	const history = useHistory();
	const params: ParamsProps = useParams();
	const [current, setCurrent] = useState<number>(1);
	const [total, setTotal] = useState<number>();
	const [pageSize, setPageSize] = useState<number>(10);
	const [addOpen, setAddOpen] = useState<boolean>(false);
	const [authOpen, setAuthOpen] = useState<boolean>(false);
	const [dataSource, setDataSource] = useState<MysqlUserItem[]>();
	const [pgsqlDataSource, setPgsqlDataSource] = useState<PgsqlUserItem[]>();
	useEffect(() => {
		getData();
	}, []);
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
						history.push(
							`/operationalPanel/${params.currentTab}/${
								params.type
							}/${params.name}/roleDetail/${
								params.type === 'mysql'
									? (record as MysqlUserItem).user
									: (record as PgsqlUserItem).username
							}`
						);
					}}
				>
					查看详情
				</span>
			)
		},
		{
			title: '能否授权',
			dataIndex: 'grantAble',
			key: 'grantAble',
			render: (text: any) => {
				if (text) return <CheckOutlined />;
				return <CloseOutlined />;
			}
		},
		{
			title: '启/禁用',
			dataIndex: params.type === 'mysql' ? 'accountLocked' : 'usable',
			key: params.type === 'mysql' ? 'accountLocked' : 'usable',
			render: (text: any) => <Switch checked={text} />
		},
		{
			title: '操作',
			dataIndex: 'action',
			key: 'action',
			render: (text: any, record: MysqlUserItem | PgsqlUserItem) => (
				<Actions>
					<LinkButton>编辑</LinkButton>
					<LinkButton>重置密码</LinkButton>
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
			}
		});
	};
	const onSearch = (value: string) => getData(value);
	const showTotal: PaginationProps['showTotal'] = (total) => `共 ${total} 条`;
	const onShowSizeChange: PaginationProps['onShowSizeChange'] = (
		current,
		pageSize
	) => {
		console.log(current, pageSize);
	};
	const onChange: PaginationProps['onChange'] = (page) => {
		setCurrent(page);
	};
	return (
		<main className="account-mag-main">
			<div className="account-mag-action-content">
				<Space>
					<Button type="primary" onClick={() => setAddOpen(true)}>
						新增
					</Button>
					<Button type="default" onClick={() => setAuthOpen(true)}>
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
					rowKey="user"
					size="small"
					columns={columns}
					dataSource={
						params.type === 'mysql' ? dataSource : pgsqlDataSource
					}
					pagination={{
						size: 'small',
						current: current,
						total: total,
						pageSize: pageSize,
						onShowSizeChange: onShowSizeChange,
						onChange: onChange,
						showTotal: showTotal,
						showSizeChanger: true,
						showQuickJumper: true
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
				/>
			)}
		</main>
	);
}
