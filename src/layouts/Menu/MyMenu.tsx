import React, { useEffect, useState } from 'react';
import { Menu, MenuProps } from 'antd';
import { useHistory, useLocation } from 'react-router';
import { connect } from 'react-redux';
import { IconFont } from '@/components/IconFont';
import { getMenu } from '@/services/user';
import { menuReduxProps, StoreState } from '@/types';
import { setMenuRefresh } from '@/redux/menu/menu';
import { ResMenuItem, MenuInfo, SelectInfo } from '@/types/comment';
import './menu.scss';
import storage from '@/utils/storage';

interface MyMenuProps {
	clusterId: string;
	menu: menuReduxProps;
	setMenuRefresh: (flag: boolean) => void;
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
	const { clusterId, menu, setMenuRefresh } = props;
	const history = useHistory();
	const location = useLocation();
	const { pathname } = location;
	const [items, setItems] = useState<MenuItem[]>([]);
	const [selectedKeys, setSelectedKeys] = useState<string[]>([
		pathname.slice(1)
	]);
	useEffect(() => {
		getMenus();
	}, [clusterId]);
	useEffect(() => {
		if (menu.flag) {
			getMenus();
			setMenuRefresh(false);
		}
	}, [menu]);
	const getMenus = async () => {
		const res = await getMenu(
			clusterId !== ''
				? {
						clusterId: clusterId
				  }
				: {}
		);
		if (res.success) {
			const its = res.data.map((item: ResMenuItem) => {
				if (item.subMenu) {
					const childMenu = item.subMenu.map((item: ResMenuItem) =>
						getItem(item.aliasName, item.url)
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
	const onMenuItemClick = (info: MenuInfo) => {
		console.log(info);
		if (info.key.includes('serviceList')) {
			storage.setSession('menuPath', `/${info.key}`);
		}
		history.push(`/${info.key}`);
	};
	const onMenuItemSelect = (info: SelectInfo) => {
		setSelectedKeys([info.key]);
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
			onClick={onMenuItemClick}
			selectedKeys={selectedKeys}
			onSelect={onMenuItemSelect}
		/>
	);
}
const mapStateToProps = (state: StoreState) => ({
	menu: state.menu
});
export default connect(mapStateToProps, {
	setMenuRefresh
})(MyMenu);
