import React, { useEffect, useState } from 'react';
import { Menu, MenuProps } from 'antd';
import { useHistory, useLocation } from 'react-router';
import { HashRouter as Router, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { IconFont } from '@/components/IconFont';
import { getMenu } from '@/services/user';
import { menuReduxProps, StoreState } from '@/types';
import { setMenuRefresh } from '@/redux/menu/menu';
import { ResMenuItem, MenuInfo, SelectInfo } from '@/types/comment';
import storage from '@/utils/storage';
import './menu.scss';

interface MyMenuProps {
	// clusterId: string;
	items: MenuItem[];
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
	const { items, menu, setMenuRefresh } = props;
	const history = useHistory();
	const location = useLocation();
	const { pathname } = location;
	const [selectedKeys, setSelectedKeys] = useState<string[]>([
		pathname.slice(1)
	]);
	const mapLocationToActiveKey = (location: Location) => {
		const pathArray = location.pathname.split('/');
		if (!location || !location.pathname || location.pathname === '/') {
			return ['dataOverview'];
		} else if (pathArray.includes('middlewareRepository'))
			return ['middlewareRepository'];
		else if (pathArray.includes('operationAudit'))
			return ['systemManagement/operationAudit'];
		else if (pathArray.includes('resourcePoolManagement'))
			return ['systemManagement/resourcePoolManagement'];
		else if (pathArray.includes('projectManagement'))
			return ['systemManagement/projectManagement'];
		else if (pathArray.includes('storageManagement'))
			return ['storageManagement'];
		else if (pathArray.includes('myProject')) return ['myProject'];
		else if (pathArray.includes('serviceList'))
			return [storage.getSession('menuPath')];
		return [location.pathname.substring(1)];
	};
	const onMenuItemClick = (info: MenuInfo) => {
		if (info.key.includes('serviceList/')) {
			storage.setSession('menuPath', `${info.key}`);
		}
		history.push(`/${info.key}`);
	};
	const onMenuItemSelect = (info: SelectInfo) => {
		setSelectedKeys([info.key]);
	};
	return (
		<Router>
			<Route>
				{({ location }: { location: Location }) => (
					<Menu
						style={{ height: '100vh' }}
						theme="light"
						mode="inline"
						items={items}
						defaultOpenKeys={[
							'monitorAlarm',
							'disasterBackup',
							'systemManagement',
							'serviceList',
							'backupService'
						]}
						onClick={onMenuItemClick}
						selectedKeys={mapLocationToActiveKey(location)}
						onSelect={onMenuItemSelect}
					/>
				)}
			</Route>
		</Router>
	);
}
const mapStateToProps = (state: StoreState) => ({
	menu: state.menu
});
export default connect(mapStateToProps, {
	setMenuRefresh
})(MyMenu);
