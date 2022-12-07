import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
	Button,
	Input,
	Layout,
	Tree,
	Tabs,
	Dropdown,
	Menu,
	notification,
	Modal,
	Form,
	Spin
} from 'antd';
import { useParams } from 'react-router';
import { LeftOutlined, ReloadOutlined, RightOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import SplitPane, { SplitPaneProps } from 'react-split-pane';
import noData from '@/assets/images/nodata.svg';
import OperatorHeader from '../OperatorHeader';
import { IconFont } from '@/components/IconFont';
import { MenuInfo } from '@/types/comment';
import TableDetail from '../components/TableDetail';
import MysqlEditTable from '../components/MysqlEditTable';
import MysqlSqlConsole from '../components/MysqlSqlConsole';
import {
	ParamsProps,
	SqlConsoleProps,
	MysqlTableItem,
	MysqlColItem,
	DatabaseItem,
	PgsqlDatabaseItem,
	SchemaItem,
	PgsqlTableItem,
	IndexItem
} from '../index.d';
import ModeMag from '../ModeMag';
import PgsqlEditTable from '../components/PgsqlEditTable';
import {
	getDbTables,
	getCols,
	getAllDatabase,
	getSchemas,
	getPgTables,
	deletePgTables,
	deleteMysqlTable,
	getMysqlExcel,
	getMysqlSQL,
	getPgsqlExcel,
	getPgsqlSQL,
	updatePgTable,
	updateMysqlTable,
	getIndexs,
	getRedisDatabases,
	getPgCols
} from '@/services/operatorPanel';
import PgTableDetail from '../components/PgTableDetail';
import { Key } from 'rc-table/lib/interface';
import OpenTable from '../components/OpenTable';
import { formItemLayout618 } from '@/utils/const';
import RedisDBMag from '../components/RedisDBMag';
import { exportFile } from '@/utils/export';
import PgsqlSqlConsole from '../components/PgsqlSqlConsole';

const { confirm } = Modal;
const { Content, Sider } = Layout;
const tableMenuItems = [
	{
		label: '打开表',
		key: 'openTable'
	},
	{
		label: '编辑表',
		key: 'editTable'
	},
	{
		label: '删除表',
		key: 'deleteTable'
	},
	{
		label: '创建表',
		key: 'createTable'
	},
	{
		label: '重命名',
		key: 'renameTable'
	},
	{
		label: '建表语句',
		key: 'exportSQL'
	},
	{
		label: '导出表结构',
		key: 'exportTable'
	}
];
const databaseMenuItems = [
	{
		label: '表详情',
		key: 'tableInfo'
	},
	{
		label: '创建表',
		key: 'createTable'
	},
	{
		label: '查询',
		key: 'inquire'
	}
];
const pgMenuItems = [
	{
		label: '模式管理',
		key: 'modeMag'
	}
];
const updateTreeData = (
	list: DataNode[],
	key: React.Key,
	children: DataNode[]
): DataNode[] =>
	list.map((node) => {
		if (node.key === key) {
			return {
				...node,
				children
			};
		}
		if (node.children) {
			return {
				...node,
				children: updateTreeData(node.children, key, children)
			};
		}

		return node;
	});
const paneProps: SplitPaneProps = {
	split: 'vertical',
	minSize: 200,
	style: {
		height: '88%'
	},
	pane2Style: {
		width: 'calc(100% - 200px)',
		overflow: 'auto'
	}
};
const InitPage = (props: { title: string }) => (
	<div style={{ textAlign: 'center', marginTop: 50 }}>
		<img width={200} height={200} src={noData} />
		<p>{props.title}</p>
	</div>
);
// * sql窗口 模版
export default function SqlConsole(props: SqlConsoleProps): JSX.Element {
	const { currentUser, setOpen } = props;
	const params: ParamsProps = useParams();
	const [form] = Form.useForm();
	const [collapsed, setCollapsed] = useState<boolean>(false);
	const [treeData, setTreeData] = useState<DataNode[]>([]);
	const [pgTreeData, setPgTreeData] = useState<DataNode[]>([]);
	const [redisListData, setRedisListData] = useState<any>([]);
	const [pgTableTreeData, setPgTableTreeData] = useState<DataNode[]>([]);
	const [activeKey, setActiveKey] = useState('');
	const [items, setItems] = useState<any[]>([]);
	const [pgsqlExpandedKeys, setPgsqlExpandedKeys] = useState<any[]>([]);
	const [mysqlExpandedKeys, setMysqlExpandedKeys] = useState<any[]>([]);
	const [selectDatabase, setSelectDatabase] = useState<string>('');
	const [selectSchema, setSelectSchema] = useState<string>('');
	const [mysqlSpinning, setMysqlSpinning] = useState<boolean>(false);
	const [mysqlLoadedKeys, setMysqlLoadedKeys] = useState<any[]>([]);
	const [pgsqlLoadedKeys, setPgsqlLoadedKeys] = useState<any[]>([]);
	const [mysqlSearchValue, setMysqlSearchValue] = useState<string>('');
	const [pgSearchValue, setPgSearchValue] = useState<string>('');
	const [pgTableTreeValue, setPgTableTreeValue] = useState<string>('');
	const newTabIndex = useRef(0);
	// * 添加标签页通用方法
	const add = (label: string, children: any) => {
		const newActiveKey = `newTab${newTabIndex.current++}`;
		const itemTemp = {
			label: label,
			children: children,
			key: newActiveKey
		};
		setItems((origin) => {
			if (
				origin.findIndex((item) => item.label === itemTemp.label) > -1
			) {
				setActiveKey(
					origin.find((item) => item.label === itemTemp.label).key
				);
				return [...origin];
			} else {
				setActiveKey(newActiveKey);
				return [...origin, itemTemp];
			}
		});
	};
	// * 导出sql语句
	const exportSQL = (i: string, fatherNode: string) => {
		let _url: string;
		if (params.type === 'mysql') {
			_url = getMysqlSQL({
				database: fatherNode,
				table: i,
				clusterId: params.clusterId,
				namespace: params.namespace,
				middlewareName: params.name
			});
			exportFile(_url, {}, i, '.sql');
		} else {
			_url = getPgsqlSQL({
				databaseName: selectDatabase,
				schemaName: selectSchema,
				tableName: i,
				clusterId: params.clusterId,
				namespace: params.namespace,
				name: params.name
			});
			exportFile(_url, {}, i, '.sql');
		}
	};
	// * 导出数据表结构
	const exportTable = (i: string, fatherNode: string) => {
		let _url: string;
		if (params.type === 'mysql') {
			_url = getMysqlExcel({
				database: fatherNode,
				table: i,
				clusterId: params.clusterId,
				namespace: params.namespace,
				middlewareName: params.name
			});
			exportFile(_url, {}, i, '.xlsx');
		} else {
			_url = getPgsqlExcel({
				databaseName: selectDatabase,
				schemaName: selectSchema,
				tableName: i,
				clusterId: params.clusterId,
				namespace: params.namespace,
				name: params.name
			});
			exportFile(_url, {}, i, '.xlsx');
		}
	};
	const handleMenuClick = (e: MenuInfo, i: string, fatherNode: string) => {
		console.log(i);
		console.log(fatherNode);
		console.log(selectDatabase);
		console.log(selectSchema);
		switch (e.key) {
			case 'editTable': // * mysql 编辑表
				add(
					`编辑表:${i}`,
					params.type === 'mysql' ? (
						<MysqlEditTable
							tableName={i}
							dbName={fatherNode || ''}
							removeActiveKey={removeActiveKey}
							onRefresh={getData}
						/>
					) : (
						<PgsqlEditTable
							dbName={selectDatabase}
							schemaName={selectSchema}
							tableName={i}
							removeActiveKey={removeActiveKey}
							onRefresh={getPgsqlTableData}
						/>
					)
				);
				return;
			case 'tableInfo': // * mysql 表详情
				add(
					`表详情:${i}`,
					params.type === 'mysql' ? (
						<TableDetail dbName={i} add={add} />
					) : (
						<PgTableDetail
							schemaName={i}
							dbName={fatherNode || ''}
							add={add}
						/>
					)
				);
				return;
			case 'inquire': // * mysql sqlconsole
				add(
					i,
					params.type === 'mysql' ? (
						<MysqlSqlConsole dbName={i} />
					) : (
						<PgsqlSqlConsole dbName={i} />
					)
				);
				return;
			case 'modeMag': // * pgsql 模式管理
				add(`数据库:${i}`, <ModeMag dbName={i} onRefresh={getData} />);
				return;
			case 'openTable': // * 打开表
				add(
					`表:${i}`,
					params.type === 'mysql' ? (
						<OpenTable dbName={fatherNode || ''} tableName={i} />
					) : (
						<OpenTable
							dbName={selectDatabase}
							tableName={i}
							schemaName={selectSchema}
						/>
					)
				);
				return;
			case 'deleteTable':
				confirm({
					title: '操作确认',
					content: `请确认是否删除${i}表格`,
					onOk: () => {
						if (params.type === 'mysql') {
							deleteMysqlTable({
								table: i,
								database: fatherNode || '',
								clusterId: params.clusterId,
								namespace: params.namespace,
								middlewareName: params.name
							}).then((res) => {
								if (res.success) {
									notification.success({
										message: '成功',
										description: '数据表删除成功！'
									});
									getData();
								} else {
									notification.error({
										message: '失败',
										description: (
											<>
												<p>{res.errorMsg}</p>
												<p>{res.errorDetail}</p>
											</>
										)
									});
								}
							});
						} else {
							deletePgTables({
								tableName: i,
								schemaName: selectSchema,
								databaseName: selectDatabase,
								clusterId: params.clusterId,
								namespace: params.namespace,
								middlewareName: params.name
							}).then((res) => {
								if (res.success) {
									notification.success({
										message: '成功',
										description: '数据表删除成功！'
									});
									getPgsqlTableData();
								} else {
									notification.error({
										message: '失败',
										description: (
											<>
												<p>{res.errorMsg}</p>
												<p>{res.errorDetail}</p>
											</>
										)
									});
								}
							});
						}
					}
				});
				return;
			case 'exportSQL':
				exportSQL(i, fatherNode || '');
				return;
			case 'exportTable':
				exportTable(i, fatherNode || '');
				return;
			case 'createTable':
				add(
					'创建表',
					params.type === 'mysql' ? (
						<MysqlEditTable
							dbName={fatherNode ? fatherNode : i}
							removeActiveKey={removeActiveKey}
							onRefresh={getData}
						/>
					) : (
						<PgsqlEditTable
							dbName={selectDatabase}
							schemaName={fatherNode ? i : selectSchema}
							removeActiveKey={removeActiveKey}
							onRefresh={getPgsqlTableData}
						/>
					)
				);
				return;
			case 'renameTable':
				confirm({
					title: '重命名',
					content: (
						<Form
							form={form}
							{...formItemLayout618}
							labelAlign="left"
						>
							<Form.Item
								name="newTableName"
								label="表名称"
								rules={[
									{ required: true, message: '请输入表名' },
									{
										type: 'string',
										min: 1,
										max: 63,
										message: '请输入1-63个字符'
									}
								]}
							>
								<Input />
							</Form.Item>
						</Form>
					),
					onOk: () => {
						form.validateFields().then(() => {
							const sendData: any = {
								clusterId: params.clusterId,
								namespace: params.namespace,
								middlewareName: params.name
							};
							if (params.type === 'mysql') {
								sendData.table = i;
								sendData.database = fatherNode;
								sendData.newTableName =
									form.getFieldValue('newTableName');
								updateMysqlTable(sendData).then((res) => {
									if (res.success) {
										notification.success({
											message: '成功',
											description: '表格重命名成功！'
										});
										getData();
									} else {
										notification.error({
											message: '失败',
											description: (
												<>
													<p>{res.errorMsg}</p>
													<p>{res.errorDetail}</p>
												</>
											)
										});
									}
								});
							} else {
								sendData.databaseName = selectDatabase;
								sendData.table = i;
								sendData.schemaName = selectSchema;
								sendData.tableName =
									form.getFieldValue('newTableName');
								updatePgTable(sendData).then((res) => {
									if (res.success) {
										notification.success({
											message: '成功',
											description: '表格重命名成功！'
										});
										getPgsqlTableData();
									} else {
										notification.error({
											message: '失败',
											description: (
												<>
													<p>{res.errorMsg}</p>
													<p>{res.errorDetail}</p>
												</>
											)
										});
									}
								});
							}
						});
					}
				});
				return;
			default:
				break;
		}
	};
	// * mysql database menu / pgsql schema menu
	const menu = (i: any, fatherNode?: string) => {
		return (
			<Menu
				onClick={(info: MenuInfo) => {
					if (fatherNode) {
						setSelectSchema(i);
					} else {
						setSelectDatabase(i);
					}
					handleMenuClick(info, i, fatherNode || '');
				}}
				items={databaseMenuItems}
			/>
		);
	};
	// * table menu
	const tableMenu = (i: any, fatherNode: string) => {
		return (
			<Menu
				items={tableMenuItems}
				onClick={(info: MenuInfo) =>
					handleMenuClick(info, i, fatherNode)
				}
			/>
		);
	};
	// * postgresql database menu
	const pgMenu = (i: any) => {
		return (
			<Menu
				items={pgMenuItems}
				onClick={(info: MenuInfo) => {
					setSelectDatabase(i);
					handleMenuClick(info, i, '');
				}}
			/>
		);
	};
	useEffect(() => {
		// * 获取数据库列表的数据 - mysql
		if (currentUser) {
			const sendData = {
				clusterId: params.clusterId,
				namespace: params.namespace,
				middlewareName: params.name,
				type: params.type
			};
			if (params.type === 'mysql') {
				setMysqlSpinning(true);
				getAllDatabase(sendData)
					.then((res) => {
						if (res.success) {
							if (res.data.length > 0) {
								const list = res.data.map((item, index) => {
									const result: any = {};
									result.title = (
										<Dropdown
											overlay={() =>
												menu((item as DatabaseItem).db)
											}
											trigger={['contextMenu']}
										>
											<span
												title={
													(item as DatabaseItem).db
												}
												className="text-overflow"
												style={{ width: '140px' }}
												onDoubleClick={() =>
													add(
														`数据库:${
															(
																item as DatabaseItem
															).db
														}`,
														<MysqlSqlConsole
															dbName={
																(
																	item as DatabaseItem
																).db
															}
														/>
													)
												}
											>
												{(item as DatabaseItem).db}
											</span>
										</Dropdown>
									);
									result.key = index + '';
									result.value = (item as DatabaseItem).db;
									result.type = 'database';
									result.icon = (
										<IconFont type="icon-database" />
									);
									return result;
								});
								setTreeData(list);
							} else {
								setTreeData([]);
							}
						} else {
							notification.error({
								message: '失败',
								description: (
									<>
										<p>{res.errorMsg}</p>
										<p>{res.errorDetail}</p>
									</>
								)
							});
						}
					})
					.finally(() => {
						setMysqlSpinning(false);
					});
			} else if (params.type === 'postgresql') {
				getAllDatabase(sendData).then((res) => {
					if (res.success) {
						if (res.data.length > 0) {
							const list = res.data.map((item, index) => {
								const result: any = {};
								result.title = (
									<Dropdown
										overlay={() =>
											pgMenu(
												(item as PgsqlDatabaseItem)
													.databaseName
											)
										}
										trigger={['contextMenu']}
									>
										<span
											title={
												(item as PgsqlDatabaseItem)
													.databaseName
											}
											className="text-overflow"
											style={{ width: '140px' }}
											onDoubleClick={() => {
												add(
													`数据库:${
														(
															item as PgsqlDatabaseItem
														).databaseName
													}`,
													<ModeMag
														dbName={
															(
																item as PgsqlDatabaseItem
															).databaseName
														}
														onRefresh={getData}
													/>
												);
											}}
										>
											{
												(item as PgsqlDatabaseItem)
													.databaseName
											}
										</span>
									</Dropdown>
								);
								result.key = index + '';
								result.value = (
									item as PgsqlDatabaseItem
								).databaseName;
								result.type = 'database';
								result.icon = <IconFont type="icon-database" />;
								return result;
							});
							setPgTreeData(list);
						} else {
							setPgTreeData([]);
						}
					} else {
						notification.error({
							message: '失败',
							description: (
								<>
									<p>{res.errorMsg}</p>
									<p>{res.errorDetail}</p>
								</>
							)
						});
					}
				});
			} else {
				getRedisDatabases({
					clusterId: params.clusterId,
					namespace: params.namespace,
					middlewareName: params.name
				}).then((res) => {
					if (res.success) {
						setRedisListData(res.data);
						redisDbClick('' + res.data[0]?.db);
					} else {
						notification.error({
							message: '失败',
							description: (
								<>
									<p>{res.errorMsg}</p>
									<p>{res.errorDetail}</p>
								</>
							)
						});
					}
				});
			}
		}
	}, [currentUser]);
	useEffect(() => {
		// * 获取表数据 - pgsql
		if (selectSchema && selectDatabase) {
			getPgTables({
				clusterId: params.clusterId,
				schemaName: selectSchema,
				databaseName: selectDatabase,
				namespace: params.namespace,
				middlewareName: params.name
			}).then((res) => {
				if (res.success) {
					if (res.data.length > 0) {
						const list = res.data.map(
							(item: PgsqlTableItem, index: number) => {
								const result: any = {};
								result.title = (
									<Dropdown
										overlay={() =>
											tableMenu(
												item.tableName,
												selectSchema
											)
										}
										trigger={['contextMenu']}
									>
										<span
											onDoubleClick={() => {
												add(
													`表:${item.tableName}`,
													<OpenTable
														dbName={
															item.databaseName
														}
														schemaName={
															item.schemaName
														}
														tableName={
															item.tableName
														}
													/>
												);
											}}
										>
											{item.tableName}
										</span>
									</Dropdown>
								);
								result.key = index + '';
								result.icon = <IconFont type="icon-biaoge" />;
								result.value = item.tableName;
								return result;
							}
						);
						setPgTableTreeData(list);
					} else {
						setPgTableTreeData([]);
					}
				} else {
					notification.error({
						message: '失败',
						description: (
							<>
								<p>{res.errorMsg}</p>
								<p>{res.errorDetail}</p>
							</>
						)
					});
				}
			});
		}
	}, [selectDatabase, selectSchema]);
	const mysqlOnLoadData = ({ key, value, type, children }: any) => {
		return new Promise<void>((resolve) => {
			if (children) {
				resolve();
				return;
			}
			if (type === 'table') {
				// * 当前加载的树为表格的情况
				const database = key.substring(0, key.length - 2);
				getCols({
					clusterId: params.clusterId,
					namespace: params.namespace,
					middlewareName: params.name,
					database: database,
					table: value
				}).then((res) => {
					if (res.success) {
						if (res.data.length > 0) {
							const list = res.data.map(
								(item: MysqlColItem, index) => {
									const result: any = {};
									result.title = (
										<span
											title={item.column}
											className="text-overflow"
											style={{
												width: '80px',
												display: 'block'
											}}
										>
											{item.column}
										</span>
									);
									result.key = `${key}-0-${index}`;
									result.icon = (
										<IconFont type="icon-liebiao" />
									);
									result.value = item.column;
									result.isLeaf = true;
									return result;
								}
							);
							const lt = [
								{
									title: `列(${list.length})`,
									key: `${key}-0`,
									icon: <IconFont type="icon-liebiao" />,
									children: list,
									type: 'column'
								},
								{
									title: '索引',
									key: `${key}-1`,
									icon: (
										<IconFont
											style={{ fontSize: 21 }}
											type="icon-lianjiesuoyin"
										/>
									),
									value: value,
									type: 'index'
								}
							];
							setTreeData((origin) =>
								updateTreeData(origin, key, lt)
							);
							resolve();
						} else {
							setTreeData((origin) =>
								updateTreeData(origin, key, [])
							);
							resolve();
						}
					} else {
						resolve();
						return;
					}
				});
			} else if (type === 'index') {
				const database = key.substring(0, key.length - 4);
				getIndexs({
					clusterId: params.clusterId,
					namespace: params.namespace,
					middlewareName: params.name,
					database: database,
					table: value
				}).then((res) => {
					if (res.success) {
						if (res.data.length > 0) {
							const list = res.data.map(
								(item: IndexItem, index) => {
									const result: any = {};
									result.title = (
										<span
											title={item.index}
											className="text-overflow"
											style={{
												width: '80px',
												display: 'block'
											}}
										>
											{item.index}
										</span>
									);
									result.key = `${key}-1-${index}`;
									result.icon = (
										<IconFont type="icon-liebiao" />
									);
									result.value = item.index;
									result.isLeaf = true;
									return result;
								}
							);
							setTreeData((origin) => {
								return updateTreeData(origin, key, list);
							});
							resolve();
						} else {
							setTreeData((origin) =>
								updateTreeData(origin, key, [])
							);
							resolve();
						}
					} else {
						resolve();
						return;
					}
				});
			} else {
				getDbTables({
					clusterId: params.clusterId,
					namespace: params.namespace,
					middlewareName: params.name,
					database: value
				}).then((res) => {
					if (res.success) {
						const list = res.data.map(
							(item: MysqlTableItem, index) => {
								const result: any = {};
								result.title = (
									<Dropdown
										overlay={() =>
											tableMenu(item.tableName, value)
										}
										trigger={['contextMenu']}
									>
										<span
											title={item.tableName}
											className="text-overflow"
											style={{ width: '120px' }}
											onDoubleClick={() => {
												add(
													`表:${item.tableName}`,
													<OpenTable
														dbName={value}
														tableName={
															item.tableName
														}
													/>
												);
											}}
										>
											{item.tableName}
										</span>
									</Dropdown>
								);
								result.key = `${value}-${index}`;
								result.value = item.tableName;
								result.type = 'table';
								result.icon = (
									<IconFont
										style={{ fontSize: 16 }}
										type="icon-biaoge"
									/>
								);
								return result;
							}
						);
						setTreeData((origin) =>
							updateTreeData(origin, key, list)
						);
						resolve();
					}
				});
			}
		});
	};
	const pgsqlOnLoadData = ({ key, value, children }: any) =>
		new Promise<void>((resolve) => {
			if (children) {
				resolve();
				return;
			}
			getSchemas({
				clusterId: params.clusterId,
				namespace: params.namespace,
				middlewareName: params.name,
				databaseName: value
			}).then((res) => {
				if (res.success) {
					if (res.data.length > 0) {
						const list = res.data.map(
							(item: SchemaItem, index: number) => {
								const result: any = {};
								result.title = (
									<Dropdown
										overlay={() =>
											menu(item.schemaName, value)
										}
										trigger={['contextMenu']}
									>
										<span
											onDoubleClick={() => {
												add(
													`模式:${item.schemaName}`,
													<PgsqlSqlConsole
														dbName={value}
													/>
												);
											}}
										>
											{item.schemaName}
										</span>
									</Dropdown>
								);
								result.key = `${key}-${index}`;
								result.icon = (
									<IconFont
										style={{ fontSize: 16 }}
										type="icon-shuzhi"
									/>
								);
								result.value = item.schemaName;
								result.type = 'schema';
								result.isLeaf = true;
								return result;
							}
						);
						setPgTreeData((origin) =>
							updateTreeData(origin, key, list)
						);
						resolve();
					} else {
						setPgTreeData((origin) =>
							updateTreeData(origin, key, [])
						);
						resolve();
					}
				} else {
					resolve();
					return;
				}
			});
		});
	const pgTableOnLoadData = ({ key, value, children }: any) =>
		new Promise<void>((resolve) => {
			if (children) {
				resolve();
				return;
			}
			getPgCols({
				databaseName: selectDatabase,
				schemaName: selectSchema,
				tableName: value,
				clusterId: params.clusterId,
				namespace: params.namespace,
				middlewareName: params.name
			}).then((res) => {
				if (res.success) {
					if (res.data.length > 0) {
						const list = res.data.map((item, index: number) => {
							const result: any = {};
							result.title = (
								<span
									title={item.column}
									className="text-overflow"
									style={{
										width: '80px',
										display: 'inline-block'
									}}
								>
									{item.column}
								</span>
							);
							result.key = `${key}-0-${index}`;
							result.icon = <IconFont type="icon-liebiao" />;
							result.value = item.column;
							result.isLeaf = true;
							return result;
						});
						const lt = [
							{
								title: `列(${list.length})`,
								key: `${key}-0`,
								icon: <IconFont type="icon-liebiao" />,
								children: list,
								type: 'column'
							}
						];
						setPgTableTreeData((origin) =>
							updateTreeData(origin, key, lt)
						);
						resolve();
					} else {
						setPgTableTreeData((origin) =>
							updateTreeData(origin, key, [])
						);
						resolve();
					}
				} else {
					resolve();
					return;
				}
			});
		});
	const onChange = (newActiveKey: string) => {
		setActiveKey(newActiveKey);
	};
	const remove = (targetKey: string) => {
		let newActiveKey = activeKey;
		let lastIndex = -1;
		items.forEach((item, i) => {
			if (item.key === targetKey) {
				lastIndex = i - 1;
			}
		});
		const newPanes = items.filter((item) => item.key !== targetKey);
		if (newPanes.length && newActiveKey === targetKey) {
			if (lastIndex >= 0) {
				newActiveKey = newPanes[lastIndex].key;
			} else {
				newActiveKey = newPanes[0].key;
			}
		}
		setItems(newPanes);
		setActiveKey(newActiveKey);
	};
	const removeActiveKey = () => {
		remove(activeKey);
	};
	const onEdit = (targetKey: any, action: 'add' | 'remove') => {
		if (action === 'add') {
			// add('new TAb', null);
		} else {
			remove(targetKey);
		}
	};
	const pgsqlOnSelect = (selectedKeys: Key[], e: any) => {
		if (e.node.type === 'database') {
			setSelectDatabase(e.node.value);
		} else {
			setSelectSchema(e.node.value);
		}
	};
	const mysqlOnSelect = (selectedKeys: Key[], e: any) => {
		if (e.node.type === 'database') {
			setSelectDatabase(e.node.value);
		}
	};
	const redisDbClick = (dbName: string) => {
		if (selectDatabase === dbName) return;
		setSelectDatabase(dbName);
		add(
			'DB-' + dbName,
			<RedisDBMag dbName={dbName} redisDbRefresh={redisDbRefresh} />
		);
	};
	const onLoad = (loadedKeys: Key[], info: any, type: string) => {
		if (type === 'mysql') {
			setMysqlLoadedKeys(loadedKeys);
		} else {
			setPgsqlLoadedKeys(loadedKeys);
		}
	};
	const mysqlOnExpand = (expandedKeys: Key[], info: any) => {
		let newMysqlLoadedKeys = mysqlLoadedKeys;
		if (mysqlExpandedKeys.length > expandedKeys.length) {
			newMysqlLoadedKeys = mysqlLoadedKeys.filter((i) =>
				expandedKeys.includes(i)
			);
		}
		if (info.node.type === 'database') {
			setSelectDatabase(info.node.value);
		}
		setMysqlLoadedKeys(newMysqlLoadedKeys);
		setMysqlExpandedKeys(expandedKeys);
	};
	const pgsqlOnExpand = (expandedKeys: Key[], info: any) => {
		let newPgsqlLoadedKeys = pgsqlLoadedKeys;
		if (pgsqlExpandedKeys.length > expandedKeys.length) {
			newPgsqlLoadedKeys = pgsqlLoadedKeys.filter((i) =>
				expandedKeys.includes(i)
			);
		}
		setSelectDatabase(info.node.value);
		setPgsqlLoadedKeys(newPgsqlLoadedKeys);
		setPgsqlExpandedKeys(expandedKeys);
	};
	// * 左侧树状图的刷新
	const getData = () => {
		setMysqlExpandedKeys([]);
		setPgsqlExpandedKeys([]);
		const sendData = {
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name,
			type: params.type
		};
		if (params.type === 'mysql') {
			setMysqlSpinning(true);
			getAllDatabase(sendData)
				.then((res) => {
					if (res.success) {
						const list = res.data.map((item, index) => {
							const result: any = {};
							result.title = (
								<Dropdown
									overlay={() =>
										menu((item as DatabaseItem).db)
									}
									trigger={['contextMenu']}
								>
									<span
										title={(item as DatabaseItem).db}
										className="text-overflow"
										style={{ width: '140px' }}
										onDoubleClick={() =>
											add(
												`数据库:${
													(item as DatabaseItem).db
												}`,
												<MysqlSqlConsole
													dbName={
														(item as DatabaseItem)
															.db
													}
												/>
											)
										}
									>
										{(item as DatabaseItem).db}
									</span>
								</Dropdown>
							);
							result.key = index + '';
							result.value = (item as DatabaseItem).db;
							result.type = 'database';
							result.isLeaf = false;
							result.icon = <IconFont type="icon-database" />;
							return result;
						});
						setTreeData(list);
					} else {
						notification.error({
							message: '失败',
							description: (
								<>
									<p>{res.errorMsg}</p>
									<p>{res.errorDetail}</p>
								</>
							)
						});
					}
				})
				.finally(() => {
					setMysqlSpinning(false);
				});
		} else if (params.type === 'postgresql') {
			getAllDatabase(sendData).then((res) => {
				if (res.success) {
					if (res.data.length > 0) {
						const list = res.data.map((item, index) => {
							const result: any = {};
							result.title = (
								<Dropdown
									overlay={() =>
										pgMenu(
											(item as PgsqlDatabaseItem)
												.databaseName
										)
									}
									trigger={['contextMenu']}
								>
									<span
										title={
											(item as PgsqlDatabaseItem)
												.databaseName
										}
										className="text-overflow"
										style={{ width: '140px' }}
										onDoubleClick={() => {
											add(
												`数据库:${
													(item as PgsqlDatabaseItem)
														.databaseName
												}`,
												<ModeMag
													dbName={
														(
															item as PgsqlDatabaseItem
														).databaseName
													}
													onRefresh={getData}
												/>
											);
										}}
									>
										{
											(item as PgsqlDatabaseItem)
												.databaseName
										}
									</span>
								</Dropdown>
							);
							result.key = index + '';
							result.value = (
								item as PgsqlDatabaseItem
							).databaseName;
							result.type = 'database';
							result.isLeaf = false;
							result.icon = <IconFont type="icon-database" />;
							return result;
						});
						setPgTreeData(list);
					} else {
						setPgTreeData([]);
					}
				} else {
					notification.error({
						message: '失败',
						description: (
							<>
								<p>{res.errorMsg}</p>
								<p>{res.errorDetail}</p>
							</>
						)
					});
				}
			});
		} else {
			getRedisDatabases({
				clusterId: params.clusterId,
				namespace: params.namespace,
				middlewareName: params.name
			}).then((res) => {
				if (res.success) {
					setRedisListData(res.data);
					redisDbClick('' + res.data[0]?.db);
				} else {
					notification.error({
						message: '失败',
						description: (
							<>
								<p>{res.errorMsg}</p>
								<p>{res.errorDetail}</p>
							</>
						)
					});
				}
			});
		}
	};
	// * pgsql table树状图的刷新
	const getPgsqlTableData = () => {
		getPgTables({
			clusterId: params.clusterId,
			schemaName: selectSchema,
			databaseName: selectDatabase,
			namespace: params.namespace,
			middlewareName: params.name
		}).then((res) => {
			if (res.success) {
				if (res.data.length > 0) {
					const list = res.data.map(
						(item: PgsqlTableItem, index: number) => {
							const result: any = {};
							result.title = (
								<Dropdown
									overlay={() =>
										tableMenu(item.tableName, selectSchema)
									}
									trigger={['contextMenu']}
								>
									<span
										onDoubleClick={() => {
											console.log('click');
											add(
												`表:${item.tableName}`,
												<OpenTable
													dbName={item.databaseName}
													schemaName={item.schemaName}
													tableName={item.tableName}
												/>
											);
										}}
									>
										{item.tableName}
									</span>
								</Dropdown>
							);
							result.key = index + '';
							result.icon = <IconFont type="icon-biaoge" />;
							result.value = item.tableName;
							return result;
						}
					);
					setPgTableTreeData(list);
				} else {
					setPgTableTreeData([]);
				}
			} else {
				notification.error({
					message: '失败',
					description: (
						<>
							<p>{res.errorMsg}</p>
							<p>{res.errorDetail}</p>
						</>
					)
				});
			}
		});
	};
	const mysqlTreeValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		setMysqlSearchValue(value);
	};
	const pgTreeValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		setPgSearchValue(value);
	};
	const pgTableTreeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		setPgTableTreeValue(value);
	};
	const newTreeData = useMemo(() => {
		const loop = (data: any[], database: string): any[] =>
			data?.map((item) => {
				const result: any = {};
				const strTitle = item.value || '';
				const index = strTitle.indexOf(mysqlSearchValue);
				const beforeStr = strTitle.substring(0, index);
				const afterStr = strTitle.slice(
					index + mysqlSearchValue.length
				);
				result.title = (
					<Dropdown
						overlay={() => menu(item.value)}
						trigger={['contextMenu']}
					>
						{index > -1 ? (
							<span
								title={item.value}
								className="text-overflow"
								style={{ width: '140px' }}
								onDoubleClick={() =>
									add(
										`数据库:${item.value}`,
										<MysqlSqlConsole dbName={item.value} />
									)
								}
							>
								{beforeStr}
								<span className="site-tree-search-value">
									{mysqlSearchValue}
								</span>
								{afterStr}
							</span>
						) : (
							<span
								title={item.value}
								className="text-overflow"
								style={{ width: '140px' }}
								onDoubleClick={() =>
									add(
										`数据库:${item.value}`,
										<MysqlSqlConsole dbName={item.value} />
									)
								}
							>
								{strTitle}
							</span>
						)}
					</Dropdown>
				);
				result.isLeaf = false;
				result.key = item.key;
				result.value = item.value;
				result.type = item.type;
				result.icon = item.icon;

				if (item.type === 'table') {
					const result1: any = {};
					result1.title = (
						<Dropdown
							overlay={() => tableMenu(item.value, database)}
							trigger={['contextMenu']}
						>
							<span
								title={item.value}
								className="text-overflow"
								style={{ width: '120px' }}
								onDoubleClick={() => {
									add(
										`表:${item.value}`,
										<OpenTable
											dbName={database}
											tableName={item.value}
										/>
									);
								}}
							>
								{index > -1 ? (
									<>
										{beforeStr}
										<span className="site-tree-search-value">
											{mysqlSearchValue}
										</span>
										{afterStr}
									</>
								) : (
									strTitle
								)}
							</span>
						</Dropdown>
					);
					result1.key = item.key;
					result1.value = item.value;
					result1.type = item.type;
					result1.icon = item.icon;
					result1.isLeaf = item.isLeaf;
					return {
						...result1,
						children: loop(item.children, '')
					};
				}
				if (item.children) {
					if (item.type === 'database') {
						return {
							...result,
							children: loop(item.children, result.value)
						};
					} else {
						return { ...item };
					}
				} else {
					return { ...item };
				}
			});

		return loop(treeData, '');
	}, [mysqlSearchValue, treeData]);
	const newPgTreeData = useMemo(() => {
		const loop = (data: any[], database: string): any[] =>
			data.map((item) => {
				const result: any = {};
				const strTitle = item.value || '';
				const index = strTitle.indexOf(pgSearchValue);
				const beforeStr = strTitle.substring(0, index);
				const afterStr = strTitle.slice(index + pgSearchValue.length);
				result.title = (
					<Dropdown
						overlay={() => pgMenu(item.value)}
						trigger={['contextMenu']}
					>
						{index > -1 ? (
							<span
								title={item.value}
								className="text-overflow"
								style={{ width: '130px' }}
								onDoubleClick={() =>
									add(
										`数据库:${item.value}`,
										<ModeMag
											dbName={item.value}
											onRefresh={getData}
										/>
									)
								}
							>
								{beforeStr}
								<span className="site-tree-search-value">
									{pgSearchValue}
								</span>
								{afterStr}
							</span>
						) : (
							<span
								title={item.value}
								className="text-overflow"
								style={{ width: '130px' }}
								onDoubleClick={() =>
									add(
										`数据库:${item.value}`,
										<ModeMag
											dbName={item.value}
											onRefresh={getData}
										/>
									)
								}
							>
								{strTitle}
							</span>
						)}
					</Dropdown>
				);
				result.key = item.key;
				result.value = item.value;
				result.type = item.type;
				result.icon = item.icon;
				result.isLeaf = false;
				if (item.type === 'schema') {
					const result1: any = {};
					result1.title = (
						<Dropdown
							overlay={() => menu(item.value, database)}
							trigger={['contextMenu']}
						>
							<span
								onDoubleClick={() => {
									add(
										`模式:${item.value}`,
										<PgsqlSqlConsole dbName={database} />
									);
								}}
							>
								{index > -1 ? (
									<>
										{beforeStr}
										<span className="site-tree-search-value">
											{pgSearchValue}
										</span>
										{afterStr}
									</>
								) : (
									strTitle
								)}
							</span>
						</Dropdown>
					);
					result1.key = item.key;
					result1.icon = item.icon;
					result1.value = item.value;
					result1.type = item.type;
					result1.isLeaf = item.isLeaf;
					return result1;
				}

				if (item.children) {
					if (item.type === 'database') {
						return {
							...result,
							children: loop(item.children, result.value)
						};
					} else {
						return { ...item };
					}
				}

				return {
					...result
				};
			});

		return loop(pgTreeData, '');
	}, [pgSearchValue, pgTreeData]);
	const newPgTreeTableData = useMemo(() => {
		const loop = (data: any[]): any[] =>
			data.map((item) => {
				console.log(item);
				const result: any = {};
				const strTitle = item.value || '';
				const index = strTitle.indexOf(pgTableTreeValue);
				const beforeStr = strTitle.substring(0, index);
				const afterStr = strTitle.slice(
					index + pgTableTreeValue.length
				);
				result.title = (
					<Dropdown
						overlay={() => tableMenu(item.value, '')}
						trigger={['contextMenu']}
					>
						{index > -1 ? (
							<span
								onDoubleClick={() => {
									add(
										`表:${item.value}`,
										<OpenTable
											dbName={selectDatabase}
											schemaName={selectSchema}
											tableName={item.value}
										/>
									);
								}}
							>
								{beforeStr}
								<span className="site-tree-search-value">
									{pgTableTreeValue}
								</span>
								{afterStr}
							</span>
						) : (
							<span
								onDoubleClick={() => {
									add(
										strTitle,
										<OpenTable
											dbName={selectDatabase}
											schemaName={selectSchema}
											tableName={item.value}
										/>
									);
								}}
							>
								{strTitle}
							</span>
						)}
					</Dropdown>
				);
				result.key = item.key;
				result.value = item.value;
				result.type = item.type;
				result.icon = item.icon;
				result.isLeaf = false;
				if (item.children) {
					if (item.type === 'table') {
						return {
							...result,
							children: loop(item.children)
						};
					} else {
						return { ...item };
					}
				}

				return {
					...result
				};
			});

		return loop(pgTableTreeData);
	}, [pgTableTreeValue, pgTableTreeData]);
	const redisDbRefresh = () => {
		getRedisDatabases({
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name
		}).then((res) => {
			if (res.success) {
				setRedisListData(res.data);
			} else {
				notification.error({
					message: '失败',
					description: (
						<>
							<p>{res.errorMsg}</p>
							<p>{res.errorDetail}</p>
						</>
					)
				});
			}
		});
	};
	return (
		<Layout style={{ height: '100%' }}>
			<Sider
				className="sql-console-sider"
				collapsed={collapsed}
				collapsible
				onCollapse={(value) => setCollapsed(value)}
				theme="light"
				collapsedWidth={0}
				zeroWidthTriggerStyle={{
					top: '40%',
					right: '-20px',
					width: '20px',
					height: '80px',
					borderRadius: '0 12px 12px 0',
					backgroundColor: '#F5F5F5',
					lineHeight: '80px',
					fontSize: '12px'
				}}
				trigger={collapsed ? <RightOutlined /> : <LeftOutlined />}
				width={230}
			>
				<div className="sql-console-sider-title-content">
					<div title={params.name + '控制台'}>
						{params.name}控制台
					</div>
					<Button onClick={getData} icon={<ReloadOutlined />} />
				</div>
				{params.type === 'mysql' && (
					<div className="sql-console-sider-search">
						<Input.Search
							placeholder="请输入关键字搜索"
							style={{ marginBottom: 8, paddingRight: 16 }}
							value={mysqlSearchValue}
							onChange={mysqlTreeValueChange}
						/>
						<div className="sql-console-tree-content">
							<Spin spinning={mysqlSpinning}>
								<Tree
									showIcon
									treeData={newTreeData}
									loadData={mysqlOnLoadData}
									onExpand={mysqlOnExpand}
									expandedKeys={mysqlExpandedKeys}
									loadedKeys={mysqlLoadedKeys}
									onLoad={(loadedKeys, info) =>
										onLoad(loadedKeys, info, 'mysql')
									}
									onSelect={mysqlOnSelect}
									// height={
									// 	document.getElementsByClassName(
									// 		'sql-console-tree-content'
									// 	)[0]?.clientHeight
									// }
								/>
							</Spin>
						</div>
					</div>
				)}
				{params.type === 'postgresql' && (
					<div className="sql-console-sider-search">
						<Input.Search
							style={{ marginBottom: 8, paddingRight: 16 }}
							placeholder="请输入关键字搜索"
							value={pgSearchValue}
							onChange={pgTreeValueChange}
						/>
						<div className="sql-console-tree-content">
							<Tree
								showIcon
								treeData={newPgTreeData}
								loadData={pgsqlOnLoadData}
								expandedKeys={pgsqlExpandedKeys}
								loadedKeys={pgsqlLoadedKeys}
								onLoad={(loadedKeys, info) =>
									onLoad(loadedKeys, info, 'pgsql')
								}
								onExpand={pgsqlOnExpand}
								onSelect={pgsqlOnSelect}
								// height={
								// 	document.getElementsByClassName(
								// 		'sql-console-tree-content'
								// 	)[0]?.clientHeight
								// }
							/>
						</div>
					</div>
				)}
				{params.type === 'redis' && (
					<div
						className="sql-console-sider-search"
						style={{ paddingRight: 16 }}
					>
						<div className="redis-dbs">
							{redisListData.map((item: any) => {
								return (
									<div
										key={item.db}
										className={`redis-db-item ${
											String(item.db) === selectDatabase
												? 'active'
												: ''
										}`}
										onDoubleClick={() =>
											redisDbClick('' + item.db)
										}
									>
										{/* <img src={redisImg} className="mr-8" />{' '} */}
										<IconFont
											type="icon-database"
											className="mr-8"
											style={{ fontSize: 24 }}
										/>
										DB-{item.db}({item.size})
									</div>
								);
							})}
						</div>
					</div>
				)}
			</Sider>
			<Content className="sql-console-content">
				<OperatorHeader
					currentUser={currentUser}
					loginOut={() => {
						if (currentUser) {
							setOpen(true);
						} else {
							window.close();
						}
					}}
				/>
				{items.length === 0 && params.type === 'redis' && (
					<InitPage title="请双击DB打开DB管理页面" />
				)}
				{items.length === 0 && params.type === 'mysql' && (
					<InitPage title="请双击数据库打开控制台页面" />
				)}
				{items.length > 0 && params.type === 'mysql' && (
					<Tabs
						hideAdd
						className="sql-console-tabs-content"
						size="small"
						type="editable-card"
						onChange={onChange}
						activeKey={activeKey}
						onEdit={onEdit}
						items={items}
					/>
				)}
				{items.length > 0 && params.type === 'redis' && (
					<Tabs
						hideAdd
						className="sql-console-tabs-content tab-mb"
						size="small"
						type="editable-card"
						onChange={onChange}
						activeKey={activeKey}
						onEdit={onEdit}
						items={items}
					/>
				)}
				{params.type === 'postgresql' && (
					<SplitPane {...paneProps}>
						<div
							style={{
								padding: '0px 0px 16px 16px',
								overflowY: 'auto',
								height: '100%'
							}}
						>
							<Input.Search
								style={{ marginBottom: 8, paddingRight: 16 }}
								placeholder="请输入关键字搜索"
								value={pgTableTreeValue}
								onChange={pgTableTreeChange}
							/>
							<Tree
								showIcon
								treeData={newPgTreeTableData}
								loadData={pgTableOnLoadData}
								// height={
								// 	document.getElementsByClassName(
								// 		'sql-console-tree-content'
								// 	)[0]?.clientHeight - 50
								// }
							/>
						</div>
						{items.length > 0 && (
							<Tabs
								hideAdd
								className="sql-console-tabs-content"
								style={{
									height: 'calc(100% - 36px)',
									width: '100%'
								}}
								size="small"
								type="editable-card"
								onChange={onChange}
								activeKey={activeKey}
								onEdit={onEdit}
								items={items}
							/>
						)}
						{items.length === 0 && (
							<InitPage title="请双击模式打开控制台页面" />
						)}
					</SplitPane>
				)}
			</Content>
		</Layout>
	);
}
