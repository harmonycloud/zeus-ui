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
import { judgeArrays } from '@/utils/utils';
import styled from 'styled-components';
import { getMenu } from '@/services/user';
import './menu.scss';
import { Icon, Message } from '@alicloud/console-components';
import { History } from 'history';
import messageConfig from '@/components/messageConfig';

const subClick = (
	openKey: string[],
	openInfo: { key: string; open: boolean },
	history: History,
	items: IItemDescriptor[]
) => {
	if (openKey.length > 0) {
		const goal = items.filter((item) => item.key === openKey[0])[0];
		const goalString: string =
			(goal.items && goal.items[0].key) || 'spaceOverview';
		if (openInfo.open) {
			history.push(goalString);
		}
	}
};

const mapLocationToActiveKey = (location: Location) => {
	const pathArray = location.pathname.split('/');
	if (!location || !location.pathname || location.pathname === '/') {
		return '/spaceOverview';
	} else if (pathArray.includes('instanceList')) return '/instanceList';
	else if (pathArray.includes('serviceCatalog')) return '/serviceCatalog';
	else if (pathArray.includes('operationAudit')) return '/operationAudit';
	return location.pathname;
};

const mapLocationToOpenKey = (location: Location) => {
	const pathArray = location.pathname.split('/');
	if (!location || !location.pathname || location.pathname === '/')
		return 'workbench';
	else if (
		judgeArrays(pathArray, [
			'basicResource',
			'authManage',
			'operationAudit',
			'userManage'
		])
	)
		return 'management';
	else if (['/platformOverview'].indexOf(location.pathname) > -1)
		return 'operations';
	else if (
		judgeArrays(pathArray, [
			'spaceOverview',
			'serviceCatalog',
			'instanceList',
			'outboundRoute'
		])
	)
		return 'workbench';
};

function Menu(): JSX.Element {
	const [items, setItems] = useState<IItemDescriptor[]>([]);
	const history: History = useHistory();
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
				return {
					key: item.url,
					label: item.aliasName,
					navProps: {
						className: 'nav-item-select-custom',
						icon: (
							<Icon
								style={{ marginRight: 8 }}
								size={14}
								className={`iconfont ${item.iconName}`}
							/>
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
			});
			setItems(itemsTemp);
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
						openMode="single"
						items={items}
						onOpen={(openKey, openInfo) =>
							subClick(openKey, openInfo, history, items)
						}
						activeKey={mapLocationToActiveKey(location)}
						openKeys={mapLocationToOpenKey(location)}
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
