import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Layout, Tree, Tabs, Dropdown, Menu } from 'antd';
import { useParams } from 'react-router';
import { LeftOutlined, ReloadOutlined, RightOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import SplitPane, { SplitPaneProps } from 'react-split-pane';
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
	PgsqslDatabaseItem,
	SchemaItem
} from '../index.d';
import ModeMag from '../ModeMag';
import PgsqlEditTable from '../components/PgsqlEditTable';
import {
	getDatabases,
	getDbTables,
	getCols,
	getAllDatabase,
	getSchemas
} from '@/services/operatorPanel';

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
		key: 'rename'
	},
	{
		label: '建表语句',
		key: 'createSQL'
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
		label: '查询',
		key: 'inquire'
	},
	{
		label: '导出建表语句',
		key: 'exportTableSQL'
	},
	{
		label: '导出数据库表结构',
		key: 'exportDatabase'
	}
];
const pgMenuItems = [
	{
		label: '模式管理',
		key: 'modeMag'
	}
];
const initialItems = [
	{
		label: 'Tab 1',
		children: <MysqlSqlConsole />,
		key: '1',
		closable: false
	},
	{ label: 'Tab 2', children: <MysqlEditTable />, key: '2' }
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
		height: '84%'
	}
};
// * sql窗口 模版
// ! TODO 对模式，数据库，列，表等删除后，左边树图的刷新
export default function SqlConsole(props: SqlConsoleProps): JSX.Element {
	const { currentUser, setOpen } = props;
	const params: ParamsProps = useParams();
	const [collapsed, setCollapsed] = useState<boolean>(false);
	const [treeData, setTreeData] = useState<DataNode[]>([]);
	const [pgTreeData, setPgTreeData] = useState<DataNode[]>([]);
	const [pgTableTreeData, setPgTableTreeData] = useState<DataNode[]>([]);
	const [activeKey, setActiveKey] = useState(initialItems[0].key);
	const [items, setItems] = useState(initialItems);
	const [pgsqlExpandedKeys, setPgslqExpandedKeys] = useState<string[]>([]);
	const newTabIndex = useRef(0);
	// * 添加标签页通用方法
	const add = (label: string, children: any) => {
		const newActiveKey = `newTab${newTabIndex.current++}`;
		const newPanes = [...items];
		newPanes.push({
			label: label,
			children: children,
			key: newActiveKey
		});
		setItems(newPanes);
		setActiveKey(newActiveKey);
	};
	const handleMenuClick = (e: MenuInfo, i: string) => {
		switch (e.key) {
			case 'editTable': // * mysql 编辑表
				add(
					`编辑表:${i}`,
					params.type === 'mysql' ? (
						<MysqlEditTable />
					) : (
						<PgsqlEditTable />
					)
				);
				return;
			case 'tableInfo': // * mysql 表详情
				add(`表详情:${i}`, <TableDetail dbName={i} />);
				return;
			case 'inquire': // * mysql sqlconsole
				add(i, <MysqlSqlConsole />);
				return;
			case 'modeMag': // * pgsql 模式管理
				add(i, <ModeMag dbName={i} />);
				return;
			default:
				break;
		}
	};
	// * mysql database menu
	const menu = (i: any) => {
		return (
			<Menu
				onClick={(info: MenuInfo) => handleMenuClick(info, i)}
				items={databaseMenuItems}
			/>
		);
	};
	// * mysql table menu
	const tableMenu = (i: any) => {
		return (
			<Menu
				items={tableMenuItems}
				onClick={(info: MenuInfo) => handleMenuClick(info, i)}
			/>
		);
	};
	// * postgresql database menu
	const pgMenu = (i: any) => {
		return (
			<Menu
				items={pgMenuItems}
				onClick={(info: MenuInfo) => handleMenuClick(info, i)}
			/>
		);
	};
	useEffect(() => {
		// * 获取数据库列表的数据 - mysql
		const sendData = {
			clusterId: params.clusterId,
			namespace: params.namespace,
			middlewareName: params.name,
			type: params.type
		};
		if (params.type === 'mysql') {
			getAllDatabase(sendData).then((res) => {
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
										title={(item as DatabaseItem).db}
										className="text-overflow"
										style={{ width: '140px' }}
									>
										{(item as DatabaseItem).db}
									</span>
								</Dropdown>
							);
							result.key = index + '';
							result.value = (item as DatabaseItem).db;
							result.icon = <IconFont type="icon-database" />;
							return result;
						});
						setTreeData(list);
					} else {
						setTreeData([]);
					}
				}
			});
		} else {
			getAllDatabase(sendData).then((res) => {
				if (res.success) {
					if (res.data.length > 0) {
						const list = res.data.map((item, index) => {
							const result: any = {};
							result.title = (
								<Dropdown
									overlay={() =>
										pgMenu(
											(item as PgsqslDatabaseItem)
												.databaseName
										)
									}
									trigger={['contextMenu']}
								>
									<span
										title={
											(item as PgsqslDatabaseItem)
												.databaseName
										}
										className="text-overflow"
										style={{ width: '140px' }}
									>
										{
											(item as PgsqslDatabaseItem)
												.databaseName
										}
									</span>
								</Dropdown>
							);
							result.key = index + '';
							result.value = (
								item as PgsqslDatabaseItem
							).databaseName;
							result.icon = <IconFont type="icon-database" />;
							return result;
						});
						setPgTreeData(list);
					} else {
						setPgTreeData([]);
					}
				}
			});
		}
		// * 获取表数据 - pgsql
		const initPgTable = [
			{
				title: (
					<Dropdown
						overlay={() => tableMenu('table1')}
						trigger={['contextMenu']}
					>
						<span>table1</span>
					</Dropdown>
				),
				key: '0',
				icon: <IconFont type="icon-biaoge" />
			},
			{
				title: 'table2',
				key: '1',
				icon: <IconFont type="icon-biaoge" />
			}
		];
		setPgTableTreeData(initPgTable);
	}, []);
	const mysqlOnLoadData = ({ key, value, children }: any) =>
		new Promise<void>((resolve) => {
			console.log(key, value, children);
			if (children) {
				resolve();
				return;
			}
			if (key.includes('-')) {
				// * 当前加载的树为表格的情况
				const array = key.split('-');
				const sendData = {
					clusterId: params.clusterId,
					namespace: params.namespace,
					middlewareName: params.name,
					database: array[0],
					table: value
				};
				getCols(sendData).then((res) => {
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
									result.isLeaf = true;
									return result;
								}
							);
							setTreeData((origin) =>
								updateTreeData(origin, key, [
									{
										title: `列(${list.length})`,
										key: `${key}-0`,
										icon: <IconFont type="icon-liebiao" />,
										children: list
									},
									{
										title: '索引',
										key: `${key}-1`,
										icon: (
											<IconFont
												style={{ fontSize: 21 }}
												type="icon-lianjiesuoyin"
											/>
										)
									}
								])
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
			} else {
				const sendData = {
					clusterId: params.clusterId,
					namespace: params.namespace,
					middlewareName: params.name,
					database: value
				};
				getDbTables(sendData).then((res) => {
					if (res.success) {
						if (res.data.length > 0) {
							const list = res.data.map(
								(item: MysqlTableItem, index) => {
									const result: any = {};
									result.title = (
										<Dropdown
											overlay={() =>
												tableMenu(item.tableName)
											}
											trigger={['contextMenu']}
										>
											<span
												title={item.tableName}
												className="text-overflow"
												style={{ width: '120px' }}
											>
												{item.tableName}
											</span>
										</Dropdown>
									);
									result.key = `${value}-${index}`;
									result.value = item.tableName;
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
			}
		});
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
										overlay={() => menu(item.schemaName)}
										trigger={['contextMenu']}
									>
										<span>{item.schemaName}</span>
									</Dropdown>
								);
								result.key = `${key}-${index}`;
								result.icon = (
									<IconFont
										style={{ fontSize: 16 }}
										type="icon-shuzhi"
									/>
								);
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
	const pgTableOnLoadData = ({ key, children }: any) =>
		new Promise<void>((resolve) => {
			if (children) {
				resolve();
				return;
			}
			setTimeout(() => {
				setPgTableTreeData((origin) =>
					updateTreeData(origin, key, [
						{
							title: '列（2）',
							key: `${key}-0`,
							icon: <IconFont type="icon-liebiao" />,
							children: [
								{
									title: 'User',
									key: `${key}-0-0`,
									icon: <IconFont type="icon-liebiao" />,
									isLeaf: true
								}
							]
						}
					])
				);
				resolve();
			}, 1000);
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
	const onEdit = (targetKey: any, action: 'add' | 'remove') => {
		if (action === 'add') {
			add('new TAb', null);
		} else {
			remove(targetKey);
		}
	};
	return (
		<Layout style={{ minHeight: 'calc(100vh - 50px)' }}>
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
					<div>Mysql控制台</div>
					<Button icon={<ReloadOutlined />} />
				</div>
				{params.type === 'mysql' && (
					<div className="sql-console-sider-search">
						<Input.Search
							placeholder="请输入关键字搜索"
							style={{ marginBottom: 8, paddingRight: 16 }}
						/>
						<div className="sql-console-tree-content">
							<Tree
								showIcon
								treeData={treeData}
								loadData={mysqlOnLoadData}
								height={
									document.getElementsByClassName(
										'sql-console-tree-content'
									)[0]?.clientHeight
								}
							/>
						</div>
					</div>
				)}
				{params.type === 'postgresql' && (
					<div className="sql-console-sider-search">
						<Input.Search
							style={{ marginBottom: 8, paddingRight: 16 }}
							placeholder="请输入关键字搜索"
						/>
						<div className="sql-console-tree-content">
							<Tree
								showIcon
								treeData={pgTreeData}
								loadData={pgsqlOnLoadData}
							/>
						</div>
					</div>
				)}
			</Sider>
			<Content className="sql-console-content">
				<OperatorHeader
					currentUser={currentUser}
					loginOut={() => {
						if (currentUser) {
							setOpen(false);
						} else {
							window.close();
						}
					}}
				/>
				{params.type === 'mysql' && (
					<Tabs
						className="sql-console-tabs-content"
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
						<div style={{ padding: 16 }}>
							<Input.Search
								style={{ marginBottom: 8 }}
								placeholder="请输入关键字搜索"
							/>
							<Tree
								showIcon
								treeData={pgTableTreeData}
								loadData={pgTableOnLoadData}
							/>
						</div>
						<Tabs
							className="sql-console-tabs-content"
							style={{ height: 'calc(100% - 36px)' }}
							size="small"
							type="editable-card"
							onChange={onChange}
							activeKey={activeKey}
							onEdit={onEdit}
							items={items}
						/>
					</SplitPane>
				)}
			</Content>
		</Layout>
	);
}
