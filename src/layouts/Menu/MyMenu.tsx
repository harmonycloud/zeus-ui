import React, { useEffect, useState } from 'react';
import { Menu, MenuProps } from 'antd';
import { getMenu } from '@/services/user';
import { menuReduxProps } from '@/types';
import { IconFont } from '@/components/IconFont';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import './menu.scss';

interface MyMenuProps {
	clusterId: string;
	// menu: menuReduxProps;
	// setMenuRefresh: (flag: boolean) => void;
}
type MenuItem = Required<MenuProps>['items'][number];
function getItem(
	label: React.ReactNode,
	key: React.Key,
	icon?: React.ReactNode,
	children?: MenuItem[]
): MenuItem {
	return {
		key,
		icon,
		children,
		label
	} as MenuItem;
}
function MyMenu(props: MyMenuProps): JSX.Element {
	const [items, setItems] = useState<MenuItem[]>([]);
	useEffect(() => {
		getMenus();
	}, []);
	const getMenus = async () => {
		const res = await getMenu(
			props.clusterId !== ''
				? {
						clusterId: props.clusterId
				  }
				: {}
		);
		if (res.success) {
			const its = res.data.map((item: any) => {
				if (item.subMenu) {
					const childMenu = item.subMenu.map((item: any) =>
						getItem(item.aliasName, item.id)
					);
					return getItem(
						item.aliasName,
						item.url,
						<IconFont size={14} type={item.iconName} />,
						childMenu
					);
				} else {
					return getItem(
						item.aliasName,
						item.url,
						<IconFont size={14} type={item.iconName} />
					);
				}
			});
			setItems(its);
		}
	};
	return (
		<Menu
			style={{ height: '100vh' }}
			theme="light"
			mode="inline"
			items={items}
			defaultOpenKeys={[
				'monitorAlarm',
				'disasterBackup',
				'systemManagement',
				'serviceList'
			]}
		/>
	);
}
export default MyMenu;
