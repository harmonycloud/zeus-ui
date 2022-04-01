import React, { useEffect, useState } from 'react';
import {
	HashRouter as Router,
	Route,
	Link,
	useHistory
} from 'react-router-dom';
import { connect } from 'react-redux';
import ConsoleMenu, {
	IItemDescriptor,
	StyledComponents
} from '@alicloud/console-components-console-menu';
import styled from 'styled-components';
import { getMenu } from '@/services/user';
import { Message } from '@alicloud/console-components';
import { History } from 'history';
import messageConfig from '@/components/messageConfig';
import { setMenuRefresh } from '@/redux/menu/menu';
import { StoreState, menuReduxProps } from '@/types/index';
import './menu.scss';
import storage from '@/utils/storage';
import CustomIcon from '@/components/CustomIcon';

const mapLocationToActiveKey = (location: Location) => {
	const pathArray = location.pathname.split('/');
	if (!location || !location.pathname || location.pathname === '/') {
		return '/dataOverview';
	} else if (pathArray.includes('middlewareRepository'))
		return '/middlewareRepository';
	else if (pathArray.includes('operationAudit'))
		return '/systemManagement/operationAudit';
	else if (pathArray.includes('resourcePoolManagement'))
		return '/systemManagement/resourcePoolManagement';
	else if (pathArray.includes('projectManagement'))
		return '/systemManagement/projectManagement';
	else if (pathArray.includes('my')) return '/myProject';
	else if (pathArray.includes('serviceList'))
		return storage.getSession('menuPath');
	return location.pathname;
};
interface MenuProps {
	clusterId: string;
	menu: menuReduxProps;
	setMenuRefresh: (flag: boolean) => void;
}
function Menu(props: MenuProps): JSX.Element {
	const [items, setItems] = useState<IItemDescriptor[]>([]);
	const history: History = useHistory();
	const [defaultOpenKeys] = useState<string[]>([
		'/monitorAlarm',
		'/disasterBackup',
		'/systemManagement',
		'/serviceList'
	]);
	const { clusterId, menu } = props;
	useEffect(() => {
		getMenus();
	}, [clusterId]);
	useEffect(() => {
		if (menu.flag) {
			getMenus();
		}
	}, [menu]);
	const onItemClick = (key: string) => {
		if (key.includes('serviceList/')) {
			storage.setSession('menuPath', key);
		} else {
			storage.removeSession('menuPath');
		}
	};
	function renderAsLink({ key, label }: IItemDescriptor) {
		return <Link to={`${key}`}>{label}</Link>;
	}
	const getMenus = async () => {
		const res = await getMenu(
			props.clusterId !== ''
				? {
						clusterId: props.clusterId
				  }
				: {}
		);
		if (res.success) {
			const itemsTemp = res.data.map((item: any) => {
				if (item.subMenu && item.subMenu.length > 0) {
					return {
						key: `/${item.url}`,
						label: item.aliasName,
						navProps: {
							className: 'test-nav-sub-menu-pros',
							icon: (
								<span
									style={{
										marginRight: 8,
										lineHeight: '41px'
									}}
								>
									<CustomIcon
										size={14}
										type={item.iconName}
									/>
								</span>
							)
						},
						items: item.subMenu.map((i: any) => {
							return {
								key: `/${i.url}`,
								label: i.aliasName,
								render: renderAsLink
							};
						})
					};
				} else {
					return {
						key: `/${item.url}`,
						label: item.aliasName,
						render: renderAsLink,
						navProps: {
							className: 'test-nav-item-pros',
							icon: (
								<span
									style={{
										marginRight: 8,
										lineHeight: '41px'
									}}
								>
									<CustomIcon
										size={14}
										type={item.iconName}
									/>
								</span>
							)
						}
					};
				}
			});
			setItems(itemsTemp);
			const urls: string[] = [];
			res.data.forEach((item: any) => {
				if (item.subMenu) {
					item.subMenu.forEach((i: any) => {
						urls.push(`/${i.url}`);
					});
				} else {
					urls.push(`/${item.url}`);
				}
			});
			const flag = urls.some((str: string) =>
				history.location.pathname.includes(str)
			);
			if (!flag) {
				history.push(urls[0]);
			}
		} else {
			Message.show(messageConfig('error', '失败', res));
		}
	};
	return (
		<Router>
			<Route>
				{({ location }: { location: Location }) => (
					<CustomizedConsoleMenu
						header="中间件平台"
						items={items}
						defaultOpenKeys={defaultOpenKeys}
						activeKey={mapLocationToActiveKey(location)}
						onItemClick={onItemClick}
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
})(Menu);

const CustomizedConsoleMenu = styled(ConsoleMenu)`
	${StyledComponents.Item} {
		padding: 0 24px;
	}
`;
