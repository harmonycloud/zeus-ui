import React, { useState, useEffect } from 'react';
import {
	Button,
	Dialog,
	Message,
	Radio,
	Balloon
} from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import moment from 'moment';
import Table from '@/components/MidTable';
import { getUserList, deleteUser } from '@/services/user';
import { listDb, deleteDb, listCharset } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import { authorityList } from '@/utils/const';
import { nullRender } from '@/utils/utils';
import { filtersProps } from '@/types/comment';
import DatabaseForm from './databaseForm';
import axios from 'axios';

const Tooltip = Balloon.Tooltip;
function UserManage(props: any): JSX.Element {
	const { clusterId, namespace, middlewareName } = props;
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [showDataSource, setShowDataSource] = useState<any[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [charsetList, setCharsetList] = useState<string[]>([]);
	const [charsetFilter, setCharsetFilter] = useState<filtersProps[]>([]);
	const [visible, setVisible] = useState<boolean>(false);
	const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
	const [updateData, setUpdateData] = useState<any>();
	const [isEdit, setIsEdit] = useState(true);
	const [roleVisible, setRoleVisible] = useState(false);
	const [role, setRole] = useState<any>();
	const [record, setRecord] = useState<any>();
	const [isLDAP, setIsLDAP] = useState<boolean>(false);

	useEffect(() => {
		listDb({ clusterId, namespace, middlewareName, keyword }).then(
			(res) => {
				if (res.success) {
					res.data ? setDataSource(res.data) : setDataSource([]);
					setShowDataSource(res.data);
				} else {
					Message.show(messageConfig('error', '失败', res.errorMsg));
				}
			}
		);
		listCharset({ clusterId, namespace, middlewareName }).then((res) => {
			if (res.success) {
				res.data && setCharsetList(res.data.map((item: any) => item.charset));
				res.data && setCharsetFilter(
					res.data.map((item: any) => {
						return {
							label: item.charset,
							value: item.charset
						};
					})
				);
			}
		});
	}, [keyword]);
	const onRefresh: () => void = () => {
		listDb({ clusterId, namespace, middlewareName }).then((res) => {
			if (res.success) {
				res.data && setDataSource(res.data);
			} else {
				Message.show(messageConfig('error', '失败', res.errorMsg));
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
				deleteDb({
					clusterId,
					namespace,
					middlewareName,
					db: record.db
				}).then((res) => {
					if (res.success) {
						Message.show(
							messageConfig('success', '成功', '该数据库删除成功')
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
	const usersRender = (value: any, index: number, record: any) => {
		return value.length > 1 ? (
			<Tooltip
				trigger={
					<div
						style={{
							cursor: 'pointer'
						}}
					>
						<span>{value[0].user}</span>[
						{
							authorityList.find(
								(item) => item.authority === value[0].authority
							)?.value
						}
						] ...
					</div>
				}
				align="t"
			>
				{value.map((item: any) => {
					return (
						<div
							key={item.user}
							style={{
								display: 'flex',
								justifyContent: 'space-between'
							}}
						>
							<span style={{ marginRight: '8px' }}>
								{item.user +
									'[' +
									authorityList.find(
										(i) => i.authority === item.authority
									)?.value +
									']'}
							</span>
						</div>
					);
				})}
			</Tooltip>
		) : (
			<Tooltip
				trigger={
					<div
						style={{
							cursor: 'pointer'
						}}
					>
						<span>
							{value.length
								? value[0].user +
								  '[' +
								  authorityList.find(
										(item) =>
											item.authority ===
											value[0].authority
								  )?.value +
								  ']'
								: '/'}
						</span>
					</div>
				}
				align="t"
			>
				<div
					style={{
						cursor: 'pointer'
					}}
				>
					<span>
						{value.length
							? value[0].user +
							  '[' +
							  authorityList.find(
									(item) =>
										item.authority === value[0].authority
							  )?.value +
							  ']'
							: '/'}
					</span>
				</div>
			</Tooltip>
		);
	};
	const onFilter = (filterParams: any) => {
		const keys = Object.keys(filterParams);
		if (filterParams[keys[0]].selectedKeys.length > 0) {
			const list = showDataSource.filter(
				(item) =>
					item[keys[0]] === filterParams[keys[0]].selectedKeys[0]
			);
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
					placeholder: '请输入内容',
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
					title="授权数据库"
					dataIndex="db"
					width={120}
					cell={nullRender}
				/>
				<Table.Column
					title="字符集"
					dataIndex="charset"
					cell={nullRender}
					filters={charsetFilter}
					filterMode="single"
					width={100}
				/>
				<Table.Column
					title="关联账户"
					dataIndex="users"
					cell={usersRender}
					width={300}
				/>
				<Table.Column
					title="备注"
					dataIndex="description"
					cell={nullRender}
					width={300}
				/>
				<Table.Column
					title="创建时间"
					dataIndex="createTime"
					cell={createTimeRender}
					sortable
					width={160}
				/>
				<Table.Column
					title="操作"
					dataIndex="action"
					cell={actionRender}
					width={100}
				/>
			</Table>
			{visible && (
				<DatabaseForm
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
					charsetList={charsetList}
				/>
			)}
		</>
	);
}

export default UserManage;
