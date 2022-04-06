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
import { getUserList, deleteUser } from '@/services/user';
import { listDb, deleteDb, listCharset } from '@/services/middleware';
import messageConfig from '@/components/messageConfig';
import { authorityList } from '@/utils/const';
import { nullRender } from '@/utils/utils';
import { filtersProps } from '@/types/comment';
import KvForm from './kvForm';

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
	const [roleVisible, setRoleVisible] = useState(false);
	const [role, setRole] = useState<any>();
	const [record, setRecord] = useState<any>();
	const [isLDAP, setIsLDAP] = useState<boolean>(false);

	useEffect(() => {
		// listDb({ clusterId, namespace, middlewareName, keyword }).then(
		// 	(res) => {
		// 		if (res.success) {
		// 			res.data ? setDataSource(res.data) : setDataSource([]);
		// 			setShowDataSource(res.data);
		// 		} else {
		// 			Message.show(messageConfig('error', '失败', res.errorMsg));
		// 		}
		// 	}
		// );
		// listCharset({ clusterId, namespace, middlewareName }).then((res) => {
		// 	if (res.success) {
		// 		setCharsetList(res.data.map((item: any) => item.charset));
		// 		setCharsetFilter(
		// 			res.data.map((item: any) => {
		// 				return {
		// 					label: item.charset,
		// 					value: item.charset
		// 				};
		// 			})
		// 		);
		// 	}
		// });
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
				{record.type === 'List' && (
					<LinkButton
						onClick={() => {
							edit(record);
							setIsEdit(true);
						}}
					>
						头部新增
					</LinkButton>
				)}
				{record.type === 'List' && (
					<LinkButton
						onClick={() => {
							edit(record);
							setIsEdit(true);
						}}
					>
						尾部新增
					</LinkButton>
				)}
				{record.type !== 'List' && (
					<LinkButton
						onClick={() => {
							edit(record);
							setIsEdit(true);
						}}
					>
						新增
					</LinkButton>
				)}
				<LinkButton onClick={() => deleteUserHandle(record)}>
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
	const keyRender = (value: any, index: number, record: any) => {
		return (
			<span>{record.type === 'string' ? value[0].keyValue : '/'}</span>
		);
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
				<Tree defaultExpandAll>
					<Tree.Node key="0" label="Redis实例" selectable={false}>
						<Tree.Node key="1" label="DB_0" />
						<Tree.Node key="2" label="DB_1" />
						<Tree.Node key="3" label="DB_2" />
						<Tree.Node key="4" label="DB_3" />
						<Tree.Node key="5" label="DB_4" />
						<Tree.Node key="6" label="DB_5" />
						<Tree.Node key="7" label="DB_6" />
					</Tree.Node>
				</Tree>
				<Table
					dataSource={[
						{
							db: 'test1',
							id: 1,
							type: 'string',
							keyValue: [{ keyValue: 'adasdas' }]
						},
						{
							db: 'test2',
							id: 2,
							type: 'List',
							keyValue: [
								{
									keyValue:
										'fasffasfvasdgdagadfgadfasklfjkalsfjhkalsjfhaijhewijqhwfdiafdksdfkasdf'
								}
							]
						},
						{
							db: 'test3',
							id: 3,
							type: 'Hash',
							keyValue: [
								{
									keyValue:
										'fasffasfvasdgdagadfgadfasklfjkalsfjhkalsjfhaijhewijqhwfdiafdksdfkasdf'
								}
							]
						},
						{
							db: 'test4',
							id: 4,
							type: 'Zset',
							keyValue: [
								{
									keyValue:
										'fasffasfvasdgdagadfgadfasklfjkalsfjhkalsjfhaijhewijqhwfdiafdksdfkasdf'
								}
							]
						},
						{
							db: 'test5',
							id: 5,
							type: 'Set',
							keyValue: [
								{
									keyValue:
										'fasffasfvasdgdagadfgadfasklfjkalsfjhkalsjfhaijhewijqhwfdiafdksdfkasdf'
								}
							]
						}
					]}
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
					expandedRowRender={(record: any) => (
						<Table dataSource={record.keyValue}>
							<Table.Column
								title="序号"
								dataIndex="id"
								width={120}
								cell={nullRender}
							/>
							{record.type === 'Hash' && (
								<Table.Column
									title="字段"
									dataIndex="mm"
									width={120}
									cell={nullRender}
								/>
							)}
							<Table.Column
								title="键值"
								dataIndex="keyValue"
								width={120}
								cell={nullRender}
							/>
							{record.type === 'Zset' && (
								<Table.Column
									title="分数"
									dataIndex="mm"
									width={120}
									cell={nullRender}
								/>
							)}
							<Table.Column
								title="操作"
								dataIndex="action"
								cell={detailActionRender}
								width={100}
							/>
						</Table>
					)}
				>
					<Table.Column
						title="键名"
						dataIndex="db"
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
						dataIndex="createTime"
						cell={createTimeRender}
						sortable
						width={160}
					/>
					<Table.Column
						title="键值"
						dataIndex="keyValue"
						cell={keyRender}
					/>
					<Table.Column
						title="操作"
						dataIndex="action"
						cell={actionRender}
						width={100}
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
						charsetList={charsetList}
					/>
				)}
			</div>
		</>
	);
}

export default KvManage;
