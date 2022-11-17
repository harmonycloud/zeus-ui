import React, { useState, useEffect } from 'react';
import { ProPage, ProContent, ProMenu } from '@/components/ProPage';
import { useParams } from 'react-router';
import DefaultPicture from '@/components/DefaultPicture';

import storage from '@/utils/storage';
import { DetailParams } from '../detail';
import UserManage from './userManage';
import DatabaseManage from './databaseManage';
import SqlAudit from './sqlAudit';

import './index.scss';

export default function DataBase(props: any): JSX.Element {
	const {
		middlewareName,
		clusterId,
		namespace,
		customMid,
		capabilities,
		data
	} = props;
	console.log(props);
	const [selectedKey, setSelectedKey] = useState<string[]>(
		storage.getSession('paramsTab')
			? [storage.getSession('paramsTab')]
			: ['userManage']
	);
	const [items, setItems] = useState([
		{
			label: '用户管理',
			key: 'userManage'
		},
		{
			label: '数据库管理',
			key: 'databaseManage'
		},
		{
			label: 'SQL审计',
			key: 'audit'
		}
	]);
	const params: DetailParams = useParams();
	const { currentTab } = params;
	const menuSelect = (item: any) => {
		setSelectedKey(item.keyPath);
		storage.setSession('paramsTab', item.key);
	};
	useEffect(() => {
		if (data.version === '8.0') {
			const list = items.filter((item) => item.key !== 'audit');
			setItems(list);
		}
	}, []);
	useEffect(() => {
		currentTab &&
			currentTab !== 'database' &&
			setSelectedKey(['userManage']);
	}, [currentTab]);

	const ConsoleMenu = () => (
		<ProMenu
			selectedKeys={selectedKey}
			onClick={menuSelect}
			style={{ height: '100%' }}
			items={items}
		></ProMenu>
	);
	const childrenRender = (selectedKey: string) => {
		switch (selectedKey) {
			case 'userManage':
				return (
					<UserManage
						clusterId={clusterId}
						namespace={namespace}
						middlewareName={middlewareName}
					/>
				);
			case 'databaseManage':
				return (
					<DatabaseManage
						clusterId={clusterId}
						namespace={namespace}
						middlewareName={middlewareName}
					/>
				);
			case 'audit':
				return (
					<SqlAudit
						clusterId={clusterId}
						namespace={namespace}
						middlewareName={middlewareName}
					/>
				);
			default:
				return null;
		}
	};
	if (customMid && !(capabilities || []).includes('config')) {
		return <DefaultPicture />;
	}
	return (
		<ProPage>
			<ProContent
				menu={<ConsoleMenu />}
				style={{ margin: 0, padding: 0 }}
			>
				{childrenRender(selectedKey[0])}
			</ProContent>
		</ProPage>
	);
}
