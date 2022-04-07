import React, { useState, useEffect } from 'react';
import {
	Button,
	Dialog,
	Message,
	Radio,
	Balloon,
	Tree
} from '@alicloud/console-components';
import { Page, Content, Header } from '@alicloud/console-components-page';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import moment from 'moment';
import Table from '@/components/MidTable';
import { getKv, deleteKv } from '@/services/middleware';
import { listDb, deleteDb, listCharset } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import { authorityList } from '@/utils/const';
import { nullRender } from '@/utils/utils';
import { filtersProps } from '@/types/comment';
import KvForm from './kvForm';
import { type } from 'os';
import { ElementFlags } from 'typescript';

const Tooltip = Balloon.Tooltip;
function KvManage(props: any): JSX.Element {
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
	const [db, setDb] = useState<string[]>(['0']);

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
				Message.show(messageConfig('error', '失败', res.errorMsg));
			}
		});
	}, [keyword, ...db]);
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
				let sendData = {
					clusterId,
					namespace,
					middlewareName,
					db: record.db,
					...record
				}
				if(record.isDetail){
					if(record.type === 'set'){
						sendData = {
							...sendData,
							set: sendData.newValue
						}
					}else if(record.type === 'hash' || record.type === 'zset'){
						sendData = {
							...sendData,
							[record.type]: {
								[record.newKey]: record.newValue
							}
						};
						delete sendData.zsets;
					}else if(record.type === 'list'){
						sendData = {
							...sendData,
							list: {
								[String(sendData.lists.findIndex((i: string) => i ===  sendData.newValue))]: sendData.newValue
							}
						}
					}
				}
				
				deleteKv(sendData).then((res) => {
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
				{record.type === 'list' && (
					<LinkButton
						onClick={() => {
							edit({...record,listType: 'front', isAdd: true});
							setIsEdit(true);
						}}
					>
						头部新增
					</LinkButton>
				)}
				{record.type === 'list' && (
					<LinkButton
						onClick={() => {
							edit({...record, listType: 'back', isAdd: true});
							setIsEdit(true);
						}}
					>
						尾部新增
					</LinkButton>
				)}
				{record.type !== 'list' && record.type !== 'string' && (
					<LinkButton
						onClick={() => {
							edit({...record, isAdd: true});
							setIsEdit(true);
						}}
					>
						新增
					</LinkButton>
				)}
				<LinkButton onClick={() => deleteUserHandle({...record,isDetail: false})}>
					删除
				</LinkButton>
			</Actions>
		);
	};

	const detailActionRender = (value: string, index: number, record: any) => {
		return (
			<Actions>
				<LinkButton
					onClick={() => {
						edit({...record, isAdd: false});
						setIsEdit(true);
					}}
				>
					编辑
				</LinkButton>
				<LinkButton onClick={() => deleteUserHandle({...record,isDetail: true})}>
					删除
				</LinkButton>
			</Actions>
		);
	};

	const createTimeRender = (value: number) => {
		if (value === -1) return '/';
		return value;
	};
	const keyRender = (value: any, index: number, record: any) => {
		return <span>{record.type === 'string' ? record.values : '/'}</span>;
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
			for (let i in obj) {
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
	return (
		<>
			<div className="kv-manage">
				<Tree
					defaultExpandAll
					selectedKeys={db}
					onSelect={(value) => {
						setDb(value);
					}}
				>
					<Tree.Node key="all" label="Redis实例" selectable={false}>
						<Tree.Node key="0" label="DB_0" />
						<Tree.Node key="1" label="DB_1" />
						<Tree.Node key="2" label="DB_2" />
						<Tree.Node key="3" label="DB_3" />
						<Tree.Node key="4" label="DB_4" />
						<Tree.Node key="5" label="DB_5" />
						<Tree.Node key="6" label="DB_6" />
						<Tree.Node key="7" label="DB_7" />
						<Tree.Node key="8" label="DB_8" />
						<Tree.Node key="9" label="DB_9" />
						<Tree.Node key="10" label="DB_10" />
						<Tree.Node key="11" label="DB_11" />
						<Tree.Node key="12" label="DB_12" />
						<Tree.Node key="13" label="DB_13" />
						<Tree.Node key="14" label="DB_14" />
						<Tree.Node key="15" label="DB_15" />
					</Tree.Node>
				</Tree>
				<Table
					dataSource={dataSource}
					exact
					fixedBarExpandWidth={[24]}
					affixActionBar
					showRefresh
					showColumnSetting
					onRefresh={onRefresh}
					search={{
						placeholder: '请输入键名',
						onSearch: handleSearch,
						onChange: handleChange,
						value: keyword
					}}
					searchStyle={{
						width: '360px'
					}}
					operation={Operation}
					onSort={onSort}
					expandedRowRender={(record: any) => {
						console.log(record);
						const list = newDatasource(record);
						return (
							<Table dataSource={list} primaryKey={record.key}>
								{/* <Table.Column
								title="序号"
								dataIndex="id"
								width={120}
								cell={nullRender}
							/> */}
								{record.type === 'hash' && (
									<Table.Column
										dataIndex="newKey"
										title="字段"
										width={120}
										cell={nullRender}
									/>
								)}
								<Table.Column
									title="键值"
									dataIndex="newValue"
									width={120}
								/>
								{record.type === 'zset' && (
									<Table.Column
										title="分数"
										dataIndex="newKey"
										width={120}
									/>
								)}
								<Table.Column
									title="操作"
									dataIndex="action"
									cell={detailActionRender}
									width={100}
								/>
							</Table>
						);
					}}
				>
					<Table.Column
						title="键名"
						dataIndex="key"
						width={120}
						cell={nullRender}
					/>
					<Table.Column
						title="类型"
						dataIndex="type"
						cell={nullRender}
						width={100}
					/>
					<Table.Column
						title="超出时间"
						dataIndex="timeOut"
						cell={createTimeRender}
						sortable
						width={160}
					/>
					<Table.Column
						title="键值"
						dataIndex="value"
						cell={keyRender}
					/>
					<Table.Column
						title="操作"
						dataIndex="action"
						cell={actionRender}
						width={200}
					/>
				</Table>
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
						charsetList={charsetList}
					/>
				)}
			</div>
		</>
	);
}

export default KvManage;
