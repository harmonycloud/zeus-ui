import React, { useState, useEffect } from 'react';
import { Button, Modal, Popover, notification } from 'antd';
import Actions from '@/components/Actions';
import moment from 'moment';
import ProTable from '@/components/ProTable';

import { listDb, deleteDb, listCharset } from '@/services/middleware';
import { authorityList } from '@/utils/const';
import { nullRender } from '@/utils/utils';
import { filtersProps } from '@/types/comment';
import DatabaseForm from './databaseForm';

const LinkButton = Actions.LinkButton;
function UserManage(props: any): JSX.Element {
	const { clusterId, namespace, middlewareName } = props;
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [showDataSource, setShowDataSource] = useState<any[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [charsetList, setCharsetList] = useState<string[]>([]);
	const [charsetFilter, setCharsetFilter] = useState<any[]>([]);
	const [visible, setVisible] = useState<boolean>(false);
	const [updateData, setUpdateData] = useState<any>();
	const [isEdit, setIsEdit] = useState(true);

	useEffect(() => {
		listDb({ clusterId, namespace, middlewareName, keyword }).then(
			(res) => {
				if (res.success) {
					res.data ? setDataSource(res.data) : setDataSource([]);
					setShowDataSource(res.data);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			}
		);
		listCharset({ clusterId, namespace, middlewareName }).then((res) => {
			if (res.success) {
				res.data &&
					setCharsetList(res.data.map((item: any) => item.charset));
				res.data &&
					setCharsetFilter(
						res.data.map((item: any) => {
							return {
								text: item.charset,
								value: item.charset
							};
						})
					);
			}
		});
	}, [keyword]);
	const onRefresh: () => void = () => {
		listDb({ clusterId, namespace, middlewareName, keyword }).then(
			(res) => {
				if (res.success) {
					res.data && setDataSource(res.data);
				} else {
					notification.error({
						message: '失败',
						description: res.errorMsg
					});
				}
			}
		);
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
		Modal.confirm({
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
						notification.success({
							message: '成功',
							description: '该数据库删除成功'
						});
						onRefresh();
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

	const actionRender = (value: string, record: any, index: number) => {
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
	const usersRender = (value: any, record: any, index: number) => {
		return value.length > 1 ? (
			<Popover
				content={value.map((item: any) => {
					return (
						<div
							key={item.user}
							style={{
								display: 'flex',
								justifyContent: 'space-between'
							}}
						>
							<span className="db-name" title={item.user}>
								{item.user}
							</span>
							[
							<span style={{ marginRight: '8px' }}>
								{
									authorityList.find(
										(i) => i.authority === item.authority
									)?.value
								}
							</span>
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
					<span className="db-name">{value[0].user}</span>[
					{
						authorityList.find(
							(item) => item.authority === value[0].authority
						)?.value
					}
					] ...
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
							title={value.length ? value[0].user : '/'}
						>
							{value.length ? value[0].user : '/'}
						</span>
						<span>
							{value.length
								? '[' +
								  authorityList.find(
										(item) =>
											item.authority ===
											value[0].authority
								  )?.value +
								  ']'
								: ''}
						</span>
					</div>
				}
			>
				<div
					style={{
						cursor: 'pointer'
					}}
				>
					<span className="db-name">
						{value.length ? value[0].user : '/'}
					</span>
					<span>
						{value.length
							? '[' +
							  authorityList.find(
									(item) =>
										item.authority === value[0].authority
							  )?.value +
							  ']'
							: ''}
					</span>
				</div>
			</Popover>
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
					placeholder: '请输入内容',
					onSearch: handleChange,
					// onChange: handleChange,
					style: {
						width: '260px'
					}
				}}
				operation={Operation}
				// onFilter={onFilter}
				// onSort={onSort}
			>
				<ProTable.Column
					title="授权数据库"
					dataIndex="db"
					width={130}
					render={nullRender}
				/>
				<ProTable.Column
					title="字符集"
					dataIndex="charset"
					render={nullRender}
					filters={charsetFilter}
					// filterMode="single"
					onFilter={(value, record: any) => value === record.charset}
					filterMultiple={false}
					width={100}
				/>
				<ProTable.Column
					title="关联账户"
					dataIndex="users"
					render={usersRender}
				/>
				<ProTable.Column
					title="备注"
					dataIndex="description"
					width={200}
					render={nullRender}
				/>
				<ProTable.Column
					title="创建时间"
					dataIndex="createTime"
					render={createTimeRender}
					// sortable
					sorter={(a: any, b: any) =>
						new Date(a.createTime).getTime() -
						new Date(b.createTime).getTime()
					}
					width={160}
				/>
				<ProTable.Column
					title="操作"
					dataIndex="action"
					render={actionRender}
					width={100}
				/>
			</ProTable>
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
