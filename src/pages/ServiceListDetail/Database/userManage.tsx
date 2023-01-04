import React, { useState, useEffect } from 'react';
import { Button, Modal, Popover, notification } from 'antd';
import {
	CheckOutlined,
	CloseOutlined,
	EyeInvisibleFilled,
	EyeFilled,
	UserOutlined
} from '@ant-design/icons';
import Actions from '@/components/Actions';
import moment from 'moment';
import ProTable from '@/components/ProTable';

import { listUser, deleteUser } from '@/services/middleware';
import { nullRender } from '@/utils/utils';
import UserForm from './userForm';
import PasswordForm from './passwordForm';
import { authorityList } from '@/utils/const';

const LinkButton = Actions.LinkButton;
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
						?.filter((item: any) => item.user === 'root')
						.concat(
							res.data.filter((item: any) => item.user !== 'root')
						)
						.map((item: any) => {
							return { ...item, passwordVisible: false };
						});
					res.data ? setDataSource(data) : setDataSource([]);
					setShowDataSource(data);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			}
		);
	}, [keyword]);
	const onRefresh: () => void = () => {
		listUser({ clusterId, namespace, middlewareName, keyword }).then(
			(res) => {
				if (res.success) {
					const data = res.data
						?.filter((item: any) => item.user === 'root')
						.concat(
							res.data.filter((item: any) => item.user !== 'root')
						)
						.map((item: any) => {
							return { ...item, passwordVisible: false };
						});
					res.data ? setDataSource(data) : setDataSource([]);
				} else {
					notification.error({
						message: '失败',
						description: res.erroeMsg
					});
				}
			}
		);
	};
	const handleChange: (value: string) => void = (value: string) => {
		setKeyword(value);
	};
	const handleSearch: (value: string) => void = (value: string) => {
		setKeyword(value);
	};
	const edit: (record: any) => void = (record: any) => {
		setUpdateData(record);
		setVisible(true);
	};
	const deleteUserHandle: (record: any) => void = (record: any) => {
		Modal.confirm({
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
						notification.success({
							message: '成功',
							description: '该用户删除成功'
						});
						onRefresh();
					} else {
						notification.error({
							message: '失败',
							description: res.erroeMsg
						});
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

	const actionRender = (value: string, record: any, index: number) => {
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
	const absRender = (value: any, record: any, index: number) => {
		return value.length > 1 ? (
			<Popover
				content={value.map((item: any) => {
					return (
						<div
							key={item.db}
							style={{
								display: 'flex',
								justifyContent: 'space-between'
							}}
						>
							<span
								title={item.db}
								style={{ marginRight: '8px' }}
								className="db-name"
							>
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
			>
				<div
					style={{
						cursor: 'pointer'
					}}
				>
					<span className="db-name">{value[0].db}</span>[
					{
						authorityList.find(
							(item) => item.authority === value[0].authority
						)?.value
					}
					]...
				</div>
			</Popover>
		) : record.user === 'root' ? (
			<Popover
				content={
					<div
						style={{
							cursor: 'pointer'
						}}
					>
						<span>所有</span>[最高权限]
					</div>
				}
			>
				<div
					style={{
						cursor: 'pointer'
					}}
				>
					<span className="db-name">所有</span>[最高权限]
				</div>
			</Popover>
		) : (
			<Popover
				content={
					<div
						style={{
							cursor: 'pointer'
						}}
					>
						<span
							className="db-name"
							title={value.length ? value[0].db : '/'}
						>
							{value.length ? value[0].db : '/'}
						</span>
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
			>
				<div
					style={{
						cursor: 'pointer'
					}}
				>
					<span className="db-name">
						{value.length ? value[0].db : '/'}
					</span>
					{value.length
						? '[' +
						  authorityList.find(
								(item) => item.authority === value[0].authority
						  )?.value +
						  ']'
						: ''}
				</div>
			</Popover>
		);
	};
	const passwordRender = (value: string, record: any, index: number) => {
		return (
			<div>
				{record.passwordVisible ? (
					<EyeFilled
						style={{ cursor: 'pointer', marginRight: '8px' }}
						onClick={() => {
							const data = dataSource.map((item: any) => {
								if (item.id === record.id) {
									item.passwordVisible =
										!item.passwordVisible;
								}
								return item;
							});
							setDataSource([...data]);
						}}
					/>
				) : (
					<EyeInvisibleFilled
						style={{ cursor: 'pointer', marginRight: '8px' }}
						onClick={() => {
							const data = dataSource.map((item: any) => {
								if (item.id === record.id) {
									item.passwordVisible =
										!item.passwordVisible;
								}
								return item;
							});
							setDataSource([...data]);
						}}
					/>
				)}

				{record.passwordVisible && <span>{value}</span>}
			</div>
		);
	};
	const passwordCheckRender = (value: boolean) => {
		return (
			<Popover
				content={
					value
						? '该账户经系统监测，平台数据库和mysql数据库密码一致，可正常登录数据库'
						: '经系统监测，平台数据库和mysql数据库密码不一致，使用平台展示密码可能无法登录数据库'
				}
			>
				{value ? (
					<CheckOutlined
						style={{ cursor: 'pointer', color: '#0070cc' }}
					/>
				) : (
					<CloseOutlined
						style={{ cursor: 'pointer', color: '#Ef595C' }}
					/>
				)}
			</Popover>
		);
	};
	const userRender = (value: string, record: any, index: number) => {
		return (
			<span title={value} className="db-name">
				{record.user === 'root' && (
					<Popover content={'初始化用户最高权限账户'}>
						<UserOutlined
							style={{
								marginRight: '8px',
								color: '#0070cc',
								cursor: 'pointer'
							}}
						/>
					</Popover>
				)}
				{value}
			</span>
		);
	};
	const onFilter = (filterParams: any) => {
		const keys = Object.keys(filterParams);
		if (filterParams[keys[0]].selectedKeys.length > 0) {
			const list = showDataSource
				?.filter(
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
			<ProTable
				dataSource={dataSource}
				// exact
				// fixedBarExpandWidth={[24]}
				// affixActionBar
				showRefresh
				showColumnSetting
				onRefresh={onRefresh}
				rowKey="id"
				search={{
					placeholder: '请输入账户名称、已授权数据库名称检索',
					onSearch: handleSearch,
					style: { width: '360px' }
				}}
				operation={Operation}
				// onFilter={onFilter}
				// onSort={onSort}
			>
				<ProTable.Column
					title="账户"
					dataIndex="user"
					width={100}
					render={userRender}
				/>
				<ProTable.Column
					title="授权数据库"
					dataIndex="dbs"
					render={absRender}
					width={200}
				/>
				<ProTable.Column
					title="密码"
					dataIndex="password"
					render={passwordRender}
					width={120}
				/>
				<ProTable.Column
					title="备注"
					dataIndex="description"
					render={nullRender}
				/>
				<ProTable.Column
					title="创建时间"
					dataIndex="createTime"
					render={createTimeRender}
					width={150}
					sorter={(a: any, b: any) =>
						new Date(a.createTime).getTime() -
						new Date(b.createTime).getTime()
					}
					// sortable
				/>
				<ProTable.Column
					title="密码校验"
					dataIndex="passwordCheck"
					render={passwordCheckRender}
					filters={[
						{ text: '密码一致', value: true },
						{ text: '密码不一致', value: false }
					]}
					onFilter={(value, record: any) =>
						record.passwordCheck === value
					}
					// filterMode="single"
					filterMultiple={false}
					width={100}
				/>
				<ProTable.Column
					title="操作"
					dataIndex="action"
					render={actionRender}
					width={160}
				/>
			</ProTable>
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
