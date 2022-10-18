import React, { useEffect, useRef, useState } from 'react';
import {
	Button,
	Input,
	Layout,
	Tree,
	Tabs,
	Dropdown,
	Menu,
	MenuProps
} from 'antd';
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
import { ParamsProps } from '../index.d';
import ModeMag from '../ModeMag';
import PgsqlEditTable from '../components/PgsqlEditTable';
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
export default function SqlConsole(): JSX.Element {
	const params: ParamsProps = useParams();
	const [collapsed, setCollapsed] = useState<boolean>(false);
	const [treeData, setTreeData] = useState<DataNode[]>([]);
	const [pgTreeData, setPgTreeData] = useState<DataNode[]>([]);
	const [pgTableTreeData, setPgTableTreeData] = useState<DataNode[]>([]);
	const [activeKey, setActiveKey] = useState(initialItems[0].key);
	const [items, setItems] = useState(initialItems);
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
				add(`表详情:${i}`, <TableDetail />);
				return;
			case 'inquire': // * mysql sqlconsole
				add(i, <MysqlSqlConsole />);
				return;
			case 'modeMag': // * pgsql 模式管理
				add(i, <ModeMag />);
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
		const initMysql = [
			{
				title: (
					<Dropdown
						overlay={() => menu('test')}
						trigger={['contextMenu']}
					>
						<span>test</span>
					</Dropdown>
				),
				key: '0',
				icon: <IconFont type="icon-database" />
			},
			{
				title: 'mysql1',
				key: '1',
				icon: <IconFont type="icon-database" />
			}
		];
		// * 获取数据库列表数据 - pgsql
		const initPgsql = [
			{
				title: (
					<Dropdown
						overlay={() => pgMenu('postgresql')}
						trigger={['contextMenu']}
					>
						<span>postgresql</span>
					</Dropdown>
				),
				key: '0',
				icon: <IconFont type="icon-database" />
			},
			{
				title: 'postgresql1',
				key: '1',
				icon: <IconFont type="icon-database" />
			}
		];
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
		setTreeData(initMysql);
		setPgTreeData(initPgsql);
		setPgTableTreeData(initPgTable);
	}, []);
	const mysqlOnLoadData = ({ key, children }: any) =>
		new Promise<void>((resolve) => {
			console.log(key, children);
			if (children) {
				resolve();
				return;
			}
			if (key.includes('-')) {
				// * 当前加载的树为表格的情况
				setTimeout(() => {
					setTreeData((origin) =>
						updateTreeData(origin, key, [
							{
								title: '列(2)',
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
								children: [
									{
										title: 'index01',
										key: `${key}-1-0`,
										icon: (
											<IconFont
												style={{ fontSize: 21 }}
												type="icon-lianjiesuoyin"
											/>
										),
										isLeaf: true
									}
								]
							}
						])
					);
					resolve();
				});
			} else {
				setTimeout(() => {
					setTreeData((origin) =>
						updateTreeData(origin, key, [
							{
								title: (
									<Dropdown
										overlay={() => tableMenu('table1')}
										trigger={['contextMenu']}
									>
										<span>table1</span>
									</Dropdown>
								),
								key: `${key}-0`,
								icon: (
									<IconFont
										style={{ fontSize: 16 }}
										type="icon-biaoge"
									/>
								)
							},
							{
								title: 'table2',
								key: `${key}-1`,
								icon: (
									<IconFont
										style={{ fontSize: 16 }}
										type="icon-biaoge"
									/>
								)
							}
						])
					);
					resolve();
				}, 1000);
			}
		});
	const pgsqlOnLoadData = ({ key, children }: any) =>
		new Promise<void>((resolve) => {
			if (children) {
				resolve();
				return;
			}
			setTimeout(() => {
				setPgTreeData((origin) =>
					updateTreeData(origin, key, [
						{
							title: (
								<Dropdown
									overlay={() => menu('mode1')}
									trigger={['contextMenu']}
								>
									<span>mode</span>
								</Dropdown>
							),
							key: `${key}-0`,
							icon: (
								<IconFont
									style={{ fontSize: 16 }}
									type="icon-shuzhi"
								/>
							),
							isLeaf: true
						},
						{
							title: 'mode2',
							key: `${key}-1`,
							icon: (
								<IconFont
									style={{ fontSize: 16 }}
									type="icon-shuzhi"
								/>
							),
							isLeaf: true
						}
					])
				);
				resolve();
			}, 1000);
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
				width={208}
			>
				<div className="sql-console-sider-title-content">
					<div>Mysql控制台</div>
					<Button icon={<ReloadOutlined />} />
				</div>
				{params.type === 'mysql' && (
					<div className="sql-console-sider-search">
						<Input.Search />
						<Tree
							showIcon
							treeData={treeData}
							loadData={mysqlOnLoadData}
						/>
					</div>
				)}
				{params.type === 'postgresql' && (
					<div className="sql-console-sider-search">
						<Input.Search placeholder="请输入关键字搜索" />
						<Tree
							showIcon
							treeData={pgTreeData}
							loadData={pgsqlOnLoadData}
						/>
					</div>
				)}
			</Sider>
			<Content className="sql-console-content">
				<OperatorHeader />
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
							<Input.Search placeholder="请输入关键字搜索" />
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
