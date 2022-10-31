import React from 'react';
import { Dropdown, Menu } from 'antd';
import { MenuInfo } from '@/types/comment';
import { IconFont } from '@/components/IconFont';
import { ReloadOutlined } from '@ant-design/icons';
import './index.scss';

interface RedisKeyItemProps {
	onRefresh: () => void;
	onDelete: () => void;
	onAdd: () => void;
	onEdit: () => void;
	onView: () => void;
}
const databaseMenuItems = [
	{
		label: '查看k-v',
		key: 'view'
	},
	{
		label: '编辑k-v',
		key: 'edit'
	},
	{
		label: '新增k-v',
		key: 'add'
	},
	{
		label: '删除k-v',
		key: 'delete'
	}
];
export default function RedisKeyItem(props: RedisKeyItemProps): JSX.Element {
	const { onDelete, onRefresh, onAdd, onEdit, onView } = props;
	const handleMenuClick = (e: MenuInfo) => {
		switch (e.key) {
			case 'add':
				onAdd();
				break;
			case 'edit':
				onEdit();
				break;
			case 'delete':
				onDelete();
				break;
			case 'view':
				onView();
				break;
			default:
				break;
		}
	};
	const menu = () => {
		return (
			<Menu
				onClick={(info: MenuInfo) => handleMenuClick(info)}
				items={databaseMenuItems}
			/>
		);
	};
	return (
		<div className="redis-key-item-content">
			<Dropdown overlay={() => menu()} trigger={['contextMenu']}>
				<div className="text-hidden redis-key-item-label">
					<IconFont type="icon-biaoshilei_yuechi" className="mr-8" />
					<span>keyNamssssssssssssse</span>
				</div>
			</Dropdown>
			<div className="redis-key-item-action">
				<ReloadOutlined className="mr-8" onClick={onRefresh} />
				<IconFont
					onClick={onDelete}
					type="icon-shanchu"
					style={{ color: '#ff4d4f', fontSize: 14 }}
				/>
			</div>
		</div>
	);
}
