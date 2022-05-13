import React, { useState, useEffect } from 'react';
import { Button, Modal, Tree, notification } from 'antd';
import Actions from '@/components/Actions';
import ProTable from '@/components/ProTable';
import KvForm from './kvForm';

import moment from 'moment';
import { getKv, deleteKv } from '@/services/middleware';
import { nullRender } from '@/utils/utils';

const LinkButton = Actions.LinkButton;
function KvManage(props: any): JSX.Element {
	const { clusterId, namespace, middlewareName } = props;
	const [dataSource, setDataSource] = useState<any[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [visible, setVisible] = useState<boolean>(false);
	const [updateData, setUpdateData] = useState<any>();
	const [isEdit, setIsEdit] = useState(true);
	const [db, setDb] = useState<any[]>(['0']);

	useEffect(() => {
		getKv({
			clusterId,
			namespace,
			middlewareName,
			keyWord: keyword,
			db: db[0]
		}).then((res) => {
			if (res.success) {
				setDataSource(
					res.data.map((item: any) => {
						return { ...item, id: Math.random() };
					})
				);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
			}
		});
	}, [db, keyword]);
	const onRefresh: () => void = () => {
		getKv({
			clusterId,
			namespace,
			middlewareName,
			keyWord: keyword,
			db: db[0]
		}).then((res) => {
			if (res.success) {
				setDataSource(
					res.data.map((item: any) => {
						return { ...item, id: Math.random() };
					})
				);
			} else {
				notification.error({
					message: '失败',
					description: res.errorMsg
				});
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
		Modal.confirm({
			title: '操作确认',
			content: '删除将无法找回，是否继续?',
			onOk: () => {
				let sendData = {
					clusterId,
					namespace,
					middlewareName,
					db: record.db,
					...record
				};
				if (record.isDetail) {
					if (record.type === 'set') {
						sendData = {
							...sendData,
							set: sendData.newValue
						};
					} else if (
						record.type === 'hash' ||
						record.type === 'zset'
					) {
						sendData = {
							...sendData,
							[record.type]: {
								[record.newKey]: record.newValue
							}
						};
						delete sendData.zsets;
					} else if (record.type === 'list') {
						sendData = {
							...sendData,
							list: {
								[String(
									sendData.lists.findIndex(
										(i: string) => i === sendData.newValue
									)
								)]: sendData.newValue
							}
						};
					}
				}

				deleteKv(sendData).then((res) => {
					if (res.success) {
						notification.success({
							message: '成功',
							description: '数据库删除成功'
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
		if (dataIndex === 'timeOut') {
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
				{record.type === 'list' && (
					<LinkButton
						onClick={() => {
							edit({ ...record, listType: 'front', isAdd: true });
							setIsEdit(true);
						}}
					>
						头部新增
					</LinkButton>
				)}
				{record.type === 'list' && (
					<LinkButton
						onClick={() => {
							edit({ ...record, listType: 'back', isAdd: true });
							setIsEdit(true);
						}}
					>
						尾部新增
					</LinkButton>
				)}
				{record.type !== 'list' && record.type !== 'string' && (
					<LinkButton
						onClick={() => {
							edit({ ...record, isAdd: true });
							setIsEdit(true);
						}}
					>
						新增
					</LinkButton>
				)}
				<LinkButton
					onClick={() =>
						deleteUserHandle({ ...record, isDetail: false })
					}
				>
					删除
				</LinkButton>
			</Actions>
		);
	};

	const detailActionRender = (value: string, record: any, index: number) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						edit({ ...record, isAdd: false });
						setIsEdit(true);
					}}
				>
					编辑
				</LinkButton>
				<LinkButton
					onClick={() =>
						deleteUserHandle({ ...record, isDetail: true })
					}
				>
					删除
				</LinkButton>
			</Actions>
		);
	};

	const createTimeRender = (value: number) => {
		if (value === -1) return '/';
		return value;
	};
	const keyRender = (value: any, record: any, index: number) => {
		return (
			<span
				className="key-render"
				title={record.type === 'string' ? record.values : '/'}
			>
				{record.type === 'string' ? record.values : '/'}
			</span>
		);
	};
	const newDatasource: (record: any) => any[] = (record: any) => {
		if (record.type === 'string') {
			return [{ newValue: record.values, ...record }];
		} else if (record.type === 'list') {
			return record.lists.map((item: any) => {
				return { newValue: item, ...record };
			});
		} else if (record.type === 'hash') {
			const obj = record.hashs;
			const data = [];
			for (const i in obj) {
				data.push({ newKey: i, newValue: obj[i], ...record });
			}
			return data;
		} else if (record.type === 'set') {
			return record.sets.map((item: string) => {
				return {
					newValue: item,
					...record
				};
			});
		} else if (record.type === 'zset') {
			return record.zsets.map((item: any) => {
				return {
					newKey: item.score,
					newValue: item.element,
					...record
				};
			});
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
			>
				新增
			</Button>
		)
	};

	const TreeData = [
		{
			title: 'Redis实例',
			key: 'all',
			selectable: false,
			children: [
				{
					title: 'DB_0',
					key: '0'
				},
				{
					title: 'DB_1',
					key: '1'
				},
				{
					title: 'DB_2',
					key: '2'
				},
				{
					title: 'DB_3',
					key: '3'
				},
				{
					title: 'DB_4',
					key: '4'
				},
				{
					title: 'DB_5',
					key: '5'
				},
				{
					title: 'DB_6',
					key: '6'
				},
				{
					title: 'DB_7',
					key: '7'
				},
				{
					title: 'DB_8',
					key: '8'
				},
				{
					title: 'DB_9',
					key: '9'
				},
				{
					title: 'DB_10',
					key: '10'
				},
				{
					title: 'DB_11',
					key: '11'
				},
				{
					title: 'DB_12',
					key: '12'
				},
				{
					title: 'DB_13',
					key: '13'
				},
				{
					title: 'DB_14',
					key: '14'
				},
				{
					title: 'DB_15',
					key: '15'
				}
			]
		}
	];
	return (
		<>
			<div className="kv-manage">
				<Tree
					defaultExpandAll
					selectedKeys={db}
					onSelect={(value) => setDb(value)}
					treeData={TreeData}
				></Tree>
				<ProTable
					dataSource={dataSource}
					// exact
					// fixedBarExpandWidth={[24]}
					// affixActionBar
					showRefresh
					onRefresh={onRefresh}
					search={{
						placeholder: '请输入键名',
						onSearch: handleChange,
						// onChange: handleChange,
						// value: keyword,
						style: {
							width: '360px'
						}
					}}
					operation={Operation}
					// onSort={onSort}
					expandedRowRender={(record: any) => {
						const list = newDatasource(record);
						return (
							<ProTable
								dataSource={list}
								rowKey="key"
								pagination={false}
							>
								{/* <ProTable.Column
									title="序号"
									dataIndex="id"
									width={120}
									render={nullRender}
								/> */}
								{record.type === 'hash' && (
									<ProTable.Column
										dataIndex="newKey"
										title="字段"
										width={120}
										render={nullRender}
									/>
								)}
								<ProTable.Column
									title="键值"
									dataIndex="newValue"
									render={nullRender}
									width={120}
								/>
								{record.type === 'zset' && (
									<ProTable.Column
										title="分数"
										dataIndex="newKey"
										width={120}
									/>
								)}
								<ProTable.Column
									title="操作"
									dataIndex="action"
									render={detailActionRender}
									width={100}
								/>
							</ProTable>
						);
					}}
				>
					<ProTable.Column
						title="键名"
						dataIndex="key"
						width={120}
						render={nullRender}
					/>
					<ProTable.Column
						title="类型"
						dataIndex="type"
						render={nullRender}
						width={100}
					/>
					<ProTable.Column
						title="超出时间"
						dataIndex="timeOut"
						render={createTimeRender}
						// sortable
						sorter={(a: any, b: any) => a.timeOut - b.timeOut}
						width={160}
					/>
					<ProTable.Column
						title="键值"
						dataIndex="value"
						render={keyRender}
					/>
					<ProTable.Column
						title="操作"
						dataIndex="action"
						render={actionRender}
						width={200}
					/>
				</ProTable>
				{visible && (
					<KvForm
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
						db={db}
					/>
				)}
			</div>
		</>
	);
}

export default KvManage;
