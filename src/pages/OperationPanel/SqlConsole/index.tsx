import React, { useEffect, useState } from 'react';
import { Button, Input, Layout, Tree } from 'antd';
import { LeftOutlined, ReloadOutlined, RightOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import OperatorHeader from '../OperatorHeader';
import { IconFont } from '@/components/IconFont';
const { Content, Sider } = Layout;
const tableTree = [
	{
		title: 'table01',
		key: `0-0`,
		icon: <IconFont type="icon-biaoge" />
	},
	{
		title: 'table02',
		key: '0-1',
		icon: <IconFont type="icon-biaoge" />
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
// * mysql sql console
export default function SqlConsole(): JSX.Element {
	const [collapsed, setCollapsed] = useState<boolean>(false);
	const [treeData, setTreeData] = useState<DataNode[]>([]);
	useEffect(() => {
		// * 获取数据库列表的数据
		const init = [
			{
				title: 'test',
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

	return (
		<Layout style={{ minHeight: '100vh' }}>
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
			<Content>
				<OperatorHeader />
			</Content>
		</Layout>
	);
}
