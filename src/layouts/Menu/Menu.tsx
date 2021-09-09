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
import { Message } from '@alicloud/console-components';
import { History } from 'history';
import messageConfig from '@/components/messageConfig';
import { Icon } from '@alifd/next';

const CustomIcon = Icon.createFromIconfontCN({
	scriptUrl: '@/assets/iconfont'
});

const menus = [
	{
		id: 1,
		name: 'dataOverview',
		aliasName: '数据总览',
		weight: 1,
		parentId: 0,
		url: 'dataOverview',
		iconName: 'icon-shujuzonglan',
		module: null,
		available: null,
		subMenu: null
	},
	{
		id: 2,
		name: 'middlewareRepository',
		aliasName: '中间件仓库',
		weight: 2,
		parentId: 0,
		url: 'middlewareRepository',
		iconName: 'icon-cangku',
		module: null,
		available: null,
		subMenu: null
	},
	{
		id: 2,
		name: 'serviceList',
		aliasName: '服务列表',
		weight: 2,
		parentId: 0,
		url: 'serviceList',
		iconName: 'icon-fuwuliebiao',
		module: null,
		available: null,
		subMenu: null
	},
	{
		id: 2,
		name: 'serviceAvailable',
		aliasName: '服务暴露',
		weight: 2,
		parentId: 0,
		url: 'serviceAvailable',
		iconName: 'icon-fuwutiaokuan',
		module: null,
		available: null,
		subMenu: null
	},
	{
		id: 3,
		name: 'monitorAlarm',
		aliasName: '监控告警',
		weight: 3,
		parentId: 0,
		url: 'monitoringAlarm',
		iconName: 'icon-gaojingshijian',
		module: null,
		available: null,
		subMenu: [
			{
				id: 8,
				name: 'dataMonitor',
				aliasName: '数据监控',
				weight: 31,
				parentId: 3,
				url: 'monitorAlarm/dataMonitor',
				iconName: null,
				module: null,
				available: null,
				subMenu: null
			},
			{
				id: 10,
				name: 'logDetail',
				aliasName: '日志详情',
				weight: 33,
				parentId: 3,
				url: 'monitorAlarm/logDetail',
				iconName: null,
				module: null,
				available: null,
				subMenu: null
			},
			{
				id: 11,
				name: 'alarmCenter',
				aliasName: '告警中心',
				weight: 34,
				parentId: 3,
				url: 'monitorAlarm/alarmCenter',
				iconName: null,
				module: null,
				available: null,
				subMenu: null
			}
		]
	},
	{
		id: 4,
		name: 'disasterBackup',
		aliasName: '容灾备份',
		weight: 3,
		parentId: 0,
		url: 'disasterBackup',
		iconName: 'icon-rongzaibeifen',
		module: null,
		available: null,
		subMenu: [
			{
				id: 8,
				name: 'disasterCenter',
				aliasName: '灾备中心',
				weight: 31,
				parentId: 4,
				url: 'disasterBackup/disasterCenter',
				iconName: null,
				module: null,
				available: null,
				subMenu: null
			},
			{
				id: 10,
				name: 'dataSecurity',
				aliasName: '数据安全',
				weight: 33,
				parentId: 4,
				url: 'disasterBackup/dataSecurity',
				iconName: null,
				module: null,
				available: null,
				subMenu: null
			}
		]
	},
	{
		id: 5,
		name: 'systemManagement',
		aliasName: '系统管理',
		weight: 3,
		parentId: 0,
		url: 'systemManagement',
		iconName: 'icon-shezhi01',
		module: null,
		available: null,
		subMenu: [
			{
				id: 8,
				name: 'userManagement',
				aliasName: '用户管理',
				weight: 31,
				parentId: 5,
				url: 'systemManagement/userManagement',
				iconName: null,
				module: null,
				available: null,
				subMenu: null
			},
			{
				id: 10,
				name: 'roleManagement',
				aliasName: '角色管理',
				weight: 33,
				parentId: 5,
				url: 'systemManagement/roleManagement',
				iconName: null,
				module: null,
				available: null,
				subMenu: null
			},
			{
				id: 10,
				name: 'operationAudit',
				aliasName: '操作审计',
				weight: 33,
				parentId: 5,
				url: 'systemManagement/operationAudit',
				iconName: null,
				module: null,
				available: null,
				subMenu: null
			},
			{
				id: 10,
				name: 'resourcePoolManagement',
				aliasName: '资源池管理',
				weight: 33,
				parentId: 5,
				url: 'systemManagement/resourcePoolManagement',
				iconName: null,
				module: null,
				available: null,
				subMenu: null
			}
		]
	}
];

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
	// console.log(location);
	const pathArray = location.pathname.split('/');
	if (!location || !location.pathname || location.pathname === '/') {
		return '/dataOverview';
	} else if (pathArray.includes('instanceList')) return '/instanceList';
	else if (pathArray.includes('serviceCatalog')) return '/serviceCatalog';
	else if (pathArray.includes('operationAudit')) return '/operationAudit';
	return location.pathname;
};

const mapLocationToOpenKey = (location: Location) => {
	// console.log(location);
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
	const [defaultOpenKeys] = useState<string[]>([
		'/monitoringAlarm',
		'/disasterBackup',
		'/systemManagement'
	]);
	useEffect(() => {
		getMenus();
	}, []);
	function renderAsLink({ key, label }: IItemDescriptor) {
		return <Link to={`${key}`}>{label}</Link>;
	}
	// const getMenus = async () => {
	const getMenus = () => {
		// const res = await getMenu();
		// if (res.success) {
		const itemsTemp = menus.map((item: any) => {
			// const itemsTemp = res.data.map((item: any) => {
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
								<CustomIcon size={14} type={item.iconName} />
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
								<CustomIcon size={14} type={item.iconName} />
							</span>
						)
					}
				};
			}
		});
		setItems(itemsTemp);
		// } else {
		// 	Message.show(messageConfig('error', '失败', res));
		// }
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
