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
import { LeftOutlined, ReloadOutlined, RightOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import OperatorHeader from '../OperatorHeader';
import { IconFont } from '@/components/IconFont';
import ExecutionTable from '../components/ExectionTable';
import CodeConsole from '../components/CodeConsole';
import { MenuInfo } from '@/types/comment';
import TableDetail from '../components/TableDetail';
import TableInfo from '../components/TableInfo';
import ColInfo from '../components/ColInfo';
const { Content, Sider } = Layout;
const initialItems = [
	{ label: 'Tab 1', children: <CodeConsole />, key: '1', closable: false },
	{ label: 'Tab 2', children: <TableInfo />, key: '2' },
	{
		label: 'Tab 3',
		children: <ColInfo />,
		key: '3'
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

// * sql窗口 模版
export default function SqlConsole(): JSX.Element {
	const [collapsed, setCollapsed] = useState<boolean>(false);
	const [treeData, setTreeData] = useState<DataNode[]>([]);
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
	const handleMenuClick = (e: MenuInfo, i: string) => {
		tableDetailAdd(i);
	};
	const menu = (i: any) => {
		return (
			<Menu
				onClick={(info: MenuInfo) => handleMenuClick(info, i)}
				items={[
					{
						label: '表详情',
						key: '1'
					},
					{
						label: '查询',
						key: '2'
					},
					{
						label: '导出建表语句',
						key: '3'
					},
					{
						label: '导出数据库表结构',
						key: '4'
					}
				]}
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
				title: 'mysql',
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
						{ title: 'Child Node', key: `${key}-0` },
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
				<div className="sql-console-sider-search">
					<Input.Search />
					<Tree showIcon treeData={treeData} loadData={onLoadData} />
				</div>
			</Sider>
			<Content className="sql-console-content">
				<OperatorHeader />
				<Tabs
					className="sql-console-tabs-content"
					size="small"
					type="editable-card"
					onChange={onChange}
					activeKey={activeKey}
					onEdit={onEdit}
					items={items}
				/>
			</Content>
		</Layout>
	);
}
