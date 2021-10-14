import React, { useEffect, useState } from 'react';
import {
	HashRouter as Router,
	Route,
	Link,
	useHistory
} from 'react-router-dom';
import ConsoleMenu, {
	IItemDescriptor,
	StyledComponents
} from '@alicloud/console-components-console-menu';
// import { judgeArrays } from '@/utils/utils';
import styled from 'styled-components';
import { getMenu } from '@/services/user';
import './menu.scss';
import { Message } from '@alicloud/console-components';
import { History } from 'history';
import messageConfig from '@/components/messageConfig';
import { Icon } from '@alifd/next';
// import storage from '@/utils/storage';

const CustomIcon = Icon.createFromIconfontCN({
	scriptUrl: '@/assets/iconfont'
});

const subClick = (
	openKey: string[],
	openInfo: { key: string; open: boolean },
	history: History,
	items: IItemDescriptor[]
) => {
	// console.log(openKey, openInfo, history, items);
	if (openKey.length > 0) {
		const goal = items.filter((item) => item.key === openKey[0])[0];
		const goalString: string =
			(goal.items && goal.items[0].key) || 'dataOverview';
		// console.log(goalString);
		if (openInfo.open) {
			history.push(goalString);
		}
	}
};

const mapLocationToActiveKey = (location: Location) => {
	const pathArray = location.pathname.split('/');
	if (!location || !location.pathname || location.pathname === '/') {
		return '/dataOverview';
	} else if (pathArray.includes('serviceList')) return '/serviceList';
	else if (pathArray.includes('middlewareRepository'))
		return '/middlewareRepository';
	else if (pathArray.includes('operationAudit'))
		return '/systemManagement/operationAudit';
	else if (pathArray.includes('resourcePoolManagement'))
		return '/systemManagement/resourcePoolManagement';
	return location.pathname;
};

// const mapLocationToOpenKey = (location: Location) => {
// 	// console.log(location);
// 	const pathArray = location.pathname.split('/');
// 	if (!location || !location.pathname || location.pathname === '/')
// 		return 'workbench';
// 	else if (
// 		judgeArrays(pathArray, [
// 			'basicResource',
// 			'authManage',
// 			'operationAudit',
// 			'userManage'
// 		])
// 	)
// 		return 'management';
// 	else if (['/platformOverview'].indexOf(location.pathname) > -1)
// 		return 'operations';
// 	else if (
// 		judgeArrays(pathArray, [
// 			'spaceOverview',
// 			'serviceCatalog',
// 			'instanceList',
// 			'outboundRoute'
// 		])
// 	)
// 		return 'workbench';
// };

function Menu(): JSX.Element {
	const [items, setItems] = useState<IItemDescriptor[]>([]);
	const history: History = useHistory();
	console.log(history);
	const [defaultOpenKeys] = useState<string[]>([
		'/monitorAlarm',
		'/disasterBackup',
		'/systemManagement'
	]);
	useEffect(() => {
		getMenus();
	}, []);
	function renderAsLink({ key, label }: IItemDescriptor) {
		return <Link to={`${key}`}>{label}</Link>;
	}
	const getMenus = async () => {
		const res = await getMenu();
		if (res.success) {
			const itemsTemp = res.data.map((item: any) => {
				if (item.subMenu) {
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
						// defaultOpenAll={true}
						defaultOpenKeys={defaultOpenKeys}
						// onOpen={(openKey, openInfo) =>
						// 	subClick(openKey, openInfo, history, items)
						// }
						activeKey={mapLocationToActiveKey(location)}
						// openKeys={mapLocationToOpenKey(location)}
					/>
				)}
			</Route>
		</Router>
	);
}

export default Menu;

const CustomizedConsoleMenu = styled(ConsoleMenu)`
	${StyledComponents.Item} {
		padding: 0 24px;
	}
`;
