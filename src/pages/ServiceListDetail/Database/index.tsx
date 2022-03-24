import React, { useState, useEffect } from 'react';
import { Page, Content, Menu } from '@alicloud/console-components-page';
import { useParams } from 'react-router';
import DefaultPicture from '@/components/DefaultPicture';
import storage from '@/utils/storage';
import { DetailParams } from '../detail';
import UserManage from './userManage';

export default function DataBase(
	props: any
): JSX.Element {
	const {
		middlewareName,
		clusterId,
		namespace,
		type,
		customMid,
		capabilities
	} = props;
	const [refreshFlag, setRefreshFlag] = useState(false);
	const [selectedKey, setSelectedKey] = useState(
		storage.getSession('paramsTab') || 'userManage'
	);
	const params: DetailParams = useParams();
	const { currentTab, chartVersion } = params;
	const menuSelect = (selectedKey: string) => {
		setSelectedKey(selectedKey);
		storage.setSession('paramsTab', selectedKey);
	};
	useEffect(() => {
		currentTab &&
			currentTab !== 'database' &&
			setSelectedKey('userManage');
	}, [currentTab]);

	const ConsoleMenu = () => (
		<Menu
			selectedKeys={selectedKey}
			onItemClick={menuSelect}
			style={{ height: '100%' }}
		>
			<Menu.Item key="userManage">用户管理</Menu.Item>
			<Menu.Item key="databaseManage">数据库管理</Menu.Item>
			<Menu.Item key="audit">SQL审计</Menu.Item>
		</Menu>
	);
	const childrenRender = (selectedKey: string) => {
		switch (selectedKey) {
			case 'userManage':
				return <UserManage />;
			case 'databaseManage':
				return <div>222</div>;
			case 'audit':
				return <div>333</div>;
			default:
				return null;
		}
	};
	if (customMid && !(capabilities || []).includes('config')) {
		return <DefaultPicture />;
	}
	return (
		<Page>
			<Content menu={<ConsoleMenu />} style={{ margin: 0 }}>
				{childrenRender(selectedKey)}
			</Content>
		</Page>
	);
}
