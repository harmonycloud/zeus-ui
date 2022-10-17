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
	{ label: 'Tab 2', children: <MysqlSqlConsole />, key: '2' }
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
	minSize: 200
};
// * sql窗口 模版
export default function SqlConsole(): JSX.Element {
	const params: ParamsProps = useParams();
	const [collapsed, setCollapsed] = useState<boolean>(false);
	const [treeData, setTreeData] = useState<DataNode[]>([]);
	const [pgTreeData, setPgTreeData] = useState<DataNode[]>([]);
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
	// * 表详情添加
	const tableDetailAdd = (label: string) => {
		add(label, <TableDetail />);
	};
	// * 编辑表添加
	const editTableAdd = (label: string) => {
		add(label, <MysqlEditTable />);
	};
	// * mysql sqlconsole添加
	const ConsoleAdd = (label: string) => {
		add(label, <MysqlSqlConsole />);
	};
	// * pgsql mode mag 添加
	const ModeMagAdd = (label: string) => {
		add(label, <ModeMag />);
	};
	const handleMenuClick = (e: MenuInfo, i: string) => {
		switch (e.key) {
			case 'editTable':
				editTableAdd(`编辑表:${i}`);
				return;
			case 'tableInfo':
				tableDetailAdd(`表详情:${i}`);
				return;
			case 'inquire':
				ConsoleAdd(i);
				return;
			case 'modeMag':
				ModeMagAdd(i);
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
		// * 获取数据库列表的数据
		const init = [
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
				title: (
					<Dropdown
						overlay={() => pgMenu('postgresql')}
						trigger={['contextMenu']}
					>
						<span>postgresql</span>
					</Dropdown>
				),
				key: '1',
				icon: <IconFont type="icon-database" />
			},
			{
				title: 'information',
				key: '2',
				icon: <IconFont type="icon-database" />
			}
		];
		setTreeData(init);
		setPgTreeData(init);
	}, []);
	const onLoadData = ({ key, children }: any) =>
		new Promise<void>((resolve) => {
			console.log(key, children);
			if (children) {
				resolve();
				return;
			}
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
							key: `${key}-0`
						},
						{ title: 'Child Node', key: `${key}-1` }
					])
				);
				setPgTreeData((origin) =>
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
							key: `${key}-0`
						},
						{ title: 'Child Node', key: `${key}-1` }
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
							loadData={onLoadData}
						/>
					</div>
				)}
				{params.type === 'postgresql' && (
					<div className="sql-console-sider-search">
						<Input.Search />
						<Tree
							showIcon
							treeData={pgTreeData}
							loadData={onLoadData}
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
							<Input.Search />
							<Tree
								showIcon
								treeData={pgTreeData}
								loadData={onLoadData}
							/>
						</div>
						<Tabs
							className="sql-console-tabs-content"
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
